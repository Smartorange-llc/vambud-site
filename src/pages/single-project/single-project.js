import "./single-project.scss";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Swiper from "swiper";
import { Navigation, Autoplay } from "swiper/modules";
import { Fancybox } from "@fancyapps/ui/dist/fancybox/fancybox.js";
import i18next from "i18next";
import { initLazyMap } from "@widgets/mapBox/mapInit";
import projectMapConfig from "./map-config.json";
import constructionHero from "@shared/images/single-project/hero.jpg";
import constructionPanorama from "@shared/images/single-project/panorama.jpg";
import constructionParking from "@shared/images/single-project/parking.jpg";
import constructionCommercial from "@shared/images/single-project/commercial.jpg";
import constructionWawel from "@shared/images/projects/wawel.jpg";
import constructionDolishniy from "@shared/images/projects/dolishniy.jpg";
import constructionKrakivskyi from "@shared/images/projects/krakivskyi.jpg";
import constructionProstir from "@shared/images/projects/prostir.jpg";

// Photos differ per queue/section since each covers a different part of the
// site; report text differs per period since it's a progress snapshot in time.
// A "report" is the combination of the two — buildConstructionReport() below
// pairs whichever stage + period are currently selected, so switching EITHER
// dropdown changes both the photos (reordered to lead with a different shot
// per period) and the text (title names the stage that's currently active).
const CONSTRUCTION_STAGE_LABELS = {
  s1: "Секція 1, черга 2",
  s2: "Секція 2, черга 2",
  s3: "Секція 3, черга 3",
};

const CONSTRUCTION_STAGE_IMAGES = {
  s1: [constructionHero, constructionPanorama, constructionWawel, constructionParking],
  s2: [constructionDolishniy, constructionCommercial, constructionKrakivskyi],
  s3: [constructionProstir, constructionHero],
};

const CONSTRUCTION_PERIOD_TEXT = {
  "2026-03": {
    label: "березень 2026 року",
    items: [
      "На 100% виконані роботи з кладки цегли стін на 1-му поверсі",
      "На 100% виконано монтаж елементів нарощування балконів (Західна сторона)",
      "На 97% виконано скління вікон (Південна сторона)",
      "На 75% виконано скління вікон (Східна сторона)",
      "На 55% виконані роботи з монтажу клапанів димовидалення",
      "На 40% виконані роботи по влаштуванню мінеральної вати на фасаді (Західна сторона)",
      "На 10% виконані роботи з монтажу спринклерної системи пожежогасіння",
      "Розпочато монтаж елементів нарощування балконів (Південна сторона)",
      "Розпочаті роботи з монтажу ліфтів",
      "Розпочаті роботи з монтажу системи опалення",
    ],
  },
  "2026-02": {
    label: "лютий 2026 року",
    items: [
      "На 90% виконані роботи з кладки цегли стін на 1-му поверсі",
      "На 80% виконано монтаж елементів нарощування балконів (Західна сторона)",
      "На 70% виконано скління вікон (Південна сторона)",
      "На 50% виконано скління вікон (Східна сторона)",
      "На 30% виконані роботи з монтажу клапанів димовидалення",
      "Розпочато роботи по влаштуванню мінеральної вати на фасаді (Західна сторона)",
      "Розпочато монтаж спринклерної системи пожежогасіння",
    ],
  },
  "2026-01": {
    label: "січень 2026 року",
    items: [
      "На 70% виконані роботи з кладки цегли стін на 1-му поверсі",
      "На 40% виконано монтаж елементів нарощування балконів (Західна сторона)",
      "На 20% виконано скління вікон (Південна сторона)",
      "Розпочато скління вікон (Східна сторона)",
      "Тривають підготовчі роботи з монтажу клапанів димовидалення",
    ],
  },
};

const CONSTRUCTION_PERIOD_KEYS = Object.keys(CONSTRUCTION_PERIOD_TEXT);

