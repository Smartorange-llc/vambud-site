import "./ready-apartments.scss";

import { gsap } from "gsap/all";
import Swiper from "swiper";
import { Navigation } from "swiper/modules";

function initPlanningCardSliders() {
  document.querySelectorAll(".ready-planning [data-flat-slider]").forEach((flatEl) => {
    const card = flatEl.closest(".ready-planning__flat");
    new Swiper(flatEl, {
      modules: [Navigation],
      slidesPerView: 1,
      speed: 500,
      navigation: {
        prevEl: card?.querySelector(".ready-planning__flat-arrow--prev"),
        nextEl: card?.querySelector(".ready-planning__flat-arrow--next"),
      },
    });
  });
}

function initPlanningTabs() {
  const section = document.querySelector(".ready-planning");
  const tabs = section?.querySelectorAll("[data-planning-tab]");
  const groupTitle = section?.querySelector("[data-planning-group-title]");
  if (!section || !tabs?.length) return;

  const cards = section.querySelectorAll(".ready-planning__card");

  function applyTab(tab) {
    const key = tab.dataset.planningTab;
    const visible = [];

    cards.forEach((card) => {
      const matches = card.dataset.planningGroup === key;
      card.classList.toggle("is-hidden-group", !matches);
      if (matches) visible.push(card);
    });

    if (groupTitle) {
      groupTitle.textContent = tab.querySelector(".ready-planning__tab-count")
        ? tab.textContent.replace(tab.querySelector(".ready-planning__tab-count").textContent, "").trim()
        : tab.textContent.trim();
    }

    visible.forEach((card) => {
      card.querySelector(".ready-planning__flat-slider")?.swiper?.update();
    });

    gsap.fromTo(visible, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.08 });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.classList.contains("is-active")) return;

      tabs.forEach((otherTab) => {
        const isActive = otherTab === tab;
        otherTab.classList.toggle("is-active", isActive);
        otherTab.setAttribute("aria-selected", String(isActive));
      });

      applyTab(tab);
    });
  });
}

function initBenefitsToggle() {
  const text = document.querySelector("[data-benefits-text]");
  const btn = document.querySelector("[data-benefits-toggle]");
  if (!text || !btn) return;

  btn.addEventListener("click", () => {
    const expanded = text.classList.toggle("is-expanded");
    btn.setAttribute("aria-expanded", expanded ? "true" : "false");
  });
}

initPlanningCardSliders();
initPlanningTabs();
initBenefitsToggle();
