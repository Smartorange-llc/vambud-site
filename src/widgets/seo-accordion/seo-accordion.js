import "./seo-accordion.scss";

document.querySelectorAll(".seo-accordion__item[data-doc-item]").forEach((item) => {
  const trigger = item.querySelector("[data-doc-trigger]");
  if (!trigger) return;

  trigger.addEventListener("click", () => {
    const willOpen = !item.classList.contains("is-open");
    item.classList.toggle("is-open", willOpen);
    trigger.setAttribute("aria-expanded", String(willOpen));
  });
});