function buildConstructionReport(stageKey, periodKey) {
  const images = CONSTRUCTION_STAGE_IMAGES[stageKey];
  const period = CONSTRUCTION_PERIOD_TEXT[periodKey];
  const periodIndex = CONSTRUCTION_PERIOD_KEYS.indexOf(periodKey);

  return {
    // Same photo set as the selected stage, just re-led by a different shot
    // per period so picking a period visibly moves the gallery too.
    images: images.map((_, i) => images[(i + periodIndex) % images.length]),
    title: `Будівельний звіт: ${CONSTRUCTION_STAGE_LABELS[stageKey]} — ${period.label}`,
    items: period.items,
  };
}

gsap.registerPlugin(ScrollTrigger);

// Same dictionary/lookup pattern as location.js — this section uses the full
// MapboxBlock (POI categories, filters, routing), not the lightweight
// footer teaser map, since it's about this one project's own surroundings.
const MAP_I18N_DICTIONARY = {
  uk: {
    "Map.location.type.main": "Головна локація",
    "Map.location.type.poi": "Точка інтересу",
    "Map.location.type.club": "Клуб",
    "Map.location.type.terminal": "Пошта",
    "Map.location.type.parking": "СТО та АЗС",
    "Map.location.type.shop": "Магазин",
    "Map.location.type.walking": "Пішохідна зона",
    "Map.location.type.entertainment": "Розваги",
    "Map.location.type.underground": "Громадський транспорт",
    "Map.location.type.zoo": "Зоопарк",
    "Map.location.type.street": "Вулиця",
    "Map.location.type.ports": "Порти",
    "Map.location.type.sport": "Спорт",
    "Map.location.type.marinas": "Марини",
    "Map.location.type.school": "Навчальні заклади",
    "Map.location.type.lake": "Озеро",
    "Map.location.type.workout": "Фітнес",
    "Map.location.type.atm": "Банкомат",
    "Map.location.type.tennis": "Теніс",
    "Map.location.type.pharmacy": "Медичні заклади",
    "Map.location.type.restaurant": "Ресторани",
    "Map.location.showFilter": "Показати фільтр",
    "Map.location.closeFilter": "Закрити фільтр",
    "Map.location.enableZoom": "Розблокувати",
    "Map.location.disableZoom": "Заблокувати",
    "Map.location.zoomDesktop": "Zoom",
    "Map.location.reCenter": "До головної точки",
    "Map.location.driving": "Авто",
    "Map.location.cycling": "Велосипед",
    "Map.location.walking": "Пішки",
    "Map.location.openInGoogleMaps": "Відкрити в Google Maps",
    "Map.location.noPhotos": "Фото відсутні",
    "Map.location.hours": "год",
    "Map.location.minutes": "хв",
  },
  en: {
    "Map.location.type.main": "Main location",
    "Map.location.type.poi": "Point of interest",
    "Map.location.type.club": "Club",
    "Map.location.type.terminal": "Post office",
    "Map.location.type.parking": "Service stations",
    "Map.location.type.shop": "Shop",
    "Map.location.type.walking": "Walking area",
    "Map.location.type.entertainment": "Entertainment",
    "Map.location.type.underground": "Public transport",
    "Map.location.type.zoo": "Zoo",
    "Map.location.type.street": "Street",
    "Map.location.type.ports": "Ports",
    "Map.location.type.sport": "Sport",
    "Map.location.type.marinas": "Marinas",
    "Map.location.type.school": "Schools",
    "Map.location.type.lake": "Lake",
    "Map.location.type.workout": "Workout",
    "Map.location.type.atm": "ATM",
    "Map.location.type.tennis": "Tennis",
    "Map.location.type.pharmacy": "Pharmacy",
    "Map.location.type.restaurant": "Restaurant",
    "Map.location.showFilter": "Show filter",
    "Map.location.closeFilter": "Close filter",
    "Map.location.enableZoom": "Enable",
    "Map.location.disableZoom": "Disable",
    "Map.location.zoomDesktop": "Zoom",
    "Map.location.reCenter": "Back to main point",
    "Map.location.driving": "Driving",
    "Map.location.cycling": "Cycling",
    "Map.location.walking": "Walking",
    "Map.location.openInGoogleMaps": "Open in Google Maps",
    "Map.location.noPhotos": "No photos available",
    "Map.location.hours": "h",
    "Map.location.minutes": "min",
  },
};

