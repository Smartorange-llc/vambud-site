import "./projects.scss";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Swiper from "swiper";
import { Navigation } from "swiper/modules";

gsap.registerPlugin(ScrollTrigger);

function initProjectsParallax() {
  const section = document.querySelector(".projects");
  const image = section?.querySelector('[data-parallax="image"]');
  const startWord = section?.querySelector('[data-parallax-word="start"]');
  const endWord = section?.querySelector('[data-parallax-word="end"]');
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

  if (startWord) {
    gsap.fromTo(
      startWord,
      { xPercent: -12 },
      {
        xPercent: 12,
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

  if (endWord) {
    gsap.fromTo(
      endWord,
      { xPercent: 12 },
      {
        xPercent: -12,
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
}

function initProjectsSlider() {
  const section = document.querySelector(".projects");
  const sliderEl = section?.querySelector(".projects__slider");
  if (!section || !sliderEl) return null;

  return new Swiper(sliderEl, {
    modules: [Navigation],
    slidesPerView: 1,
    spaceBetween: 8,
    speed: 600,
    navigation: {
      prevEl: section.querySelector("[data-projects-prev]"),
      nextEl: section.querySelector("[data-projects-next]"),
    },
    breakpoints: {
      768: { slidesPerView: 1 },
      1024: { slidesPerView: 2 },
      1366: { slidesPerView: 2 },
      1920: { slidesPerView: 2 },
    },
  });
}

function initProjectsFilter(swiper) {
  const section = document.querySelector(".projects");
  if (!section) return;

  const buttons = section.querySelectorAll("[data-project-filter]");
  const slides = section.querySelectorAll(".projects__slide");
  if (!buttons.length || !slides.length) return;

  function applyFilter(filterId) {
    const revealedCards = [];

    slides.forEach((slide) => {
      const status = slide.dataset.projectStatus;
      const tags = (slide.dataset.projectTags || "").split(",").filter(Boolean);
      const matches =
        filterId === "all" || (filterId === "eoselya" ? tags.includes("eoselya") : status === filterId);

      slide.classList.toggle("is-hidden", !matches);
      if (matches) {
        const card = slide.querySelector(".projects__card");
        if (card) revealedCards.push(card);
      }
    });

    gsap.fromTo(
      revealedCards,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.06, overwrite: true },
    );

    swiper?.update();
    swiper?.slideTo(0);
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-active")) return;

      buttons.forEach((otherBtn) => {
        const isActive = otherBtn === btn;
        otherBtn.classList.toggle("is-active", isActive);
        otherBtn.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      applyFilter(btn.dataset.projectFilter);
    });
  });
}

initProjectsParallax();
initProjectsFilter(initProjectsSlider());
