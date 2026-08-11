/* Google tag (gtag.js) — consent-aware GA4 integration */
(() => {
  "use strict";

  const measurementId = "G-X1MCTDKV88";
  const storageKey = "catrin_analytics_consent_v1";
  const validChoices = new Set(["granted", "denied"]);
  const translations = {
    lv: {
      title: "Jūsu izvēle",
      text: "Ar Jūsu atļauju apkoposim vietnes apmeklējuma datus, lai pilnveidotu CATRIN saturu un lietošanas pieredzi. Izvēli varat mainīt jebkurā laikā.",
      accept: "Atļaut",
      reject: "Turpināt bez",
      more: "Par privātumu",
      settings: "Privātuma izvēle",
      region: "Privātuma izvēle",
    },
    ru: {
      title: "Ваш выбор",
      text: "С Вашего разрешения мы будем собирать данные о посещении, чтобы улучшать содержание и удобство сайта CATRIN. Выбор можно изменить в любое время.",
      accept: "Разрешить",
      reject: "Продолжить без",
      more: "О конфиденциальности",
      settings: "Настройки приватности",
      region: "Выбор настроек приватности",
    },
    en: {
      title: "Your choice",
      text: "With your permission, we’ll collect website visit data to refine CATRIN’s content and experience. You can change this choice at any time.",
      accept: "Allow",
      reject: "Continue without",
      more: "About privacy",
      settings: "Privacy choices",
      region: "Privacy choices",
    },
  };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });

  let currentChoice = readChoice();
  let analyticsInitialized = false;
  let banner;
  let settingsButton;
  let lastFocusedElement;
  let visibilityVersion = 0;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");

  window[`ga-disable-${measurementId}`] = currentChoice !== "granted";
  if (currentChoice === "granted") enableAnalytics();

  function readChoice() {
    try {
      const choice = window.localStorage.getItem(storageKey);
      return validChoices.has(choice) ? choice : null;
    } catch {
      return null;
    }
  }

  function saveChoice(choice) {
    try {
      window.localStorage.setItem(storageKey, choice);
    } catch {
      // The choice still applies to the current page when storage is unavailable.
    }
  }

  function currentLanguage() {
    const language = document.documentElement.lang?.toLowerCase().split("-")[0];
    return language in translations ? language : "lv";
  }

  function privacyPath() {
    const existingLink = document.querySelector('.footer-legal a[href*="privacy"]');
    if (existingLink) return existingLink.getAttribute("href");

    const language = currentLanguage();
    const projectPrefix = location.hostname.endsWith("github.io") ? "/CATRIN_page" : "";
    const localePath = language === "lv" ? "" : `/${language}`;
    return `${projectPrefix}${localePath}/privacy.html`;
  }

  function enableAnalytics() {
    window[`ga-disable-${measurementId}`] = false;
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });

    if (analyticsInitialized) return;
    analyticsInitialized = true;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.catrinAnalytics = "";
    document.head.appendChild(script);

    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  }

  function disableAnalytics() {
    window[`ga-disable-${measurementId}`] = true;
    window.gtag("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    removeAnalyticsCookies();
  }

  function removeAnalyticsCookies() {
    const names = document.cookie
      .split(";")
      .map((cookie) => cookie.split("=", 1)[0].trim())
      .filter((name) => /^(?:_ga|_gid|_gat|_gac_|_gcl_)/.test(name));
    const domains = ["", location.hostname, `.${location.hostname}`, "catrin.lv", ".catrin.lv"];

    for (const name of new Set(names)) {
      for (const domain of new Set(domains)) {
        const domainAttribute = domain ? `; domain=${domain}` : "";
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domainAttribute}`;
      }
    }
  }

  function createInterface() {
    banner = document.createElement("section");
    banner.className = "cookie-consent";
    if (document.querySelector(".mobile-actions")) {
      banner.classList.add("cookie-consent--with-mobile-actions");
    }
    banner.hidden = true;
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-labelledby", "cookie-consent-title");
    banner.innerHTML = `
      <div class="cookie-consent__copy">
        <span class="cookie-consent__eyebrow" aria-hidden="true">CATRIN</span>
        <h2 id="cookie-consent-title"></h2>
        <p data-cookie-consent-text></p>
      </div>
      <div class="cookie-consent__actions">
        <div class="cookie-consent__choice">
          <button class="cookie-consent__button cookie-consent__button--reject" type="button" data-cookie-reject></button>
          <button class="cookie-consent__button cookie-consent__button--accept" type="button" data-cookie-accept></button>
        </div>
        <a class="cookie-consent__more" data-cookie-more></a>
      </div>`;
    document.body.appendChild(banner);

    banner.querySelector("[data-cookie-accept]").addEventListener("click", () => setChoice("granted"));
    banner.querySelector("[data-cookie-reject]").addEventListener("click", () => setChoice("denied"));

    const footerLegal = document.querySelector(".footer-legal");
    if (footerLegal) {
      settingsButton = document.createElement("button");
      settingsButton.className = "cookie-settings-button";
      settingsButton.type = "button";
      settingsButton.addEventListener("click", showBanner);
      footerLegal.appendChild(settingsButton);
    }

    renderInterface();
    if (!currentChoice) showBanner();
  }

  function renderInterface() {
    if (!banner) return;
    const copy = translations[currentLanguage()];
    banner.setAttribute("aria-label", copy.region);
    banner.querySelector("#cookie-consent-title").textContent = copy.title;
    banner.querySelector("[data-cookie-consent-text]").textContent = copy.text;
    banner.querySelector("[data-cookie-accept]").textContent = copy.accept;
    banner.querySelector("[data-cookie-reject]").textContent = copy.reject;
    const more = banner.querySelector("[data-cookie-more]");
    more.textContent = copy.more;
    more.href = privacyPath();
    if (settingsButton) settingsButton.textContent = copy.settings;
  }

  function showBanner() {
    visibilityVersion += 1;
    lastFocusedElement = document.activeElement;
    renderInterface();
    banner.hidden = false;
    document.body.classList.add("cookie-consent-open");
    if (reducedMotion?.matches) {
      banner.classList.add("is-visible");
      return;
    }
    requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add("is-visible")));
  }

  function hideBanner() {
    const version = ++visibilityVersion;
    banner.classList.remove("is-visible");
    document.body.classList.remove("cookie-consent-open");
    const finish = () => {
      if (version !== visibilityVersion) return;
      banner.hidden = true;
      if (lastFocusedElement === settingsButton) settingsButton.focus();
    };
    if (reducedMotion?.matches) finish();
    else window.setTimeout(finish, 620);
  }

  function setChoice(choice) {
    currentChoice = choice;
    saveChoice(choice);
    if (choice === "granted") enableAnalytics();
    else disableAnalytics();
    hideBanner();
  }

  const start = () => {
    createInterface();
    document.addEventListener("catrin:languagechange", renderInterface);
    new MutationObserver(renderInterface).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
