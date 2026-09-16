import "./projects.scss";
import "../../widgets/pagination/pagination.scss";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// The site-wide loader (see widgets/loader) keeps the page non-scrollable
// for its first ~3s and can shift layout (fonts/images) while it's up —
// any ScrollTrigger positions calculated before it finishes can be stale
// by the time it disappears, so recalculate once it's actually gone.
window.addEventListener("loader:complete", () => ScrollTrigger.refresh(), { once: true });

function initSectionReveal(selector, targets) {
  const section = document.querySelector(selector);
  if (!section) return;

  const els = targets ? section.querySelectorAll(targets) : [section];
  if (!els.length) return;

  gsap.set(els, { opacity: 0, y: 32 });
  gsap.to(els, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power2.out",
    stagger: 0.1,
    scrollTrigger: {
      trigger: section,
      start: "top 82%",
      once: true,
    },
  });
}

// Batches per-card, not one trigger on the grid container: a container-level
// trigger fires once for every card at the same moment regardless of which
// ones are actually on-screen yet, which looks wrong for a grid that spans
// several rows (or, for the catalog grid specifically, sits high enough up
// the page to already be at least partly in view on load). Batching each
// card lets only the rows actually scrolled to animate in, independent of
// how many columns the grid has at the current breakpoint.
// Starting from a light haze (not fully invisible) and only a small rise,
// with the trigger set to the earliest possible point ("top 100%" — a card
// qualifies the instant its top edge reaches the bottom of the viewport)
// keeps this from ever reading as an empty gap before the card shows up:
// there's always something faintly there, just settling into full focus.
function initCardsReveal(gridSelector, cardSelector) {
  const grid = document.querySelector(gridSelector);
  if (!grid) return;

  const cards = grid.querySelectorAll(cardSelector);
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0.55, y: 14 });
  ScrollTrigger.batch(cards, {
    start: "top 100%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power1.out",
        stagger: 0.04,
        overwrite: true,
      }),
  });
}

function initHeroParallax() {
  const section = document.querySelector(".projects-page-hero");
  const bg = section?.querySelector(".projects-page-hero__bg");
  if (!section || !bg) return;

  // gsap.fromTo(
  //   bg,
  //   { yPercent: -6 },
  //   {
  //     yPercent: 6,
  //     ease: "none",
  //     scrollTrigger: {
  //       trigger: section,
  //       start: "top bottom",
  //       end: "bottom top",
  //       scrub: true,
  //     },
  //   },
  // );
}

// Combines the status/tag filter with the shared numbered-pagination + "load
// more" widget, which normally only operates over a single static list.
// Filtering swaps in a new subset and resets to page 1 so the two controls
// never disagree about how many pages/cards exist.
function initProjectsCatalog() {
  const section = document.querySelector(".projects-page");
  const grid = section?.querySelector("[data-projects-grid]");
  const paginationWrap = section?.querySelector(".pagination");
  const filterButtons = section?.querySelectorAll("[data-project-filter]");
  const emptyState = section?.querySelector("[data-projects-empty]");
  if (!section || !grid || !paginationWrap || !filterButtons?.length) return;

  const allCards = Array.from(grid.querySelectorAll("[data-project-card]"));
  const prevBtn = paginationWrap.querySelector(".pagination__prev");
  const nextBtn = paginationWrap.querySelector(".pagination__next");
  const currentCountEl = paginationWrap.querySelector(".pagination-count__current");
  const maxCountEl = paginationWrap.querySelector(".pagination-count__max");
  const loadMoreBtn = paginationWrap.querySelector(".pagination__more");

  const perPage = 10;
  let activeFilter =
    Array.from(filterButtons).find((btn) => btn.classList.contains("is-active"))?.dataset.projectFilter ||
    "all";
  let filteredCards = allCards;
  let currentPage = 1;

  function matchesFilter(card, filterId) {
    if (filterId === "all") return true;
    const status = card.dataset.projectStatus;
    const tags = (card.dataset.projectTags || "").split(",").filter(Boolean);
    return status === filterId || tags.includes(filterId);
  }

  function animateIn(cards) {
    if (!cards.length) return;
    gsap.fromTo(
      cards,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", overwrite: true },
    );
  }

  function updateUI(totalPages) {
    if (currentCountEl) currentCountEl.textContent = String(currentPage).padStart(2, "0");
    if (maxCountEl) maxCountEl.textContent = `з ${String(totalPages).padStart(2, "0")} сторінок`;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    if (loadMoreBtn) loadMoreBtn.style.display = currentPage === totalPages ? "none" : "";
  }

  function renderPage(page, { scroll = true, animate = true } = {}) {
    const totalPages = Math.max(1, Math.ceil(filteredCards.length / perPage));
    currentPage = Math.max(1, Math.min(page, totalPages));

    allCards.forEach((card) => {
      card.style.display = "none";
    });

    const start = (currentPage - 1) * perPage;
    const visible = filteredCards.slice(start, currentPage * perPage);
    visible.forEach((card) => {
      card.style.display = "";
    });

    if (animate) animateIn(visible);
    updateUI(totalPages);

    if (scroll) {
      setTimeout(() => {
        const offsetTop = grid.offsetTop - 120;
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
      }, 150);
    }
  }

  function loadMore() {
    const totalPages = Math.max(1, Math.ceil(filteredCards.length / perPage));
    if (currentPage >= totalPages) return;

    currentPage += 1;
    const newCards = filteredCards
      .slice(0, currentPage * perPage)
      .filter((card) => card.style.display === "none");
    newCards.forEach((card) => {
      card.style.display = "";
    });

    animateIn(newCards);
    updateUI(totalPages);
  }

  function applyFilter(filterId, { animate = true } = {}) {
    activeFilter = filterId;
    filteredCards = allCards.filter((card) => matchesFilter(card, filterId));

    grid.hidden = filteredCards.length === 0;
    if (emptyState) emptyState.hidden = filteredCards.length !== 0;

    renderPage(1, { scroll: false, animate });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-active")) return;

      filterButtons.forEach((otherBtn) => {
        const isActive = otherBtn === btn;
        otherBtn.classList.toggle("is-active", isActive);
        otherBtn.setAttribute("aria-selected", String(isActive));
      });

      applyFilter(btn.dataset.projectFilter);
    });
  });

  if (prevBtn) prevBtn.addEventListener("click", () => renderPage(currentPage - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => renderPage(currentPage + 1));
  if (loadMoreBtn) loadMoreBtn.addEventListener("click", loadMore);

  // Skips its own immediate fade for this first render — initGridReveal
  // (called after this function, below) owns the entrance animation for
  // the initial page instead, gated by scroll position rather than firing
  // the moment the script runs.
  applyFilter(activeFilter, { animate: false });
}

