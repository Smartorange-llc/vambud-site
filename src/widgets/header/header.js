import "./header.scss";

import device from "current-device";

import { gsap, ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const MENU_TRANSITION_DURATION = 700;
const MENU_CONTENT_REVEAL_DELAY = 160;

function getMenuAnimatedElements(menu) {
  const links = menu.querySelectorAll(".menu-main-link, .menu-sublink");
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

  // triggerEl is the whole .menu-block (burger circle + "Меню" label), so its
  // own rect would center the animation between the two — anchor to the
  // round .menu-btn itself instead, since that's what visually "opens".
  const originEl = triggerEl.querySelector(".menu-btn") || triggerEl;
  const rect = originEl.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  menu.style.setProperty("--menu-origin-x", `${x}px`);
  menu.style.setProperty("--menu-origin-y", `${y}px`);

  // The reveal circles are a fixed 300vmax in CSS (see header.scss) so
  // they're always big enough to cover the viewport from any corner once
  // fully open. Scaling that same box down to exactly the button's own
  // diameter gives it a starting size/position that matches the button
  // itself, instead of scale(0) (an invisible point) — so the reveal reads
  // as the button circle growing, and (since closing reverts to this same
  // base value) as shrinking back into it.
  const circleDiameterPx = 3 * Math.max(window.innerWidth, window.innerHeight);
  const startScale = rect.width / circleDiameterPx;
  menu.style.setProperty("--menu-start-scale", startScale);

  // .menu-panel-fill's own circle (header.scss) is clipped inside
  // .menu-panel, so its top/left are resolved against .menu-panel's own
  // box, not the viewport — and .menu-panel is offset from the viewport
  // (right-aligned at laptop), so reusing the viewport-relative
  // --menu-origin-x/y there would push its center off to the side instead
  // of under the button. Recompute the same point in .menu-panel's own
  // coordinate space.
  const panel = menu.querySelector(".menu-panel");
  if (panel) {
    const panelRect = panel.getBoundingClientRect();
    menu.style.setProperty("--menu-panel-origin-x", `${x - panelRect.left}px`);
    menu.style.setProperty("--menu-panel-origin-y", `${y - panelRect.top}px`);
  }
}

let menuBlurTimeoutId = null;

function openMenuWithReveal(menu, triggerEl) {
  if (!menu || menu.classList.contains("is-open")) return;

  setMenuOrigin(menu, triggerEl);
  menu.classList.remove("hidden", "is-closing", "is-blurred");
  setMenuContentHidden(menu);

  // Force a reflow so the reveal transition always starts from scale(0).
  void menu.offsetWidth;

  menu.classList.add("is-open");

  window.setTimeout(() => {
    revealMenuContent(menu);
  }, MENU_CONTENT_REVEAL_DELAY);

  // backdrop-filter's blur pass isn't compositor-only like the reveal's
  // transform — its cost scales with the area it's sampling, so turning it
  // on while the circle is still growing re-blurs an ever-larger region
  // every frame and stalls the whole animation. Switching it on only once
  // the growth has finished keeps that expensive pass off the hot path.
  clearTimeout(menuBlurTimeoutId);
  menuBlurTimeoutId = window.setTimeout(() => {
    menu.classList.add("is-blurred");
  }, MENU_TRANSITION_DURATION);
}

function closeMenuWithReveal(menu) {
  if (!menu || menu.classList.contains("hidden")) return;

  const { links } = getMenuAnimatedElements(menu);
  gsap.killTweensOf(links);
  // The reveal circle only covers the background — with the old clip-path
  // approach it also clipped the text away as it shrank, so closing never
  // needed to touch link opacity directly. Now it does, or the text is left
  // sitting at full opacity, floating over the page while the circle behind
  // it shrinks away.
  gsap.to(links, { autoAlpha: 0, duration: 0.2, ease: "power2.in" });

  clearTimeout(menuBlurTimeoutId);
  menu.classList.remove("is-open", "is-blurred");
  menu.classList.add("is-closing");

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
  const menuItem = evt.target.closest(".menu-main-link, .menu-sublink");
  const tyPopup = document.querySelector("[data-ty-popup]");
  const formSubmit = evt.target.closest("[data-form-submit]");
  if (btnMenuTarget) {
    const isHidden = menu.classList.contains("hidden");

    if (isHidden) {
      window.dispatchEvent(new Event("stop-scroll"));
      header.classList.add("menu-is-open");
      openMenuWithReveal(menu, btnMenuTarget);
    } else {
      window.dispatchEvent(new Event("start-scroll"));
      header.classList.remove("menu-is-open");
      closeMenuWithReveal(menu);
    }

    return;
  }
  if (menuItem && !menu.classList.contains("hidden")) {
    window.dispatchEvent(new Event("start-scroll"));
    header.classList.remove("menu-is-open");
    closeMenuWithReveal(menu);
    return;
  }
  if (btnMenuClose || evt.target === menu) {
    window.dispatchEvent(new Event("start-scroll"));
    header.classList.remove("menu-is-open");
    closeMenuWithReveal(menu);
  }
  if (btnUp) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (btn) {
    // Stash which CTA opened the shared modal so the generic contact form
    // can tag its submission with a theme (e.g. which vacancy, or "Продати
    // квартиру") — always assign, even to "", so a stale theme from a
    // previous button doesn't leak into an unrelated submission.
    const modalForm = document.querySelector("[data-call-us-modal] form");
    if (modalForm) modalForm.dataset.theme = btn.dataset.callUsTheme || "";

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
