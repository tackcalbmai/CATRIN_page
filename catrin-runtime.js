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

function storedLanguage() {
  try { return localStorage.getItem("catrin-lang"); }
  catch { return null; }
}

let language = new URLSearchParams(location.search).get("lang") || storedLanguage() || "lv";
if (!["lv", "ru", "en"].includes(language)) language = "lv";

function valueFor(key) {
  return copy[language]?.[key] ?? initialText[key];
}

function updateLocalLinks() {
  document.querySelectorAll("a[data-local-link]").forEach((link) => {
    const raw = link.getAttribute("href");
    if (!raw || raw.startsWith("#") || raw.startsWith("tel:") || raw.startsWith("mailto:")) return;
    const url = new URL(raw, location.href);
    if (language === "lv") url.searchParams.delete("lang");
    else url.searchParams.set("lang", language);
    link.href = url.href;
  });
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

function translate(nextLanguage, updateAddress = true) {
  language = ["lv", "ru", "en"].includes(nextLanguage) ? nextLanguage : "lv";
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
  updateLocalLinks();

  try { localStorage.setItem("catrin-lang", language); }
  catch { /* Translation remains active without storage. */ }

  if (updateAddress) {
    const url = new URL(location.href);
    if (language === "lv") url.searchParams.delete("lang");
    else url.searchParams.set("lang", language);
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  document.dispatchEvent(new CustomEvent("catrin:languagechange"));
}

document.querySelectorAll("[data-lang]").forEach((button) => {
  button.addEventListener("click", () => translate(button.dataset.lang));
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

translate(language, false);

const gallery = document.querySelector("[data-gallery]");
if (gallery) {
  const slides = [...gallery.querySelectorAll(".hero-images figure")];
  const controls = [...gallery.querySelectorAll("[data-slide]")];
  let currentSlide = 0;
  let galleryTimer = 0;

  const showSlide = (index) => {
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === currentSlide));
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
  startGallery();
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
