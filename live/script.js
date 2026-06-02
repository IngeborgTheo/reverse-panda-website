(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealElements = document.querySelectorAll("[data-reveal]");

  if (prefersReducedMotion) {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    revealElements.forEach((el) => {
      const delay = el.getAttribute("data-reveal-delay");
      if (delay) el.style.setProperty("--reveal-delay", `${delay}ms`);
      observer.observe(el);
    });

    document.querySelectorAll("#hero [data-reveal]").forEach((el) => {
      el.classList.add("is-visible");
    });
  }

  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      mobileNav.hidden = isOpen;
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
      });
    });
  }

  const settingsExplorer = document.querySelector(".settings-explorer");
  if (settingsExplorer) {
    const tabs = settingsExplorer.querySelectorAll('[role="tab"]');
    const panels = settingsExplorer.querySelectorAll('[role="tabpanel"]');
    const previewImg = document.querySelector("[data-settings-preview]");
    const previewVideo = document.querySelector("[data-settings-preview-video]");
    const previewStage = document.querySelector("[data-preview-stage]");
    const videoTriggers = settingsExplorer.querySelectorAll("[data-preview-video]");

    function videoMimeType(src) {
      return src.endsWith(".webm") ? "video/webm" : "video/mp4";
    }

    function clearSubmenuActive() {
      settingsExplorer.querySelectorAll(".settings-submenu__btn.is-active").forEach((btn) => {
        btn.classList.remove("is-active");
      });
    }

    function showImagePreview(panelId) {
      clearSubmenuActive();

      if (previewVideo) {
        previewVideo.pause();
        previewVideo.currentTime = 0;
        previewVideo.hidden = true;
      }

      if (previewImg) {
        previewImg.hidden = false;
        const nextSrc = previewImg.getAttribute(`data-preview-${panelId}`);
        if (nextSrc && previewImg.getAttribute("src") !== nextSrc) {
          previewImg.setAttribute("src", nextSrc);
        }
        previewImg.dataset.activePreview = panelId;
      }

      previewStage?.classList.remove("is-video-active");
    }

    function showVideoPreview(videoSrc, triggerBtn) {
      if (!previewVideo || !videoSrc) return;

      clearSubmenuActive();
      triggerBtn?.classList.add("is-active");

      if (previewImg) previewImg.hidden = true;

      const source = previewVideo.querySelector("source");
      if (source && source.getAttribute("src") !== videoSrc) {
        source.setAttribute("src", videoSrc);
        source.setAttribute("type", videoMimeType(videoSrc));
        previewVideo.load();
      }

      previewVideo.hidden = false;
      previewStage?.classList.add("is-video-active");

      if (prefersReducedMotion) return;

      const playAttempt = previewVideo.play();
      if (playAttempt !== undefined) {
        playAttempt.catch(() => {});
      }
    }

    function activateSettingsPanel(panelId) {
      tabs.forEach((tab) => {
        const isActive = tab.dataset.settingsPanel === panelId;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });

      panels.forEach((panel) => {
        const isActive = panel.dataset.settingsPanel === panelId;
        panel.classList.toggle("is-active", isActive);
        panel.hidden = !isActive;
      });

      showImagePreview(panelId);
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        activateSettingsPanel(tab.dataset.settingsPanel);
      });
    });

    videoTriggers.forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = btn.closest("[data-settings-panel]");
        const panelId = panel?.dataset.settingsPanel;

        if (panelId) {
          tabs.forEach((tab) => {
            const isActive = tab.dataset.settingsPanel === panelId;
            tab.classList.toggle("is-active", isActive);
            tab.setAttribute("aria-selected", String(isActive));
            tab.tabIndex = isActive ? 0 : -1;
          });

          panels.forEach((p) => {
            const isActive = p.dataset.settingsPanel === panelId;
            p.classList.toggle("is-active", isActive);
            p.hidden = !isActive;
          });
        }

        showVideoPreview(btn.dataset.previewVideo, btn);
      });
    });

    const initialPanel = tabs[0]?.dataset.settingsPanel;
    if (initialPanel) activateSettingsPanel(initialPanel);
  }
})();
