import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const host = valueAfter("--host", "127.0.0.1");
const port = Number(valueAfter("--port", "4173"));
const root = process.cwd();
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const requested = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
  let filename = path.resolve(root, `.${requested}`);
  if (!filename.startsWith(`${root}${path.sep}`)) filename = path.join(root, "404.html");
  if (!fs.existsSync(filename) || fs.statSync(filename).isDirectory()) filename = path.join(root, "404.html");

  const status = filename.endsWith(`${path.sep}404.html`) && requested !== "/404.html" ? 404 : 200;
  response.writeHead(status, {
    "Content-Type": types[path.extname(filename)] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  fs.createReadStream(filename).pipe(response);
}).listen(port, host, () => {
  console.log(`CATRIN preview ready on http://${host}:${port}`);
});
