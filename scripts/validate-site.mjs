import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html"));
const errors = [];
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "i18n.js"), "utf8"), sandbox);
const translations = sandbox.window.CATRIN_COPY;

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
  const translationKeys = [...html.matchAll(/data-t(?:-placeholder|-aria-label|-title)?=["']([^"']+)["']/g)]
    .map((match) => match[1]);

  if (!/<html\s+lang="lv"/.test(html)) errors.push(`${file}: missing default Latvian language`);
  if (!/<meta\s+name="viewport"/.test(html)) errors.push(`${file}: missing viewport metadata`);
  if (file !== "404.html" && !/<link\s+rel="canonical"\s+href="https:\/\/catrin\.lv\//.test(html)) {
    errors.push(`${file}: missing catrin.lv canonical URL`);
  }
  if (h1Count !== 1) errors.push(`${file}: expected one h1, found ${h1Count}`);
  if (duplicateIds.length) errors.push(`${file}: duplicate ids: ${duplicateIds.join(", ")}`);
  if (file !== "404.html") {
    for (const language of ["lv", "ru", "en"]) {
      const missingKeys = [...new Set(translationKeys.filter((key) => !(key in translations[language])))];
      if (missingKeys.length) errors.push(`${file}: missing ${language} translations: ${missingKeys.join(", ")}`);
    }
  }

  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const reference = match[1];
    if (!reference || /^(?:https?:|mailto:|tel:|#|data:)/.test(reference)) continue;
    const localPath = reference.split(/[?#]/, 1)[0];
    if (localPath && !fs.existsSync(path.join(root, localPath))) {
      errors.push(`${file}: missing local asset ${reference}`);
    }
  }

  for (const match of html.matchAll(/href=["']([^"']+#[^"']*)["']/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:)/.test(reference)) continue;
    const [targetPath, rawHash] = reference.split("#", 2);
    const targetFile = targetPath.split("?", 1)[0] || file;
    const target = path.join(root, targetFile);
    if (!fs.existsSync(target) || !rawHash) continue;
    const targetHtml = fs.readFileSync(target, "utf8");
    const id = decodeURIComponent(rawHash);
    if (!new RegExp(`\\sid=["']${id.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}["']`).test(targetHtml)) {
      errors.push(`${file}: missing anchor target ${reference}`);
    }
  }
}

const requiredFiles = ["CNAME", ".nojekyll", "robots.txt", "sitemap.xml", "app.js", "i18n.js"];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`missing required file ${file}`);
}

const legacyFiles = ["script.js", "catrin-runtime.js", "catrin-mobile.js", "catrin-launch.js", "catrin-metadata.js"];
for (const file of legacyFiles) {
  if (fs.existsSync(path.join(root, file))) errors.push(`legacy runtime file remains: ${file}`);
}

for (const file of ["index.html", "sitemap.xml", "robots.txt"]) {
  const content = fs.readFileSync(path.join(root, file), "utf8");
  if (content.includes("tackcalbmai.github.io/CATRIN_page")) errors.push(`${file}: old public URL remains`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML pages and ${requiredFiles.length} deployment files.`);
