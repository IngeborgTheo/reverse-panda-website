(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const RP = window.RP;

  /* ── Scroll reveal ── */
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
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
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

  /* ── Mobile nav ── */
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

  if (!RP) return;

  /* ── Hero tracks ── */
  const leftTrack = document.querySelector('[data-hero-track="left"]');
  const rightTrack = document.querySelector('[data-hero-track="right"]');
  if (leftTrack) {
    leftTrack.innerHTML = RP.renderTrack(window.RP_HERO_LEFT, { duplicate: true, caption: false });
  }
  if (rightTrack) {
    rightTrack.innerHTML = RP.renderTrack(window.RP_HERO_RIGHT, { duplicate: true, caption: false });
  }

  /* ── Showcase gallery (static) ── */
  const galleryMount = document.querySelector("[data-showcase-gallery]");
  if (galleryMount) {
    const showcaseThemes = {
      "bubble-cloud": "light",
      "classic-pages": "light",
      "continuous-canvas": "dark",
      "hidden-dock": "dark",
      "multi-column": "light"
    };
    const showcaseIds = window.RP_SHOWCASE || [];
    galleryMount.innerHTML = showcaseIds
      .map((id) => {
        const preview = RP.getById(id);
        return preview
          ? RP.renderCard(preview, {
              showCaption: true,
              lazy: true,
              theme: showcaseThemes[id] || preview.theme
            })
          : "";
      })
      .join("");
  }

  /* ── Feature explorer ── */
  const featurePanel = document.querySelector("[data-feature-panel]");
  const featureTabs = document.querySelectorAll("[data-feature]");
  const FEATURES = {
    home: {
      num: "01",
      category: "HOME SCREEN",
      headline: "BREAK FREE<br>FROM THE GRID.",
      desc: "Choose how apps are arranged and how you move through your home screen.",
      examples: "CLASSIC PAGINATED  /  CONTINUOUS CANVAS  /  BUBBLE CLOUD",
      visual: `
        <div class="fx-stage" data-fx-stage="home">
          <div class="fx fx--home">
            <span class="fx-icon" style="--x:12%;--y:18%"></span>
            <span class="fx-icon accent" style="--x:38%;--y:12%"></span>
            <span class="fx-icon" style="--x:64%;--y:22%"></span>
            <span class="fx-icon round" style="--x:22%;--y:42%"></span>
            <span class="fx-icon" style="--x:48%;--y:48%"></span>
            <span class="fx-icon accent" style="--x:72%;--y:40%"></span>
            <span class="fx-icon" style="--x:18%;--y:68%"></span>
            <span class="fx-icon round" style="--x:44%;--y:72%"></span>
            <span class="fx-icon" style="--x:68%;--y:66%"></span>
          </div>
        </div>`
    },
    dock: {
      num: "02",
      category: "DOCK",
      headline: "NOT JUST<br>A ROW OF ICONS.",
      desc: "Turn the dock into something that actually changes how your launcher feels.",
      examples: "LINEAR  /  WHEEL  /  CYLINDER  /  COVER FLOW",
      visual: `
        <div class="fx-stage" data-fx-stage="dock">
          <div class="fx fx--dock">
            <div class="fx-dock-arc">
              <span class="fx-icon"></span>
              <span class="fx-icon"></span>
              <span class="fx-icon"></span>
              <span class="fx-icon"></span>
              <span class="fx-icon"></span>
              <div class="fx-dock-base"></div>
            </div>
          </div>
        </div>`
    },
    drawer: {
      num: "03",
      category: "APP DRAWER",
      headline: "FIND APPS<br>YOUR WAY.",
      desc: "Choose how your apps are organized and how you move through them.",
      examples: "CLASSIC GRID  /  MULTI COLUMN  /  SCROLLABLE LIST",
      visual: `
        <div class="fx-stage" data-fx-stage="drawer">
          <div class="fx fx--drawer">
            <div class="fx-col"><span class="fx-icon"></span><span class="fx-icon soft"></span><span class="fx-icon"></span><span class="fx-icon"></span></div>
            <div class="fx-col"><span class="fx-icon"></span><span class="fx-icon"></span><span class="fx-icon"></span><span class="fx-icon soft"></span></div>
            <div class="fx-col"><span class="fx-icon soft"></span><span class="fx-icon"></span><span class="fx-icon"></span><span class="fx-icon"></span></div>
          </div>
        </div>`
    },
    folders: {
      num: "04",
      category: "FOLDERS",
      headline: "MORE THAN<br>A SQUARE.",
      desc: "Change how folders look, open and arrange the apps inside them.",
      examples: "GRID  /  LIST  /  STACK",
      visual: `
        <div class="fx-stage" data-fx-stage="folders">
          <div class="fx fx--folders">
            <div class="fx-folder is-muted"><span></span><span></span><span></span><span></span></div>
            <div class="fx-folder is-open"><span></span><span></span><span></span><span></span></div>
            <div class="fx-folder is-muted"><span></span><span></span><span></span><span></span></div>
          </div>
        </div>`
    },
    motion: {
      num: "05",
      category: "MOTION",
      headline: "MAKE IT<br>MOVE YOUR WAY.",
      desc: "Choose transitions and animations that change how navigation feels.",
      examples: "PAGE TRANSITIONS  /  SCROLL EFFECTS  /  GESTURES",
      visual: `
        <div class="fx-stage" data-fx-stage="motion">
          <div class="fx fx--motion">
            <div class="fx-screens">
              <div class="fx-screen s1"></div>
              <div class="fx-screen s2"></div>
              <div class="fx-screen s3"></div>
            </div>
          </div>
        </div>`
    }
  };

  function renderFeature(id, animate) {
    const feature = FEATURES[id];
    if (!feature || !featurePanel) return;

    const numEl = featurePanel.querySelector("[data-feature-num]");
    const catEl = featurePanel.querySelector("[data-feature-cat]");
    const headlineEl = featurePanel.querySelector("[data-feature-headline]");
    const descEl = featurePanel.querySelector("[data-feature-desc]");
    const examplesEl = featurePanel.querySelector("[data-feature-examples]");
    const visualEl = featurePanel.querySelector("[data-feature-visual]");
    const activeTab = document.getElementById(`feature-tab-${id}`);

    const apply = () => {
      if (numEl) numEl.textContent = feature.num;
      if (catEl) catEl.textContent = feature.category;
      if (headlineEl) headlineEl.innerHTML = feature.headline;
      if (descEl) descEl.textContent = feature.desc;
      if (examplesEl) examplesEl.textContent = feature.examples;
      if (visualEl) visualEl.innerHTML = feature.visual;
      featurePanel.setAttribute("aria-labelledby", `feature-tab-${id}`);
      featureTabs.forEach((tab) => {
        const active = tab.dataset.feature === id;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
      });
    };

    if (animate && !prefersReducedMotion) {
      featurePanel.classList.add("is-switching");
      window.setTimeout(() => {
        apply();
        featurePanel.classList.remove("is-switching");
      }, 160);
    } else {
      apply();
    }

    if (activeTab && activeTab.scrollIntoView && window.matchMedia("(max-width: 980px)").matches) {
      activeTab.scrollIntoView({ inline: "center", block: "nearest", behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  }

  if (featurePanel && featureTabs.length) {
    featureTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        if (tab.classList.contains("is-active")) return;
        renderFeature(tab.dataset.feature, true);
      });
    });
  }

})();
