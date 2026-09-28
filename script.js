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
  document.querySelectorAll("[data-theme-compare]").forEach(initThemeCompare);

  function initThemeCompare(root) {
    const stage = root.querySelector(".theme-compare__stage");
    const valueTarget = root.getAttribute("data-compare-target") || "the right side";
    const range = root.querySelector("[data-theme-compare-range]");
    if (!stage || !range) return;

    const INITIAL = 58;
    let introPlayed = false;
    let dragging = false;
    let activePointer = null;
    let raf = 0;
    let pendingValue = null;

    function commitPosition(value, { animate = false } = {}) {
      const clamped = Math.max(0, Math.min(100, Number(value)));
      if (animate) root.classList.add("is-animating");
      else root.classList.remove("is-animating");

      root.style.setProperty("--compare-pos", `${clamped}%`);
      range.value = String(Math.round(clamped));
      range.setAttribute("aria-valuenow", String(Math.round(clamped)));
      range.setAttribute(
        "aria-valuetext",
        `${Math.round(clamped)} percent toward ${valueTarget}`
      );
    }

    function queuePosition(value) {
      pendingValue = value;
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        if (pendingValue == null) return;
        commitPosition(pendingValue);
        pendingValue = null;
      });
    }

    function positionFromClientX(clientX) {
      const rect = stage.getBoundingClientRect();
      if (!rect.width) return INITIAL;
      return ((clientX - rect.left) / rect.width) * 100;
    }

    stage.addEventListener("pointerdown", (event) => {
      if (event.button != null && event.button !== 0) return;
      activePointer = event.pointerId;
      dragging = true;
      root.classList.add("is-dragging");
      root.classList.remove("is-animating");
      stage.setPointerCapture(activePointer);
      queuePosition(positionFromClientX(event.clientX));
      event.preventDefault();
    });

    stage.addEventListener("pointermove", (event) => {
      if (!dragging || event.pointerId !== activePointer) return;
      queuePosition(positionFromClientX(event.clientX));
    });

    function endDrag(event) {
      if (event && activePointer != null && event.pointerId !== activePointer) return;
      dragging = false;
      activePointer = null;
      root.classList.remove("is-dragging");
    }

    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);

    range.addEventListener("input", () => {
      root.classList.remove("is-animating");
      commitPosition(range.value);
    });
    range.addEventListener("change", () => commitPosition(range.value));

    if (prefersReducedMotion) {
      commitPosition(INITIAL);
      return;
    }

    commitPosition(50);

    const introObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || introPlayed) return;
          introPlayed = true;
          introObserver.disconnect();
          window.requestAnimationFrame(() => {
            commitPosition(INITIAL, { animate: true });
            window.setTimeout(() => root.classList.remove("is-animating"), 520);
          });
        });
      },
      { threshold: 0.35 }
    );

    introObserver.observe(root);
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

  function keyGreenPixels(data) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const maxRb = Math.max(r, b);

      // Key typical green-screen pixels; soften near edges.
      if (g > 90 && g > maxRb * 1.4 && g - maxRb > 28) {
        data[i + 3] = 0;
      } else if (g > 70 && g > maxRb * 1.2 && g - maxRb > 14) {
        const strength = Math.min(1, (g - maxRb) / 70);
        data[i + 3] = Math.round(data[i + 3] * (1 - strength));
      }
    }
  }

  function findKeyedBounds(video) {
    const width = video.videoWidth;
    const height = video.videoHeight;
    const probe = document.createElement("canvas");
    probe.width = width;
    probe.height = height;
    const probeCtx = probe.getContext("2d", { willReadFrequently: true });
    probeCtx.drawImage(video, 0, 0, width, height);
    const data = probeCtx.getImageData(0, 0, width, height).data;

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const i = (y * width + x) * 4;
        const g = data[i + 1];
        const maxRb = Math.max(data[i], data[i + 2]);
        if (g > 90 && g > maxRb * 1.4 && g - maxRb > 28) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    if (maxX <= minX || maxY <= minY) return { x: 0, y: 0, w: width, h: height };
    const pad = 4;
    const x = Math.max(0, minX - pad);
    const y = Math.max(0, minY - pad);
    return {
      x,
      y,
      w: Math.min(width, maxX + pad) - x,
      h: Math.min(height, maxY + pad) - y
    };
  }

  function mountCardVideo(mount) {
    const canvas = mount.querySelector("canvas");
    const src = mount.getAttribute("data-lp-video");
    if (!canvas || !src) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const video = document.createElement("video");
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "");
    video.preload = "none";

    let crop = null;
    let loaded = false;
    let visible = false;
    let frameHandle = 0;
    const useVideoFrameCallback = "requestVideoFrameCallback" in video;

    function draw() {
      if (video.readyState < 2 || !video.videoWidth) return;
      if (!crop) {
        crop = findKeyedBounds(video);
        canvas.width = crop.w;
        canvas.height = crop.h;
      }
      ctx.drawImage(video, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
      const frame = ctx.getImageData(0, 0, crop.w, crop.h);
      keyGreenPixels(frame.data);
      ctx.putImageData(frame, 0, 0);
    }

    function scheduleFrame() {
      if (video.paused || video.ended) {
        frameHandle = 0;
        return;
      }
      frameHandle = useVideoFrameCallback
        ? video.requestVideoFrameCallback(() => {
            draw();
            scheduleFrame();
          })
        : window.requestAnimationFrame(() => {
            draw();
            scheduleFrame();
          });
    }

    function stopFrames() {
      if (!frameHandle) return;
      if (useVideoFrameCallback) video.cancelVideoFrameCallback(frameHandle);
      else window.cancelAnimationFrame(frameHandle);
      frameHandle = 0;
    }

    function ensureLoaded() {
      if (loaded) return;
      loaded = true;
      video.preload = prefersReducedMotion ? "metadata" : "auto";
      video.src = src;
    }

    function sync() {
      if (!visible) {
        stopFrames();
        video.pause();
        return;
      }
      ensureLoaded();
      if (prefersReducedMotion || document.hidden) {
        stopFrames();
        video.pause();
        return;
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }

    video.addEventListener("loadeddata", draw);
    video.addEventListener("seeked", draw);
    video.addEventListener("play", () => {
      if (!frameHandle) scheduleFrame();
    });
    video.addEventListener("pause", stopFrames);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
          sync();
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(mount);
    document.addEventListener("visibilitychange", sync);
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
              video: true,
              theme: showcaseThemes[id] || preview.theme
            })
          : "";
      })
      .join("");

    galleryMount.querySelectorAll("[data-lp-video]").forEach(mountCardVideo);

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
      note: "Choose a dock layout.",
      options: [
        {
          id: "linear",
          label: "Linear",
          video: "assets/videos/showcase/dock/showcase-dock-linear-gs.mp4",
          description: "A familiar dock, kept simple.",
          chromaKey: "green"
        },
        {
          id: "rotary",
          label: "Rotary",
          video: "assets/videos/showcase/dock/showcase-dock-rotary.mp4",
          description: "Apps arranged around a rotating dock.",
          chromaKey: "green"
        }
        // Add future docks here, e.g. wheel / cylinder / cover-flow.
      ]
    }
  };

  const detailStage = document.querySelector("[data-detail-stage]");
  const detailPreview = document.querySelector("[data-detail-preview]");
  const detailOpts = document.querySelector("[data-detail-opts]");
  const detailNote = document.querySelector("[data-detail-note]");
  const detailCats = Array.from(document.querySelectorAll("[data-detail-cat]"));
  const detailVideoStage = document.querySelector("[data-detail-video-stage]");
  const detailVideoFrame = document.querySelector("[data-detail-video-frame]");
  const detailVideoReplay = document.querySelector("[data-detail-video-replay]");
  const detailSection = document.getElementById("features");

  if (detailPreview && detailOpts && detailCats.length) {
    const state = {
      icons: detailPreview.getAttribute("data-icons") || "default",
      labels: detailPreview.getAttribute("data-labels") || "show",
      folders: detailPreview.getAttribute("data-folders") || "standard",
      dock: detailPreview.getAttribute("data-dock") || "linear"
    };
    let activeCat = "icons";
    let sectionVisible = true;
    let lastActiveDockId = null;
    const dockVideos = new Map();

    function setReplayVisible(visible, label) {
      if (!detailVideoReplay) return;
      detailVideoReplay.hidden = !visible;
      detailVideoReplay.setAttribute(
        "aria-label",
        label === "Play" ? "Play dock demo" : "Replay dock demo"
      );
    }

    function stopChromaLoop(entry) {
      if (!entry || !entry.rafId) return;
      window.cancelAnimationFrame(entry.rafId);
      entry.rafId = 0;
    }

    function drawChromaFrame(entry) {
      const { video, canvas, ctx } = entry;
      if (!canvas || !ctx || video.readyState < 2) return;

      const width = video.videoWidth || canvas.width;
      const height = video.videoHeight || canvas.height;
      if (!width || !height) return;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.drawImage(video, 0, 0, width, height);
      const frame = ctx.getImageData(0, 0, width, height);
      keyGreenPixels(frame.data);
      ctx.putImageData(frame, 0, 0);
    }

    function startChromaLoop(entry) {
      if (!entry || !entry.canvas || entry.rafId) return;

      const tick = () => {
        drawChromaFrame(entry);
        if (!entry.video.paused && !entry.video.ended) {
          entry.rafId = window.requestAnimationFrame(tick);
        } else {
          entry.rafId = 0;
        }
      };

      entry.rafId = window.requestAnimationFrame(tick);
    }

    function playDockEntry(entry) {
      if (!entry) return;
      setReplayVisible(false);
      const playPromise = entry.video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
      if (entry.chromaKey) startChromaLoop(entry);
    }

    function restartDockEntry(entry) {
      if (!entry) return;
      stopChromaLoop(entry);
      try {
        entry.video.currentTime = 0;
      } catch {
        // Ignore seek errors before metadata.
      }
      playDockEntry(entry);
    }

    function mountDockVideos() {
      if (!detailVideoFrame || dockVideos.size) return;

      DETAIL.dock.options.forEach((option) => {
        if (!option.video) return;

        const video = document.createElement("video");
        video.muted = true;
        video.defaultMuted = true;
        video.loop = false;
        video.playsInline = true;
        video.setAttribute("playsinline", "");
        video.setAttribute("muted", "");
        video.preload = "metadata";
        video.setAttribute("aria-hidden", "true");
        video.tabIndex = -1;
        video.src = option.video;
        video.dataset.dockId = option.id;

        const entry = {
          video,
          canvas: null,
          ctx: null,
          chromaKey: option.chromaKey || null,
          rafId: 0,
          layer: null
        };

        if (option.chromaKey === "green") {
          video.className = "detail-video-stage__source";
          const canvas = document.createElement("canvas");
          canvas.className = "detail-video-stage__video is-chroma";
          canvas.setAttribute("aria-hidden", "true");
          entry.canvas = canvas;
          entry.ctx = canvas.getContext("2d", { willReadFrequently: true });
          entry.layer = canvas;
          detailVideoFrame.appendChild(video);
          detailVideoFrame.appendChild(canvas);

          const paintOnce = () => drawChromaFrame(entry);
          video.addEventListener("loadeddata", paintOnce);
          video.addEventListener("seeked", paintOnce);
        } else {
          video.className = "detail-video-stage__video";
          entry.layer = video;
          detailVideoFrame.appendChild(video);
        }

        video.addEventListener("ended", () => {
          stopChromaLoop(entry);
          if (entry.chromaKey) drawChromaFrame(entry);
          if (activeCat === "dock" && state.dock === option.id) {
            setReplayVisible(true, "Replay");
          }
        });

        dockVideos.set(option.id, entry);
      });
    }

    function pauseAllDockVideos() {
      dockVideos.forEach((entry) => {
        stopChromaLoop(entry);
        entry.video.pause();
      });
      setReplayVisible(false);
    }

    function shouldPlayDockVideo() {
      return (
        activeCat === "dock" &&
        sectionVisible &&
        !prefersReducedMotion &&
        !document.hidden
      );
    }

    function syncDockVideos() {
      const play = shouldPlayDockVideo();

      dockVideos.forEach((entry, id) => {
        const active = id === state.dock;
        const { video, layer } = entry;

        if (layer) layer.classList.toggle("is-active", active);

        if (!active) {
          stopChromaLoop(entry);
          video.pause();
          return;
        }

        const switchedDock =
          lastActiveDockId !== null && lastActiveDockId !== id;
        lastActiveDockId = id;

        if (switchedDock) {
          try {
            video.currentTime = 0;
          } catch {
            // Ignore seek errors before metadata.
          }
        }

        if (play) {
          if (video.ended && !switchedDock) {
            setReplayVisible(true, "Replay");
            if (entry.chromaKey) drawChromaFrame(entry);
            return;
          }
          playDockEntry(entry);
        } else {
          stopChromaLoop(entry);
          video.pause();
          if (prefersReducedMotion) {
            try {
              video.currentTime = 0;
            } catch {
              // Ignore seek errors before metadata.
            }
            if (entry.chromaKey) drawChromaFrame(entry);
            setReplayVisible(true, "Play");
          } else {
            setReplayVisible(false);
          }
        }
      });
    }

    if (detailVideoReplay) {
      detailVideoReplay.addEventListener("click", () => {
        const entry = dockVideos.get(state.dock);
        if (!entry || activeCat !== "dock") return;
        restartDockEntry(entry);
      });
    }

    function setPreviewMode(mode) {
      if (!detailStage) return;
      const isVideo = mode === "video";
      detailStage.classList.toggle("is-video-mode", isVideo);
      if (detailVideoStage) {
        detailVideoStage.hidden = !isVideo;
        detailVideoStage.setAttribute("aria-hidden", String(!isVideo));
      }
    }

    function updateNote() {
      if (!detailNote) return;
      const config = DETAIL[activeCat];
      if (!config) return;

      if (activeCat === "dock") {
        const option = config.options.find((item) => item.id === state.dock);
        detailNote.textContent =
          (option && option.description) || config.note || "";
        return;
      }

      detailNote.textContent = config.note || "";
    }

    function applyPreview(animate) {
      const run = () => {
        detailPreview.setAttribute("data-icons", state.icons);
        detailPreview.setAttribute("data-labels", state.labels);
        detailPreview.setAttribute("data-folders", state.folders);
        detailPreview.setAttribute("data-dock", state.dock);

        if (activeCat === "dock") {
          setPreviewMode("video");
          mountDockVideos();
          syncDockVideos();
        } else {
          pauseAllDockVideos();
          setPreviewMode("static");
        }
      };

      if (activeCat === "dock") {
        // Video crossfade uses CSS opacity; skip the static phone flash.
        run();
        return;
      }

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
              aria-pressed="${state[activeCat] === option.id ? "true" : "false"}"
              aria-label="${activeCat === "dock" ? `${option.label} dock layout` : option.label}"
            >
              ${option.label}
            </button>`
        )
        .join("");

      updateNote();
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
      const leavingDock = activeCat === "dock" && cat !== "dock";
      activeCat = cat;

      detailCats.forEach((tab) => {
        const active = tab.getAttribute("data-detail-cat") === cat;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
      });

      if (leavingDock) pauseAllDockVideos();
      renderOptions(animate);
      applyPreview(false);
    }

    detailCats.forEach((tab) => {
      tab.addEventListener("click", () => {
        const cat = tab.getAttribute("data-detail-cat");
        if (!cat || cat === activeCat) return;
        setCategory(cat, true);
      });
    });

    if (detailSection) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            sectionVisible = entry.isIntersecting;
            if (!sectionVisible) pauseAllDockVideos();
            else syncDockVideos();
          });
        },
        { threshold: 0.2 }
      );
      sectionObserver.observe(detailSection);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseAllDockVideos();
      else syncDockVideos();
    });

    setCategory("icons", false);
  }
})();
