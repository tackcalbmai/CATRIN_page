(() => {
  const current = document.currentScript;
  const base = new URL(".", current?.src || location.href);
  const version = "20260805-5";

  if (!document.querySelector("style[data-catrin-mobile-bar]")) {
    const style = document.createElement("style");
    style.dataset.catrinMobileBar = "";
    style.textContent = `
@media (max-width: 900px) {
  .mobile-actions {
    position: fixed;
    isolation: isolate;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 0 !important;
    padding: 4px !important;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.58) !important;
    border-radius: 18px !important;
    background: rgba(250,247,244,.27) !important;
    box-shadow: 0 9px 28px rgba(55,35,45,.08) !important;
    backdrop-filter: blur(22px) saturate(1.1) !important;
    -webkit-backdrop-filter: blur(22px) saturate(1.1) !important;
  }
  .mobile-actions::before,
  .mobile-actions::after {
    position: absolute;
    z-index: 1;
    top: 13px;
    bottom: 13px;
    width: 1px;
    transform: translateX(-.5px);
    background: rgba(65,40,53,.16);
    content: "";
    pointer-events: none;
  }
  .mobile-actions::before { left: 33.333333%; }
  .mobile-actions::after { left: 66.666667%; }
  .mobile-actions a,
  .mobile-actions a:last-child {
    position: relative;
    z-index: 2;
    min-width: 0;
    min-height: 50px;
    gap: .42rem;
    padding: .55rem .4rem;
    border: 0 !important;
    border-radius: 12px !important;
    background: transparent !important;
    box-shadow: none !important;
    color: var(--plum-dark) !important;
    transition: background-color 180ms ease, transform 180ms ease;
  }
  .mobile-actions a + a {
    border-left: 0 !important;
  }
  .mobile-actions a:first-child::before,
  .mobile-actions a:last-child::before {
    width: 15px;
    height: 15px;
    flex: 0 0 15px;
    background: currentColor;
    content: "";
  }
  .mobile-actions a:first-child::before {
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M7.2 3.5 9.7 7.8 8 9.5c1.1 2.3 2.9 4.1 5.2 5.2l1.7-1.7 4.3 2.5-.6 3.4c-.2 1-1.1 1.7-2.1 1.6C9.2 19.8 4.2 14.8 3.5 7.5c-.1-1 .6-1.9 1.6-2.1l2.1-.4Z' fill='none' stroke='black' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/contain no-repeat;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M7.2 3.5 9.7 7.8 8 9.5c1.1 2.3 2.9 4.1 5.2 5.2l1.7-1.7 4.3 2.5-.6 3.4c-.2 1-1.1 1.7-2.1 1.6C9.2 19.8 4.2 14.8 3.5 7.5c-.1-1 .6-1.9 1.6-2.1l2.1-.4Z' fill='none' stroke='black' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/contain no-repeat;
  }
  .mobile-actions a:last-child::before {
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='4' y='5.5' width='16' height='14' rx='2' fill='none' stroke='black' stroke-width='1.7'/%3E%3Cpath d='M8 3.5v4M16 3.5v4M4 9.5h16M8.5 13h7M8.5 16h4.5' fill='none' stroke='black' stroke-width='1.7' stroke-linecap='round'/%3E%3C/svg%3E") center/contain no-repeat;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect x='4' y='5.5' width='16' height='14' rx='2' fill='none' stroke='black' stroke-width='1.7'/%3E%3Cpath d='M8 3.5v4M16 3.5v4M4 9.5h16M8.5 13h7M8.5 16h4.5' fill='none' stroke='black' stroke-width='1.7' stroke-linecap='round'/%3E%3C/svg%3E") center/contain no-repeat;
  }
  .mobile-actions img { width: 16px; height: 16px; flex: 0 0 16px; }
  .mobile-actions a:active,
  .mobile-actions a:last-child:active {
    transform: scale(.985);
    background: rgba(238,229,225,.46) !important;
  }
  #pieraksts { scroll-margin-top: calc(var(--header-height) + .35rem) !important; }
  .booking-section { gap: 1.5rem !important; padding-top: 2rem !important; }
}
@media (max-width: 620px) {
  .booking-section { gap: 1rem !important; padding-top: 1rem !important; }
  .booking-copy h2 { margin: .65rem 0 .8rem; }
}
@media (max-width: 420px) {
  .mobile-actions a,
  .mobile-actions a:last-child { gap: .28rem; padding-inline: .28rem; font-size: .57rem; letter-spacing: .04em; }
  .mobile-actions a:first-child::before,
  .mobile-actions a:last-child::before,
  .mobile-actions img { width: 14px; height: 14px; flex-basis: 14px; }
}
@media (max-width: 350px) {
  .mobile-actions a:first-child::before,
  .mobile-actions a:last-child::before,
  .mobile-actions img { display: none; }
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  @media (max-width: 900px) { .mobile-actions { background: rgba(250,247,244,.74) !important; } }
}`;
    document.head.appendChild(style);
  }

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
    .then(() => load("catrin-mobile.js"))
    .catch((error) => console.error(error));
})();
