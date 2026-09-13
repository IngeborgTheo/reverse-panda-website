(function () {
  document.documentElement.classList.add("js");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const RP = window.RP;

  /* ── Scroll reveal ── */
  const revealSelector = ".reveal, .reveal-soft, .reveal-heading, .reveal-item, [data-reveal]";

  function assignStaggerDelays(root) {
    root.querySelectorAll(".reveal-stagger").forEach((group) => {
      const items = group.querySelectorAll(":scope > .reveal-item");
      items.forEach((item, index) => {
        if (item.hasAttribute("data-reveal-delay")) return;
        const delay = Math.min(index * 70, 250);
        item.style.setProperty("--reveal-delay", `${delay}ms`);
      });
    });
  }

  function prepareRevealElement(el) {
    const delay = el.getAttribute("data-reveal-delay");
    if (delay) el.style.setProperty("--reveal-delay", `${delay}ms`);
  }

  function revealAll(elements) {
    elements.forEach((el) => el.classList.add("is-visible"));
  }

  function initReveal(extraElements) {
    assignStaggerDelays(document);
    const revealElements = Array.from(
      new Set([
        ...document.querySelectorAll(revealSelector),
        ...(extraElements || [])
      ])
    );

    revealElements.forEach(prepareRevealElement);

    if (prefersReducedMotion) {
      revealAll(revealElements);
      return null;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -4% 0px" }
    );

    revealElements.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      observer.observe(el);
    });

    return observer;
  }

  const revealObserver = initReveal();

  function observeNewReveals(elements) {
    if (!elements || !elements.length) return;
    if (prefersReducedMotion || !revealObserver) {
      revealAll(elements);
      return;
    }
    elements.forEach((el) => {
      prepareRevealElement(el);
      if (el.classList.contains("is-visible")) return;
      revealObserver.observe(el);
    });
  }

  /* ── Subtle scroll drift for selected visuals ── */
  function initDrift() {
    if (prefersReducedMotion) return;

    const driftEls = Array.from(document.querySelectorAll("[data-reveal-drift]")).map((el) => ({
      el,
      amount: Number(el.getAttribute("data-drift-amount")) || 18
    }));
    if (!driftEls.length) return;

    let ticking = false;

    function updateDrift() {
      ticking = false;
      const vh = window.innerHeight || 1;
      driftEls.forEach(({ el, amount }) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -40 || rect.top > vh + 40) return;
        const centerOffset = vh * 0.5 - (rect.top + rect.height * 0.5);
        const progress = Math.max(-1, Math.min(1, centerOffset / vh));
        const y = progress * amount;
        el.style.setProperty("--drift-y", `${y.toFixed(2)}px`);
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateDrift);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateDrift();
  }

  /* ── Community feature ── */
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderCommunityVisual(layout) {
    if (layout.image) {
      return `<img class="community-frame__media" src="${escapeHtml(layout.image)}" alt="${escapeHtml(layout.title)} setup" loading="lazy" decoding="async" width="360" height="700" data-reveal-drift data-drift-amount="14">`;
    }

    const visual = layout.visual || "midnight-minimal";
    if (visual === "midnight-minimal") {
      return `
        <div class="community-setup community-setup--midnight" data-reveal-drift data-drift-amount="14" aria-hidden="true">
          <div class="community-setup__status"></div>
          <div class="community-setup__grid">
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
          </div>
          <p class="community-setup__hint">Placeholder setup</p>
        </div>`;
    }

    return `<div class="community-setup community-setup--midnight" aria-hidden="true"><div class="community-setup__status"></div></div>`;
  }

  function renderCommunityByline(layout) {
    const name = layout.creator || "Anonymous";
    const handle = layout.creatorHandle ? ` ${escapeHtml(layout.creatorHandle)}` : "";
    if (layout.creatorUrl) {
      return `<p class="community__by reveal-item reveal-soft" data-reveal="soft">by <a href="${escapeHtml(layout.creatorUrl)}" rel="noopener noreferrer">${escapeHtml(name)}</a>${handle}</p>`;
    }
    return `<p class="community__by reveal-item reveal-soft" data-reveal="soft">by ${escapeHtml(name)}${handle}</p>`;
  }

  function renderCommunitySection() {
    const mount = document.querySelector("[data-community-section]");
    const data = window.RP_COMMUNITY;
    if (!mount || !data || !data.featured) return;

    const featured = data.featured;
    const mode = data.mode === "week" ? "week" : "featured";
    const heading = mode === "week" ? "LAYOUT OF THE WEEK." : "FEATURED SETUP.";
    const eyebrow = mode === "week" ? "COMMUNITY" : "FEATURED";
    const lead =
      mode === "week"
        ? "A setup from the ReversePanda community."
        : "Built by someone who didn't settle for default.";
    const submitHref = data.submitHref || "contact.html?type=layout";
    const previous = Array.isArray(data.previous) ? data.previous.filter(Boolean) : [];
    const tags = Array.isArray(featured.tags) ? featured.tags.slice(0, 4) : [];

    const tagsHtml = tags
      .map(
        (tag, index) =>
          `<span class="community__tag${index === 0 ? " is-accent" : ""}">${escapeHtml(tag)}</span>`
      )
      .join("");

    const previousHtml =
      previous.length > 0
        ? `
      <div class="community__previous reveal" data-reveal>
        <p class="community__previous-label">PREVIOUS FEATURES</p>
        <div class="community__previous-row">
          ${previous
            .slice(0, 3)
            .map((item) => {
              const thumb = item.image
                ? `<img class="community-prev__thumb" src="${escapeHtml(item.image)}" alt="" loading="lazy" decoding="async" width="150" height="267">`
                : `<div class="community-prev__thumb" aria-hidden="true"></div>`;
              return `
                <article class="community-prev">
                  ${thumb}
                  <p class="community-prev__title">${escapeHtml(item.title || "Setup")}</p>
                </article>`;
            })
            .join("")}
        </div>
      </div>`
        : "";

    mount.innerHTML = `
      <header class="community__intro reveal-stagger">
        <p class="community__eyebrow reveal-item reveal-soft" data-reveal="soft">
          <span class="community__mark" aria-hidden="true"></span>
          ${escapeHtml(eyebrow)}
        </p>
        <h2 class="community__title reveal-item reveal-heading" id="community-heading" data-reveal="heading">
          ${escapeHtml(heading)}
        </h2>
        <p class="community__lead reveal-item reveal-soft" data-reveal="soft">
          ${escapeHtml(lead)}
        </p>
      </header>

      <div class="community__feature">
        <div class="community__visual reveal" data-reveal data-reveal-delay="60">
          <div class="community-frame">
            ${renderCommunityVisual(featured)}
          </div>
        </div>

        <div class="community__meta reveal-stagger">
          <h3 class="community__layout-title reveal-item reveal-heading" data-reveal="heading">
            ${escapeHtml(featured.title || "Untitled setup")}
          </h3>
          ${renderCommunityByline(featured)}
          ${
            featured.description
              ? `<p class="community__desc reveal-item reveal-soft" data-reveal="soft">${escapeHtml(featured.description)}</p>`
              : ""
          }
          ${
            tagsHtml
              ? `<div class="community__tags reveal-item" data-reveal>${tagsHtml}</div>`
              : ""
          }
          <div class="community__submit reveal-item reveal-soft" data-reveal="soft">
            <p class="community__submit-label">WANT YOUR SETUP FEATURED?</p>
            <p class="community__submit-copy">Send us your ReversePanda layout.</p>
            <a class="community__submit-link" href="${escapeHtml(submitHref)}">
              SUBMIT YOUR LAYOUT <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
      ${previousHtml}
    `;

    assignStaggerDelays(mount);
    observeNewReveals(
      Array.from(
        mount.querySelectorAll(".reveal, .reveal-soft, .reveal-heading, .reveal-item, [data-reveal]")
      )
    );
  }

  renderCommunitySection();
  initDrift();

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

    const galleryCards = Array.from(galleryMount.querySelectorAll(".lp"));
    galleryCards.forEach((card, index) => {
      card.classList.add("reveal", "reveal-item");
      card.setAttribute("data-reveal", "soft");
      card.style.setProperty("--reveal-delay", `${Math.min(index * 70, 250)}ms`);
    });
    observeNewReveals(galleryCards);
  }

  /* ── Detail lab ── */
  const DETAIL = {
    icons: {
      note: "Adjust icon size on the home screen.",
      options: [
        { id: "small", label: "Small" },
        { id: "default", label: "Default" },
        { id: "large", label: "Large" }
      ]
    },
    labels: {
      note: "Keep app names visible, or clear the screen.",
      options: [
        { id: "show", label: "Show" },
        { id: "hidden", label: "Hidden" }
      ]
    },
    folders: {
      note: "Change how a folder presents the apps inside.",
      options: [
        { id: "standard", label: "Standard" },
        { id: "fan", label: "Fan" },
        { id: "arc", label: "Arc" }
      ]
    },
    dock: {
      note: "Choose a dock layout — or hide it entirely.",
      options: [
        { id: "linear", label: "Linear" },
        { id: "wheel", label: "Wheel" },
        { id: "hidden", label: "Hidden Dock" }
      ]
    }
  };

  const detailPreview = document.querySelector("[data-detail-preview]");
  const detailOpts = document.querySelector("[data-detail-opts]");
  const detailNote = document.querySelector("[data-detail-note]");
  const detailCats = Array.from(document.querySelectorAll("[data-detail-cat]"));

  if (detailPreview && detailOpts && detailCats.length) {
    const state = {
      icons: detailPreview.getAttribute("data-icons") || "default",
      labels: detailPreview.getAttribute("data-labels") || "show",
      folders: detailPreview.getAttribute("data-folders") || "standard",
      dock: detailPreview.getAttribute("data-dock") || "linear"
    };
    let activeCat = "icons";

    function applyPreview(animate) {
      const run = () => {
        detailPreview.setAttribute("data-icons", state.icons);
        detailPreview.setAttribute("data-labels", state.labels);
        detailPreview.setAttribute("data-folders", state.folders);
        detailPreview.setAttribute("data-dock", state.dock);
      };

      if (!animate || prefersReducedMotion) {
        run();
        return;
      }

      detailPreview.classList.add("is-updating");
      window.setTimeout(() => {
        run();
        detailPreview.classList.remove("is-updating");
      }, 140);
    }

    function renderOptions(animate) {
      const config = DETAIL[activeCat];
      if (!config) return;

      detailOpts.innerHTML = config.options
        .map(
          (option) => `
            <button
              type="button"
              class="detail-opts__item${state[activeCat] === option.id ? " is-active" : ""}"
              data-detail-opt="${option.id}"
            >
              ${option.label}
            </button>`
        )
        .join("");

      if (detailNote) detailNote.textContent = config.note;
      detailOpts.setAttribute("aria-labelledby", `detail-cat-${activeCat}`);

      if (animate && !prefersReducedMotion) {
        detailOpts.classList.remove("is-swapping");
        void detailOpts.offsetWidth;
        detailOpts.classList.add("is-swapping");
      }

      detailOpts.querySelectorAll("[data-detail-opt]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const value = btn.getAttribute("data-detail-opt");
          if (!value || state[activeCat] === value) return;
          state[activeCat] = value;
          renderOptions(false);
          applyPreview(true);
        });
      });
    }

    function setCategory(cat, animate) {
      if (!DETAIL[cat]) return;
      activeCat = cat;
      detailCats.forEach((tab) => {
        const active = tab.getAttribute("data-detail-cat") === cat;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
      });
      renderOptions(animate);
    }

    detailCats.forEach((tab) => {
      tab.addEventListener("click", () => {
        const cat = tab.getAttribute("data-detail-cat");
        if (!cat || cat === activeCat) return;
        setCategory(cat, true);
      });
    });

    setCategory("icons", false);
    applyPreview(false);
  }
})();
