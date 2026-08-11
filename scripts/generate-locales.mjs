import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const siteUrl = "https://www.catrin.lv";
const socialImageUrl = `${siteUrl}/assets/catrin-social-preview.jpg`;
const languages = ["lv", "ru", "en"];
const localeCodes = { lv: "lv_LV", ru: "ru_RU", en: "en_GB" };
const pageFiles = [
  "index.html",
  "kleitas.html",
  "pakalpojumi.html",
  "salons.html",
  "atsauksmes.html",
  "kontakti.html",
  "privacy.html",
];
const pageKeys = {
  "index.html": "home",
  "kleitas.html": "dresses",
  "pakalpojumi.html": "services",
  "salons.html": "salon",
  "atsauksmes.html": "reviews",
  "kontakti.html": "contact",
  "privacy.html": "privacy",
};
const sitemapSettings = {
  "index.html": ["weekly", "1.0"],
  "kleitas.html": ["weekly", "0.9"],
  "pakalpojumi.html": ["monthly", "0.9"],
  "salons.html": ["monthly", "0.7"],
  "atsauksmes.html": ["monthly", "0.8"],
  "kontakti.html": ["monthly", "0.9"],
  "privacy.html": ["yearly", "0.2"],
};
const socialImageAlt = {
  lv: "CATRIN kāzu modes salons Jelgavā",
  ru: "Салон свадебной моды CATRIN в Елгаве",
  en: "CATRIN bridal fashion salon in Jelgava",
};

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "i18n.js"), "utf8"), sandbox);
const copy = sandbox.window.CATRIN_COPY;
const metadata = sandbox.window.CATRIN_METADATA;

const escapeAttribute = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const pageUrl = (file, language) => {
  const filename = file === "index.html" ? "" : file;
  const localePath = language === "lv" ? "" : `${language}/`;
  return `${siteUrl}/${localePath}${filename}`;
};

const setAttribute = (tag, name, value) => {
  const escaped = escapeAttribute(value);
  const expression = new RegExp(`\\s${name}=(['"])[\\s\\S]*?\\1`, "i");
  if (expression.test(tag)) return tag.replace(expression, ` ${name}="${escaped}"`);
  return tag.replace(/>$/, ` ${name}="${escaped}">`);
};

const replaceMetaContent = (html, selectorPattern, value) => html.replace(
  new RegExp(`(<meta\\s+${selectorPattern}\\s+content=")([^"]*)(")`, "i"),
  `$1${escapeAttribute(value)}$3`,
);

const replaceLinkHref = (html, relPattern, value) => html.replace(
  new RegExp(`(<link\\s+${relPattern}\\s+href=")([^"]*)(")`, "i"),
  `$1${escapeAttribute(value)}$3`,
);

const applyTranslations = (html, language) => {
  html = html.replace(
    /(<(?<tag>[a-z][a-z0-9-]*)\b[^>]*\bdata-t="(?<key>[^"]+)"[^>]*>)(?<content>[\s\S]*?)(<\/\k<tag>>)/gi,
    (match, start, _tag, _key, _content, end, _offset, _input, groups) => {
      const value = copy[language]?.[groups.key];
      return value === undefined ? match : `${start}${value}${end}`;
    },
  );

  const translatedAttributes = [
    ["data-t-placeholder", "placeholder"],
    ["data-t-aria-label", "aria-label"],
    ["data-t-title", "title"],
  ];

  for (const [dataAttribute, targetAttribute] of translatedAttributes) {
    const expression = new RegExp(`<[^>]*\\b${dataAttribute}="([^"]+)"[^>]*>`, "gi");
    html = html.replace(expression, (tag, key) => {
      const value = copy[language]?.[key];
      return value === undefined ? tag : setAttribute(tag, targetAttribute, value);
    });
  }

  html = html.replace(/<button\b[^>]*\bdata-lang="(lv|ru|en)"[^>]*>/gi, (tag, buttonLanguage) => (
    setAttribute(tag, "aria-pressed", String(buttonLanguage === language))
  ));

  return html;
};

const ensureSocialMetadata = (html, language) => {
  html = html.replace(/\s*<meta\s+property="og:site_name"[^>]*>/gi, "");
  html = html.replace(/\s*<meta\s+property="og:locale:alternate"[^>]*>/gi, "");
  html = html.replace(
    /\s*<meta\s+(?:property="og:image:(?:alt|secure_url|type|width|height)"|name="twitter:image(?::alt)?")[^>]*>/gi,
    "",
  );

  const alternates = languages
    .filter((candidate) => candidate !== language)
    .map((candidate) => `  <meta property="og:locale:alternate" content="${localeCodes[candidate]}">`)
    .join("\n");
  const additions = [
    "  <meta property=\"og:site_name\" content=\"CATRIN\">",
    alternates,
  ].filter(Boolean).join("\n");
  html = html.replace(/(<meta\s+property="og:locale"[^>]*>)/i, `$1\n${additions}`);
  const imageMetadata = [
    `  <meta property="og:image:secure_url" content="${socialImageUrl}">`,
    '  <meta property="og:image:type" content="image/jpeg">',
    '  <meta property="og:image:width" content="1200">',
    '  <meta property="og:image:height" content="630">',
    `  <meta property="og:image:alt" content="${escapeAttribute(socialImageAlt[language])}">`,
    `  <meta name="twitter:image" content="${socialImageUrl}">`,
    `  <meta name="twitter:image:alt" content="${escapeAttribute(socialImageAlt[language])}">`,
  ].join("\n");
  html = html.replace(/(<meta\s+property="og:image"[^>]*>)/i, `$1\n${imageMetadata}`);
  return html;
};

