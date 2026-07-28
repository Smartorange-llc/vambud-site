import "./header.scss";

import device from "current-device";

import { gsap, ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const MENU_TRANSITION_DURATION = 700;
const MENU_CONTENT_REVEAL_DELAY = 160;

function getMenuAnimatedElements(menu) {
  const links = menu.querySelectorAll(".menu-main-link, .menu-group__label, .menu-sublink");
  return { links };
}

function setMenuContentHidden(menu) {
  if (!menu) return;

  const { links } = getMenuAnimatedElements(menu);

  gsap.set(links, {
    autoAlpha: 0,
    y: 16,
    filter: "blur(2px)",
  });
}

function revealMenuContent(menu) {
  if (!menu) return;

  const { links } = getMenuAnimatedElements(menu);

  gsap.killTweensOf(links);

  gsap.to(links, {
    autoAlpha: 1,
    y: 0,
    filter: "blur(0px)",
    duration: 0.38,
    ease: "power3.out",
    stagger: 0.03,
    delay: 0.05,
  });
}

function setMenuOrigin(menu, triggerEl) {
  if (!menu || !triggerEl) return;

  const rect = triggerEl.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  menu.style.setProperty("--menu-origin-x", `${x}px`);
  menu.style.setProperty("--menu-origin-y", `${y}px`);
}

function openMenuWithReveal(menu, triggerEl) {
  if (!menu || menu.classList.contains("is-open")) return;

  setMenuOrigin(menu, triggerEl);
  menu.classList.remove("hidden", "is-closing");
  setMenuContentHidden(menu);

  // Force a reflow so the clip-path transition always starts from 0%.
  void menu.offsetWidth;

  menu.classList.add("is-open");

  const video = menu.querySelector(".menu-video");
  if (video) {
    video.currentTime = 0;
    video.play().catch(() => {});
  }

  window.setTimeout(() => {
    revealMenuContent(menu);
  }, MENU_CONTENT_REVEAL_DELAY);
}

function closeMenuWithReveal(menu) {
  if (!menu || menu.classList.contains("hidden")) return;

  const { links } = getMenuAnimatedElements(menu);
  gsap.killTweensOf(links);

  menu.classList.remove("is-open");
  menu.classList.add("is-closing");

  const video = menu.querySelector(".menu-video");
  if (video) {
    video.pause();
    video.currentTime = 0;
  }

  window.setTimeout(() => {
    menu.classList.remove("is-closing");
    menu.classList.add("hidden");
  }, MENU_TRANSITION_DURATION);
}

function initHeaderScrollState() {
  const header = document.querySelector(".header");
  if (!header) return;

  let ticking = false;

  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 0);
  };

  const requestUpdate = () => {
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  requestUpdate();
}

