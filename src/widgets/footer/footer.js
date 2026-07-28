import "./footer.scss";
import "../../features/footerSvg/footerSvg";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
import i18next from "i18next";
import { initFooterMap } from "@widgets/mapBox/footerMapInit";
import footerMapConfig from "@widgets/mapBox/map-config-footer.json";

gsap.registerPlugin(ScrollTrigger);

const FOOTER_MAP_I18N_DICTIONARY = {
  uk: {
    "FooterMap.title": "Розташування об'єктів",
    "FooterMap.openInGoogleMaps": "Прокласти маршрут",
    "FooterMap.noPhotos": "Фото відсутні",
  },
  en: {
    "FooterMap.title": "Object locations",
    "FooterMap.openInGoogleMaps": "Open route in Google Maps",
    "FooterMap.noPhotos": "No photos available",
  },
};

function createFooterMapI18n() {
  const htmlLang = document.documentElement.lang || "uk";
  const i18nLang = i18next?.resolvedLanguage || i18next?.language || "";
  const lang = (i18nLang || htmlLang).toLowerCase().startsWith("en") ? "en" : "uk";
  const dictionary = FOOTER_MAP_I18N_DICTIONARY[lang];

  return {
    t(key) {
      const external = typeof i18next?.t === "function" ? i18next.t(key, { defaultValue: "" }) : "";
      if (typeof external === "string" && external && external !== key) return external;
      return dictionary[key] || FOOTER_MAP_I18N_DICTIONARY.uk[key] || key;
    },
  };
}

function initFooterMapWidget() {
  const mapInfo = footerMapConfig?.map;
  if (!mapInfo) return;

  initFooterMap({
    selector: "#footer-map",
    accessToken: mapInfo.mapbox_access_token,
    center: mapInfo.default_coordinates,
    zoom: mapInfo.default_zoom,
    categories: mapInfo.categories,
    markers: mapInfo.markers,
    i18n: createFooterMapI18n(),
  });
}

initFooterMapWidget();

function initFooterFormParallax() {
  const section = document.querySelector(".footer-form");
  const image = section?.querySelector('[data-parallax="image"]');

  if (!section || !image) return;

  gsap.fromTo(
    image,
    { yPercent: -12 },
    {
      yPercent: 12,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    },
  );
}

initFooterFormParallax();

const scrollTopBtn = document.querySelector("[data-scroll-top]");
scrollTopBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