// Interest-free installment calculator: monthly payment = (total - down
// payment) / (term in months). Currency toggle converts the entered total
// using an illustrative FX rate — swap for a live rate on WP integration.
function initProjectsCalculator() {
  const section = document.querySelector(".projects-calculator");
  if (!section) return;

  const totalInput = section.querySelector("[data-calc-total]");
  const currencyBtns = section.querySelectorAll("[data-calc-currency]");
  const typeDropdown = section.querySelector("[data-calc-type-dropdown]");
  const typeTrigger = section.querySelector("[data-calc-type-trigger]");
  const typeList = section.querySelector("[data-calc-type-list]");
  const typeOptions = section.querySelectorAll("[data-calc-type-list] [role='option']");
  const typeValueEl = section.querySelector("[data-calc-type-value]");
  const downRange = section.querySelector("[data-calc-down]");
  const downValueEl = section.querySelector("[data-calc-down-value]");
  const downMinLabelEl = section.querySelector("[data-calc-down-min-label]");
  const downMinEl = section.querySelector("[data-calc-down-min]");
  const downMaxEl = section.querySelector("[data-calc-down-max]");
  const termRange = section.querySelector("[data-calc-term]");
  const termValueEl = section.querySelector("[data-calc-term-value]");
  const termMaxEl = section.querySelector("[data-calc-term-max]");
  const monthlyEl = section.querySelector("[data-calc-monthly]");

  if (!totalInput || !downRange || !termRange || !monthlyEl) return;

  const FX_RATE = 41.5;
  let currency = section.querySelector("[data-calc-currency].is-active")?.dataset.calcCurrency || "UAH";

  const symbol = () => (currency === "USD" ? "$" : "₴");
  const formatMoney = (value) =>
    `${new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(Math.max(0, Math.round(value)))} ${symbol()}`;

  function updateProgress(range) {
    const min = Number(range.min);
    const max = Number(range.max);
    const value = Number(range.value);
    const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
    range.style.setProperty("--progress", `${percent}%`);
  }

  function recalc() {
    const total = Math.max(0, Number(totalInput.value) || 0);
    const downPct = Number(downRange.value);
    const termYears = Number(termRange.value);

    if (downValueEl) downValueEl.textContent = `${downPct}%`;
    if (downMinEl) downMinEl.textContent = formatMoney((total * Number(downRange.min)) / 100);
    if (downMaxEl) downMaxEl.textContent = formatMoney((total * Number(downRange.max)) / 100);
    if (termValueEl) termValueEl.textContent = String(termYears);

    const financed = total * (1 - downPct / 100);
    const monthly = termYears > 0 ? financed / (termYears * 12) : 0;
    monthlyEl.textContent = formatMoney(monthly);

    updateProgress(downRange);
    updateProgress(termRange);
  }

  currencyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextCurrency = btn.dataset.calcCurrency;
      if (nextCurrency === currency) return;

      const total = Number(totalInput.value) || 0;
      totalInput.value = Math.round(nextCurrency === "USD" ? total / FX_RATE : total * FX_RATE);

      currency = nextCurrency;
      currencyBtns.forEach((otherBtn) => otherBtn.classList.toggle("is-active", otherBtn === btn));
      recalc();
    });
  });

  // Custom "Тип" dropdown (a native <select> can't be restyled to match the
  // site's look). Follows the standard listbox pattern: trigger toggles the
  // list, clicking/Enter on an option selects it, outside click / Escape
  // closes it.
  if (typeDropdown && typeTrigger && typeList && typeOptions.length) {
    const closeTypeDropdown = () => {
      typeList.hidden = true;
      typeTrigger.setAttribute("aria-expanded", "false");
    };

    const openTypeDropdown = () => {
      typeList.hidden = false;
      typeTrigger.setAttribute("aria-expanded", "true");
    };

    const selectType = (option) => {
      typeOptions.forEach((opt) => {
        const isSelected = opt === option;
        opt.classList.toggle("is-selected", isSelected);
        opt.setAttribute("aria-selected", String(isSelected));
      });

      const maxYears = Number(option.dataset.termMax);
      const minDown = Number(option.dataset.downMin);

      termRange.max = String(maxYears);
      if (termMaxEl) termMaxEl.textContent = String(maxYears);
      if (Number(termRange.value) > maxYears) termRange.value = String(maxYears);

      downRange.min = String(minDown);
      if (downMinLabelEl) downMinLabelEl.textContent = String(minDown);
      if (Number(downRange.value) < minDown) downRange.value = String(minDown);

      if (typeValueEl) typeValueEl.textContent = option.textContent.trim();
      recalc();
      closeTypeDropdown();
      typeTrigger.focus();
    };

    typeTrigger.addEventListener("click", () => {
      if (typeList.hidden) openTypeDropdown();
      else closeTypeDropdown();
    });

    typeTrigger.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openTypeDropdown();
        (typeList.querySelector(".is-selected") || typeOptions[0])?.focus();
      }
    });

    typeOptions.forEach((option) => {
      option.addEventListener("click", () => selectType(option));
      option.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectType(option);
        } else if (event.key === "Escape") {
          closeTypeDropdown();
          typeTrigger.focus();
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          (option.nextElementSibling || typeOptions[0])?.focus();
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          (option.previousElementSibling || typeOptions[typeOptions.length - 1])?.focus();
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!typeList.hidden && !typeDropdown.contains(event.target)) closeTypeDropdown();
    });
  }

  totalInput.addEventListener("input", recalc);
  downRange.addEventListener("input", recalc);
  termRange.addEventListener("input", recalc);

  recalc();
}

