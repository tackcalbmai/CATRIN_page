import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const siteUrl = "https://www.catrin.lv";
const languages = ["lv", "ru", "en"];
const errors = [];

const walk = (directory, predicate) => fs.readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute, predicate);
    return predicate(absolute) ? [absolute] : [];
  });

const htmlPaths = walk(root, (file) => file.endsWith(".html") && !file.includes(`${path.sep}.git${path.sep}`));
const htmlFiles = htmlPaths.map((file) => path.relative(root, file));
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "i18n.js"), "utf8"), sandbox);
const translations = sandbox.window.CATRIN_COPY;

const expectedPageUrl = (file) => {
  const parts = file.split(path.sep);
  const language = languages.includes(parts[0]) ? parts.shift() : "lv";
  const filename = parts.join("/");
  const localePath = language === "lv" ? "" : `${language}/`;
  return `${siteUrl}/${localePath}${filename === "index.html" ? "" : filename}`;
};

const extractAttribute = (tag, name) => tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"))?.[1];

for (const file of htmlFiles) {
  const absoluteFile = path.join(root, file);
  const html = fs.readFileSync(absoluteFile, "utf8");
  const isNotFound = file === "404.html";
  const parts = file.split(path.sep);
  const language = languages.includes(parts[0]) ? parts[0] : "lv";
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
  const translationKeys = [...html.matchAll(/data-t(?:-placeholder|-aria-label|-title)?=["']([^"']+)["']/g)]
    .map((match) => match[1]);

  if (!new RegExp(`<html\\s+lang="${language}"`).test(html)) errors.push(`${file}: incorrect document language`);
  if (!/<meta\s+name="viewport"/i.test(html)) errors.push(`${file}: missing viewport metadata`);
  if (!/<meta\s+name="referrer"\s+content="strict-origin-when-cross-origin"/i.test(html)) errors.push(`${file}: missing referrer policy`);
  const analyticsReferences = (html.match(/<script\s+defer\s+src=["'][^"']*analytics\.js[^"']*["']/gi) || []).length;
  if (analyticsReferences !== 1) errors.push(`${file}: expected one deferred analytics bootstrap, found ${analyticsReferences}`);
  if (h1Count !== 1) errors.push(`${file}: expected one h1, found ${h1Count}`);
  if (duplicateIds.length) errors.push(`${file}: duplicate ids: ${duplicateIds.join(", ")}`);

  if (isNotFound) {
    if (!/<meta\s+name="robots"\s+content="noindex,follow"/i.test(html)) errors.push("404.html: missing noindex directive");
  } else {
    const expectedCanonical = expectedPageUrl(file);
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
    const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i)?.[1];
    if (canonical !== expectedCanonical) errors.push(`${file}: canonical is ${canonical || "missing"}, expected ${expectedCanonical}`);
    if (ogUrl !== expectedCanonical) errors.push(`${file}: Open Graph URL does not match canonical`);
    if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) errors.push(`${file}: missing meta description`);
    if (!/<meta\s+property="og:site_name"\s+content="CATRIN"/i.test(html)) errors.push(`${file}: missing Open Graph site name`);
    if (!/<meta\s+property="og:image:alt"\s+content="[^"]+"/i.test(html)) errors.push(`${file}: missing Open Graph image alt text`);
    if (!/<meta\s+name="twitter:card"\s+content="summary_large_image"/i.test(html)) errors.push(`${file}: missing Twitter card metadata`);

    for (const alternateLanguage of [...languages, "x-default"]) {
      const targetLanguage = alternateLanguage === "x-default" ? "lv" : alternateLanguage;
      const filename = path.basename(file);
      const expectedAlternate = expectedPageUrl(path.join(targetLanguage === "lv" ? "" : targetLanguage, filename));
      const expression = new RegExp(`<link\\s+rel="alternate"\\s+hreflang="${alternateLanguage}"\\s+href="([^"]+)"`, "i");
      const actualAlternate = html.match(expression)?.[1];
      if (actualAlternate !== expectedAlternate) errors.push(`${file}: incorrect ${alternateLanguage} hreflang`);
    }
  }

  for (const currentLanguage of languages) {
    const missingKeys = [...new Set(translationKeys.filter((key) => !(key in translations[currentLanguage])))];
    if (missingKeys.length) errors.push(`${file}: missing ${currentLanguage} translations: ${missingKeys.join(", ")}`);
  }

  if (!isNotFound) {
    for (const match of html.matchAll(/<(?<tag>[a-z][a-z0-9-]*)\b[^>]*\bdata-t="(?<key>[^"]+)"[^>]*>(?<content>[\s\S]*?)<\/\k<tag>>/gi)) {
      const expected = translations[language]?.[match.groups.key];
      const actual = match.groups.content.replace(/\s+/g, " ").trim();
      if (expected !== undefined && actual !== expected.replace(/\s+/g, " ").trim()) {
        errors.push(`${file}: stale default copy for ${match.groups.key}`);
      }
    }
  }

  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const reference = match[1];
    if (!reference || /^(?:https?:|mailto:|tel:|#|data:)/.test(reference)) continue;
    const localPath = reference.split(/[?#]/, 1)[0];
    const target = path.resolve(path.dirname(absoluteFile), localPath);
    if (!target.startsWith(root) || !fs.existsSync(target)) errors.push(`${file}: missing local resource ${reference}`);
  }

  for (const match of html.matchAll(/href=["']([^"']+#[^"']*)["']/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:)/.test(reference)) continue;
    const [targetPath, rawHash] = reference.split("#", 2);
    const targetFile = targetPath.split("?", 1)[0] || path.basename(file);
    const target = path.resolve(path.dirname(absoluteFile), targetFile);
    if (!fs.existsSync(target) || !rawHash) continue;
    const targetHtml = fs.readFileSync(target, "utf8");
    const id = decodeURIComponent(rawHash);
    if (!new RegExp(`\\sid=["']${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(targetHtml)) {
      errors.push(`${file}: missing anchor target ${reference}`);
    }
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    if (extractAttribute(tag, "alt") === undefined) errors.push(`${file}: image missing alt attribute`);
    if (!extractAttribute(tag, "width") || !extractAttribute(tag, "height")) errors.push(`${file}: image missing intrinsic dimensions`);
  }

  for (const match of html.matchAll(/<a\b[^>]*\btarget="_blank"[^>]*>/gi)) {
    const rel = new Set((extractAttribute(match[0], "rel") || "").split(/\s+/));
    if (!rel.has("noopener")) errors.push(`${file}: external target is missing rel=noopener`);
  }

  for (const match of html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      const structuredData = JSON.parse(match[1]);
      if (JSON.stringify(structuredData).includes("https://catrin.lv/")) errors.push(`${file}: structured data uses the non-www host`);
    } catch (error) {
      errors.push(`${file}: invalid JSON-LD (${error.message})`);
    }
  }

  if (html.includes("https://catrin.lv/")) errors.push(`${file}: non-www production URL remains`);
  if (!/<link\s+rel="manifest"/i.test(html)) errors.push(`${file}: missing web manifest link`);
}

const requiredFiles = [
  "CNAME", ".nojekyll", "robots.txt", "sitemap.xml", "site.webmanifest",
  "styles-core.css", "styles.css", "app.js", "i18n.js", "analytics.js",
];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`missing required file ${file}`);
}

if (fs.readFileSync(path.join(root, "CNAME"), "utf8").trim() !== "www.catrin.lv") errors.push("CNAME must use www.catrin.lv");
if (!fs.readFileSync(path.join(root, "robots.txt"), "utf8").includes(`${siteUrl}/sitemap.xml`)) errors.push("robots.txt has the wrong sitemap host");
if (fs.readFileSync(path.join(root, "styles.css"), "utf8").includes("@import")) errors.push("styles.css must not serially import another stylesheet");

const analytics = fs.readFileSync(path.join(root, "analytics.js"), "utf8");
if (!analytics.includes('const measurementId = "G-X1MCTDKV88"')) errors.push("analytics.js has the wrong GA4 measurement ID");
if (!analytics.includes('analytics_storage: "denied"')) errors.push("analytics.js must deny analytics storage by default");
if (!analytics.includes('analytics_storage: "granted"')) errors.push("analytics.js is missing the consent grant path");
if (!analytics.includes("https://www.googletagmanager.com/gtag/js?id=")) errors.push("analytics.js is missing the Google tag loader");

try {
  JSON.parse(fs.readFileSync(path.join(root, "site.webmanifest"), "utf8"));
} catch (error) {
  errors.push(`invalid site.webmanifest (${error.message})`);
}

const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
for (const file of htmlFiles.filter((file) => file !== "404.html")) {
  const canonical = expectedPageUrl(file);
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) errors.push(`sitemap.xml: missing ${canonical}`);
}
if (sitemap.includes("https://catrin.lv/")) errors.push("sitemap.xml: non-www host remains");

const legacyFiles = ["script.js", "catrin-runtime.js", "catrin-mobile.js", "catrin-launch.js", "catrin-metadata.js"];
for (const file of legacyFiles) {
  if (fs.existsSync(path.join(root, file))) errors.push(`legacy runtime file remains: ${file}`);
}

const publicSourceFiles = walk(root, (file) => /\.(?:html|css|js|xml|webmanifest)$/.test(file) && !file.includes(`${path.sep}.git${path.sep}`));
const publicSource = publicSourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
const assetFiles = walk(path.join(root, "assets"), (file) => !file.endsWith(".txt"));
for (const asset of assetFiles) {
  const reference = path.relative(root, asset).split(path.sep).join("/");
  if (!publicSource.includes(reference)) errors.push(`unused asset remains: ${reference}`);
}

if (errors.length) {
  console.error([...new Set(errors)].join("\n"));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML pages, three locales and production SEO files.`);
