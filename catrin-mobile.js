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
      if (!mobileQuery.matches) {
        cue.classList.remove("is-visible");
        return;
      }
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
