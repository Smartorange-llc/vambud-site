import "./awards.scss";
import "@app/styles/vendor-fancybox.scss";
import Swiper from "swiper";
import { Navigation } from "swiper/modules";
import { Fancybox } from "@fancyapps/ui/dist/fancybox/fancybox.js";

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

initAwardsSlider();
initAwardsGallery();
initAwardsCardToggle();