function createMapI18n() {
  const htmlLang = document.documentElement.lang || "uk";
  const i18nLang = i18next?.resolvedLanguage || i18next?.language || "";
  const lang = (i18nLang || htmlLang).toLowerCase().startsWith("en") ? "en" : "uk";
  const dictionary = MAP_I18N_DICTIONARY[lang];

  return {
    t(key) {
      const external = typeof i18next?.t === "function" ? i18next.t(key, { defaultValue: "" }) : "";
      if (typeof external === "string" && external && external !== key) return external;
      return dictionary[key] || MAP_I18N_DICTIONARY.uk[key] || key;
    },
  };
}

function initSectionReveal(selector, targets) {
  const section = document.querySelector(selector);
  if (!section) return;

  const els = targets ? section.querySelectorAll(targets) : [section];
  if (!els.length) return;

  gsap.set(els, { opacity: 0, y: 32 });
  gsap.to(els, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power2.out",
    stagger: 0.1,
    scrollTrigger: {
      trigger: section,
      start: "top 82%",
      once: true,
    },
  });
}

// "Pop-up description" — same overlay mechanism as vacancy-modal/partner-modal
// (stop-scroll/start-scroll events pause Lenis while it's open).
function initDescriptionModal() {
  const overflow = document.querySelector("[data-description-modal__overflow]");
  const trigger = document.querySelector("[data-description-trigger]");
  if (!overflow || !trigger) return;

  const open = () => {
    window.dispatchEvent(new Event("stop-scroll"));
    overflow.classList.remove("hidden");
  };

  const close = () => {
    window.dispatchEvent(new Event("start-scroll"));
    overflow.classList.add("hidden");
  };

  trigger.addEventListener("click", open);
  overflow.querySelector("[data-description-modal-close]")?.addEventListener("click", close);
  overflow.addEventListener("click", (event) => {
    if (event.target === overflow) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}

// Continuous autoslider through every photo (all categories, in order) with a
// stories-style progress bar; the category chips don't filter the slider —
// clicking one jumps to its first photo and stays highlighted for as long as
// the currently showing photo belongs to it, syncing back as autoplay moves
// through the rest of the categories.
function initHeroSlider() {
  const section = document.querySelector(".single-project-hero");
  const sliderEl = section?.querySelector(".single-project-hero__slider");
  const progressBar = section?.querySelector(".single-project-hero__progress-bar");
  const tabs = section?.querySelectorAll("[data-hero-category]");
  if (!section || !sliderEl) return;

  const slideCategories = Array.from(sliderEl.querySelectorAll(".swiper-slide")).map((slide) =>
    (slide.dataset.heroCategories || "").split(" "),
  );

  const swiper = new Swiper(sliderEl, {
    modules: [Navigation, Autoplay],
    slidesPerView: 1,
    speed: 600,
    // `rewind` (jump back to slide 0 after the last one) rather than `loop`
    // (clone-based infinite scroll) — with only a handful of slides, loop
    // mode's clones fired spurious slideChange events far faster than the
    // configured autoplay delay.
    rewind: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    navigation: {
      prevEl: section.querySelector("[data-hero-prev]"),
      nextEl: section.querySelector("[data-hero-next]"),
    },
    on: {
      autoplayTimeLeft(instance, timeLeft, progress) {
        if (progressBar) progressBar.style.transform = `scaleX(${1 - progress})`;
      },
      slideChangeTransitionStart(instance) {
        if (progressBar) progressBar.style.transform = "scaleX(0)";
        syncActiveTab(instance.activeIndex);
      },
    },
  });

  if (!tabs?.length) return;

  function syncActiveTab(activeIndex) {
    // Only the slide's primary (first-listed) category lights up — a slide
    // tagged into two categories shouldn't highlight two chips at once.
    const primaryCategory = (slideCategories[activeIndex] || [])[0];
    tabs.forEach((tab) => {
      const isActive = tab.dataset.heroCategory === primaryCategory;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetIndex = slideCategories.findIndex((categories) =>
        categories.includes(tab.dataset.heroCategory),
      );
      if (targetIndex === -1) return;
      swiper.slideTo(targetIndex);
    });
  });

  syncActiveTab(swiper.activeIndex);
}

// Hero gallery: hidden proxy links resolve each on-page photo's real <img>
// src, then join the panorama/commercial/parking tiles in one Fancybox
// lightbox group. There's no dedicated "open gallery" button — the panorama
// tile (and any other [data-fancybox='single-project'] trigger) opens it.
function initHeroGallery() {
  const section = document.querySelector(".single-project-hero");
  const gallery = section?.querySelector("[data-gallery]");
  if (!section || !gallery) return;

  gallery.querySelectorAll("a[data-source]").forEach((link) => {
    const source = document.querySelector(link.dataset.source);
    if (source) link.href = source.currentSrc || source.src;
    else link.remove();
  });

  // Same fix as above, but for triggers that wrap their own preview <img>
  // (the panorama tile) rather than pointing at a raw source path.
  document.querySelectorAll("[data-fancybox='single-project'][data-self-source]").forEach((link) => {
    const img = link.querySelector("img");
    if (img) link.href = img.currentSrc || img.src;
  });

  // Bound at document level (not just this section) so the panorama tile's
  // trigger — a different section further down the page — joins the same
  // lightbox group as the hero gallery entries.
  Fancybox.bind(document, "[data-fancybox='single-project']");
}

// Bottom-right hero button scrolls to the next section (it's a "scroll
// down" cue, not a gallery opener).
function initHeroScrollBtn() {
  const hero = document.querySelector(".single-project-hero");
  const scrollBtn = hero?.querySelector("[data-hero-scroll]");
  if (!hero || !scrollBtn) return;

  scrollBtn.addEventListener("click", () => {
    hero.nextElementSibling?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function initPlanningSection() {
  const section = document.querySelector(".single-project-planning");
  const sliderEl = section?.querySelector(".single-project-planning__slider");
  const tabs = section?.querySelectorAll("[data-planning-tab]");
  if (!section || !sliderEl || !tabs?.length) return;

  const swiper = new Swiper(sliderEl, {
    modules: [Navigation],
    slidesPerView: 1,
    spaceBetween: 20,
    speed: 600,
    navigation: {
      prevEl: section.querySelector("[data-planning-prev]"),
      nextEl: section.querySelector("[data-planning-next]"),
    },
    breakpoints: {
      1024: { slidesPerView: 2, spaceBetween: 24 },
    },
  });

  // Each card's own floor-plan photo(s) get their own nested mini-slider
  // (currently just one photo per unit, but the arrows/counter are ready
  // for more without further markup changes).
  section.querySelectorAll("[data-flat-slider]").forEach((flatEl) => {
    const flat = flatEl.closest(".single-project-planning__flat") || flatEl;
    new Swiper(flatEl, {
      modules: [Navigation],
      slidesPerView: 1,
      speed: 500,
      navigation: {
        prevEl: flat.querySelector(".single-project-planning__flat-prev"),
        nextEl: flat.querySelector(".single-project-planning__flat-next"),
      },
    });
  });

  const slides = section.querySelectorAll(".single-project-planning__card");

  function applyTab(roomKey) {
    const visible = [];
    slides.forEach((slide) => {
      const matches = slide.dataset.planningGroup === roomKey;
      slide.classList.toggle("swiper-slide-hidden-group", !matches);
      if (matches) visible.push(slide);
    });
    swiper.update();
    swiper.slideTo(0);

    gsap.fromTo(
      visible,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.08 },
    );
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.classList.contains("is-active")) return;

      tabs.forEach((otherTab) => {
        const isActive = otherTab === tab;
        otherTab.classList.toggle("is-active", isActive);
        otherTab.setAttribute("aria-selected", String(isActive));
      });

      applyTab(tab.dataset.planningTab);
    });
  });

  applyTab(tabs[0].dataset.planningTab);
}

