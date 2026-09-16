import mapboxgl from "mapbox-gl";
import Swiper from "swiper";
import { Navigation } from "swiper/modules";
import "mapbox-gl/dist/mapbox-gl.css";
import "./footer-map-block.scss";

// Simple generic glyphs per category — intentionally minimal, no external assets required.
const CATEGORY_ICONS = {
  projects: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3.2L3.5 10v10.3h6.2v-6.6h4.6v6.6h6.2V10L12 3.2z" fill="#fff"/></svg>`,
  sales: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="11" rx="2" fill="#fff"/><path d="M9 8V6a2 2 0 012-2h2a2 2 0 012 2v2" stroke="#fff" stroke-width="1.6" fill="none"/></svg>`,
  office: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2.5l2.7 5.8 6.3.9-4.6 4.4 1.1 6.2L12 16.9l-5.5 2.9 1.1-6.2-4.6-4.4 6.3-.9L12 2.5z" fill="#fff"/></svg>`,
};

const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M18 6.7L17.3 6l-5.3 5.3L6.7 6 6 6.7l5.3 5.3L6 17.3l.7.7 5.3-5.3 5.3 5.3.7-.7-5.3-5.3L18 6.7z" fill="currentColor"/></svg>`;

// Custom per-marker icons live in src/shared/images/markers/ — reference them in
// map-config-footer.json via `"icon": "filename.svg"` (or a full "/src/..." path).
// Loaded as raw SVG markup (not <img src>) so they stay vector and don't get
// rasterized/blurred by Mapbox's marker transform (translate/rotate on a tilted map).
const MARKER_ICONS_BASE = "/src/shared/images/markers/";
const MARKER_ICON_MODULES = import.meta.glob("/src/shared/images/markers/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});
const ARROW_PREV_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="16" viewBox="0 0 10 16" fill="none"><path d="M9 1L2 8l7 7" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>`;
const ARROW_NEXT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="16" viewBox="0 0 10 16" fill="none"><path d="M1 1l7 7-7 7" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>`;

const THEME_OPTIONS = [
  { id: "dawn", label: "Світанок", progress: 0 },
  { id: "day", label: "День", progress: 33.333 },
  { id: "dusk", label: "Сутінки", progress: 66.667 },
  { id: "night", label: "Ніч", progress: 100 },
];

const THEME_ICONS = {
  dawn: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><g><circle cx="19" cy="19" r="18.5" fill="white" /><path d="M29.9414 29.9673L7.44141 29.9673" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M24.717 29.9669C24.717 26.8095 22.1574 24.25 19.0001 24.25C15.8427 24.25 13.2832 26.8095 13.2832 29.9669" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M18.998 17.9084V20.3202" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M18.998 12.7725L18.998 6.53246" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M22.1094 8.33984L19.0723 5.95312" stroke="#4264FB" stroke-width="2" stroke-linecap="round" /><path d="M15.8867 8.33984L18.9238 5.95312" stroke="#4264FB" stroke-width="2" stroke-linecap="round" /><path d="M10.4746 21.4402L12.1786 23.1458" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M27.5245 21.4402L25.8184 23.1458" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /></g></svg>`,
  day: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><g><circle cx="19" cy="19.0002" r="18.5" fill="white" /><path d="M19 24.5467C22.0635 24.5467 24.5469 22.0632 24.5469 18.9998C24.5469 15.9363 22.0635 13.4529 19 13.4529C15.9366 13.4529 13.4531 15.9363 13.4531 18.9998C13.4531 22.0632 15.9366 24.5467 19 24.5467Z" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M19 7.30005V9.6401" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M10.7285 10.7268L12.3819 12.3817" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M7.30078 18.9998H9.64083" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M10.7285 27.2725L12.3834 25.6182" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M19 30.6999V28.3589" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M27.2726 27.2725L25.6172 25.6182" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M30.6994 19.0002H28.3594" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M27.2726 10.7268L25.6172 12.3817" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /></g></svg>`,
  dusk: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><g><circle cx="19" cy="19" r="18.5" fill="white" /><path d="M24.4979 28.9589C24.4979 25.923 22.0368 23.4619 19.0009 23.4619C15.965 23.4619 13.5039 25.923 13.5039 28.9589" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M19 17.3643V19.6833" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M10.8008 20.7603L12.4393 22.4003" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M30.25 28.9592L7.75 28.9592" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M27.1991 20.7603L25.5586 22.4003" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M18.998 5.90894L18.998 12.1489" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /><path d="M15.8887 10.3416L18.9258 12.7283" stroke="#4264FB" stroke-width="2" stroke-linecap="round" /><path d="M22.1113 10.3416L19.0742 12.7283" stroke="#4264FB" stroke-width="2" stroke-linecap="round" /></g></svg>`,
  night: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg"><g><circle cx="19" cy="19" r="18.5" fill="white" /><path d="M18.53 27.9489C14.9462 28.7919 11.3593 27.5714 9.01172 25.0631C10.617 25.5423 12.3651 25.6235 14.1138 25.2139C19.4467 23.9597 22.7537 18.6189 21.4996 13.2864C21.0884 11.5378 20.2364 10.01 19.0919 8.78589C22.3837 9.77013 25.0744 12.4361 25.9173 16.0214C27.1705 21.3549 23.864 26.6947 18.53 27.9489Z" stroke="#4264FB" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" /></g></svg>`,
};

const THEME_ORDER = ["dawn", "day", "dusk", "night"];

const getThemeByProgress = (progress) => {
  if (progress < 25) return "dawn";
  if (progress < 50) return "day";
  if (progress < 75) return "dusk";
  return "night";
};

export default class FooterMapBlock {
  constructor({ mountTo, accessToken, center, zoom = 12, categories = [], markers = [], i18n }) {
    this.root = typeof mountTo === "string" ? document.querySelector(mountTo) : mountTo;
    if (!this.root) throw new Error("Mount element not found");

    mapboxgl.accessToken = accessToken;
    this.center = this.toLngLat(center);
    this.zoom = zoom;
    this.i18n = i18n && typeof i18n.t === "function" ? i18n : { t: () => "" };
    this.categories = categories.length ? categories : this._deriveCategories(markers);
    this.markers = markers.map((marker) => ({
      ...marker,
      coordinates: this.toLngLat(marker.coordinates),
    }));
    this.markerInstances = [];
    this.activeMarkerEl = null;
    this.activeCategory = this.categories[0]?.id || null;
    this.activeTheme = "day";
    this.sliderInstance = null;
    this.currentMarker = null;

    this.render();
    this.initMap();
  }

  toLngLat(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length < 2) return [0, 0];
    const lat = Number(coordinates[0]);
    const lng = Number(coordinates[1]);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lng, lat] : [0, 0];
  }

  _deriveCategories(markers) {
    const seen = new Set();
    return markers.reduce((acc, marker) => {
      if (!seen.has(marker.category)) {
        seen.add(marker.category);
        acc.push({ id: marker.category, label: marker.category });
      }
      return acc;
    }, []);
  }

  getCategoryIcon(id) {
    return CATEGORY_ICONS[id] || CATEGORY_ICONS.projects;
  }

  resolveMarkerIconSrc(icon) {
    if (/^(https?:)?\//.test(icon)) return icon;
    return `${MARKER_ICONS_BASE}${icon}`;
  }

  getInlineMarkerIcon(icon) {
    if (/^https?:\/\//.test(icon)) return null;
    const filename = icon.split("/").pop();
    const raw = MARKER_ICON_MODULES[`${MARKER_ICONS_BASE}${filename}`];
    if (!raw) return null;
    return raw.replace("<svg", '<svg class="footer-map__marker-icon"');
  }

  getMarkerIcon(marker) {
    if (marker.icon) {
      const inlineSvg = this.getInlineMarkerIcon(marker.icon);
      if (inlineSvg) return inlineSvg;

      // Fallback for remote/external icon URLs that can't be inlined at build time.
      const src = this.resolveMarkerIconSrc(marker.icon);
      return `<img class="footer-map__marker-icon" src="${src}" alt="" />`;
    }
    return this.getCategoryIcon(marker.category);
  }

  render() {
    const tabsHtml = this.categories
      .map(
        (cat, index) => `
        <button type="button" class="footer-map__tab${index === 0 ? " is-active" : ""}" data-category="${cat.id}">
          ${cat.label}
        </button>
      `,
      )
      .join("");

    const activeProgress = THEME_OPTIONS.find((theme) => theme.id === this.activeTheme)?.progress ?? 33.333;

    const themeButtonsHtml = THEME_OPTIONS.map(
      (theme, index) => `
        <button type="button" class="footer-map__theme-btn${theme.id === this.activeTheme ? " is-active" : ""}" data-theme="${theme.id}" data-theme-index="${index}" aria-label="${theme.label}" title="${theme.label}" aria-pressed="${theme.id === this.activeTheme}">
          ${THEME_ICONS[theme.id]}
        </button>
      `,
    ).join("");

    this.root.innerHTML = `
      <div class="footer-map__head">
        <h2 class="footer-map__title">${this.i18n.t("FooterMap.title") || "Розташування об'єктів"}</h2>
        <div class="footer-map__tabs">${tabsHtml}</div>
      </div>
      <div class="footer-map__map-wrap">
        <div class="footer-map__theme" data-theme="${this.activeTheme}" style="--thumb-progress: ${activeProgress}" aria-label="Перемикач теми мапи">
          <input type="range" class="footer-map__theme-range" min="0" max="100" step="0.1" value="${activeProgress}" aria-label="Повзунок теми мапи" />
          ${themeButtonsHtml}
        </div>
        <div class="footer-map__map"></div>
        <aside class="footer-map__popup">
          <button type="button" class="footer-map__popup-close" aria-label="Close">${CLOSE_ICON}</button>
          <div class="footer-map__popup-gallery swiper">
            <div class="swiper-wrapper"></div>
            <div class="swiper-button-prev footer-map__swiper-prev">${ARROW_PREV_ICON}</div>
            <div class="swiper-button-next footer-map__swiper-next">${ARROW_NEXT_ICON}</div>
          </div>
          <h3 class="footer-map__popup-title"></h3>
          <p class="footer-map__popup-desc"></p>
          <a class="footer-map__popup-btn general-btn general-btn--dark" target="_blank" rel="noopener noreferrer">
            <span>${this.i18n.t("FooterMap.openInGoogleMaps") || "Прокласти маршрут"}</span>
          </a>
        </aside>
      </div>
    `;

    this.mapContainer = this.root.querySelector(".footer-map__map");
    this.popup = this.root.querySelector(".footer-map__popup");
    this.popupTitle = this.root.querySelector(".footer-map__popup-title");
    this.popupDesc = this.root.querySelector(".footer-map__popup-desc");
    this.popupBtn = this.root.querySelector(".footer-map__popup-btn");
    this.galleryWrapper = this.root.querySelector(".footer-map__popup-gallery .swiper-wrapper");

    this.root.querySelector(".footer-map__popup-close")?.addEventListener("click", () => this.hidePopup());

    this.root.querySelectorAll(".footer-map__tab").forEach((btn) => {
      btn.addEventListener("click", () => this.setActiveCategory(btn.dataset.category));
    });

    this.themeControls = this.root.querySelector(".footer-map__theme");
    this.themeRange = this.root.querySelector(".footer-map__theme-range");

    this.root.querySelectorAll(".footer-map__theme-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.setActiveTheme(btn.dataset.theme, { syncRange: true }));
    });

    this.themeRange?.addEventListener("input", () => {
      const progress = Number(this.themeRange.value);
      this.themeControls?.style.setProperty("--thumb-progress", String(progress));

      const nextTheme = getThemeByProgress(progress);
      if (nextTheme !== this.activeTheme) {
        this.setActiveTheme(nextTheme, { progress, syncRange: false });
      }
    });
  }

  initMap() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: "mapbox://styles/mapbox/standard",
      center: this.center,
      zoom: this.zoom,
      pitch: 45,
      bearing: 0,
      scrollZoom: false,
      attributionControl: false,
    });

    this.map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    this.map.on("load", () => {
      this.map.setConfigProperty("basemap", "lightPreset", this.activeTheme);
      this.addMarkers();
      if (this.activeCategory) this.setActiveCategory(this.activeCategory, { animate: false });
    });
  }

  addMarkers() {
    this.markers.forEach((marker) => {
      const hasCustomIcon = Boolean(marker.icon);
      const el = document.createElement("div");
      el.className = `footer-map__marker footer-map__marker--${marker.category}`;
      el.classList.toggle("footer-map__marker--custom", hasCustomIcon);
      el.innerHTML = this.getMarkerIcon(marker);
      el.addEventListener("click", () => {
        this.setActiveMarker(el);
        this.showPopup(marker);
      });

      const mapMarker = new mapboxgl.Marker({ element: el, anchor: hasCustomIcon ? "center" : "bottom" })
        .setLngLat(marker.coordinates)
        .addTo(this.map);

      this.markerInstances.push({ marker, mapMarker, el });
    });
  }

  setActiveMarker(el) {
    if (this.activeMarkerEl === el) return;
    this.activeMarkerEl?.classList.remove("footer-map__marker--selected");
    el.classList.add("footer-map__marker--selected");
    this.activeMarkerEl = el;
  }

  clearActiveMarker() {
    this.activeMarkerEl?.classList.remove("footer-map__marker--selected");
    this.activeMarkerEl = null;
  }

  setActiveCategory(categoryId, { animate = true } = {}) {
    this.activeCategory = categoryId;

    this.root.querySelectorAll(".footer-map__tab").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.category === categoryId);
    });

    const categoryMarkers = [];
    this.markerInstances.forEach(({ marker, el }) => {
      const isMatch = marker.category === categoryId;
      el.style.display = isMatch ? "" : "none";
      if (isMatch) categoryMarkers.push(marker);
    });

    this.hidePopup();
    this.fitToMarkers(categoryMarkers, animate);
  }

  setActiveTheme(themeId, { progress, syncRange = true } = {}) {
    if (!themeId || !THEME_ORDER.includes(themeId) || themeId === this.activeTheme) return;
    this.activeTheme = themeId;

    const stageProgress = THEME_OPTIONS.find((theme) => theme.id === themeId)?.progress ?? 33.333;
    const nextProgress = progress ?? stageProgress;

    if (this.themeControls) {
      this.themeControls.dataset.theme = themeId;
      this.themeControls.style.setProperty("--thumb-progress", String(nextProgress));
    }

    if (this.themeRange && syncRange) {
      this.themeRange.value = String(nextProgress);
    }

    this.root.querySelectorAll(".footer-map__theme-btn").forEach((btn) => {
      const isActive = btn.dataset.theme === themeId;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    this.map?.setConfigProperty("basemap", "lightPreset", themeId);
  }

  fitToMarkers(markers, animate = true) {
    if (!this.map || !markers.length) return;

    if (markers.length === 1) {
      this.map[animate ? "flyTo" : "jumpTo"]({
        center: markers[0].coordinates,
        zoom: Math.max(this.zoom, 14),
        pitch: 45,
        bearing: this.map.getBearing(),
      });
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    markers.forEach((marker) => bounds.extend(marker.coordinates));

    this.map.fitBounds(bounds, {
      padding: window.innerWidth <= 768 ? 48 : 96,
      maxZoom: 15,
      duration: animate ? 1000 : 0,
      pitch: 45,
      bearing: this.map.getBearing(),
    });
  }

  showPopup(marker) {
    this.currentMarker = marker;
    this.popupTitle.textContent = marker.title || "";
    this.popupDesc.textContent = marker.description || "";
    this.updateGallery(marker.images || []);

    const [lng, lat] = marker.coordinates;
    this.popupBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

    this.popup.classList.add("active");
  }

  hidePopup() {
    this.popup?.classList.remove("active");
    this._destroySliderSafely();
    this.clearActiveMarker();
  }

  updateGallery(images) {
    this._destroySliderSafely();
    this.galleryWrapper.innerHTML = "";

    if (!images.length) {
      this.galleryWrapper.innerHTML = `<div class="swiper-slide footer-map__popup-empty">${this.i18n.t("FooterMap.noPhotos") || "Фото відсутні"}</div>`;
      return;
    }

    const title = this.currentMarker?.title || "";
    images.forEach((src) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.innerHTML = `<img src="${src}" alt="${title}" loading="lazy" />`;
      this.galleryWrapper.appendChild(slide);
    });

    if (images.length > 1) {
      const swiperContainer = this.root.querySelector(".footer-map__popup-gallery.swiper");
      this.sliderInstance = new Swiper(swiperContainer, {
        modules: [Navigation],
        slidesPerView: 1,
        navigation: {
          nextEl: ".footer-map__swiper-next",
          prevEl: ".footer-map__swiper-prev",
        },
      });
    }
  }

  _destroySliderSafely() {
    if (!this.sliderInstance) return;
    try {
      this.sliderInstance.destroy(true, true);
    } catch (e) {
      console.error("Swiper destroy error:", e);
    }
    this.sliderInstance = null;
  }

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this._destroySliderSafely();
  }
}