// Mobile/tablet stand-in for the laptop :hover reveal (see projects.scss —
// laptop has no pointer capable of :hover-only interaction on touch, so it
// gets an explicit toggle instead; both drive the same .is-expanded state).
function initServicesToggle() {
  const cards = document.querySelectorAll("[data-services-card]");
  if (!cards.length) return;

  cards.forEach((card) => {
    const btn = card.querySelector("[data-services-toggle]");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const expanded = card.classList.toggle("is-expanded");
      btn.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  });
}

function initTablesTextToggle() {
  const text = document.querySelector("[data-tables-text]");
  const btn = document.querySelector("[data-tables-text-toggle]");
  const label = document.querySelector("[data-tables-more-label]");
  if (!text || !btn || !label) return;

  btn.addEventListener("click", () => {
    const expanded = text.classList.toggle("is-expanded");
    btn.setAttribute("aria-expanded", expanded ? "true" : "false");
    label.textContent = expanded ? "Згорнути" : "Читати весь опис";
  });
}

// initHeroParallax();
initProjectsCatalog();
initProjectsCalculator();
initTablesTextToggle();
initServicesToggle();

initCardsReveal(".projects-page__grid", "[data-project-card]");
initSectionReveal(".projects-calculator", ".projects-calculator__head, .projects-calculator__box");
initSectionReveal(".projects-tables", ".projects-tables__head");
initCardsReveal(".projects-tables__grid", ".projects-tables__card");
initSectionReveal(".projects-services", ".projects-services__title");
initCardsReveal(".projects-services__grid", ".projects-services__card");
