const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const reviewTrack = document.querySelector('[data-review-track]');
const reviewSlides = reviewTrack ? [...reviewTrack.children] : [];
const hero = document.querySelector('.hero, .about-hero');
let reviewIndex = 0;

const updateHeader = () => {
  const scrolled = hero ? hero.getBoundingClientRect().bottom <= header.offsetHeight : window.scrollY > 40;
  header.classList.toggle('scrolled', scrolled);
};
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

const categoryTrack = document.querySelector('[data-category-track]');
const categoryControls = document.querySelector('[data-category-controls]');
const categoryPrev = document.querySelector('[data-category-prev]');
const categoryNext = document.querySelector('[data-category-next]');
const updateCategories = () => {
  if (!categoryTrack || !categoryControls) return;
  const overflow = categoryTrack.scrollWidth > categoryTrack.clientWidth + 2;
  categoryControls.hidden = !overflow;
  categoryPrev.disabled = categoryTrack.scrollLeft < 2;
  categoryNext.disabled = categoryTrack.scrollLeft + categoryTrack.clientWidth >= categoryTrack.scrollWidth - 2;
};
const moveCategory = direction => {
  const card = categoryTrack?.querySelector('.category-card');
  if (!card) return;
  const gap = parseFloat(getComputedStyle(categoryTrack).columnGap) || 0;
  categoryTrack.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: 'smooth' });
};
categoryPrev?.addEventListener('click', () => moveCategory(-1));
categoryNext?.addEventListener('click', () => moveCategory(1));
categoryTrack?.addEventListener('scroll', updateCategories, { passive: true });
window.addEventListener('resize', updateCategories);
window.addEventListener('load', updateCategories);
updateCategories();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelector('[data-booking-form]')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const select = form.querySelector('select');
  if (!select.value) { select.focus(); return; }
  const button = form.querySelector('button');
  button.textContent = 'Opening availability…';
  button.disabled = true;
  const propertyName = select.selectedOptions[0]?.textContent || select.value;
  try {
    if (typeof window.gtag === 'function') window.gtag('event', 'booking_widget_search', { property_name: propertyName });
    else if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'booking_widget_search', property_name: propertyName });
  } catch (_) { /* Booking remains available when analytics is absent. */ }
  window.location.assign(`https://hotels.cloudbeds.com/en/reservation/${encodeURIComponent(select.value)}/?currency=usd`);
});

const showReview = index => {
  if (!reviewTrack || !reviewSlides.length) return;
  reviewIndex = (index + reviewSlides.length) % reviewSlides.length;
  reviewTrack.style.transform = `translateX(-${reviewIndex * 100}%)`;
};
document.querySelector('[data-review-prev]')?.addEventListener('click', () => showReview(reviewIndex - 1));
document.querySelector('[data-review-next]')?.addEventListener('click', () => showReview(reviewIndex + 1));
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setInterval(() => showReview(reviewIndex + 1), 6500);
}
