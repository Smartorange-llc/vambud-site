import "./home.scss";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function initHeroVideo() {
  const hero = document.querySelector(".hero");
  const video = hero?.querySelector("[data-hero-video]");
  if (!hero || !video) return;

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
    { threshold: 0.1 },
  );

  observer.observe(hero);
}

function initHeroScrollBtn() {
  const hero = document.querySelector(".hero");
  const scrollBtn = hero?.querySelector("[data-hero-scroll]");
  if (!hero || !scrollBtn) return;

  scrollBtn.addEventListener("click", () => {
    const nextSection = hero.nextElementSibling;
    nextSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function initStatsCounters() {
  const counters = document.querySelectorAll("[data-counter-target]");
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.counterTarget, 10);
        const counter = { value: 0 };

        gsap.to(counter, {
          value: target,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = Math.round(counter.value);
          },
        });

        obs.unobserve(el);
      });
    },
    { threshold: 0.6 },
  );

  counters.forEach((el) => observer.observe(el));
}

function initStatsParallax() {
  const section = document.querySelector(".stats");
  const media = section?.querySelector('[data-parallax="image"]');
  const card = section?.querySelector('[data-parallax="card"]');
  if (!section || !media) return;

  gsap.fromTo(
    media,
    { yPercent: -8 },
    {
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    },
  );

  if (card) {
    gsap.fromTo(
      card,
      { yPercent: 8 },
      {
        yPercent: -8,
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

function initCommercialParallax() {
  const section = document.querySelector(".commercial");
  const image = section?.querySelector('[data-parallax="image"]');
  const startWord = section?.querySelector('[data-parallax-word="start"]');
  const endWord = section?.querySelector('[data-parallax-word="end"]');
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

initHeroVideo();
initHeroScrollBtn();
initStatsCounters();
initStatsParallax();
initCommercialParallax();
