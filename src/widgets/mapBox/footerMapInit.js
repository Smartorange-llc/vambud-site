// Keyed by mount target rather than a single shared variable — a page can
// embed more than one instance (e.g. a project's own infrastructure map
// plus the footer's map), and each must be destroyed/replaced independently
// instead of the most-recently-scrolled-to one tearing down the others.
const mapsByTarget = new Map();

/**
 * Lazily loads and initializes the footer map widget once its container
 * scrolls into view. Keeps the heavy mapbox-gl bundle out of the critical
 * path since the footer is present on every page.
 */
export const initFooterMap = ({ selector, accessToken, center, zoom, categories, markers, i18n }) => {
  const target = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!target) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        observer.disconnect();

        import("./FooterMapBlock").then(({ default: FooterMapBlock }) => {
          mapsByTarget.get(target)?.destroy();

          mapsByTarget.set(
            target,
            new FooterMapBlock({
              mountTo: target,
              accessToken,
              center,
              zoom,
              categories,
              markers,
              i18n,
            }),
          );
        });
      });
    },
    { rootMargin: "200px 0px" },
  );

  observer.observe(target);
};