function initMobileHeaderLiquidGlass() {
  const mobileHeaderBg = document.querySelector(".header-bg.mob-v");
  if (!mobileHeaderBg) return;

  const ua = navigator.userAgent;
  const isWebKitEngine = /AppleWebKit/i.test(ua) && !/Chrome|CriOS|Edg|EdgiOS|FxiOS|OPR/i.test(ua);
  mobileHeaderBg.classList.toggle("is-webkit-glass", isWebKitEngine);

  const isMobileViewport = window.matchMedia("(max-width: 767px)");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsBackdropFilter =
    CSS.supports("backdrop-filter", "blur(1px)") || CSS.supports("-webkit-backdrop-filter", "blur(1px)");

  const syncMobileClass = (matches) => {
    mobileHeaderBg.classList.toggle("is-liquid-ready", matches && supportsBackdropFilter);
  };

  syncMobileClass(isMobileViewport.matches);

  const onViewportChange = (event) => {
    syncMobileClass(event.matches);
  };

  if (isMobileViewport.addEventListener) {
    isMobileViewport.addEventListener("change", onViewportChange);
  } else {
    isMobileViewport.addListener(onViewportChange);
  }

  if (!supportsBackdropFilter || prefersReducedMotion) return;

  const turbulence = document.getElementById("header-liquid-fe-turbulence");
  const displacement = document.getElementById("header-liquid-fe-displacement");
  const turbulenceStrong = document.getElementById("header-liquid-fe-turbulence-strong");
  const displacementStrong = document.getElementById("header-liquid-fe-displacement-strong");
  const offsetRed = document.getElementById("header-liquid-fe-offset-r");
  const offsetBlue = document.getElementById("header-liquid-fe-offset-b");
  if (!turbulence || !displacement || !turbulenceStrong || !displacementStrong) return;

  const start = performance.now();
  let previousScrollY = window.scrollY;
  let velocity = 0;

  window.addEventListener(
    "scroll",
    () => {
      const nextY = window.scrollY;
      const delta = Math.abs(nextY - previousScrollY);
      previousScrollY = nextY;
      velocity = Math.min(1, delta / 18);
    },
    { passive: true },
  );

  const animate = (now) => {
    const t = (now - start) * 0.001;
    velocity *= 0.9;

    const boost = 1 + velocity * 1.35;
    const freqX = (0.0105 + Math.sin(t * 0.75) * 0.0023 * boost).toFixed(4);
    const freqY = (0.024 + Math.cos(t * 0.62) * 0.0028 * boost).toFixed(4);
    const scale = (24 + Math.sin(t * 0.9) * 3.8 + velocity * 7.5).toFixed(2);

    const strongFreqX = (0.014 + Math.sin(t * 0.68 + 0.4) * 0.003 * boost).toFixed(4);
    const strongFreqY = (0.032 + Math.cos(t * 0.58 - 0.3) * 0.0042 * boost).toFixed(4);
    const strongScale = (34 + Math.sin(t * 0.84 + 0.7) * 5.6 + velocity * 11).toFixed(2);

    const chromaShift = (0.82 + Math.sin(t * 1.2) * 0.22 + velocity * 0.55).toFixed(3);

    turbulence.setAttribute("baseFrequency", `${freqX} ${freqY}`);
    displacement.setAttribute("scale", scale);
    turbulenceStrong.setAttribute("baseFrequency", `${strongFreqX} ${strongFreqY}`);
    displacementStrong.setAttribute("scale", strongScale);

    if (offsetRed && offsetBlue) {
      offsetRed.setAttribute("dx", chromaShift);
      offsetBlue.setAttribute("dx", (-Number(chromaShift)).toFixed(3));
    }

    window.requestAnimationFrame(animate);
  };

  window.requestAnimationFrame(animate);
}

