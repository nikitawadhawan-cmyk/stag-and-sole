/* Product page behavior: variant selection with section re-render,
   cross-fading media gallery, animated accordions, quantity stepper,
   gift card recipient toggle, share copy-link, and deferred product
   recommendations. Progressive enhancement throughout — the form
   submits the first available variant without JavaScript. */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class VariantPicker extends HTMLElement {
  connectedCallback() {
    const dataEl = this.querySelector('[data-variant-data]');
    this.variants = dataEl ? JSON.parse(dataEl.textContent) : [];
    this.section = this.closest('[data-section-id]');
    this.addEventListener('change', this.onChange.bind(this));
    this.updateAvailability();
  }

  selectedOptions() {
    return [...this.querySelectorAll('input[type="radio"]:checked')]
      .sort((a, b) => a.dataset.optionPosition - b.dataset.optionPosition)
      .map((input) => input.value);
  }

  /* Is any variant with `value` at option `index` available, holding every
     other currently selected option fixed? */
  valueAvailable(index, value, selected) {
    return this.variants.some(
      (v) =>
        v.available &&
        v.options[index] === value &&
        v.options.every((opt, i) => i === index || opt === selected[i])
    );
  }

  /* Strike out unavailable values; if the checked value just became
     unavailable, move to the first available one in that group. */
  updateAvailability() {
    const selected = this.selectedOptions();
    let moved = false;
    this.querySelectorAll('input[type="radio"]').forEach((input) => {
      const index = parseInt(input.dataset.optionPosition, 10) - 1;
      const available = this.valueAvailable(index, input.value, selected);
      input.closest('.pdp__value').classList.toggle('is-soldout', !available);
      input.disabled = !available;
      if (!available && input.checked) {
        const replacement = [
          ...this.querySelectorAll(`input[data-option-position="${input.dataset.optionPosition}"]`),
        ].find((other) => this.valueAvailable(index, other.value, selected));
        if (replacement) {
          replacement.checked = true;
          moved = true;
        }
      }
    });
    return moved;
  }

  onChange() {
    this.updateAvailability();
    const options = this.selectedOptions();
    const variant = this.variants.find((v) =>
      v.options.every((value, i) => value === options[i])
    );

    this.querySelectorAll('fieldset').forEach((fieldset) => {
      const checked = fieldset.querySelector('input:checked');
      const label = fieldset.querySelector('[data-selected-value]');
      if (checked && label) label.textContent = checked.value;
    });

    if (!variant) return;

    const idInput = this.section.querySelector('[data-variant-id]');
    if (idInput) idInput.value = variant.id;

    const gallery = this.section.querySelector('media-gallery');
    if (gallery) {
      if (this.dataset.colorIndex !== undefined) {
        gallery.filterColor(variant.options[parseInt(this.dataset.colorIndex, 10)]);
      }
      if (variant.featured_media_id) {
        gallery.activate(variant.featured_media_id);
      }
    }

    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant.id);
    window.history.replaceState({}, '', url.toString());

    this.refreshSection(variant.id);
  }

  async refreshSection(variantId) {
    const sectionId = this.section.dataset.sectionId;
    const base = this.dataset.url;
    try {
      const res = await fetch(`${base}?variant=${variantId}&section_id=${sectionId}`);
      if (!res.ok) return;
      const html = new DOMParser().parseFromString(await res.text(), 'text/html');
      ['price', 'buy', 'pickup', 'sku'].forEach((key) => {
        const fresh = html.querySelector(`[data-swap="${key}"]`);
        const current = this.section.querySelector(`[data-swap="${key}"]`);
        if (fresh && current) current.replaceWith(fresh);
      });
      document.dispatchEvent(new CustomEvent('pdp:swapped'));
    } catch {
      /* Leave the current markup in place if the refresh fails. */
    }
  }
}

/* Mobile sticky add-to-bag bar: appears once the buy area scrolls out of
   view, mirrors the main button's state, and submits the same form. */
