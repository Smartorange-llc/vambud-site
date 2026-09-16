import "./news.scss";
import "../../widgets/pagination/pagination.scss";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

function initHeroParallax() {
  const section = document.querySelector(".news-page-hero");
  const bg = section?.querySelector(".news-page-hero__bg");
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
// more" widget, same approach as src/pages/projects/projects.js.
function initNewsCatalog() {
  const section = document.querySelector(".news-page");
  const grid = section?.querySelector("[data-news-grid]");
  const paginationWrap = section?.querySelector(".pagination");
  const filterButtons = section?.querySelectorAll("[data-news-filter]");
  const emptyState = section?.querySelector("[data-news-empty]");
  if (!section || !grid || !paginationWrap || !filterButtons?.length) return;

  const allCards = Array.from(grid.querySelectorAll("[data-news-card]"));
  const prevBtn = paginationWrap.querySelector(".pagination__prev");
  const nextBtn = paginationWrap.querySelector(".pagination__next");
  const currentCountEl = paginationWrap.querySelector(".pagination-count__current");
  const maxCountEl = paginationWrap.querySelector(".pagination-count__max");
  const loadMoreBtn = paginationWrap.querySelector(".pagination__more");

  const perPage = 12;
  let activeFilter =
    Array.from(filterButtons).find((btn) => btn.classList.contains("is-active"))?.dataset.newsFilter || "all";
  let filteredCards = allCards;
  let currentPage = 1;

  function matchesFilter(card, filterId) {
    return filterId === "all" || card.dataset.newsType === filterId;
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

  function renderPage(page, { scroll = true } = {}) {
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

    animateIn(visible);
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

  function applyFilter(filterId) {
    activeFilter = filterId;
    filteredCards = allCards.filter((card) => matchesFilter(card, filterId));

    grid.hidden = filteredCards.length === 0;
    if (emptyState) emptyState.hidden = filteredCards.length !== 0;

    renderPage(1, { scroll: false });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("is-active")) return;

      filterButtons.forEach((otherBtn) => {
        const isActive = otherBtn === btn;
        otherBtn.classList.toggle("is-active", isActive);
        otherBtn.setAttribute("aria-selected", String(isActive));
      });

      applyFilter(btn.dataset.newsFilter);
    });
  });

  if (prevBtn) prevBtn.addEventListener("click", () => renderPage(currentPage - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => renderPage(currentPage + 1));
  if (loadMoreBtn) loadMoreBtn.addEventListener("click", loadMore);

  applyFilter(activeFilter);
}

// initHeroParallax();
initNewsCatalog();
