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

customElements.define('auto-scroller', AutoScroller);
customElements.define('scroll-row', ScrollRow);
customElements.define('announcement-rotator', AnnouncementRotator);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReveal);
} else {
  initReveal();
}
