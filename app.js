/* catrin-runtime.js */
const copy=window.CATRIN_COPY||{};
const metadata=window.CATRIN_METADATA||{};

const page = document.body.dataset.page || "home";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function injectEditorialSections() {
  if (page === "salon" && !document.querySelector("[data-editorial-salon-story]")) {
    const hero = document.querySelector(".salon-hero");
    if (hero) {
      const section = document.createElement("section");
      section.className = "service-ledger section-shell salon-editorial-story";
      section.dataset.editorialSalonStory = "";
      section.innerHTML = `
        <div class="ledger-heading reveal">
          <p class="eyebrow" data-t="salonStoryEyebrow">Viss process vienuviet</p>
          <h2 data-t="salonStoryTitle">No pirmās idejas līdz gatavai kleitai</h2>
          <p class="salon-editorial-intro" data-t="salonStoryIntro">Mūsu darbs sākas ar sarunu un turpinās līdz gatavam rezultātam.</p>
        </div>
        <div class="ledger-list">
          <article class="ledger-item reveal">
            <i class="thread-mark" aria-hidden="true"></i>
            <h3 data-t="salonStoryChoiceTitle">Izvēle bez gataviem priekšstatiem</h3>
            <p data-t="salonStoryChoiceText">Meklējam risinājumu, kurā jūtaties pārliecināti un ērti.</p>
          </article>
          <article class="ledger-item reveal">
            <i class="thread-mark" aria-hidden="true"></i>
            <h3 data-t="salonStoryAtelierTitle">Šūšana un korekcijas salonā</h3>
            <p data-t="salonStoryAtelierText">Precīzi saskaņojam konstrukciju, detaļas un piegulumu.</p>
          </article>
          <article class="ledger-item reveal">
            <i class="thread-mark" aria-hidden="true"></i>
            <h3 data-t="salonStoryCareTitle">Atbalsts līdz gatavam rezultātam</h3>
            <p data-t="salonStoryCareText">Vienojamies par pielaikošanām, termiņiem un nākamajiem soļiem.</p>
          </article>
        </div>`;
      hero.insertAdjacentElement("afterend", section);
    }
  }

  if (page === "reviews" && !document.querySelector("[data-editorial-reviews-note]")) {
    const collage = document.querySelector(".reviews-collage");
    const notes = collage?.querySelector(".review-notes");
    if (collage && notes) {
      const note = document.createElement("p");
      note.className = "reviews-editorial-note";
      note.dataset.editorialReviewsNote = "";
      note.dataset.t = "reviewsNote";
      note.textContent = "Atsauksmes publicētas oriģinālvalodā; atsevišķi teksti ir saīsināti.";
      notes.before(note);
    }
  }
}

injectEditorialSections();

const initialText = {};
const initialPlaceholders = {};
const initialAriaLabels = {};
const initialTitles = {};

for (const element of document.querySelectorAll("[data-t]")) {
  const key = element.dataset.t;
  if (!(key in initialText)) initialText[key] = element.innerHTML;
}
for (const element of document.querySelectorAll("[data-t-placeholder]")) {
  initialPlaceholders[element.dataset.tPlaceholder] = element.placeholder;
}
for (const element of document.querySelectorAll("[data-t-aria-label]")) {
  initialAriaLabels[element.dataset.tAriaLabel] = element.getAttribute("aria-label") || "";
}
for (const element of document.querySelectorAll("[data-t-title]")) {
  initialTitles[element.dataset.tTitle] = element.getAttribute("title") || "";
}

const supportedLanguages = ["lv", "ru", "en"];
const legacyLanguage = new URLSearchParams(location.search).get("lang");
const routeLanguage = location.pathname.match(/\/(ru|en)(?:\/|$)/)?.[1] || "lv";
let language = supportedLanguages.includes(legacyLanguage) ? legacyLanguage : routeLanguage;

function valueFor(key) {
  return copy[language]?.[key] ?? initialText[key];
}

function localizedPageUrl(nextLanguage) {
  const alternate = document.querySelector(`link[rel="alternate"][hreflang="${nextLanguage}"]`);
  if (!alternate) return null;
  const declared = new URL(alternate.href, location.href);
  const target = new URL(location.href);
  target.pathname = declared.pathname;
  target.search = declared.search;
  return `${target.pathname}${target.search}${target.hash}`;
}

