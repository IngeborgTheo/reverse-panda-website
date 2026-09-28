/**
 * Central ReversePanda launcher preview registry.
 * To swap a placeholder for a real screenshot later, only set `image`.
 * Layout, sizing, animation, and radius stay untouched.
 */
window.RP_PREVIEWS = [
  { id: "bubble-cloud", title: "Bubble Cloud", shortTitle: "Bubble Cloud", image: "assets/mockups/hero/showcase-hs-bubble-cloud.webp", video: "assets/videos/showcase/home%20screen/showcase-hs-bubble-cloud.mp4", variant: "bubble", theme: "light" },
  { id: "classic-pages", title: "Classic Pages", shortTitle: "Classic", image: null, video: "assets/videos/showcase/home%20screen/showcase-hs-classic-paginated.mp4", variant: "classic", theme: "blue" },
  { id: "hidden-dock", title: "Hidden Dock", shortTitle: "Hidden Dock", image: "assets/mockups/hero/showcase-dock-hidden-dock.webp", variant: "hiddenDock", theme: "dark" },
  { id: "zen", title: "Zen", shortTitle: "Zen", image: "assets/mockups/hero/showcase-hs-zen.webp", video: "assets/videos/showcase/home%20screen/showcase-hs-zen.mp4", variant: "hiddenDock", theme: "dark" },
  { id: "wheel-dock", title: "Wheel Dock", image: "assets/mockups/hero/showcase_dock_wheel.webp", variant: "wheelDock", theme: "light" },
  { id: "app-drawer", title: "App Drawer", image: "assets/mockups/hero/showcase-ad-multi-column.webp", variant: "appDrawer", theme: "blue" },
  { id: "folders", title: "Folders", image: "assets/mockups/hero/showcase-folder-standard.webp", variant: "folders", theme: "dark" },
  { id: "gestures", title: "Gestures", image: "assets/mockups/hero/showcase-gestures.webp", variant: "gestures", theme: "light" },
  { id: "icons", title: "Icons", image: null, variant: "icons", theme: "blue" },
  { id: "single-column", title: "Single Column Drawer", image: "assets/mockups/hero/showcase-ad-single-column.webp", variant: "appDrawer", theme: "dark" },
  { id: "continuous-canvas", title: "Continuous Canvas", shortTitle: "Continuous Canvas", image: "assets/mockups/hero/showcase-hs-zen.webp", video: "assets/videos/showcase/home%20screen/showcase-hs-continues-canvas.mp4", variant: "canvas", theme: "dark" },
  { id: "settings", title: "Settings", image: "assets/mockups/hero/showcase-settings-main.webp", variant: "settings", theme: "light" },
  { id: "cylinder-dock", title: "Cylinder Dock", image: null, variant: "cylinder", theme: "blue" },
  { id: "multi-column", title: "Multi Column Drawer", shortTitle: "Multi Column", image: "assets/mockups/hero/showcase-ad-multi-column.webp", variant: "multiColumn", theme: "dark" },
  { id: "minimal", title: "Minimal", image: null, variant: "minimal", theme: "light" },
  { id: "chaos", title: "Chaos", image: null, variant: "chaos", theme: "blue" }
];

window.RP_HERO_LEFT = ["bubble-cloud", "hidden-dock", "app-drawer", "continuous-canvas", "single-column"];
window.RP_HERO_RIGHT = ["wheel-dock", "gestures", "folders", "settings"];
window.RP_SHOWCASE = [
  "bubble-cloud",
  "classic-pages",
  "continuous-canvas",
  "zen"
];

