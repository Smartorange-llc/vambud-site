import "./about.scss";
import "@app/styles/vendor-fancybox.scss";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Swiper from "swiper";
import { Navigation } from "swiper/modules";
import { Fancybox } from "@fancyapps/ui/dist/fancybox/fancybox.js";

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

// Mobile/tablet stand-in for the card's own laptop :hover reveal (see
// about.scss — laptop has no pointer capable of :hover-only interaction on
// touch, so "Детальніше" opens this popup instead of expanding the card
// inline). Content is read straight from each card's own
// .about-stats__value/__label/__text, so the three stats rendered in
// about.pug stay the single source of truth; prev/next just moves the
// index and re-reads from the next/previous card without closing the popup.
function initStatsModal() {
  const section = document.querySelector(".about-stats");
  const overflow = document.querySelector("[data-about-stats-modal__overflow]");
  const modal = document.querySelector("[data-about-stats-modal]");
  if (!section || !overflow || !modal) return;

  const cards = Array.from(section.querySelectorAll(".about-stats__card"));
  const triggers = section.querySelectorAll("[data-about-stats-more]");
  if (!cards.length || !triggers.length) return;

  const body = modal.querySelector(".about-stats-modal__body");
  const valueEl = modal.querySelector("[data-about-stats-modal-value]");
  const labelEl = modal.querySelector("[data-about-stats-modal-label]");
  const textEl = modal.querySelector("[data-about-stats-modal-text]");
  const prevBtn = modal.querySelector("[data-about-stats-modal-prev]");
  const nextBtn = modal.querySelector("[data-about-stats-modal-next]");

  let currentIndex = 0;

  function render(index) {
    currentIndex = (index + cards.length) % cards.length;
    const card = cards[currentIndex];

    if (valueEl) valueEl.textContent = card.querySelector(".about-stats__value")?.textContent ?? "";
    if (labelEl) labelEl.textContent = card.querySelector(".about-stats__label")?.textContent ?? "";
    if (textEl) textEl.textContent = card.querySelector(".about-stats__text")?.textContent ?? "";
    if (body) body.scrollTop = 0;
  }

  function open(index) {
    render(index);
    window.dispatchEvent(new Event("stop-scroll"));
    overflow.classList.remove("hidden");
  }

  function close() {
    if (overflow.classList.contains("hidden")) return;
    window.dispatchEvent(new Event("start-scroll"));
    overflow.classList.add("hidden");
  }

  triggers.forEach((btn, index) => {
    btn.addEventListener("click", () => open(index));
  });

  prevBtn?.addEventListener("click", () => render(currentIndex - 1));
  nextBtn?.addEventListener("click", () => render(currentIndex + 1));

  modal.querySelector("[data-about-stats-modal-close]")?.addEventListener("click", close);
  overflow.addEventListener("click", (evt) => {
    if (evt.target === overflow) close();
  });
  document.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape") close();
  });
}

