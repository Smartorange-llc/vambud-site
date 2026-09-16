import './loyalty.scss';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initPartnersTabs() {
  const section = document.querySelector('.loyalty-partners');
  if (!section) return;

  const tabs = section.querySelectorAll('[data-partners-tab]');
  const cards = section.querySelectorAll('[data-partners-item]');
  if (!tabs.length || !cards.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.partnersTab;
      if (tab.classList.contains('is-active')) return;

      tabs.forEach((otherTab) => otherTab.classList.toggle('is-active', otherTab === tab));

      cards.forEach((card) => {
        const matches = category === 'all' || card.dataset.partnersItem === category;
        card.classList.toggle('is-hidden', !matches);
      });
    });
  });
}

function initSectionReveal() {
  document.querySelectorAll('.loyalty-content__card, .loyalty-partners__card').forEach((card) => {
    gsap.set(card, { opacity: 0, y: 24 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        once: true,
      },
    });
  });
}

function initLoyalty() {
  initPartnersTabs();
  initSectionReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLoyalty);
} else {
  initLoyalty();
}