function navigateToLanguage(nextLanguage, replace = false) {
  if (!supportedLanguages.includes(nextLanguage)) return;
  const target = localizedPageUrl(nextLanguage);
  if (!target) return;
  if (replace) location.replace(target);
  else location.assign(target);
}

function updateEditorialDetails() {
  const legalLine = document.querySelector(".footer-legal > span");
  if (legalLine) {
    const year = new Date().getFullYear();
    legalLine.textContent = language === "lv"
      ? `© ${year} SIA CATRIN · Reģ. Nr. 43603051076`
      : language === "ru"
        ? `© ${year} SIA CATRIN · Рег. № 43603051076`
        : `© ${year} SIA CATRIN · Registration No. 43603051076`;
  }

  if (page === "salon") {
    const facts = document.querySelectorAll(".salon-facts > div");
    const languageValue = facts[2]?.querySelector("dd");
    const addressValue = facts[3]?.querySelector("dd");
    if (languageValue) {
      languageValue.textContent = language === "lv" ? "Latviešu · krievu · angļu" : language === "ru" ? "Латышский · русский · английский" : "Latvian · Russian · English";
    }
    if (addressValue) {
      addressValue.textContent = language === "lv" ? "Krišjāņa Barona iela 40, Jelgava" : language === "ru" ? "Улица Кришьяня Барона, 40, Елгава" : "40 Krišjāņa Barona Street, Jelgava";
    }
  }
}

function updateMetadata() {
  const translated = metadata[language]?.[page];
  if (!translated) return;
  document.title = translated[0];
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = translated[1];
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogTitle) ogTitle.content = translated[0];
  if (ogDescription) ogDescription.content = translated[1];
  if (ogLocale) ogLocale.content = language === "lv" ? "lv_LV" : language === "ru" ? "ru_RU" : "en_GB";
}

function translate(nextLanguage) {
  language = supportedLanguages.includes(nextLanguage) ? nextLanguage : "lv";
  document.documentElement.lang = language;

  document.querySelectorAll("[data-t]").forEach((element) => {
    const value = valueFor(element.dataset.t);
    if (value !== undefined) element.innerHTML = value;
  });
  document.querySelectorAll("[data-t-placeholder]").forEach((element) => {
    const key = element.dataset.tPlaceholder;
    element.placeholder = copy[language]?.[key] ?? initialPlaceholders[key] ?? "";
  });
  document.querySelectorAll("[data-t-aria-label]").forEach((element) => {
    const key = element.dataset.tAriaLabel;
    element.setAttribute("aria-label", copy[language]?.[key] ?? initialAriaLabels[key] ?? "");
  });
  document.querySelectorAll("[data-t-title]").forEach((element) => {
    const key = element.dataset.tTitle;
    element.setAttribute("title", copy[language]?.[key] ?? initialTitles[key] ?? "");
  });
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.lang === language));
  });

  updateMetadata();
  updateEditorialDetails();

  document.dispatchEvent(new CustomEvent("catrin:languagechange"));
}

document.querySelectorAll("[data-lang]").forEach((button) => {
  button.addEventListener("click", () => navigateToLanguage(button.dataset.lang));
});

document.querySelector(`[data-page-link="${page}"]`)?.setAttribute("aria-current", "page");

const floatingHeader = document.querySelector(".site-header, .policy-header");
if (floatingHeader) {
  const updateHeaderSurface = () => floatingHeader.classList.toggle("is-scrolled", window.scrollY > 24);
  updateHeaderSurface();
  window.addEventListener("scroll", updateHeaderSurface, { passive: true });
}

const menuButton = document.querySelector("[data-menu-button]");
const navigation = document.querySelector("[data-nav]");
const pageVeil = document.querySelector(".page-veil");

function closeMenu(returnFocus = false) {
  if (!menuButton || !navigation) return;
  const wasOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", "false");
  navigation.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  if (returnFocus && wasOpen) menuButton.focus();
}

menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  if (!open) return closeMenu(true);
  menuButton.setAttribute("aria-expanded", "true");
  navigation?.classList.add("is-open");
  document.body.classList.add("nav-open");
  requestAnimationFrame(() => navigation?.querySelector("a")?.focus());
});

navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu(false)));
pageVeil?.addEventListener("click", () => closeMenu(true));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") return closeMenu(true);
  if (event.key !== "Tab" || menuButton?.getAttribute("aria-expanded") !== "true" || !navigation) return;
  const focusable = [
    ...navigation.querySelectorAll("a"),
    ...document.querySelectorAll(".site-header .language-switcher button"),
    menuButton
  ];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
});
window.addEventListener("resize", () => { if (window.innerWidth > 900) closeMenu(); }, { passive: true });