function initStickyAtc() {
  const section = document.querySelector('.pdp');
  if (!section) return;
  const sticky = section.querySelector('[data-sticky-atc]');
  if (!sticky) return;
  let observer;

  const sync = () => {
    const mainBtn = section.querySelector('.pdp__atc');
    const stickyBtn = sticky.querySelector('[data-sticky-atc-btn]');
    if (mainBtn && stickyBtn) stickyBtn.disabled = mainBtn.disabled;
    const amount = section.querySelector('.pdp__amount');
    const price = sticky.querySelector('.pdp-sticky__price');
    if (amount && price) price.textContent = amount.textContent;
  };

  const observe = () => {
    const buy = section.querySelector('[data-swap="buy"]');
    if (!buy) return;
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(([entry]) => {
      sticky.hidden = entry.isIntersecting || entry.boundingClientRect.top > 0;
    });
    observer.observe(buy);
  };

  observe();
  sync();
  document.addEventListener('pdp:swapped', () => {
    observe();
    sync();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStickyAtc);
} else {
  initStickyAtc();
}

class MediaGallery extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', (event) => {
      const thumb = event.target.closest('[data-thumb-media-id]');
      if (thumb) this.activate(thumb.dataset.thumbMediaId);
    });
    this.initZoom();
  }

  activate(mediaId) {
    this.querySelectorAll('[data-media-id]').forEach((item) => {
      item.classList.toggle('is-active', item.dataset.mediaId === String(mediaId));
    });
    this.querySelectorAll('[data-thumb-media-id]').forEach((thumb) => {
      thumb.classList.toggle('is-active', thumb.dataset.thumbMediaId === String(mediaId));
    });
  }

  /* Hide media tied to other colors; if the active media just got hidden,
     fall back to the first visible one. */
  filterColor(color) {
    this.querySelectorAll('[data-media-colors]').forEach((el) => {
      const colors = el.dataset.mediaColors.split('||');
      el.classList.toggle('is-color-hidden', !colors.includes(color));
    });
    const active = this.querySelector('[data-media-id].is-active');
    if (active && active.classList.contains('is-color-hidden')) {
      const firstVisible = this.querySelector('[data-media-id]:not(.is-color-hidden)');
      if (firstVisible) this.activate(firstVisible.dataset.mediaId);
    }
  }

  /* Cursor-following zoom on the main image (hover devices only). */
  initZoom() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const main = this.querySelector('[data-gallery-main]');
    if (!main) return;
    main.addEventListener('mouseenter', () => main.classList.add('is-zooming'));
    main.addEventListener('mouseleave', () => {
      main.classList.remove('is-zooming');
    });
    main.addEventListener('mousemove', (event) => {
      const img = main.querySelector('.is-active img');
      if (!img) return;
      const rect = main.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      img.style.transformOrigin = `${x}% ${y}%`;
    });
  }
}

class SizeChart extends HTMLElement {
  connectedCallback() {
    this.dialog = this.querySelector('dialog');
    this.section = this.closest('[data-section-id]');
    const opener = this.querySelector('[data-size-chart-open]');
    if (opener) {
      opener.addEventListener('click', () => this.open());
    }
    const closer = this.querySelector('[data-size-chart-close]');
    if (closer) {
      closer.addEventListener('click', () => this.dialog.close());
    }
    this.dialog.addEventListener('click', (event) => {
      if (event.target === this.dialog) this.dialog.close();
    });
    this.addEventListener('click', (event) => {
      const row = event.target.closest('[data-chart-size]');
      if (row && this.dialog.open) this.select(row);
    });
  }

  picker() {
    return this.section ? this.section.querySelector('variant-picker') : null;
  }

  open() {
    this.refreshAvailability();
    this.dialog.showModal();
  }

  /* Mark rows sold out for the currently selected combination (for example
     the selected color), holding the size column free. */
  refreshAvailability() {
    const picker = this.picker();
    const sizeIndex = parseInt(this.dataset.sizeIndex, 10);
    this.querySelectorAll('[data-chart-size]').forEach((row) => {
      let available = true;
      if (picker && picker.variants && sizeIndex >= 0) {
        available = picker.valueAvailable(sizeIndex, row.dataset.chartSize, picker.selectedOptions());
      }
      row.classList.toggle('is-soldout', !available);
      const btn = row.querySelector('[data-chart-select]');
      const tag = row.querySelector('.sizechart__soldout-tag');
      if (btn) btn.disabled = !available;
      if (tag) tag.hidden = available;
    });
  }