function initPhilosophyParallax() {
  const section = document.querySelector(".about-philosophy");
  const image = section?.querySelector('[data-parallax="image"]');
  if (!section || !image) return;

  gsap.fromTo(
    image,
    { yPercent: -6 },
    {
      yPercent: 6,
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

// Card sits on top of the already-parallaxing photo (initPhilosophyParallax)
// — scrubbing its own rotateX/yPercent at a different rate/axis than the
// background makes the two layers visibly separate in depth instead of
// drifting together, which is what actually reads as "3D" here.
function initPhilosophyCardTilt() {
  const section = document.querySelector(".about-philosophy");
  // Animate the inner face, not .about-philosophy__card itself — that outer
  // element owns the laptop `transform: translateY(-50%)` centering in CSS,
  // and GSAP writing its own inline transform there would overwrite it.
  const card = section?.querySelector(".about-philosophy__card-face");
  if (!section || !card) return;

  gsap.fromTo(
    card,
    { yPercent: 4, rotateX: 8, transformPerspective: 1000, transformOrigin: "50% 100%" },
    {
      yPercent: -4,
      rotateX: -8,
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

function initValuesParallax() {
  const section = document.querySelector(".about-values");
  const image = section?.querySelector('[data-parallax="image"]');
  if (!section || !image) return;

  gsap.fromTo(
    image,
    { yPercent: -10 },
    {
      yPercent: 10,
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

function initHistoryParallax() {
  const section = document.querySelector(".about-history");
  const image = section?.querySelector('[data-parallax="image"]');
  if (!section || !image) return;

  gsap.fromTo(
    image,
    { yPercent: -10 },
    {
      yPercent: 10,
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

function initHistoryBirds() {
  const section = document.querySelector(".about-history");
  const bird = section?.querySelector(".about-history__bird");
  if (!section || !bird) return;

  gsap.set(bird, {
    opacity: 0,
    xPercent: 24,
    scale: 0.8,
    y: 36,
    rotate: -5,
    scale: 0.9,
    transformOrigin: "50% 50%",
  });

  gsap.to(bird, {
    opacity: 1,
    xPercent: 0,
    scale: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    duration: 1.6,
    ease: "back.out(1.5)",
    scrollTrigger: {
      trigger: bird,
      start: "top 90%",
      once: true,
    },
    onComplete: () => {
      // Idle glide: gentle altitude bob + wing-tilt wobble, kept off the x-axis
      // so it doesn't fight the scroll-driven drift tween below.
      gsap.to(bird, {
        y: "+=14",
        duration: 2.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to(bird, {
        rotate: 2,
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.4,
      });
    },
  });

  // Birds drift further across the sky than the background as the section scrolls by.
  gsap.to(bird, {
    xPercent: 10,
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
}

function initHistorySlider() {
  const section = document.querySelector(".about-history");
  const sliderEl = section?.querySelector(".about-history__slider");
  if (!section || !sliderEl) return;

  new Swiper(sliderEl, {
    modules: [Navigation],
    slidesPerView: 1,
    spaceBetween: 8,
    speed: 600,
    navigation: {
      prevEl: section.querySelector("[data-history-prev]"),
      nextEl: section.querySelector("[data-history-next]"),
    },
    breakpoints: {
      1024: { slidesPerView: 2.4 },
      1366: { slidesPerView: 3 },
    },
  });
}

function initReviewsVideoVisibility() {
  const section = document.querySelector(".about-reviews");
  const video = section?.querySelector(".about-reviews__video");
  if (!section || !video) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.25 },
  );

  observer.observe(video);
}

function initReviewsSlider() {
  const section = document.querySelector(".about-reviews");
  const sliderEl = section?.querySelector(".about-reviews__slider");
  if (!section || !sliderEl) return;

  new Swiper(sliderEl, {
    modules: [Navigation],
    slidesPerView: 1,
    spaceBetween: 8,
    speed: 600,
    navigation: {
      prevEl: section.querySelector("[data-reviews-prev]"),
      nextEl: section.querySelector("[data-reviews-next]"),
    },
    breakpoints: {
      1024: { slidesPerView: 2 },
    },
  });

  Fancybox.bind(section, "[data-fancybox='reviews']");
}

function initStandardsSlider() {
  const section = document.querySelector(".about-standards");
  const sliderEl = section?.querySelector(".about-standards__slider");
  if (!section || !sliderEl) return;

  new Swiper(sliderEl, {
    modules: [Navigation],
    slidesPerView: 1,
    spaceBetween: 16,
    speed: 600,
    navigation: {
      prevEl: section.querySelector("[data-standards-prev]"),
      nextEl: section.querySelector("[data-standards-next]"),
    },
    breakpoints: {
      768: { slidesPerView: 1.4 },
      1024: { slidesPerView: 2, spaceBetween: 24 },
      1366: { slidesPerView: 2.4, spaceBetween: 24 },
    },
  });

  Fancybox.bind(section, "[data-fancybox='standards']");
}

function initTeamTabs() {
  const section = document.querySelector(".about-team");
  if (!section) return;

  const tabs = section.querySelectorAll("[data-team-tab]");
  const groups = section.querySelectorAll("[data-team-group]");
  if (!tabs.length || !groups.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.teamTab;
      if (tab.classList.contains("is-active")) return;

      tabs.forEach((otherTab) => {
        const isActive = otherTab === tab;
        otherTab.classList.toggle("is-active", isActive);
        otherTab.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      groups.forEach((group) => {
        group.hidden = group.dataset.teamGroup !== target;
      });
    });
  });
}

function initTeamSliders() {
  const section = document.querySelector(".about-team");
  if (!section) return;

  section.querySelectorAll("[data-team-group]").forEach((group) => {
    const key = group.dataset.teamGroup;
    const sliderEl = group.querySelector(".about-team__slider");
    if (!sliderEl) return;

    new Swiper(sliderEl, {
      modules: [Navigation],
      slidesPerView: "auto",
      spaceBetween: 8,
      speed: 600,
      navigation: {
        prevEl: section.querySelector(`[data-team-prev-${key}]`),
        nextEl: section.querySelector(`[data-team-next-${key}]`),
      },
    });
  });
}

initStatsModal();
initPhilosophyParallax();
initPhilosophyCardTilt();
initValuesParallax();
initHistoryParallax();
initHistoryBirds();
initHistorySlider();
initReviewsVideoVisibility();
initReviewsSlider();
initStandardsSlider();
initTeamTabs();
initTeamSliders();

// Targets the inner face, not .about-philosophy__card, for the same reason
// as initPhilosophyCardTilt above: the shell owns a CSS `transform` at
// laptop (centering) that a GSAP-written inline transform would overwrite.
initSectionReveal(".about-philosophy", ".about-philosophy__card-face");
initSectionReveal(".about-values", ".about-values__title, .about-values__card");
initSectionReveal(".about-history", ".about-history__title");
initSectionReveal(".about-reviews", ".about-reviews__title, .about-reviews__card");
initSectionReveal(".about-standards", ".about-standards__title");
initSectionReveal(".about-team", ".about-team__title, .about-team__tabs");
initSectionReveal(".about-career", ".about-career__card");
