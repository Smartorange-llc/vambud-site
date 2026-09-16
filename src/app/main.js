import "./styles/index.scss";

// Vendor styles (swiper etc.), scoped to a low-priority CSS layer so
// widget/page styles always win regardless of bundle chunk order.
import "./styles/vendor.scss";

// Forms initialization.
import "@features/form/form-init";

// Smooth scroll
import "@shared/scripts/scroll/leniscroll";

const modules = import.meta.glob(["../widgets/**/*.js", "../features/**/*.js", "../shared/ui/**/*.js"], {
  eager: true,
});
