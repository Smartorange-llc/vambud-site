import './vacancies.scss';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initSectionReveal() {
  document.querySelectorAll('.vacancies-row, .vacancies-career__card').forEach((card) => {
    gsap.set(card, { opacity: 0, y: 24 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 92%',
        once: true,
      },
    });
  });
}

function initVacancies() {
  initSectionReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVacancies);
} else {
  initVacancies();
}