function initScrollTopButton() {
  const btn = document.querySelector("[data-btn-up]");
  if (!btn) return;

  // The header uses transforms, so fixed positioning inside it can be trapped.
  // Moving the button to <body> keeps it anchored to the viewport on mobile and desktop.
  if (btn.parentElement !== document.body) {
    document.body.appendChild(btn);
  }

  const STOP_GAP = 50;

  let ticking = false;

  const update = () => {
    const showButton = window.scrollY > window.innerHeight;
    btn.classList.toggle("is-visible", showButton);

    if (!showButton) {
      btn.classList.remove("is-docked");
      btn.style.removeProperty("--btn-up-top");
      return;
    }

    const bottomOffset = window.innerWidth >= 768 ? 24 : 8;
    const minTopOffset = 12;
    const defaultTop = window.innerHeight - bottomOffset - btn.offsetHeight;

    // Position relative to the viewport where the very bottom of the document sits.
    const documentBottom = document.documentElement.scrollHeight - window.scrollY;
    const dockedTop = documentBottom - STOP_GAP - btn.offsetHeight;

    if (dockedTop < defaultTop) {
      btn.classList.add("is-docked");
      btn.style.setProperty("--btn-up-top", `${Math.max(minTopOffset, dockedTop)}px`);
      return;
    }

    btn.classList.remove("is-docked");
    btn.style.removeProperty("--btn-up-top");
  };

  const requestUpdate = () => {
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  requestUpdate();
}

initMobileHeaderLiquidGlass();
initScrollTopButton();
initHeaderScrollState();

// if (innerWidth < 768) {
//   let lastScroll = 0;
//   const header = document.querySelector(".header");
//   const scrollThreshold = 10; // мінімальна зміна для реагування

//   window.addEventListener("scroll", () => {
//     const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

//     // Якщо прокрутка незначна — нічого не робимо
//     if (Math.abs(currentScroll - lastScroll) < scrollThreshold) return;

//     if (currentScroll > lastScroll && currentScroll > header.offsetHeight) {
//       // Користувач крутить вниз
//       header.classList.add("hide");
//     } else {
//       // Користувач крутить вгору
//       header.classList.remove("hide");
//     }

//     lastScroll = currentScroll;
//   });
// }

const header = document.querySelector(".header");
document.body.addEventListener("click", function (evt) {
  const close = evt.target.closest("[data-call-us-modal-close]");
  const form = evt.target.closest("[data-call-us-modal]");
  const btn = evt.target.closest("[data-call-us-btn]");
  const overflow = document.querySelector("[data-call-us__overflow]");
  const btnMob = evt.target.closest("[data-mob-call-btn]");
  const overflowMob = document.querySelector("[data-mob-call__overflow]");
  const closeMob = evt.target.closest("[data-mob-call-close]");
  const countryList = evt.target.closest(".iti__country-list");
  const btnUp = evt.target.closest("[data-btn-up]");
  const btnMenuTarget = evt.target.closest("[data-menu-button]");
  const btnMenuClose = evt.target.closest("[data-menu-close]");
  const menu = document.querySelector("[data-menu]");
  const menuItem = evt.target.closest(".menu-main-link");
  const tyPopup = document.querySelector("[data-ty-popup]");
  const formSubmit = evt.target.closest("[data-form-submit]");
  if (btnMenuTarget) {
    const isHidden = menu.classList.contains("hidden");

    if (isHidden) {
      if (window.innerWidth < 768) {
        window.dispatchEvent(new Event("stop-scroll"));
      }
      header.classList.add("menu-is-open");
      openMenuWithReveal(menu, btnMenuTarget);
    } else {
      if (window.innerWidth < 768) {
        window.dispatchEvent(new Event("start-scroll"));
      }
      header.classList.remove("menu-is-open");
      closeMenuWithReveal(menu);
    }

    return;
  }
  if (menuItem && !menu.classList.contains("hidden")) {
    if (window.innerWidth < 768) {
      window.dispatchEvent(new Event("start-scroll"));
    }
    header.classList.remove("menu-is-open");
    closeMenuWithReveal(menu);
    return;
  }
  if (btnMenuClose || evt.target === menu) {
    if (window.innerWidth < 768) {
      window.dispatchEvent(new Event("start-scroll"));
    }
    header.classList.remove("menu-is-open");
    closeMenuWithReveal(menu);
  }
  if (btnUp) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (btn) {
    if (overflow.classList.contains("hidden")) {
      window.dispatchEvent(new Event("stop-scroll"));
      overflowMob.classList.add("hidden");
      gsap.to("[data-call-us-modal]", {
        opacity: 1,
      });
      return overflow.classList.remove("hidden");
    }
    return;
  }
  if (close) {
    window.dispatchEvent(new Event("start-scroll"));

    tyPopup.classList.add("hidden");
    setTimeout(() => {
      overflow.classList.add("hidden");
    }, 300);
    return;
  }
  if (evt.target === overflow) {
    window.dispatchEvent(new Event("start-scroll"));

    tyPopup.classList.add("hidden");
    setTimeout(() => {
      overflow.classList.add("hidden");
    }, 300);
    return;
  }

  if (btnMob) {
    if (overflowMob.classList.contains("hidden")) {
      window.dispatchEvent(new Event("stop-scroll"));

      return overflowMob.classList.remove("hidden");
    }
    return;
  }
  if (closeMob) {
    window.dispatchEvent(new Event("start-scroll"));

    return overflowMob.classList.add("hidden");
  }

  if (evt.target === overflowMob) {
    window.dispatchEvent(new Event("start-scroll"));

    return overflowMob.classList.add("hidden");
  }
});