window.RP = {
  getById(id) {
    return window.RP_PREVIEWS.find((p) => p.id === id);
  },

  /**
   * Renders one launcher preview card.
   * Same outer shell for images and placeholders.
   */
  renderCard(preview, options = {}) {
    if (!preview) return "";
    const lazy = options.lazy ? 'loading="lazy"' : 'loading="eager"';
    const label = preview.title.replace(/"/g, "&quot;");
    const theme = options.theme || preview.theme || "light";
    const caption = options.caption || preview.shortTitle || preview.title;

    let inner;
    let shellClass = "";
    if (preview.video && options.video) {
      inner = `<div class="lp__video" data-lp-video="${preview.video}"><canvas class="lp__media lp__media--video" aria-hidden="true"></canvas></div>`;
      shellClass = " is-video";
    } else if (preview.image) {
      inner = `<img class="lp__media" src="${preview.image}" alt="${label}" ${lazy} decoding="async" width="360" height="720">`;
    } else {
      inner = this.renderPlaceholder(preview);
    }

    return `
      <article class="lp" data-preview-id="${preview.id}" aria-label="${label}">
        <div class="lp__shell theme-${theme}${shellClass}">
          ${inner}
        </div>
        ${options.showCaption !== false ? `<p class="lp__caption">${caption}</p>` : ""}
      </article>
    `;
  },

  renderPlaceholder(preview) {
    const v = preview.variant || "classic";
    return `<div class="lp-ph lp-ph--${v}" aria-hidden="true">${this.placeholderMarkup(v)}</div>`;
  },

  placeholderMarkup(variant) {
    const icon = (cls = "") => `<span class="lp-ph__icon ${cls}"></span>`;
    const icons = (n, cls = "") => Array.from({ length: n }, () => icon(cls)).join("");

    switch (variant) {
      case "bubble":
        return `
          <div class="lp-ph__status"></div>
          <div class="lp-ph__bubble-field">
            ${icon("sm")} ${icon("lg accent")} ${icon("md")} ${icon("xl")}
            ${icon("sm")} ${icon("md accent")} ${icon("lg")} ${icon("sm")}
            ${icon("md")} ${icon("lg")} ${icon("sm accent")} ${icon("md")}
          </div>
          <div class="lp-ph__label">01 BUBBLE CLOUD</div>
        `;
      case "classic":
        return `
          <div class="lp-ph__status"></div>
          <div class="lp-ph__grid">${icons(12)}</div>
          <div class="lp-ph__dock">${icons(4, "dock")}</div>
          <div class="lp-ph__pages"><i></i><i class="on"></i><i></i></div>
          <div class="lp-ph__label">02 CLASSIC PAGES</div>
        `;
      case "hiddenDock":
        return `
          <div class="lp-ph__status"></div>
          <div class="lp-ph__grid sparse">${icons(8)}</div>
          <div class="lp-ph__dock-hint"></div>
          <div class="lp-ph__label">03 HIDDEN DOCK</div>
        `;
      case "wheelDock":
        return `
          <div class="lp-ph__status"></div>
          <div class="lp-ph__grid sparse">${icons(6)}</div>
          <div class="lp-ph__wheel">
            ${icon("wheel")} ${icon("wheel accent")} ${icon("wheel")} ${icon("wheel")} ${icon("wheel")}
          </div>
          <div class="lp-ph__label">04 WHEEL DOCK</div>
        `;
      case "appDrawer":
        return `
          <div class="lp-ph__status"></div>
          <div class="lp-ph__search"></div>
          <div class="lp-ph__drawer-rows">
            <div class="lp-ph__row">${icons(5)}</div>
            <div class="lp-ph__row">${icons(5)}</div>
            <div class="lp-ph__row">${icons(5)}</div>
            <div class="lp-ph__row">${icons(4)}</div>
          </div>
          <div class="lp-ph__label">05 APP DRAWER</div>
        `;
      case "folders":
        return `
          <div class="lp-ph__status"></div>
          <div class="lp-ph__folder-grid">
            <div class="lp-ph__folder">${icons(4, "tiny")}</div>
            <div class="lp-ph__folder accent">${icons(4, "tiny")}</div>
            <div class="lp-ph__folder">${icons(4, "tiny")}</div>
            <div class="lp-ph__folder">${icons(4, "tiny")}</div>
          </div>
          <div class="lp-ph__label">06 FOLDERS</div>
        `;
      case "gestures":
        return `
          <div class="lp-ph__status"></div>
          <div class="lp-ph__gesture">
            <span class="lp-ph__swipe"></span>
            <span class="lp-ph__swipe mid"></span>
            <span class="lp-ph__swipe short"></span>
            <span class="lp-ph__finger"></span>
          </div>
          <div class="lp-ph__label">07 GESTURES</div>
        `;
      case "icons":
        return `
          <div class="lp-ph__status"></div>
          <div class="lp-ph__icon-lab">
            ${icon("shape-sq")} ${icon("shape-round accent")} ${icon("shape-squircle")}
            ${icon("shape-round")} ${icon("shape-sq accent")} ${icon("shape-squircle")}
          </div>
          <div class="lp-ph__label">08 ICONS</div>
        `;
      case "canvas":
        return `
          <div class="lp-ph__status"></div>
          <div class="lp-ph__canvas">
            <div class="lp-ph__canvas-block a"></div>
            <div class="lp-ph__canvas-block b"></div>
            <div class="lp-ph__canvas-block c accent"></div>
            ${icons(5, "float")}
          </div>
          <div class="lp-ph__label">09 CONTINUOUS CANVAS</div>
        `;
      case "settings":
        return `
          <div class="lp-ph__status"></div>
          <div class="lp-ph__settings-title">SETTINGS</div>
          <div class="lp-ph__settings-list">
            <div class="lp-ph__setting"><b></b><i></i></div>
            <div class="lp-ph__setting accent"><b></b><i></i></div>
            <div class="lp-ph__setting"><b></b><i></i></div>
            <div class="lp-ph__setting"><b></b><i></i></div>
            <div class="lp-ph__setting"><b></b><i></i></div>
          </div>
          <div class="lp-ph__label">10 SETTINGS</div>
        `;
      case "cylinder":
        return `
          <div class="lp-ph__status"></div>
          <div class="lp-ph__grid sparse">${icons(6)}</div>
          <div class="lp-ph__cylinder">${icons(5, "cyl")}</div>
          <div class="lp-ph__label">CYLINDER DOCK</div>
        `;
      case "multiColumn":
        return `
          <div class="lp-ph__status"></div>
          <div class="lp-ph__columns">
            <div class="lp-ph__col">${icons(6, "tiny")}</div>
            <div class="lp-ph__col">${icons(6, "tiny")}</div>
            <div class="lp-ph__col">${icons(6, "tiny")}</div>
          </div>
          <div class="lp-ph__label">MULTI COLUMN</div>
        `;
      case "minimal":
        return `
          <div class="lp-ph__status"></div>
          <div class="lp-ph__minimal">
            ${icon("lg")} ${icon("md")} ${icon("sm accent")}
          </div>
          <div class="lp-ph__label">MINIMAL</div>
        `;
      case "chaos":
        return `
          <div class="lp-ph__status"></div>
          <div class="lp-ph__chaos">
            ${icon("rot1")} ${icon("lg rot2 accent")} ${icon("md rot3")}
            ${icon("sm rot1")} ${icon("xl rot2")} ${icon("md rot3 accent")}
            ${icon("lg rot1")} ${icon("sm rot2")}
          </div>
          <div class="lp-ph__label">CHAOS</div>
        `;
      default:
        return `<div class="lp-ph__grid">${icons(9)}</div>`;
    }
  },

  renderTrack(ids, { duplicate = true, caption = false } = {}) {
    const cards = ids
      .map((id) => this.getById(id))
      .filter(Boolean)
      .map((p) => this.renderCard(p, { showCaption: caption, lazy: true }))
      .join("");
    return duplicate ? cards + cards : cards;
  }
};