translate(language);
if (supportedLanguages.includes(legacyLanguage) && legacyLanguage !== routeLanguage) {
  navigateToLanguage(legacyLanguage, true);
}

const gallery = document.querySelector("[data-gallery]");
if (gallery) {
  const slides = [...gallery.querySelectorAll(".hero-images figure")];
  const controls = [...gallery.querySelectorAll("[data-slide]")];
  const crossfadeDuration = 1500;
  let currentSlide = -1;
  let galleryTimer = 0;
  let slideCleanupTimer = 0;

  slides.forEach((slide) => {
    slide.classList.remove("is-active", "is-leaving", "reveal", "is-visible");
    slide.style.removeProperty("transition-delay");
  });

  const showSlide = (index) => {
    const nextSlide = (index + slides.length) % slides.length;
    if (nextSlide === currentSlide) return;

    const outgoingSlide = currentSlide >= 0 ? slides[currentSlide] : null;
    window.clearTimeout(slideCleanupTimer);

    slides.forEach((slide) => {
      if (slide !== outgoingSlide) slide.classList.remove("is-leaving");
    });

    if (outgoingSlide) {
      outgoingSlide.classList.remove("is-active");
      outgoingSlide.classList.add("is-leaving");
    }

    currentSlide = nextSlide;
    slides[currentSlide].classList.remove("is-leaving");
    slides[currentSlide].classList.add("is-active");

    if (outgoingSlide) {
      slideCleanupTimer = window.setTimeout(() => {
        outgoingSlide.classList.remove("is-leaving");
      }, crossfadeDuration + 50);
    }

    controls.forEach((control, controlIndex) => {
      const active = controlIndex === currentSlide;
      control.classList.toggle("is-active", active);
      control.setAttribute("aria-pressed", String(active));
    });
  };
  const stopGallery = () => window.clearInterval(galleryTimer);
  const startGallery = () => {
    stopGallery();
    if (!reducedMotion.matches) galleryTimer = window.setInterval(() => showSlide(currentSlide + 1), 5600);
  };

  controls.forEach((control) => control.addEventListener("click", () => {
    showSlide(Number(control.dataset.slide));
    startGallery();
  }));
  gallery.addEventListener("pointerenter", stopGallery);
  gallery.addEventListener("pointerleave", startGallery);
  gallery.addEventListener("focusin", stopGallery);
  gallery.addEventListener("focusout", startGallery);
  showSlide(0);
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    gallery.classList.add("is-ready");
    startGallery();
  }));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopGallery();
    else startGallery();
  });
}

const reviewSpotlight = document.querySelector("[data-review-spotlight]");
const reviewItems = [...document.querySelectorAll("[data-review-item]")];
if (reviewSpotlight && reviewItems.length) {
  const spotlightQuote = reviewSpotlight.querySelector("[data-spotlight-quote]");
  const spotlightAuthor = reviewSpotlight.querySelector("[data-spotlight-author]");
  const spotlightDate = reviewSpotlight.querySelector("[data-spotlight-date]");
  const spotlightIcon = reviewSpotlight.querySelector("[data-spotlight-icon]");
  const reviewDelay = 5600;
  let currentReview = 0;
  let reviewTimer = 0;
  let switchTimer = 0;

  const stopReviewRotation = () => {
    window.clearTimeout(reviewTimer);
    window.clearTimeout(switchTimer);
    reviewSpotlight.classList.remove("is-running");
  };
  const scheduleReviewRotation = () => {
    window.clearTimeout(reviewTimer);
    reviewSpotlight.classList.remove("is-running");
    if (reducedMotion.matches || document.hidden) return;
    void reviewSpotlight.offsetWidth;
    reviewSpotlight.classList.add("is-running");
    reviewTimer = window.setTimeout(() => showReview(currentReview + 1), reviewDelay);
  };
  const applyReview = (index) => {
    currentReview = (index + reviewItems.length) % reviewItems.length;
    const item = reviewItems[currentReview];
    const source = item.querySelector(".review-note-origin");
    const icon = source?.querySelector("img");
    const date = item.querySelector("time");
    if (spotlightQuote) spotlightQuote.textContent = item.querySelector("blockquote")?.textContent.trim() || "";
    if (spotlightAuthor) spotlightAuthor.textContent = item.querySelector("footer strong")?.textContent.trim() || "";
    if (spotlightDate) {
      spotlightDate.textContent = date?.textContent.trim() || "";
      if (date?.dateTime) spotlightDate.dateTime = date.dateTime;
      else spotlightDate.removeAttribute("datetime");
    }
    if (spotlightIcon) spotlightIcon.src = icon?.getAttribute("src") || "assets/icon-google.svg";
    reviewItems.forEach((review, reviewIndex) => review.classList.toggle("is-current", reviewIndex === currentReview));
    reviewSpotlight.classList.remove("is-switching");
    scheduleReviewRotation();
  };
  function showReview(index, animate = true) {
    window.clearTimeout(switchTimer);
    if (!animate || reducedMotion.matches) return applyReview(index);
    reviewSpotlight.classList.add("is-switching");
    switchTimer = window.setTimeout(() => applyReview(index), 520);
  }

  document.addEventListener("visibilitychange", () => document.hidden ? stopReviewRotation() : scheduleReviewRotation());
  document.addEventListener("catrin:languagechange", () => showReview(currentReview, false));
  showReview(0, false);
}

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

  document.querySelectorAll(".reveal").forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
    revealObserver.observe(element);
  });
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

