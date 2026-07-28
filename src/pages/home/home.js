import "./home.scss";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Swiper from "swiper";
import { Navigation, Autoplay, Scrollbar } from "swiper/modules";
import { Fancybox } from "@fancyapps/ui/dist/fancybox/fancybox.js";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

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

function initFounderParallax() {
  const section = document.querySelector(".founder");
  const text = section?.querySelector('[data-parallax="text"]');
  const startWord = section?.querySelector('[data-parallax-word="start"]');
  const endWord = section?.querySelector('[data-parallax-word="end"]');
  if (!section) return;

  if (text) {
    gsap.fromTo(
      text,
      { yPercent: 20 },
      {
        yPercent: -20,
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

function initFounderPopup() {
  const openBtn = document.querySelector("[data-founder-open]");
  const popup = document.querySelector("[data-founder-popup]");
  if (!openBtn || !popup) return;

  const closeBtn = popup.querySelector("[data-founder-close]");
  const signature = popup.querySelector("[data-founder-signature]");
  let signatureAnimated = false;

  function animateSignature() {
    if (signatureAnimated || !signature) return;
    signatureAnimated = true;

    gsap.fromTo(
      signature,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        duration: 1.4,
        ease: "power2.inOut",
        delay: 0.55,
      },
    );
  }

  function openPopup() {
    window.dispatchEvent(new Event("stop-scroll"));
    popup.classList.remove("hidden");
    animateSignature();
  }

  function closePopup() {
    window.dispatchEvent(new Event("start-scroll"));
    popup.classList.add("hidden");
  }

  openBtn.addEventListener("click", openPopup);
  closeBtn?.addEventListener("click", closePopup);

  popup.addEventListener("click", (event) => {
    if (event.target === popup) closePopup();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !popup.classList.contains("hidden")) {
      closePopup();
    }
  });
}

function initAwardsSlider() {
  const section = document.querySelector(".awards");
  const sliderEl = section?.querySelector(".awards__slider");
  if (!section || !sliderEl) return;

  new Swiper(sliderEl, {
    modules: [Navigation],
    slidesPerView: 1,
    spaceBetween: 1,
    grabCursor: true,
    speed: 600,
    navigation: {
      prevEl: section.querySelector("[data-awards-prev]"),
      nextEl: section.querySelector("[data-awards-next]"),
    },
    breakpoints: {
      768: { slidesPerView: 1.4 },
      1024: { slidesPerView: 2.8 },
      1366: { slidesPerView: 3.4 },
      1600: { slidesPerView: 3.8 },
    },
  });
}

function initAwardsGallery() {
  const section = document.querySelector(".awards");
  if (!section) return;

  Fancybox.bind(section, "[data-fancybox='awards']");
}

function initAwardsCardToggle() {
  const section = document.querySelector(".awards");
  if (!section) return;

  section.querySelectorAll("[data-awards-more]").forEach((btn) => {
    const label = btn.querySelector("span:first-child");
    const sign = btn.querySelector(".awards__card-plus");
    const collapsedText = label?.textContent ?? "Детальніше";
    const collapsedSign = sign?.textContent ?? "+";

    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const card = btn.closest(".awards__card");
      const isExpanded = card?.classList.toggle("is-expanded");

      if (label) label.textContent = isExpanded ? "Згорнути" : collapsedText;
      if (sign) sign.textContent = isExpanded ? "-" : collapsedSign;
    });
  });
}

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
      768: { slidesPerView: 1.3 },
      1024: { slidesPerView: 2.4 },
      1366: { slidesPerView: 3.4 },
      1920: { slidesPerView: 4 },
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

function initNewsSlider() {
  const section = document.querySelector(".news");
  const sliderEl = section?.querySelector(".news__slider");
  if (!section || !sliderEl) return null;

  return new Swiper(sliderEl, {
    modules: [Navigation],
    slidesPerView: 1,
    spaceBetween: 8,
    speed: 600,
    navigation: {
      prevEl: section.querySelector("[data-news-prev]"),
      nextEl: section.querySelector("[data-news-next]"),
    },
    breakpoints: {
      768: { slidesPerView: 1 },
      1024: { slidesPerView: 2.5 },
      1366: { slidesPerView: 3 },
      1920: { slidesPerView: 3.2 },
    },
  });
}

initHeroVideo();
initHeroScrollBtn();
initStatsCounters();
initStatsParallax();
initFounderParallax();
initFounderPopup();
initAwardsSlider();
initAwardsGallery();
initAwardsCardToggle();
initProjectsParallax();
initProjectsFilter(initProjectsSlider());
initCommercialParallax();
initNewsSlider();
