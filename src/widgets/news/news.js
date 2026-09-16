import "./news.scss";
import Swiper from "swiper";
import { Navigation } from "swiper/modules";

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
    },
  });
}

initNewsSlider();
