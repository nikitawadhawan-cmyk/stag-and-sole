/* Cart behavior: slide-out drawer, AJAX line-item updates, order note
   saving, and add-to-cart interception that opens the drawer. Without
   JavaScript the bag links to the cart page and all forms post natively. */

class CartDrawer extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', (event) => {
      if (event.target.closest('[data-drawer-close]')) this.close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.classList.contains('is-open')) this.close();
    });
    document.addEventListener('click', (event) => {
      const bag = event.target.closest('[data-cart-bag]');
      if (!bag) return;
      event.preventDefault();
      this.open();
    });
  }

  open() {
    this.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const close = this.querySelector('.drawer__close');
    if (close) close.focus();
  }

  close() {
    this.classList.remove('is-open');
    document.body.style.overflow = '';
    const bag = document.querySelector('[data-cart-bag]');
    if (bag) bag.focus();
  }
}

customElements.define('cart-drawer', CartDrawer);

const cartRoutes = {
  change: '/cart/change.js',
  add: '/cart/add.js',
  update: '/cart/update.js',
};

/* Re-render the drawer panel, cart page, and header bag from a fresh copy
   of the current page. */
async function refreshCart() {
  const res = await fetch(window.location.href);
  if (!res.ok) return;
  const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
  [
    '[data-cart-drawer] .drawer__panel',
    '[data-cart-page]',
    '[data-cart-bag]',
  ].forEach((selector) => {
    const fresh = doc.querySelector(selector);
    const current = document.querySelector(selector);
    if (fresh && current) current.replaceWith(fresh);
  });
}

async function changeLine(key, quantity) {
  const region = document.querySelector('[data-cart-drawer].is-open .drawer__body') || document.querySelector('[data-cart-items]');
  if (region) region.style.opacity = '0.5';
  try {
    const res = await fetch(cartRoutes.change, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity }),
    });
    if (res.ok) await refreshCart();
  } finally {
    if (region) region.style.opacity = '';
  }
}

document.addEventListener('change', (event) => {
  const input = event.target.closest('[data-line-quantity]');
  if (!input) return;
  const quantity = Math.max(0, parseInt(input.value || '0', 10));
  changeLine(input.dataset.lineQuantity, quantity);
});

document.addEventListener('click', (event) => {
  const remove = event.target.closest('[data-line-remove]');
  if (!remove) return;
  event.preventDefault();
  changeLine(remove.dataset.lineRemove, 0);
});

document.addEventListener(
  'blur',
  (event) => {
    const note = event.target.closest && event.target.closest('[data-cart-note]');
    if (!note) return;
    fetch(cartRoutes.update, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: note.value }),
    });
  },
  true
);

/* Intercept add-to-cart so the drawer opens with the new item. Dynamic
   checkout buttons bypass form submission and are unaffected. */
/* Shared with the wishlist module ("move to wishlist" removes the line). */
window.themeCart = { changeLine, refreshCart };

document.addEventListener('submit', async (event) => {
  const form = event.target.closest('form[action$="/cart/add"]');
  if (!form) return;
  const drawer = document.querySelector('[data-cart-drawer]');
  if (!drawer || drawer.dataset.openOnAdd !== 'true') return;
  event.preventDefault();
  const button = form.querySelector('[name="add"]');
  if (button) button.disabled = true;
  try {
    const res = await fetch(cartRoutes.add, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    });
    if (!res.ok) {
      form.submit();
      return;
    }
    await refreshCart();
    const freshDrawer = document.querySelector('[data-cart-drawer]');
    if (freshDrawer) freshDrawer.open();
  } finally {
    if (button) button.disabled = false;
  }
});