function initAdvantagesSlider() {
  const section = document.querySelector(".single-project-advantages");
  const sliderEl = section?.querySelector(".single-project-advantages__slider");
  if (!section || !sliderEl) return;

  new Swiper(sliderEl, {
    modules: [Navigation],
    slidesPerView: 1,
    spaceBetween: 8,
    speed: 600,
    navigation: {
      prevEl: section.querySelector("[data-advantages-prev]"),
      nextEl: section.querySelector("[data-advantages-next]"),
    },
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 4 },
    },
  });
}

// Mobile/tablet stand-in for the laptop :hover reveal (see single-project.scss
// — laptop has no button at all, the image just shrinks on hover; touch
// devices get an explicit toggle instead, driving the same .is-expanded
// state and swapping the button's label like the Figma "active" state does).
function initAdvantagesToggle() {
  const cards = document.querySelectorAll("[data-advantages-card]");
  if (!cards.length) return;

  cards.forEach((card) => {
    const btn = card.querySelector("[data-advantages-toggle]");
    const label = btn?.querySelector(".single-project-advantages__toggle-text");
    if (!btn || !label) return;

    btn.addEventListener("click", () => {
      const expanded = card.classList.toggle("is-expanded");
      btn.setAttribute("aria-expanded", expanded ? "true" : "false");
      label.textContent = expanded ? "Згорнути" : "Детальніше";
    });
  });
}

