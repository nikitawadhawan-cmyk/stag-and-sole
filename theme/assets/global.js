/* Sitewide behavior: scroll-reveal for sections and the rotating
   announcement bar. Everything degrades gracefully without JavaScript
   and collapses to static states under prefers-reduced-motion. */

document.documentElement.classList.add('js');

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Fade-up reveal: elements with [data-reveal] fade in once when they
   enter the viewport; children of [data-reveal-stagger] are delayed
   in sequence. */
function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;
  if (reducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }
  targets.forEach((el) => {
    el.querySelectorAll('[data-reveal-stagger] > *').forEach((child, i) => {
      child.style.transitionDelay = `${Math.min(i * 80, 480)}ms`;
    });
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );
  targets.forEach((el) => io.observe(el));
}

/* Quantity stepper used on product and cart pages. */
class QuantityInput extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('input[type="number"]');
    this.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-qty-change]');
      if (!btn || !this.input) return;
      const next = parseInt(this.input.value || '1', 10) + parseInt(btn.dataset.qtyChange, 10);
      this.input.value = Math.max(parseInt(this.input.min || '1', 10), next);
      this.input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
}

/* Continuous horizontal marquee: wraps the track's items into a group,
   clones it for a seamless loop, and lets CSS animate. Pauses on hover and
   focus (CSS); stays a static grid without JS or with reduced motion. */
class AutoScroller extends HTMLElement {
  connectedCallback() {
    if (reducedMotion) return;
    const track = this.querySelector('[data-autoscroll-track]');
    if (!track || this.classList.contains('is-scrolling')) return;
    const items = [...track.children];
    if (items.length < 2) return;

    const group = document.createElement('div');
    group.className = 'autoscroll__group';
    items.forEach((el) => group.appendChild(el));
    track.appendChild(group);
    this.classList.add('is-scrolling');

    /* After layout: repeat items until the group at least fills the
       viewport (otherwise the loop point shows a gap), then clone the
       whole group once for the seamless wrap. */
    requestAnimationFrame(() => {
      let safety = 0;
      while (group.scrollWidth < this.clientWidth && safety < 10) {
        items.forEach((el) => {
          const copy = el.cloneNode(true);
          copy.setAttribute('aria-hidden', 'true');
          copy.setAttribute('inert', '');
          group.appendChild(copy);
        });
        safety += 1;
      }
      const clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('inert', '');
      track.appendChild(clone);
      this.style.setProperty('--autoscroll-duration', `${group.children.length * 6}s`);
    });
  }
}

/* Manual horizontal scroll row with arrow buttons: arrows page the track
   left/right, disable at the ends, and hide entirely when nothing
   overflows. */
class ScrollRow extends HTMLElement {
  connectedCallback() {
    this.track = this.querySelector('[data-scroll-track]');
    this.prev = this.querySelector('[data-scroll-prev]');
    this.next = this.querySelector('[data-scroll-next]');
    if (!this.track || !this.prev || !this.next) return;
    this.prev.addEventListener('click', () => this.page(-1));
    this.next.addEventListener('click', () => this.page(1));
    this.track.addEventListener('scroll', () => this.update(), { passive: true });
    window.addEventListener('resize', () => this.update(), { passive: true });
    this.update();
  }

  page(direction) {
    this.track.scrollBy({
      left: direction * this.track.clientWidth * 0.8,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }

  update() {
    const maxScroll = this.track.scrollWidth - this.track.clientWidth;
    this.classList.toggle('no-overflow', maxScroll <= 1);
    this.prev.disabled = this.track.scrollLeft <= 1;
    this.next.disabled = this.track.scrollLeft >= maxScroll - 1;
  }
}

class AnnouncementRotator extends HTMLElement {
  connectedCallback() {
    const items = this.querySelectorAll('[data-announcement]');
    if (items.length < 2 || reducedMotion) return;
    let current = 0;
    const delay = (parseInt(this.dataset.interval, 10) || 5) * 1000;
    this.timer = setInterval(() => {
      items[current].classList.remove('is-active');
      current = (current + 1) % items.length;
      items[current].classList.add('is-active');
    }, delay);
  }

  disconnectedCallback() {
    clearInterval(this.timer);
  }
}

customElements.define('quantity-input', QuantityInput);
customElements.define('auto-scroller', AutoScroller);
customElements.define('scroll-row', ScrollRow);
customElements.define('announcement-rotator', AnnouncementRotator);

/* Desktop nav dropdowns open on hover (hover-capable devices only); click
   and keyboard toggling keep working through the native details element. */
function initHoverMenus() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.site-nav__item').forEach((details) => {
    let closeTimer;
    details.addEventListener('mouseenter', () => {
      clearTimeout(closeTimer);
      details.open = true;
    });
    details.addEventListener('mouseleave', () => {
      closeTimer = setTimeout(() => {
        details.open = false;
      }, 150);
    });
  });
}

/* Any details marked data-dropdown closes on outside click. */
function initDropdownClose() {
  document.addEventListener('click', (event) => {
    document.querySelectorAll('details[data-dropdown][open]').forEach((details) => {
      if (!details.contains(event.target)) details.open = false;
    });
  });
}

function init() {
  initReveal();
  initHoverMenus();
  initDropdownClose();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


/* Quick view: fetches the quick-view section for a product and opens it in
   the dialog rendered by quick-view-modal.liquid. */
document.addEventListener('click', async (event) => {
  const trigger = event.target.closest('[data-quick-add]');
  if (!trigger) return;
  event.preventDefault();
  const dialog = document.querySelector('[data-quick-view-dialog]');
  if (!dialog) return;
  const body = dialog.querySelector('[data-quick-view-body]');
  const loadingText = body.querySelector('.qview__loading');
  body.innerHTML = '';
  if (loadingText) body.appendChild(loadingText);
  dialog.showModal();
  try {
    const sep = trigger.dataset.url.includes('?') ? '&' : '?';
    const res = await fetch(`${trigger.dataset.url}${sep}section_id=quick-view`);
    if (!res.ok) throw new Error('quick view failed');
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const content = doc.querySelector('[data-quick-view-content]');
    if (!content) throw new Error('quick view empty');
    body.innerHTML = '';
    body.appendChild(content);
  } catch (error) {
    dialog.close();
    window.location.href = trigger.dataset.url;
  }
});

document.addEventListener('click', (event) => {
  const dialog = document.querySelector('[data-quick-view-dialog]');
  if (!dialog || !dialog.open) return;
  if (event.target.closest('[data-quick-view-close]')) dialog.close();
  else if (event.target === dialog) dialog.close();
});
