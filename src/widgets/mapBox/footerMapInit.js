let currentMap = null;

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
          if (currentMap) {
            currentMap.destroy();
            currentMap = null;
          }

          currentMap = new FooterMapBlock({
            mountTo: target,
            accessToken,
            center,
            zoom,
            categories,
            markers,
            i18n,
          });
        });
      });
    },
    { rootMargin: "200px 0px" },
  );

  observer.observe(target);
};