function initOffersSlider() {
  const section = document.querySelector(".single-project-offers");
  const sliderEl = section?.querySelector(".single-project-offers__slider");
  if (!section || !sliderEl) return;

  new Swiper(sliderEl, {
    modules: [Navigation],
    slidesPerView: 1,
    spaceBetween: 8,
    speed: 600,
    navigation: {
      prevEl: section.querySelector("[data-offers-prev]"),
      nextEl: section.querySelector("[data-offers-next]"),
    },
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 4 },
    },
  });
}

// Mobile/tablet stand-in for the laptop :hover reveal (see single-project.scss
// — laptop has no pointer capable of :hover-only interaction on touch, so it
// gets an explicit toggle instead; both drive the same .is-expanded state).
function initOffersToggle() {
  const cards = document.querySelectorAll("[data-offers-card]");
  if (!cards.length) return;

  cards.forEach((card) => {
    const btn = card.querySelector("[data-offers-toggle]");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const expanded = card.classList.toggle("is-expanded");
      btn.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  });
}

function initOthersSlider() {
  const section = document.querySelector(".single-project-others");
  const sliderEl = section?.querySelector(".single-project-others__slider");
  if (!section || !sliderEl) return;

  new Swiper(sliderEl, {
    modules: [Navigation],
    slidesPerView: 1,
    spaceBetween: 8,
    speed: 600,
    navigation: {
      prevEl: section.querySelector("[data-others-prev]"),
      nextEl: section.querySelector("[data-others-next]"),
    },
    breakpoints: {
      768: { slidesPerView: 1.05 },
      1024: { slidesPerView: 2 },
    },
  });
}

function initCharacteristicsToggle() {
  const section = document.querySelector(".single-project-characteristics");
  const button = section?.querySelector("[data-characteristics-more]");
  const cards = section?.querySelectorAll(".single-project-characteristics__card");
  if (!section || !button || !cards?.length) return;

  const extra = Array.from(cards).slice(6);
  if (!extra.length) {
    button.style.display = "none";
    return;
  }

  extra.forEach((card) => {
    card.style.display = "none";
  });

  button.addEventListener("click", () => {
    const isOpen = button.classList.toggle("is-open");
    extra.forEach((card) => {
      card.style.display = isOpen ? "" : "none";
    });
    button.querySelector("span").textContent = isOpen
      ? "Сховати характеристики"
      : "Показати більше характеристик";
  });
}