const ensureCommonHead = (html) => {
  if (!/<meta\s+name="referrer"/i.test(html)) {
    html = html.replace(
      /(<meta\s+name="viewport"[^>]*>)/i,
      '$1\n  <meta name="referrer" content="strict-origin-when-cross-origin">',
    );
  }
  if (!/<link\s+rel="manifest"/i.test(html)) {
    html = html.replace(
      /(<link\s+rel="apple-touch-icon"[^>]*>)/i,
      '$1\n  <link rel="manifest" href="site.webmanifest">\n  <link rel="mask-icon" href="assets/logo-round.svg" color="#641f4b">',
    );
  }
  if (!/<script\s+defer\s+src="(?:\.\.\/)?analytics\.js/i.test(html)) {
    html = html.replace(
      /<\/head>/i,
      '  <script defer src="analytics.js?v=20260811-3"></script>\n</head>',
    );
  }
  html = html.replaceAll("styles.css?v=20260811-1", "styles.css?v=20260811-4");
  return html;
};

const localizePage = (source, file, language) => {
  const pageKey = pageKeys[file];
  const [title, description] = metadata[language][pageKey];
  let html = source.replace(/<html\s+lang="[^"]+"/i, `<html lang="${language}"`);
  html = applyTranslations(html, language);
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = replaceMetaContent(html, 'name="description"', description);
  html = replaceMetaContent(html, 'property="og:title"', title);
  html = replaceMetaContent(html, 'property="og:description"', description);
  html = replaceMetaContent(html, 'property="og:locale"', localeCodes[language]);
  html = replaceMetaContent(html, 'property="og:url"', pageUrl(file, language));
  html = replaceMetaContent(html, 'property="og:image"', socialImageUrl);
  html = replaceLinkHref(html, 'rel="canonical"', pageUrl(file, language));

  for (const alternateLanguage of [...languages, "x-default"]) {
    const targetLanguage = alternateLanguage === "x-default" ? "lv" : alternateLanguage;
    html = replaceLinkHref(
      html,
      `rel="alternate"\\s+hreflang="${alternateLanguage}"`,
      pageUrl(file, targetLanguage),
    );
  }

  html = html.replaceAll("https://catrin.lv/", `${siteUrl}/`);
  html = ensureSocialMetadata(html, language);
  html = ensureCommonHead(html);

  if (language !== "lv") {
    html = html.replace(
      /\b(href|src)=(['"])(assets\/|styles-core\.css|styles\.css|i18n\.js|privacy-copy\.js|app\.js|analytics\.js|site\.webmanifest)/g,
      (_match, attribute, quote, target) => `${attribute}=${quote}../${target}`,
    );
  }

  return `${html.trim()}\n`;
};

const buildSitemap = () => {
  const lastModified = new Date().toISOString().slice(0, 10);
  const entries = [];
  for (const file of pageFiles) {
    const [changeFrequency, priority] = sitemapSettings[file];
    const alternates = [
      ...languages.map((language) => `    <xhtml:link rel="alternate" hreflang="${language}" href="${pageUrl(file, language)}"/>`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl(file, "lv")}"/>`,
    ].join("\n");
    for (const language of languages) {
      entries.push([
        "  <url>",
        `    <loc>${pageUrl(file, language)}</loc>`,
        `    <lastmod>${lastModified}</lastmod>`,
        `    <changefreq>${changeFrequency}</changefreq>`,
        `    <priority>${priority}</priority>`,
        alternates,
        "  </url>",
      ].join("\n"));
    }
  }
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    entries.join("\n"),
    "</urlset>",
    "",
  ].join("\n");
};

const expectedFiles = new Map();
for (const file of pageFiles) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const defaultPage = localizePage(source, file, "lv");
  expectedFiles.set(file, defaultPage);
  for (const language of ["ru", "en"]) {
    expectedFiles.set(path.join(language, file), localizePage(defaultPage, file, language));
  }
}
expectedFiles.set("sitemap.xml", buildSitemap());

const differences = [];
for (const [relativePath, expected] of expectedFiles) {
  const absolutePath = path.join(root, relativePath);
  const current = fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf8") : null;
  if (current === expected) continue;
  if (checkOnly) {
    differences.push(relativePath);
    continue;
  }
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, expected);
}

if (differences.length) {
  console.error(`Generated locale files are stale: ${differences.join(", ")}`);
  process.exit(1);
}

console.log(checkOnly
  ? `Verified ${expectedFiles.size} generated pages and SEO files.`
  : `Generated ${expectedFiles.size} pages and SEO files.`);
