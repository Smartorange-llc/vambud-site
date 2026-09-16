import "./commercial.scss";

import Swiper from "swiper";
import { Navigation } from "swiper/modules";

// Same expand/collapse mechanic as single-project's documents accordion
// (single-project.js initDocumentsAccordion), but only one item may stay
// open at a time within a given accordion group, matching the Figma source
// (only the first property section ships "open" — the rest are collapsed).
function initAccordion(container, { exclusive = false } = {}) {
  const items = container?.querySelectorAll("[data-doc-item]");
  if (!container || !items?.length) return;

  items.forEach((item) => {
    const trigger = item.querySelector("[data-doc-trigger]");
    trigger?.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");

      if (exclusive && willOpen) {
        items.forEach((otherItem) => {
          if (otherItem === item) return;
          otherItem.classList.remove("is-open");
          otherItem.querySelector("[data-doc-trigger]")?.setAttribute("aria-expanded", "false");
        });
      }

      item.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });
  });
}

// Real filter, same idea as one-room's project-grid filter: each property
// carries its own `data-deal-type` ("sale"/"rent"); switching the tab shows
// only the matching accordion items instead of just toggling a visual state.
function initDealFilter() {
  const section = document.querySelector(".commercial-list");
  const tabs = section?.querySelectorAll("[data-commercial-filter]");
  const items = section?.querySelectorAll("[data-doc-item]");
  if (!section || !tabs?.length || !items?.length) return;

  function applyFilter(dealType) {
    items.forEach((item) => {
      item.style.display = item.dataset.dealType === dealType ? "" : "none";
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.classList.contains("is-active")) return;

      tabs.forEach((otherTab) => {
        const isActive = otherTab === tab;
        otherTab.classList.toggle("is-active", isActive);
        otherTab.setAttribute("aria-selected", String(isActive));
      });

      applyFilter(tab.dataset.commercialFilter);
    });
  });

  const initialFilter = section.querySelector("[data-commercial-filter].is-active")?.dataset.commercialFilter;
  if (initialFilter) applyFilter(initialFilter);
}

// Photo gallery per property and plan gallery per unit — the mockup shows
// arrows plus an "01 / 02" counter on the property photo and arrows around
// each unit plan.
function initPropertyGalleries() {
  document.querySelectorAll("[data-property-gallery]").forEach((el) => {
    const counter = el.querySelector("[data-gallery-counter]");
    const pad = (n) => String(n).padStart(2, "0");
    const swiper = new Swiper(el, {
      modules: [Navigation],
      slidesPerView: 1,
      speed: 500,
      navigation: {
        prevEl: el.querySelector(".commercial-item__gallery-arrow--prev"),
        nextEl: el.querySelector(".commercial-item__gallery-arrow--next"),
      },
    });
    if (!counter) return;
    const sync = () => {
      counter.textContent = `${pad(swiper.realIndex + 1)} / ${pad(swiper.slides.length)}`;
    };
    swiper.on("slideChange", sync);
    sync();
  });
}

function initUnitPlanGalleries() {
  document.querySelectorAll("[data-unit-plans]").forEach((el) => {
    const plan = el.closest(".commercial-unit__plan");
    new Swiper(el, {
      modules: [Navigation],
      slidesPerView: 1,
      speed: 500,
      navigation: {
        prevEl: plan?.querySelector(".commercial-unit__plan-arrow--prev"),
        nextEl: plan?.querySelector(".commercial-unit__plan-arrow--next"),
      },
    });
  });
}

function initPromoToggle() {
  const text = document.querySelector("[data-promo-text]");
  const btn = document.querySelector("[data-promo-toggle]");
  if (!text || !btn) return;

  btn.addEventListener("click", () => {
    const expanded = text.classList.toggle("is-expanded");
    btn.setAttribute("aria-expanded", expanded ? "true" : "false");
  });
}

initPropertyGalleries();
initUnitPlanGalleries();
initAccordion(document.querySelector("[data-commercial-accordion]"), { exclusive: true });
initDealFilter();
initPromoToggle();
