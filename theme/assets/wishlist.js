/* Wishlist: stored in localStorage on the shopper's device. Heart buttons
   toggle items, the header badge tracks the count, the wishlist page
   renders saved items, and cart lines can be moved into it.
   NOTE: self-contained module — remove this file, the wishlist section,
   and its hooks to strip the feature. */

const WISHLIST_KEY = 'stag:wishlist';

const Wishlist = {
  read() {
    try {
      const items = JSON.parse(localStorage.getItem(WISHLIST_KEY));
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  },

  write(items) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent('wishlist:change'));
  },

  has(handle) {
    return this.read().some((item) => item.handle === handle);
  },

  add(item) {
    if (!item.handle || this.has(item.handle)) return;
    this.write([...this.read(), item]);
  },

  remove(handle) {
    this.write(this.read().filter((item) => item.handle !== handle));
  },

  toggle(item) {
    if (this.has(item.handle)) {
      this.remove(item.handle);
    } else {
      this.add(item);
    }
  },
};

function itemFromDataset(dataset) {
  return {
    handle: dataset.handle,
    url: dataset.url,
    title: dataset.title,
    image: dataset.image,
    price: dataset.price,
    type: dataset.type,
  };
}

class WishlistButton extends HTMLElement {
  connectedCallback() {
    this.button = this.querySelector('button');
    if (!this.button) return;
    this.button.addEventListener('click', () => {
      Wishlist.toggle(itemFromDataset(this.dataset));
    });
    document.addEventListener('wishlist:change', () => this.sync());
    this.sync();
  }

  sync() {
    const active = Wishlist.has(this.dataset.handle);
    this.button.classList.toggle('is-active', active);
    this.button.setAttribute('aria-pressed', active ? 'true' : 'false');
    this.button.setAttribute(
      'aria-label',
      active ? this.dataset.labelRemove : this.dataset.labelAdd
    );
  }
}

class WishlistCount extends HTMLElement {
  connectedCallback() {
    document.addEventListener('wishlist:change', () => this.sync());
    this.sync();
  }

  sync() {
    const count = Wishlist.read().length;
    this.textContent = count;
    this.hidden = count === 0;
  }
}

class WishlistGrid extends HTMLElement {
  connectedCallback() {
    this.grid = this.querySelector('[data-wishlist-grid]');
    this.empty = this.querySelector('[data-wishlist-empty]');
    document.addEventListener('wishlist:change', () => this.render());
    this.addEventListener('click', (event) => {
      const remove = event.target.closest('[data-wishlist-remove]');
      if (remove) Wishlist.remove(remove.dataset.wishlistRemove);
    });
    this.render();
  }

  render() {
    const items = Wishlist.read();
    if (this.empty) this.empty.hidden = items.length > 0;
    if (!this.grid) return;
    this.grid.hidden = items.length === 0;
    this.grid.replaceChildren(
      ...items.map((item) => {
        const card = document.createElement('div');
        card.className = 'product-card wishlist-card';

        const media = document.createElement('a');
        media.className = 'product-card__media';
        media.href = item.url;
        if (item.image) {
          const img = document.createElement('img');
          img.className = 'product-card__img';
          img.src = item.image;
          img.alt = item.title || '';
          img.loading = 'lazy';
          media.appendChild(img);
        }
        card.appendChild(media);

        const info = document.createElement('div');
        info.className = 'product-card__info';
        const name = document.createElement('a');
        name.className = 'product-card__name';
        name.href = item.url;
        name.textContent = item.title;
        info.appendChild(name);
        if (item.type) {
          const type = document.createElement('span');
          type.className = 'product-card__material';
          type.textContent = item.type;
          info.appendChild(type);
        }
        if (item.price) {
          const price = document.createElement('span');
          price.className = 'product-card__price';
          price.textContent = item.price;
          info.appendChild(price);
        }
        card.appendChild(info);

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'wishlist-card__remove';
        remove.dataset.wishlistRemove = item.handle;
        remove.textContent = this.dataset.removeLabel;
        card.appendChild(remove);

        return card;
      })
    );
  }
}

/* Cart hook: "Move to wishlist" saves the product, then removes the line
   through the cart module. */
document.addEventListener('click', (event) => {
  const move = event.target.closest('[data-line-move-wishlist]');
  if (!move) return;
  event.preventDefault();
  Wishlist.add(itemFromDataset(move.dataset));
  if (window.themeCart) {
    window.themeCart.changeLine(move.dataset.lineKey, 0);
  }
});

customElements.define('wishlist-button', WishlistButton);
customElements.define('wishlist-count', WishlistCount);
customElements.define('wishlist-grid', WishlistGrid);
