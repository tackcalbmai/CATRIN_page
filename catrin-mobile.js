(() => {
  const mobileQuery = window.matchMedia("(max-width: 900px)");

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
      const activeIndex = Math.max(0, controls.findIndex((control) => control.classList.contains("is-active")));
      const nextIndex = deltaX < 0
        ? (activeIndex + 1) % controls.length
        : (activeIndex - 1 + controls.length) % controls.length;
      controls[nextIndex]?.click();
    }, { passive: true });
  };

  const setupKeyboardAwareness = () => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      if (!mobileQuery.matches) {
        document.body.classList.remove("mobile-keyboard-open");
        return;
      }
      const keyboardOpen = viewport.height < window.innerHeight * 0.72;
      document.body.classList.toggle("mobile-keyboard-open", keyboardOpen);
    };

    viewport.addEventListener("resize", update, { passive: true });
    viewport.addEventListener("scroll", update, { passive: true });
    window.addEventListener("orientationchange", () => window.setTimeout(update, 180), { passive: true });
    update();
  };

  document.querySelectorAll(".site-header [data-lang]").forEach((button) => {
    button.addEventListener("click", () => window.setTimeout(() => {
      setSalonLanguageAbbreviations();
      closeMobileMenu();
    }, 0));
  });

  document.addEventListener("catrin:languagechange", setSalonLanguageAbbreviations);
  window.addEventListener("orientationchange", closeMobileMenu, { passive: true });

  setSalonLanguageAbbreviations();
  setupGallerySwipe();
  setupKeyboardAwareness();
})();
