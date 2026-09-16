import './investors.scss';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initParallax() {
  document.querySelectorAll('[data-parallax="image"]').forEach((image) => {
    gsap.fromTo(
      image,
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: image.closest('section') || image.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
  });
}

function initSectionReveal() {
  document
    .querySelectorAll(
      '.inv-types__card, .inv-benefits__card, .inv-resale__card, .inv-projects__card',
    )
    .forEach((card) => {
      gsap.set(card, { opacity: 0, y: 32 });
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true,
        },
      });
    });
}

function initInvestors() {
  initParallax();
  initSectionReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInvestors);
} else {
  initInvestors();
}
