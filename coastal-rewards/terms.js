(() => {
  const dialog = document.querySelector('#rewards-terms');
  if (!dialog) return;
  let trigger;
  let previousOverflow;
  document.querySelectorAll('[data-terms-open]').forEach(button => {
    button.addEventListener('click', () => {
      if (dialog.open) return;
      trigger = button;
      previousOverflow = document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    });
  });
  dialog.querySelectorAll('[data-terms-close]').forEach(button => {
    button.addEventListener('click', () => dialog.close());
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  // Native dialog handles Escape and keeps keyboard focus inside the popup.
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    trigger?.focus();
  });
})();
