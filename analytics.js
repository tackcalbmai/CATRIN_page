/* Google tag (gtag.js) — consent-aware GA4 integration */
(() => {
  "use strict";

  const measurementId = "G-X1MCTDKV88";
  const storageKey = "catrin_analytics_consent_v1";
  const validChoices = new Set(["granted", "denied"]);
  const translations = {
    lv: {
      title: "Jūsu privātums",
      text: "Ar Jūsu atļauju izmantojam apmeklējuma statistiku, lai pilnveidotu CATRIN vietni. Izvēli jebkurā laikā varat mainīt.",
      accept: "Pieņemt",
      reject: "Nē, paldies",
      more: "Privātuma politika",
      settings: "Sīkdatņu iestatījumi",
      region: "Sīkdatņu iestatījumi",
      email: "E-pasts (nav obligāts)",
      name: "Vārds",
      phone: "Tālrunis",
      date: "Vēlamais vizītes datums",
      interest: "Pakalpojums",
      message: "Komentārs",
      photo: "Fotogrāfiju pievienošu WhatsApp sarakstē.",
      fitting: "Labdien! Vēlos pieteikt kāzu kleitas pielaikošanu CATRIN salonā.",
      custom: "Labdien! Vēlos pārrunāt individuālas kāzu kleitas šūšanu CATRIN salonā.",
      photoOpening: "Labdien! Vēlos noskaidrot iespēju izgatavot kleitu pēc attēla CATRIN salonā.",
      alter: "Labdien! Vēlos pieteikt kleitas pielāgošanu vai remontu CATRIN salonā.",
      clean: "Labdien! Vēlos pieteikt kāzu kleitas ķīmisko tīrīšanu CATRIN salonā.",
      other: "Labdien! Vēlos uzdot CATRIN salonam jautājumu.",
    },
    ru: {
      title: "Ваша приватность",
      text: "С Вашего разрешения мы используем статистику посещений, чтобы сделать сайт CATRIN удобнее. Выбор можно изменить в любое время.",
      accept: "Принять",
      reject: "Нет, спасибо",
      more: "Политика конфиденциальности",
      settings: "Настройки cookie",
      region: "Настройки cookie",
      email: "E-mail (необязательно)",
      name: "Имя",
      phone: "Телефон",
      date: "Желаемая дата визита",
      interest: "Услуга",
      message: "Комментарий",
      photo: "Фотографию прикреплю в чате WhatsApp.",
      fitting: "Здравствуйте! Хочу записаться на примерку свадебного платья в салон CATRIN.",
      custom: "Здравствуйте! Хочу обсудить индивидуальный пошив свадебного платья в CATRIN.",
      photoOpening: "Здравствуйте! Хочу узнать о возможности пошива платья по изображению в CATRIN.",
      alter: "Здравствуйте! Хочу записаться на подгонку или ремонт платья в CATRIN.",
      clean: "Здравствуйте! Хочу уточнить возможность химчистки свадебного платья в CATRIN.",
      other: "Здравствуйте! Хочу задать вопрос салону CATRIN.",
    },
    en: {
      title: "Your privacy",
      text: "With your permission, we use visit statistics to make the CATRIN website better. You can change this choice at any time.",
      accept: "Accept",
      reject: "No, thank you",
      more: "Privacy policy",
      settings: "Cookie settings",
      region: "Cookie settings",
      email: "Email (optional)",
      name: "Name",
      phone: "Phone",
      date: "Preferred visit date",
      interest: "Service",
      message: "Note",
      photo: "I will attach the photograph in the WhatsApp chat.",
      fitting: "Hello! I would like to book a wedding dress fitting at CATRIN.",
      custom: "Hello! I would like to discuss bespoke wedding dressmaking with CATRIN.",
      photoOpening: "Hello! I would like to ask about having a dress made from a reference image at CATRIN.",
      alter: "Hello! I would like to book a dress alteration or repair at CATRIN.",
      clean: "Hello! I would like to ask about wedding dress dry cleaning at CATRIN.",
      other: "Hello! I have a question for the CATRIN salon.",
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
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
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
      allow_google_signals: true,
      allow_ad_personalization_signals: true,
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

  function normalizeEmail(value) {
    const email = String(value || "").trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
  }

  function normalizePhone(value) {
    let source = String(value || "").trim();
    if (!source) return "";
    if (source.startsWith("00")) source = `+${source.slice(2)}`;
    const digits = source.replace(/\D/g, "");
    let normalized = "";

    if (source.startsWith("+")) normalized = `+${digits}`;
    else if (digits.length === 8) normalized = `+371${digits}`;
    else if (digits.startsWith("371")) normalized = `+${digits}`;
    else if (digits.length >= 11 && digits.length <= 15) normalized = `+${digits}`;

    return /^\+\d{11,15}$/.test(normalized) ? normalized : "";
  }

  function installBookingEmailField() {
    const form = document.querySelector("[data-booking-form]");
    if (!form) return;

    let emailInput = form.querySelector('input[name="email"]');
    if (!emailInput) {
      const phoneLabel = form.querySelector('input[name="phone"]')?.closest("label");
      if (!phoneLabel) return;
      const label = document.createElement("label");
      label.dataset.analyticsEmailField = "";
      label.innerHTML = `<span></span><input name="email" type="email" autocomplete="email" maxlength="254">`;
      phoneLabel.insertAdjacentElement("afterend", label);
      emailInput = label.querySelector('input[name="email"]');
    }

    const renderLabel = () => {
      const label = emailInput?.closest("label");
      const span = label?.querySelector("span");
      if (span) span.textContent = translations[currentLanguage()].email;
    };
    renderLabel();
    document.addEventListener("catrin:languagechange", renderLabel);

    form.addEventListener("submit", interceptBookingSubmit, true);
  }

  function bookingOpening(interestKey, language) {
    const copy = translations[language];
    return {
      fitting: copy.fitting,
      custom: copy.custom,
      photo: copy.photoOpening,
      alter: copy.alter,
      clean: copy.clean,
      other: copy.other,
    }[interestKey] || copy.other;
  }

  function buildBookingMessage(form, data) {
    const language = currentLanguage();
    const copy = translations[language];
    const interestKey = String(data.get("interest") || "other");
    const interest = form.querySelector('select[name="interest"]')?.selectedOptions[0]?.textContent.trim() || "";
    const attachPhoto = data.get("attachPhoto") === "on";
    const email = normalizeEmail(data.get("email"));

    return [
      bookingOpening(interestKey, language),
      `${copy.name}: ${data.get("name")}`,
      `${copy.phone}: ${data.get("phone")}`,
      email ? `${copy.email.replace(/\s*\([^)]*\)$/, "")}: ${email}` : "",
      `${copy.date}: ${data.get("date") || "—"}`,
      `${copy.interest}: ${interest}`,
      data.get("message") ? `${copy.message}: ${data.get("message")}` : "",
      attachPhoto ? copy.photo : "",
    ].filter(Boolean).join("\n");
  }

  function trackLead(data) {
    if (currentChoice !== "granted") return Promise.resolve();

    const email = normalizeEmail(data.get("email"));
    const phone = normalizePhone(data.get("phone"));
    const userData = {};
    if (email) userData.email = email;
    if (email && phone) userData.phone_number = phone;

    return new Promise((resolve) => {
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        resolve();
      };
      window.setTimeout(finish, 450);

      const eventParameters = {
        method: "whatsapp",
        event_callback: finish,
      };
      if (Object.keys(userData).length) eventParameters.user_data = userData;
      window.gtag("event", "generate_lead", eventParameters);
    });
  }

  async function interceptBookingSubmit(event) {
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const submitButton = form.querySelector('button[type="submit"]');
    const data = new FormData(form);
    const message = buildBookingMessage(form, data);
    const destination = `https://wa.me/37127164000?text=${encodeURIComponent(message)}`;

    if (submitButton) submitButton.disabled = true;
    try {
      await trackLead(data);
    } finally {
      window.location.assign(destination);
      window.setTimeout(() => {
        if (submitButton) submitButton.disabled = false;
      }, 1200);
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
    installBookingEmailField();
    document.addEventListener("catrin:languagechange", renderInterface);
    new MutationObserver(renderInterface).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
