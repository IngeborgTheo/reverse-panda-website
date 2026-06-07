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

    const previewContent = document.querySelector("[data-preview-content]");

    const previewArea = document.querySelector("[data-preview-area]");

    const previewCopyBlocks = document.querySelectorAll(".showcase-preview-copy");
    const previewCopySlot = document.querySelector("[data-preview-copy-slot]");

    const subsectionTriggers = settingsExplorer.querySelectorAll("[data-settings-subsection]");

    const layoutTriggers = settingsExplorer.querySelectorAll("[data-preview-layout]");



    function videoMimeType(src) {

      return src.endsWith(".webm") ? "video/webm" : "video/mp4";

    }



    function hidePreviewCopy() {
      previewCopyBlocks.forEach((block) => {
        block.hidden = true;
      });
      if (previewCopySlot) previewCopySlot.hidden = true;
      previewContent?.classList.remove("is-expanded");
      previewArea?.classList.remove("is-expanded");
    }

    function showPreviewCopy(copyId) {
      hidePreviewCopy();
      if (!copyId) return;

      const block = document.querySelector(`.showcase-preview-copy[data-preview-copy-id="${copyId}"]`);
      if (block) {
        if (previewCopySlot) previewCopySlot.hidden = false;
        block.hidden = false;
        previewContent?.classList.add("is-expanded");
        previewArea?.classList.add("is-expanded");
      }
    }



    function hideSubsections() {

      settingsExplorer.querySelectorAll("[data-settings-subsection-panel]").forEach((panel) => {

        panel.hidden = true;

      });

      subsectionTriggers.forEach((btn) => {

        btn.classList.remove("is-open");

        btn.setAttribute("aria-expanded", "false");

      });

    }



    function clearLayoutActive() {

      layoutTriggers.forEach((btn) => btn.classList.remove("is-active"));

    }



    function clearSubmenuActive() {

      settingsExplorer.querySelectorAll(".settings-submenu__btn.is-active").forEach((btn) => {

        btn.classList.remove("is-active");

      });

      hideSubsections();

      clearLayoutActive();

    }



    function syncPanelTabs(panelId) {

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

    }



    function showImagePreview(panelId) {

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

      hidePreviewCopy();

    }



    function showVideoPreview(videoSrc, triggerBtn) {

      if (!previewVideo || !videoSrc) return;



      if (previewImg) previewImg.hidden = true;



      const source = previewVideo.querySelector("source");

      if (source && source.getAttribute("src") !== videoSrc) {

        source.setAttribute("src", videoSrc);

        source.setAttribute("type", videoMimeType(videoSrc));

        previewVideo.load();

      }



      previewVideo.hidden = false;

      previewStage?.classList.add("is-video-active");

      showPreviewCopy(triggerBtn?.dataset.previewCopyId);



      if (prefersReducedMotion) return;



      const playAttempt = previewVideo.play();

      if (playAttempt !== undefined) {

        playAttempt.catch(() => {});

      }

    }



    function showLayoutPreview(triggerBtn) {

      const panel = triggerBtn.closest("[data-settings-panel]");

      const panelId = panel?.dataset.settingsPanel || "drawer";



      syncPanelTabs(panelId);

      clearLayoutActive();

      triggerBtn.classList.add("is-active");



      const subsectionBtn = settingsExplorer.querySelector('[data-settings-subsection="sorting-layout"]');

      const subsectionPanel = settingsExplorer.querySelector('[data-settings-subsection-panel="sorting-layout"]');

      if (subsectionBtn && subsectionPanel) {

        subsectionBtn.classList.add("is-open", "is-active");

        subsectionBtn.setAttribute("aria-expanded", "true");

        subsectionPanel.hidden = false;

      }



      const videoSrc = triggerBtn.dataset.previewVideo;

      if (videoSrc) {

        showVideoPreview(videoSrc, triggerBtn);

        return;

      }



      showImagePreview(panelId);

      showPreviewCopy(triggerBtn.dataset.previewCopyId);

    }



    function activateSettingsPanel(panelId) {

      syncPanelTabs(panelId);

      clearSubmenuActive();

      showImagePreview(panelId);

    }



    function toggleSubsection(triggerBtn) {

      const subsectionId = triggerBtn.dataset.settingsSubsection;

      const subsectionPanel = settingsExplorer.querySelector(

        `[data-settings-subsection-panel="${subsectionId}"]`

      );

      const isOpen = triggerBtn.classList.contains("is-open");



      clearLayoutActive();

      settingsExplorer.querySelectorAll(".settings-submenu__btn.is-active").forEach((btn) => {

        btn.classList.remove("is-active");

      });

      hideSubsections();

      hidePreviewCopy();

      showImagePreview("drawer");



      if (!isOpen && subsectionPanel) {

        triggerBtn.classList.add("is-open", "is-active");

        triggerBtn.setAttribute("aria-expanded", "true");

        subsectionPanel.hidden = false;

      }

    }



    tabs.forEach((tab) => {

      tab.addEventListener("click", () => {

        activateSettingsPanel(tab.dataset.settingsPanel);

      });

    });



    subsectionTriggers.forEach((btn) => {

      btn.addEventListener("click", () => {

        syncPanelTabs("drawer");

        toggleSubsection(btn);

      });

    });



    layoutTriggers.forEach((btn) => {

      btn.addEventListener("click", () => {

        showLayoutPreview(btn);

      });

    });



    const initialPanel = tabs[0]?.dataset.settingsPanel;

    if (initialPanel) activateSettingsPanel(initialPanel);

  }

})();


