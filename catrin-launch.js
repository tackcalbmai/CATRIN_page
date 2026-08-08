(() => {
  const supportedLanguages = ["lv", "ru", "en"];
  const currentLanguage = () => supportedLanguages.includes(document.documentElement.lang)
    ? document.documentElement.lang
    : "lv";

  const languageUrl = (lang) => {
    const url = new URL(location.href);
    url.hash = "";
    if (lang === "lv") url.searchParams.delete("lang");
    else url.searchParams.set("lang", lang);
    return url.href;
  };

  const syncLanguageSeo = () => {
    const lang = currentLanguage();
    const canonicalUrl = languageUrl(lang);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = canonicalUrl;

    const locale = document.querySelector('meta[property="og:locale"]');
    if (locale) locale.content = lang === "lv" ? "lv_LV" : lang === "ru" ? "ru_RU" : "en_GB";

    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => {
      const hreflang = link.getAttribute("hreflang");
      if (supportedLanguages.includes(hreflang)) link.href = languageUrl(hreflang);
      if (hreflang === "x-default") link.href = languageUrl("lv");
    });
  };

  const hardenExternalLinks = () => {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const rel = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      link.setAttribute("rel", [...rel].join(" "));
    });
  };

  const improveFormSafety = () => {
    const form = document.querySelector("[data-booking-form]");
    if (!form) return;

    const name = form.querySelector('input[name="name"]');
    const phone = form.querySelector('input[name="phone"]');
    const message = form.querySelector('textarea[name="message"]');
    const interest = form.querySelector('select[name="interest"]');

    if (name) {
      name.maxLength = 80;
      name.autocapitalize = "words";
    }
    if (phone) phone.maxLength = 32;
    if (message) message.maxLength = 800;
    if (interest) interest.required = true;
  };

  const improveMediaDefaults = () => {
    document.querySelectorAll("img").forEach((image) => {
      if (!image.hasAttribute("decoding")) image.decoding = "async";
      const inOpeningHero = image.closest(".home-hero, .page-hero, .contact-hero, .reviews-page-hero");
      if (!inOpeningHero && !image.hasAttribute("loading")) image.loading = "lazy";
    });

    document.querySelectorAll("iframe").forEach((frame) => {
      if (!frame.hasAttribute("loading")) frame.loading = "lazy";
    });
  };

  const fixReviewAccessibility = () => {
    const spotlight = document.querySelector("[data-review-spotlight]");
    if (!spotlight) return;
    spotlight.removeAttribute("aria-hidden");
    spotlight.setAttribute("aria-label", currentLanguage() === "lv"
      ? "Izcelta klienta atsauksme"
      : currentLanguage() === "ru"
        ? "Избранный отзыв клиента"
        : "Featured client review");
  };

  const flagBrokenPlaceholders = () => {
    document.querySelectorAll('a[href="#"]').forEach((link) => {
      link.addEventListener("click", (event) => event.preventDefault());
      link.setAttribute("aria-disabled", "true");
    });
  };

  const run = () => {
    syncLanguageSeo();
    hardenExternalLinks();
    improveFormSafety();
    improveMediaDefaults();
    fixReviewAccessibility();
    flagBrokenPlaceholders();
  };

  document.addEventListener("catrin:languagechange", () => {
    syncLanguageSeo();
    fixReviewAccessibility();
  });
  window.addEventListener("popstate", syncLanguageSeo);

  run();
})();