// Generic single-select dropdown (listbox pattern), reused for every custom
// "Тип"-style trigger+list pair on the page (calculator, construction filters).
function initDropdown(root, { onSelect } = {}) {
  const trigger = root.querySelector("[aria-haspopup='listbox']");
  const list = root.querySelector("[role='listbox']");
  const options = root.querySelectorAll("[role='option']");
  if (!trigger || !list || !options.length) return;

  const close = () => {
    list.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    list.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
  };

  const select = (option) => {
    options.forEach((opt) => {
      const isSelected = opt === option;
      opt.classList.toggle("is-selected", isSelected);
      opt.setAttribute("aria-selected", String(isSelected));
    });
    onSelect?.(option);
    close();
    trigger.focus();
  };

  trigger.addEventListener("click", () => {
    if (list.hidden) open();
    else close();
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
      (list.querySelector(".is-selected") || options[0])?.focus();
    }
  });

  options.forEach((option) => {
    option.addEventListener("click", () => select(option));
    option.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select(option);
      } else if (event.key === "Escape") {
        close();
        trigger.focus();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        (option.nextElementSibling || options[0])?.focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        (option.previousElementSibling || options[options.length - 1])?.focus();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!list.hidden && !root.contains(event.target)) close();
  });
}

function initConstructionFilters() {
  const section = document.querySelector(".single-project-construction");
  const sliderEl = section?.querySelector(".single-project-construction__slider");
  const wrapperEl = sliderEl?.querySelector(".swiper-wrapper");
  if (!section || !sliderEl || !wrapperEl) return;

  const reportTitleEl = section.querySelector("[data-construction-report-title]");
  const reportListEl = section.querySelector("[data-construction-report-list]");
  const counterEl = section.querySelector("[data-construction-counter]");

  const swiper = new Swiper(sliderEl, {
    modules: [Navigation],
    slidesPerView: 1,
    speed: 600,
    navigation: {
      prevEl: section.querySelector("[data-construction-prev]"),
      nextEl: section.querySelector("[data-construction-next]"),
    },
    on: {
      slideChange(instance) {
        if (counterEl) counterEl.textContent = `${instance.activeIndex + 1} / ${instance.slides.length}`;
      },
    },
  });

  const setImages = (images) => {
    wrapperEl.innerHTML = "";
    images.forEach((src, index) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Хід будівництва — фото ${index + 1}`;
      img.loading = "lazy";
      slide.append(img);
      wrapperEl.append(slide);
    });
    swiper.update();
    swiper.slideTo(0, 0);
    if (counterEl) counterEl.textContent = `1 / ${images.length}`;
  };

  const setReport = (data) => {
    if (reportTitleEl) reportTitleEl.textContent = data.title;
    if (reportListEl) {
      reportListEl.innerHTML = "";
      data.items.forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        reportListEl.append(li);
      });
    }
  };

  let currentStage = "s1";
  let currentPeriod = "2026-03";

  const applyReport = () => {
    const report = buildConstructionReport(currentStage, currentPeriod);
    setImages(report.images);
    setReport(report);
  };

  section.querySelectorAll("[data-construction-dropdown]").forEach((root) => {
    const key = root.dataset.constructionDropdown;
    const valueEl = section.querySelector(`[data-construction-value="${key}"]`);

    initDropdown(root, {
      onSelect: (option) => {
        if (valueEl) valueEl.textContent = option.textContent.trim();
        if (key === "stage") currentStage = option.dataset.stageKey;
        else if (key === "period") currentPeriod = option.dataset.periodKey;
        applyReport();
      },
    });
  });

  applyReport();
}

function initDocumentsAccordion() {
  const section = document.querySelector(".single-project-documents");
  const items = section?.querySelectorAll("[data-doc-item]");
  if (!section || !items?.length) return;

  items.forEach((item) => {
    const trigger = item.querySelector("[data-doc-trigger]");
    trigger?.addEventListener("click", () => {
      const isOpen = item.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", String(isOpen));
    });
  });

  section.querySelectorAll("[data-doc-tabs]").forEach((tabsEl) => {
    const body = tabsEl.closest("[data-doc-body]");
    const tabs = tabsEl.querySelectorAll("[data-doc-tab]");
    const panels = body.querySelectorAll("[data-doc-tab-panel]");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetIndex = tab.dataset.docTab;
        tabs.forEach((t) => {
          const isActive = t === tab;
          t.classList.toggle("is-active", isActive);
          t.setAttribute("aria-selected", String(isActive));
        });
        panels.forEach((panel) => {
          panel.classList.toggle("hidden", panel.dataset.docTabPanel !== targetIndex);
        });
      });
    });
  });
}

// Interest-free installment calculator: monthly payment = (total - down
// payment) / (term in months). Currency toggle converts the entered total
// using an illustrative FX rate — swap for a live rate on WP integration.
function initCalculator() {
  const section = document.querySelector(".single-project-calculator");
  if (!section) return;

  const totalInput = section.querySelector("[data-calc-total]");
  const currencyBtns = section.querySelectorAll("[data-calc-currency]");
  const typeDropdown = section.querySelector("[data-calc-type-dropdown]");
  const typeValueEl = section.querySelector("[data-calc-type-value]");
  const downRange = section.querySelector("[data-calc-down]");
  const downValueEl = section.querySelector("[data-calc-down-value]");
  const downMinLabelEl = section.querySelector("[data-calc-down-min-label]");
  const downMinEl = section.querySelector("[data-calc-down-min]");
  const downMaxEl = section.querySelector("[data-calc-down-max]");
  const termRange = section.querySelector("[data-calc-term]");
  const termValueEl = section.querySelector("[data-calc-term-value]");
  const termMaxEl = section.querySelector("[data-calc-term-max]");
  const monthlyEl = section.querySelector("[data-calc-monthly]");

  if (!totalInput || !downRange || !termRange || !monthlyEl) return;

  const FX_RATE = 41.5;
  let currency = section.querySelector("[data-calc-currency].is-active")?.dataset.calcCurrency || "UAH";

  const symbol = () => (currency === "USD" ? "$" : "₴");
  const formatMoney = (value) =>
    `${new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Math.max(0, Math.round(value)))} ${symbol()}`;

  function updateProgress(range) {
    const min = Number(range.min);
    const max = Number(range.max);
    const value = Number(range.value);
    const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
    range.style.setProperty("--progress", `${percent}%`);
  }

  function recalc() {
    const total = Math.max(0, Number(totalInput.value) || 0);
    const downPct = Number(downRange.value);
    const termYears = Number(termRange.value);

    if (downValueEl) downValueEl.textContent = `${downPct}%`;
    if (downMinEl) downMinEl.textContent = formatMoney((total * Number(downRange.min)) / 100);
    if (downMaxEl) downMaxEl.textContent = formatMoney((total * Number(downRange.max)) / 100);
    if (termValueEl) termValueEl.textContent = String(termYears);

    const financed = total * (1 - downPct / 100);
    const monthly = termYears > 0 ? financed / (termYears * 12) : 0;
    monthlyEl.textContent = formatMoney(monthly);

    updateProgress(downRange);
    updateProgress(termRange);
  }

  currencyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextCurrency = btn.dataset.calcCurrency;
      if (nextCurrency === currency) return;

      const total = Number(totalInput.value) || 0;
      totalInput.value = Math.round(nextCurrency === "USD" ? total / FX_RATE : total * FX_RATE);

      currency = nextCurrency;
      currencyBtns.forEach((otherBtn) => otherBtn.classList.toggle("is-active", otherBtn === btn));
      recalc();
    });
  });

  if (typeDropdown) {
    initDropdown(typeDropdown, {
      onSelect: (option) => {
        const maxYears = Number(option.dataset.termMax);
        const minDown = Number(option.dataset.downMin);

        termRange.max = String(maxYears);
        if (termMaxEl) termMaxEl.textContent = String(maxYears);
        if (Number(termRange.value) > maxYears) termRange.value = String(maxYears);

        downRange.min = String(minDown);
        if (downMinLabelEl) downMinLabelEl.textContent = String(minDown);
        if (Number(downRange.value) < minDown) downRange.value = String(minDown);

        if (typeValueEl) typeValueEl.textContent = option.textContent.trim();
        recalc();
      },
    });
  }

  totalInput.addEventListener("input", recalc);
  downRange.addEventListener("input", recalc);
  termRange.addEventListener("input", recalc);

  recalc();
}

// Bar height is computed in pixels — not a percentage of the column — from
// the space actually left over after that column's price label and year
// chip (see the CSS comment on .single-project-investitions__bar for why a
// percentage caused every tall bar to clamp to the same height). The
// shortest bar gets INVEST_CHART_FLOOR% of that leftover space (so it's
// never a sliver) and the rest scale linearly up to 100% at the highest
// price, so editing a single number in the markup reflows every bar's
// proportions. Recomputed on resize since the column height is fluid
// (vw-based) at the laptop breakpoint.
const INVEST_CHART_FLOOR = 24;

// Below 768px the chart switches to horizontal bars (one per row) instead of
// vertical ones — see the mobile-only override at the bottom of
// .single-project-investitions__bar in single-project.scss. Same
// floor/scale formula either way, just measured against the column's
// available width instead of height.
const INVEST_CHART_MOBILE_QUERY = "(width < 768px)";

function initInvestitionsChart() {
  const chart = document.querySelector("[data-investitions-chart]");
  const cols = chart?.querySelectorAll(".single-project-investitions__col");
  if (!chart || !cols?.length) return;

  const bars = Array.from(cols, (col) => col.querySelector("[data-investitions-bar]"));
  const prices = bars.map((bar) => Number(bar.dataset.investitionsBar));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const isMobile = () => window.matchMedia(INVEST_CHART_MOBILE_QUERY).matches;

  const percentFor = (index) =>
    max > min
      ? INVEST_CHART_FLOOR + ((prices[index] - min) / (max - min)) * (60 - INVEST_CHART_FLOOR) + 40
      : 100;

  const applyHeights = () => {
    cols.forEach((col, index) => {
      const bar = bars[index];
      bar.style.width = "";
      const price = col.querySelector(".single-project-investitions__price");
      const text = col.querySelector(".single-project-investitions__col-text");
      const available = col.clientHeight - price.offsetHeight - text.offsetHeight;
      bar.style.height = `${Math.max(4, (available * percentFor(index)) / 100)}px`;
    });
  };

  const applyWidths = () => {
    cols.forEach((col, index) => {
      const bar = bars[index];
      bar.style.height = "";
      const price = col.querySelector(".single-project-investitions__price");
      const available = col.clientWidth - price.offsetWidth - 12;
      bar.style.width = `${Math.max(32, (available * percentFor(index)) / 100)}px`;
    });
  };

  const apply = () => (isMobile() ? applyWidths() : applyHeights());

  apply();
  new ResizeObserver(apply).observe(chart);
}

// Reuses the same lightweight lazy-load map widget as the footer, re-centered
// on this project's district (Позитрон) instead of the citywide default.
function initInfraMap() {
  const mapInfo = projectMapConfig?.map;
  if (!mapInfo || !document.querySelector("#single-project-infra-map")) return;

  initLazyMap({
    selector: "#single-project-infra-map",
    accessToken: mapInfo.mapbox_access_token,
    i18n: createMapI18n(),
    center: mapInfo.default_coordinates,
    zoom: mapInfo.default_zoom,
    markers: (mapInfo.markers || []).map((marker) => ({
      type: marker.type,
      title: marker.title,
      description: marker.description,
      images: marker.images,
      coordinates: marker.coordinates,
      lng: marker.coordinates[1],
      lat: marker.coordinates[0],
    })),
  });
}

initDescriptionModal();
initHeroSlider();
initHeroGallery();
initHeroScrollBtn();
initPlanningSection();
initAdvantagesSlider();
initAdvantagesToggle();
initOffersSlider();
initOffersToggle();
initOthersSlider();
initCharacteristicsToggle();
initConstructionFilters();
initDocumentsAccordion();
initCalculator();
initInvestitionsChart();
initInfraMap();

initSectionReveal(".single-project-info", ".single-project-info__apartments, .single-project-info__about");
initSectionReveal(".single-project-characteristics", ".single-project-characteristics__grid");
initSectionReveal(
  ".single-project-calculator",
  ".single-project-calculator__head, .single-project-calculator__box",
);
initSectionReveal(".single-project-card", ".single-project-card__inner");
