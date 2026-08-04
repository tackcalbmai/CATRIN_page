(() => {
  const current = document.currentScript;
  const base = new URL(".", current?.src || location.href);
  const version = "20260804-2";
  const load = (name) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = new URL(`${name}?v=${version}`, base).href;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${name}`));
    document.head.appendChild(script);
  });

  Promise.all([
    load("catrin-copy-lv.js"),
    load("catrin-copy-ru-1.js"),
    load("catrin-copy-ru-2.js"),
    load("catrin-copy-ru-3.js"),
    load("catrin-copy-en-1.js"),
    load("catrin-copy-en-2.js"),
    load("catrin-copy-en-3.js"),
    load("catrin-metadata.js")
  ])
    .then(() => load("catrin-copy-polish.js"))
    .then(() => load("catrin-copy-warmth.js"))
    .then(() => load("catrin-copy-final.js"))
    .then(() => load("catrin-runtime.js"))
    .catch((error) => console.error(error));
})();