const bookingForm = document.querySelector("[data-booking-form]");
if (bookingForm) {
  const dateField = bookingForm.querySelector('input[name="date"]');
  const formStatus = bookingForm.querySelector("[data-form-status]");
  const today = new Date();
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");
  if (dateField) dateField.min = localToday;

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(bookingForm);
    const attachPhoto = data.get("attachPhoto") === "on";
    const interestKey = data.get("interest");
    const interest = bookingForm.querySelector('select[name="interest"]')?.selectedOptions[0]?.textContent.trim() || "";
    const openings = {
      lv: {
        fitting: "Labdien! Vēlos pieteikt kāzu kleitas pielaikošanu CATRIN salonā.",
        custom: "Labdien! Vēlos pārrunāt individuālas kāzu kleitas šūšanu CATRIN salonā.",
        photo: "Labdien! Vēlos noskaidrot iespēju izgatavot kleitu pēc attēla CATRIN salonā.",
        alter: "Labdien! Vēlos pieteikt kleitas pielāgošanu vai remontu CATRIN salonā.",
        clean: "Labdien! Vēlos pieteikt kāzu kleitas ķīmisko tīrīšanu CATRIN salonā.",
        other: "Labdien! Vēlos uzdot CATRIN salonam jautājumu."
      },
      ru: {
        fitting: "Здравствуйте! Хочу записаться на примерку свадебного платья в салон CATRIN.",
        custom: "Здравствуйте! Хочу обсудить индивидуальный пошив свадебного платья в CATRIN.",
        photo: "Здравствуйте! Хочу узнать о возможности пошива платья по изображению в CATRIN.",
        alter: "Здравствуйте! Хочу записаться на подгонку или ремонт платья в CATRIN.",
        clean: "Здравствуйте! Хочу уточнить возможность химчистки свадебного платья в CATRIN.",
        other: "Здравствуйте! Хочу задать вопрос салону CATRIN."
      },
      en: {
        fitting: "Hello! I would like to book a wedding dress fitting at CATRIN.",
        custom: "Hello! I would like to discuss bespoke wedding dressmaking with CATRIN.",
        photo: "Hello! I would like to ask about having a dress made from a reference image at CATRIN.",
        alter: "Hello! I would like to book a dress alteration or repair at CATRIN.",
        clean: "Hello! I would like to ask about wedding dress dry cleaning at CATRIN.",
        other: "Hello! I have a question for the CATRIN salon."
      }
    };
    const labels = {
      lv: { name: "Vārds", phone: "Tālrunis", date: "Vēlamais vizītes datums", interest: "Pakalpojums", message: "Komentārs", photo: "Fotogrāfiju pievienošu WhatsApp sarakstē." },
      ru: { name: "Имя", phone: "Телефон", date: "Желаемая дата визита", interest: "Услуга", message: "Комментарий", photo: "Фотографию прикреплю в чате WhatsApp." },
      en: { name: "Name", phone: "Phone", date: "Preferred visit date", interest: "Service", message: "Note", photo: "I will attach the photograph in the WhatsApp chat." }
    }[language];
    const opening = openings[language]?.[interestKey] || openings[language]?.other;
    const message = [
      opening,
      `${labels.name}: ${data.get("name")}`,
      `${labels.phone}: ${data.get("phone")}`,
      `${labels.date}: ${data.get("date") || "—"}`,
      `${labels.interest}: ${interest}`,
      data.get("message") ? `${labels.message}: ${data.get("message")}` : "",
      attachPhoto ? labels.photo : ""
    ].filter(Boolean).join("\n");

    if (formStatus) formStatus.textContent = "";
    window.location.assign(`https://wa.me/37127164000?text=${encodeURIComponent(message)}`);
  });
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("is-ready")));

