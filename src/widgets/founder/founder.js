import "./founder.scss";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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

initFounderParallax();
initFounderPopup();