  select(row) {
    if (row.classList.contains('is-soldout')) return;
    const picker = this.picker();
    const sizeIndex = parseInt(this.dataset.sizeIndex, 10);
    if (!picker || sizeIndex < 0) return;
    const input = [...picker.querySelectorAll(`input[data-option-position="${sizeIndex + 1}"]`)].find(
      (radio) => radio.value === row.dataset.chartSize
    );
    if (!input || input.disabled) return;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    this.dialog.close();
  }
}

class AccordionGroup extends HTMLElement {
  connectedCallback() {
    this.querySelectorAll('summary').forEach((summary) => {
      summary.addEventListener('click', (event) => {
        event.preventDefault();
        this.toggle(summary.closest('details'));
      });
    });
  }

  toggle(details) {
    if (details.open) {
      this.close(details);
    } else {
      this.querySelectorAll('details[open]').forEach((other) => {
        if (other !== details) this.close(other);
      });
      this.open(details);
    }
  }

  animate(body, from, to, onDone) {
    if (prefersReducedMotion) {
      onDone();
      return;
    }
    body.style.maxHeight = `${from}px`;
    body.style.transition = 'max-height 0.28s ease-out';
    requestAnimationFrame(() => {
      body.style.maxHeight = `${to}px`;
    });
    body.addEventListener(
      'transitionend',
      () => {
        body.style.maxHeight = '';
        body.style.transition = '';
        onDone();
      },
      { once: true }
    );
  }

  open(details) {
    const body = details.querySelector('.pdp__accordion-body');
    details.open = true;
    this.animate(body, 0, body.scrollHeight, () => {});
  }

  close(details) {
    const body = details.querySelector('.pdp__accordion-body');
    this.animate(body, body.scrollHeight, 0, () => {
      details.open = false;
    });
  }
}

class GiftCardRecipient extends HTMLElement {
  connectedCallback() {
    const toggle = this.querySelector('[data-recipient-toggle]');
    const fields = this.querySelector('[data-recipient-fields]');
    if (!toggle || !fields) return;
    toggle.addEventListener('change', () => {
      fields.hidden = !toggle.checked;
    });
  }
}

class ProductRecommendations extends HTMLElement {
  connectedCallback() {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        this.load();
      },
      { rootMargin: '0px 0px 400px 0px' }
    );
    observer.observe(this);
  }

  async load() {
    try {
      const res = await fetch(this.dataset.url);
      if (!res.ok) return;
      const html = new DOMParser().parseFromString(await res.text(), 'text/html');
      const fresh = html.querySelector('product-recommendations');
      if (fresh && fresh.querySelector('.product-card')) {
        this.replaceChildren(...fresh.childNodes);
      } else {
        const section = this.closest('.shopify-section');
        if (section) section.remove();
      }
    } catch {
      /* Keep the section hidden if recommendations fail to load. */
    }
  }
}

document.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-copy-link]');
  if (!btn || !navigator.clipboard) return;
  navigator.clipboard.writeText(window.location.href.split('?')[0]).then(() => {
    let note = btn.parentElement.querySelector('.pdp__copied-note');
    if (!note) {
      note = document.createElement('span');
      note.className = 'pdp__copied-note';
      note.setAttribute('role', 'status');
      btn.parentElement.appendChild(note);
    }
    note.textContent = btn.dataset.copiedLabel;
    setTimeout(() => note.remove(), 2000);
  });
});

customElements.define('variant-picker', VariantPicker);
customElements.define('media-gallery', MediaGallery);
customElements.define('size-chart', SizeChart);
customElements.define('accordion-group', AccordionGroup);
customElements.define('gift-card-recipient', GiftCardRecipient);
customElements.define('product-recommendations', ProductRecommendations);

/* Record this product for "Recently viewed" sections. Stored locally,
   newest first, capped at 12 handles. */
(function () {
  const match = window.location.pathname.match(/\/products\/([a-z0-9-]+)/);
  if (!match) return;
  try {
    const key = 'stag:recently-viewed';
    const handle = match[1];
    const list = JSON.parse(localStorage.getItem(key) || '[]').filter((h) => h !== handle);
    list.unshift(handle);
    localStorage.setItem(key, JSON.stringify(list.slice(0, 12)));
  } catch (e) {
    /* Storage unavailable (private mode) — feature quietly does nothing. */
  }
})();