/* catrin-mobile.js */
(() => {
  const mobileQuery = window.matchMedia("(max-width: 900px)");

  const installBrandStyles = () => {
    if (document.querySelector("style[data-catrin-branding]")) return;
    const style = document.createElement("style");
    style.dataset.catrinBranding = "";
    style.textContent = `
.footer-brand {
  width: clamp(100px, 8vw, 118px) !important;
  height: clamp(100px, 8vw, 118px) !important;
}

.footer-brand img {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
}

body[data-page="salon"] .salon-collage-note > img {
  display: block !important;
  width: clamp(104px, 9vw, 136px);
  height: auto;
  margin: 0 0 1.55rem;
  opacity: .94;
  transition: transform 420ms cubic-bezier(.22,1,.36,1), opacity 240ms ease;
}

body[data-page="salon"] .salon-collage-note:hover > img {
  transform: translateY(-3px) scale(1.025);
  opacity: 1;
}

@media (max-width: 900px) {
  .footer-brand {
    width: 96px !important;
    height: 96px !important;
  }

  body[data-page="salon"] .salon-collage-note > img {
    width: 112px;
    margin-bottom: 1.35rem;
  }
}

@media (max-width: 620px) {
  .footer-brand {
    width: 92px !important;
    height: 92px !important;
  }

  body[data-page="salon"] .salon-collage-note > img {
    width: 104px;
    margin-bottom: 1.2rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  body[data-page="salon"] .salon-collage-note > img {
    transition: none !important;
  }

  body[data-page="salon"] .salon-collage-note:hover > img {
    transform: none !important;
  }
}`;
    document.head.appendChild(style);
  };

  const setSalonLanguageAbbreviations = () => {
    if (document.body.dataset.page !== "salon") return;
    const value = document.querySelector(".salon-facts > div:nth-child(3) dd");
    if (value) value.textContent = "LV · RU · ENG";
  };

  const closeMobileMenu = () => {
    if (!mobileQuery.matches) return;
    const button = document.querySelector("[data-menu-button]");
    const navigation = document.querySelector("[data-nav]");
    button?.setAttribute("aria-expanded", "false");
    navigation?.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  const setupGallerySwipe = () => {
    const gallery = document.querySelector("[data-gallery]");
    if (!gallery) return;

    let startX = 0;
    let startY = 0;

    gallery.addEventListener("touchstart", (event) => {
      if (!mobileQuery.matches || event.touches.length !== 1) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    }, { passive: true });

    gallery.addEventListener("touchend", (event) => {
      if (!mobileQuery.matches || event.changedTouches.length !== 1) return;
      const deltaX = event.changedTouches[0].clientX - startX;
      const deltaY = event.changedTouches[0].clientY - startY;
      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

      const controls = [...gallery.querySelectorAll("[data-slide]")];
      if (!controls.length) return;
      const activeIndex = Math.max(0, controls.findIndex((control) => control.classList.contains("is-active")));
      const nextIndex = deltaX < 0
        ? (activeIndex + 1) % controls.length
        : (activeIndex - 1 + controls.length) % controls.length;
      controls[nextIndex]?.click();
    }, { passive: true });
  };

  const setupKeyboardAwareness = () => {
    const viewport = window.visualViewport;
    const actionBar = document.querySelector(".mobile-actions");
    if (!viewport || !actionBar) return;

    const update = () => {
      const keyboardOpen = mobileQuery.matches && viewport.height < window.innerHeight * 0.72;
      document.body.classList.toggle("mobile-keyboard-open", keyboardOpen);
      actionBar.style.visibility = keyboardOpen ? "hidden" : "";
      actionBar.style.opacity = keyboardOpen ? "0" : "";
      actionBar.style.pointerEvents = keyboardOpen ? "none" : "";
      actionBar.style.transform = keyboardOpen ? "translateY(120%)" : "";
    };

    viewport.addEventListener("resize", update, { passive: true });
    viewport.addEventListener("scroll", update, { passive: true });
    window.addEventListener("orientationchange", () => window.setTimeout(update, 180), { passive: true });
    update();
  };

  const scrollToBooking = (behavior = "auto") => {
    if (!mobileQuery.matches || location.hash !== "#pieraksts") return;
    const target = document.querySelector("#pieraksts .booking-copy") || document.getElementById("pieraksts");
    if (!target) return;
    const headerHeight = document.querySelector(".site-header")?.offsetHeight || 70;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 6;
    window.scrollTo({ top: Math.max(0, top), behavior });
  };

  const setupBookingAnchor = () => {
    const alignAfterLayout = () => window.setTimeout(() => scrollToBooking("auto"), 80);

    if (document.readyState === "complete") alignAfterLayout();
    else window.addEventListener("load", alignAfterLayout, { once: true });

    window.addEventListener("hashchange", alignAfterLayout);

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link || !mobileQuery.matches) return;
      const url = new URL(link.href, location.href);
      if (url.pathname !== location.pathname || url.hash !== "#pieraksts") return;
      event.preventDefault();
      history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
      closeMobileMenu();
      window.setTimeout(() => scrollToBooking("smooth"), 0);
    });
  };

  const setupHeroScrollCue = () => {
    const page = document.body.dataset.page;
    let host = null;
    let target = null;

    if (page === "home") {
      host = document.querySelector(".home-hero");
      target = document.querySelector(".service-paths");
    } else if (["dresses", "services", "salon"].includes(page)) {
      host = document.querySelector(".page-hero");
      target = host?.nextElementSibling || null;
    } else if (page === "reviews") {
      host = document.querySelector(".reviews-page-hero");
      target = document.querySelector(".review-stage");
    } else if (page === "contact") {
      host = document.querySelector(".contact-hero");
      target = document.querySelector(".booking-section");
    }

    if (!host || !target || document.querySelector(".hero-scroll-cue")) return;

    const cue = document.createElement("button");
    cue.type = "button";
    cue.className = "hero-scroll-cue";
    document.body.appendChild(cue);

    const updateLabel = () => {
      const labels = {
        lv: "Skatīt nākamo sadaļu",
        ru: "Перейти к следующему разделу",
        en: "View the next section"
      };
      const label = labels[document.documentElement.lang] || labels.lv;
      cue.setAttribute("aria-label", label);
      cue.title = label;
    };

    const updateVisibility = () => {
      const hostRect = host.getBoundingClientRect();
      const headerHeight = document.querySelector(".site-header")?.offsetHeight || 70;
      const visibleRange = Math.min(host.offsetHeight * 0.7, window.innerHeight * 0.84);
      const withinOpening = window.scrollY < host.offsetTop + visibleRange;
      const hostStillVisible = hostRect.bottom > headerHeight + 80;
      const unobstructed = !document.body.classList.contains("nav-open") && !document.body.classList.contains("mobile-keyboard-open");
      cue.classList.toggle("is-visible", withinOpening && hostStillVisible && unobstructed);
    };

    cue.addEventListener("click", () => {
      const headerHeight = document.querySelector(".site-header")?.offsetHeight || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
      cue.classList.remove("is-visible");
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    });

    document.addEventListener("catrin:languagechange", updateLabel);
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility, { passive: true });
    window.addEventListener("orientationchange", () => window.setTimeout(updateVisibility, 180), { passive: true });

    updateLabel();
    window.requestAnimationFrame(updateVisibility);
  };

  document.querySelectorAll(".site-header [data-lang]").forEach((button) => {
    button.addEventListener("click", () => window.setTimeout(() => {
      setSalonLanguageAbbreviations();
      closeMobileMenu();
    }, 0));
  });

  document.addEventListener("catrin:languagechange", setSalonLanguageAbbreviations);
  window.addEventListener("orientationchange", closeMobileMenu, { passive: true });

  installBrandStyles();
  setSalonLanguageAbbreviations();
  setupGallerySwipe();
  setupKeyboardAwareness();
  setupBookingAnchor();
  setupHeroScrollCue();
})();

/* catrin-launch.js */
(() => {
  const currentLanguage = () => supportedLanguages.includes(document.documentElement.lang)
    ? document.documentElement.lang
    : "lv";

  const languageUrl = (lang) => {
    const alternate = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
    return alternate?.href || document.querySelector('link[rel="canonical"]')?.href || location.href;
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
