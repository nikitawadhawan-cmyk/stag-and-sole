/* Inline header search with predictive results: typing fetches live
   suggestions through the Section Rendering API into a dropdown under the
   input. Without JavaScript the form submits to the search page. */

class HeaderSearch extends HTMLElement {
  connectedCallback() {
    this.input = this.querySelector('[data-search-input]');
    this.panel = this.querySelector('[data-predictive-results]');
    if (!this.input || !this.panel) return;

    this.input.addEventListener('input', () => {
      clearTimeout(this.debounce);
      this.debounce = setTimeout(() => this.fetchResults(), 250);
    });

    this.input.addEventListener('focus', () => {
      if (this.panel.childElementCount > 0) this.panel.hidden = false;
    });

    document.addEventListener('click', (event) => {
      if (!this.contains(event.target)) this.panel.hidden = true;
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !this.panel.hidden) {
        this.panel.hidden = true;
        this.input.focus();
      }
    });
  }

  async fetchResults() {
    const query = this.input.value.trim();
    if (query.length < 2) {
      this.panel.hidden = true;
      this.panel.replaceChildren();
      return;
    }
    this.panel.classList.add('is-loading');
    try {
      const url = `${this.dataset.predictiveUrl}?q=${encodeURIComponent(query)}&resources[limit]=5&resources[limit_scope]=each&section_id=predictive-search`;
      const res = await fetch(url);
      if (!res.ok) return;
      const html = new DOMParser().parseFromString(await res.text(), 'text/html');
      const fresh = html.querySelector('.predictive');
      /* Only apply if the input still holds this query. */
      if (this.input.value.trim() === query) {
        this.panel.replaceChildren(...(fresh ? [fresh] : []));
        this.panel.hidden = this.panel.childElementCount === 0;
      }
    } catch {
      /* Network hiccup: keep whatever is currently shown. */
    } finally {
      this.panel.classList.remove('is-loading');
    }
  }
}

customElements.define('header-search', HeaderSearch);
