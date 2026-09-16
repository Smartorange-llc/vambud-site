import "./resale.scss";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function initParallax() {
  document.querySelectorAll('[data-parallax="image"]').forEach((image) => {
    gsap.fromTo(
      image,
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: image.closest("section") || image.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });
}

function initSectionReveal() {
  document
    .querySelectorAll(
      ".resale-pitch__card, .resale-process__card, .resale-cta__card, .resale-advantages__card",
    )
    .forEach((card) => {
      gsap.set(card, { opacity: 0, y: 32 });
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          once: true,
        },
      });
    });
}

function initResale() {
  initParallax();
  initSectionReveal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initResale);
} else {
  initResale();
}
