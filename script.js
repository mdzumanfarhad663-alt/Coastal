const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const reviewTrack = document.querySelector('[data-review-track]');
const reviewSlides = reviewTrack ? [...reviewTrack.children] : [];
const hero = document.querySelector('.hero, .about-hero, .pineola-hero, .listing-hero, .getaways-hero, .rewards-hero');
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

document.querySelector('[data-contact-form]')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const topic = String(data.get('topic') || '').trim();
  const message = String(data.get('message') || '').trim();
  const subject = encodeURIComponent(`Coastal Getaway: ${topic}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`);
  form.querySelector('[data-contact-status]').textContent = 'Your email app is opening. Please review and send the message there.';
  window.location.href = `mailto:info@coastalgetaway.com?subject=${subject}&body=${body}`;
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

const galleryDialog = document.querySelector('[data-gallery-dialog]');
const galleryPhotos = [...document.querySelectorAll('.pineola-gallery-photo img')];
let galleryIndex = 0;
const showGalleryPhoto = index => {
  if (!galleryPhotos.length || !galleryDialog) return;
  galleryIndex = (index + galleryPhotos.length) % galleryPhotos.length;
  galleryDialog.querySelector('[data-gallery-image]').src = galleryPhotos[galleryIndex].src;
  galleryDialog.querySelector('[data-gallery-image]').alt = galleryPhotos[galleryIndex].alt;
  galleryDialog.querySelector('[data-gallery-caption]').textContent = `${galleryIndex + 1} / ${galleryPhotos.length}`;
};
document.querySelectorAll('[data-gallery-open]').forEach(button => button.addEventListener('click', () => {
  showGalleryPhoto(Number(button.dataset.galleryOpen));
  galleryDialog.showModal();
}));
document.querySelector('[data-gallery-prev]')?.addEventListener('click', () => showGalleryPhoto(galleryIndex - 1));
document.querySelector('[data-gallery-next]')?.addEventListener('click', () => showGalleryPhoto(galleryIndex + 1));
document.querySelector('[data-gallery-close]')?.addEventListener('click', () => galleryDialog.close());
galleryDialog?.addEventListener('click', event => { if (event.target === galleryDialog) galleryDialog.close(); });
galleryDialog?.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') showGalleryPhoto(galleryIndex - 1);
  if (event.key === 'ArrowRight') showGalleryPhoto(galleryIndex + 1);
});


// Filter the Coastal property collection without changing any booking links.
const collectionFilters = document.querySelector('[data-collection-filters]');
if (collectionFilters) {
  const cards = [...document.querySelectorAll('[data-property-grid] .collection-card')];
  const categories = [...collectionFilters.querySelectorAll('[data-category]')];
  const locationSelect = collectionFilters.querySelector('[data-location]');
  const count = document.querySelector('[data-result-count]');
  const clearButton = document.querySelector('[data-clear-filters]');
  const empty = document.querySelector('[data-empty-state]');
  const validCategories = new Set(categories.map(button => button.dataset.category));
  const validLocations = new Set([...locationSelect.options].map(option => option.value));
  let category = 'all';
  let location = 'all';
  const renderCollection = () => {
    let visible = 0;
    cards.forEach(card => {
      const matchesCategory = category === 'all' || card.dataset.categories.split(' ').includes(category);
      const matchesLocation = location === 'all' || card.dataset.location === location;
      card.hidden = !(matchesCategory && matchesLocation);
      if (!card.hidden) visible++;
    });
    categories.forEach(button => {
      const active = button.dataset.category === category;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    locationSelect.value = location;
    count.textContent = `Showing ${visible} ${visible === 1 ? 'property' : 'properties'}`;
    empty.hidden = visible !== 0;
    clearButton.hidden = category === 'all' && location === 'all';
  };
  const readCollectionURL = () => {
    const params = new URLSearchParams(window.location.search);
    category = validCategories.has(params.get('category')) ? params.get('category') : 'all';
    location = validLocations.has(params.get('location')) ? params.get('location') : 'all';
    renderCollection();
  };
  const writeCollectionURL = () => {
    const url = new URL(window.location.href);
    if (category === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', category);
    if (location === 'all') url.searchParams.delete('location');
    else url.searchParams.set('location', location);
    window.history.pushState(null, '', url);
    renderCollection();
  };
  categories.forEach(button => button.addEventListener('click', () => {
    if (category === button.dataset.category) return;
    category = button.dataset.category;
    writeCollectionURL();
  }));
  locationSelect.addEventListener('change', () => { location = locationSelect.value; writeCollectionURL(); });
  const resetCollection = () => { category = 'all'; location = 'all'; writeCollectionURL(); };
  clearButton.addEventListener('click', resetCollection);
  document.querySelector('[data-empty-reset]').addEventListener('click', resetCollection);
  window.addEventListener('popstate', readCollectionURL);
  readCollectionURL();
}

// Coastal Rewards signup (front-end preview; Contact Form 7 replaces this in WordPress).
document.querySelectorAll('[data-rewards-form]').forEach(form => {
  const messages = {
    'your-name': 'Please enter your name.',
    'your-phone': 'Please enter a phone number.',
    'your-email': 'Please enter a valid email address.',
    'your-consent': 'Please agree to receive member emails.'
  };
  const check = input => {
    const error = input.closest('label').querySelector('.field-error');
    let valid = input.type === 'checkbox' ? input.checked : input.value.trim() !== '';
    if (valid && input.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
    if (valid && input.type === 'tel') valid = input.value.replace(/\D/g, '').length >= 7;
    input.classList.toggle('is-invalid', !valid);
    input.setAttribute('aria-invalid', String(!valid));
    if (error) error.textContent = valid ? '' : messages[input.name];
    return valid;
  };
  form.querySelectorAll('input').forEach(input => input.addEventListener(input.type === 'checkbox' ? 'change' : 'blur', () => {
    if (input.classList.contains('is-invalid') || input.value) check(input);
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = [...form.querySelectorAll('input')];
    const results = fields.map(check);
    const firstBad = fields[results.indexOf(false)];
    if (firstBad) { firstBad.focus(); return; }
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'rewards_signup', form_location: form.dataset.location || 'rewards_page' });
    } catch (_) { /* Signup still completes without analytics. */ }
    const success = form.parentElement.querySelector('[data-rewards-success]');
    form.hidden = true;
    if (success) { success.hidden = false; success.focus(); }
  });
});

// FAQ accordion
document.querySelectorAll('[data-faq] .faq-item button').forEach(button => button.addEventListener('click', () => {
  const panel = button.closest('.faq-item').querySelector('.faq-panel');
  const open = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!open));
  panel.hidden = open;
}));
