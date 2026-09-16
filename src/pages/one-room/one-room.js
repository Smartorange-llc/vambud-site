import "./one-room.scss";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Swiper from "swiper";
import { Navigation } from "swiper/modules";

gsap.registerPlugin(ScrollTrigger);

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

function initHeroParallax() {
  const section = document.querySelector(".one-room-hero");
  const bg = section?.querySelector(".one-room-hero__bg");
  if (!section || !bg) return;

  // gsap.fromTo(
  //   bg,
  //   { yPercent: -6 },
  //   {
  //     yPercent: 6,
  //     ease: "none",
  //     scrollTrigger: {
  //       trigger: section,
  //       start: "top bottom",
  //       end: "bottom top",
  //       scrub: true,
  //     },
  //   },
  // );
}

// Same filter mechanic as projects.pug's catalog, minus pagination — this
// page only ever shows 9 curated cards, so a plain show/hide per filter is
// enough (no need for the numbered-pagination + "load more" widget).
function initProjectsFilter() {
  const section = document.querySelector(".one-room-projects");
  const grid = section?.querySelector("[data-projects-grid]");
  const filterButtons = section?.querySelectorAll("[data-project-filter]");
  const emptyState = section?.querySelector("[data-projects-empty]");
  if (!section || !grid || !filterButtons?.length) return;

  const allCards = Array.from(grid.querySelectorAll("[data-project-card]"));

  function matchesFilter(card, filterId) {
    if (filterId === "all") return true;
    const status = card.dataset.projectStatus;
    const tags = (card.dataset.projectTags || "").split(",").filter(Boolean);
    return status === filterId || tags.includes(filterId);
  }

  function applyFilter(filterId) {
    const visible = [];
    allCards.forEach((card) => {
      const matches = matchesFilter(card, filterId);
      card.style.display = matches ? "" : "none";
      if (matches) visible.push(card);
    });

    if (emptyState) emptyState.hidden = visible.length !== 0;

    gsap.fromTo(
      visible,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", overwrite: true },
    );
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-active")) return;

      filterButtons.forEach((otherBtn) => {
        const isActive = otherBtn === btn;
        otherBtn.classList.toggle("is-active", isActive);
        otherBtn.setAttribute("aria-selected", String(isActive));
      });

      applyFilter(btn.dataset.projectFilter);
    });
  });

  const initialFilter =
    section.querySelector("[data-project-filter].is-active")?.dataset.projectFilter || "all";
  applyFilter(initialFilter);
}

// The mockup carousels these cards only from laptop up (two per view);
// below that both plans are simply stacked, so Swiper stays off there.
function initPlanningSlider() {
  const section = document.querySelector(".one-room-planning");
  const sliderEl = section?.querySelector(".one-room-planning__slider");
  if (!section || !sliderEl) return;

  new Swiper(sliderEl, {
    modules: [Navigation],
    enabled: false,
    slidesPerView: 1,
    spaceBetween: 8,
    speed: 600,
    navigation: {
      prevEl: section.querySelector("[data-planning-prev]"),
      nextEl: section.querySelector("[data-planning-next]"),
    },
    breakpoints: {
      1024: { enabled: true, slidesPerView: 2, spaceBetween: 8 },
    },
  });
}

// initHeroParallax();
initProjectsFilter();
initPlanningSlider();

initSectionReveal(".one-room-intro", ".one-room-intro__text, .one-room-intro__table");
initSectionReveal(".one-room-card", ".one-room-card__inner");
initSectionReveal(".one-room-benefits", ".one-room-benefits__text, .one-room-benefits__grid");
