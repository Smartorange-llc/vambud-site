import "./single-news.scss";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";
import Swiper from "swiper";
import { Navigation } from "swiper/modules";
import { whenLoaderReveals } from "../../shared/scripts/loader-sync.js";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  gsap.set(".header", { y: -100, opacity: 0 });
  gsap.set(".btn-back", { y: -30, opacity: 0 });
  gsap.set("h1", { y: 30, opacity: 0, clipPath: "inset(0% 0% 100% 0%)" });
  gsap.set(".single-news__social", { y: 20, opacity: 0 });

  const tl = gsap.timeline({
    paused: true,
    defaults: {
      ease: "power2.out",
      duration: 1,
    },
  });

  tl.to(".header", { y: 0, opacity: 1, duration: 1 }, 0);
  tl.to(".btn-back", { y: 0, opacity: 1, duration: 0.6 }, "<");
  tl.to(
    "h1",
    { y: 0, opacity: 1, duration: 0.6, clipPath: "inset(0% 0% 0% 0%)", clearProps: "clipPath" },
    "-=0.4",
  );
  tl.to(".single-news__social", { y: 0, opacity: 1, duration: 0.6 }, "-=0.4");

  whenLoaderReveals().then(() => tl.play());

  initGallerySlider();
  initRelatedSlider();
  initContentReveal();

  function initGallerySlider() {
    const slider = document.querySelector(".news-slider");
    if (!slider) return;

    const track = slider.querySelector(".news-slider__track");
    const slides = Array.from(slider.querySelectorAll(".news-slider__slide"));
    const prevBtn = slider.querySelector(".news-slider__nav--prev");
    const nextBtn = slider.querySelector(".news-slider__nav--next");
    const counterCurrent = slider.querySelector(".news-slider__counter-current");
    const counterTotal = slider.querySelector(".news-slider__counter-total");

    if (!slides.length || !track) return;

    const total = slides.length;
    let current = 0;
    const pad = (n) => String(n).padStart(2, "0");

    counterTotal.textContent = pad(total);
    counterCurrent.textContent = pad(1);

    const goTo = (index) => {
      current = ((index % total) + total) % total;
      gsap.to(track, {
        x: `-${current * 100}%`,
        duration: 0.7,
        ease: "power2.inOut",
      });
      counterCurrent.textContent = pad(current + 1);
    };

    prevBtn.addEventListener("click", () => goTo(current - 1));
    nextBtn.addEventListener("click", () => goTo(current + 1));

    let startX = 0;
    const trackWrap = slider.querySelector(".news-slider__track-wrap");
    trackWrap.addEventListener("pointerdown", (e) => {
      startX = e.clientX;
    });
    trackWrap.addEventListener("pointerup", (e) => {
      const diff = startX - e.clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    });
  }

  function initRelatedSlider() {
    const section = document.querySelector(".single-news-related");
    const sliderEl = section?.querySelector(".single-news-related__slider");
    if (!section || !sliderEl) return;

    new Swiper(sliderEl, {
      modules: [Navigation],
      slidesPerView: "auto",
      spaceBetween: 8,
      speed: 600,
      navigation: {
        prevEl: section.querySelector("[data-related-prev]"),
        nextEl: section.querySelector("[data-related-next]"),
      },
    });
  }

  function initContentReveal() {
    const elements = document.querySelectorAll(".single-news__content > *");

    elements.forEach((el) => {
      if (el.classList.contains("news-slider")) return;

      gsap.fromTo(
        el,
        { yPercent: 100, clipPath: "inset(0% 0% 100% 0%)" },
        {
          yPercent: 0,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 100%",
            toggleActions: "play none none none",
            onEnter: () => (el.style.willChange = "transform, clip-path"),
            onComplete: () => (el.style.willChange = "auto"),
          },
        },
      );
    });
  }
});
