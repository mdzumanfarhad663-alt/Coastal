const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const floatingBooking = document.querySelector('[data-floating-booking]');

const updateHeader = () => {
  const scrolled = window.scrollY > 40;
  header.classList.toggle('scrolled', scrolled);
  floatingBooking?.classList.toggle('visible', window.scrollY > window.innerHeight * .55);
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
  const button = event.currentTarget.querySelector('button');
  const original = button.innerHTML;
  button.innerHTML = 'Opening availability <span>↗</span>';
  setTimeout(() => { button.innerHTML = original; }, 1800);
});
