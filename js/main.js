/* ============================================================
   AKUNKU — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     1. UTILITY HELPERS
  ────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

  /* ──────────────────────────────────────────
     2. NAVBAR — SCROLL + HAMBURGER
  ────────────────────────────────────────── */
  const navbar = $('#navbar');
  const hamburger = $('#hamburger');
  const mobileNav = $('#mobileNav');

  // Scroll-based navbar styling
  window.addEventListener('scroll', () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
    // Parallax handled below
    handleParallax();
  }, { passive: true });

  // Hamburger toggle
  on(hamburger, 'click', () => {
    const isOpen = hamburger.classList.toggle('active');
    if (mobileNav) {
      mobileNav.classList.toggle('open', isOpen);
    }
  });

  // Close mobile nav on link click
  $$('#mobileNav a').forEach(link => {
    on(link, 'click', () => {
      if (hamburger) hamburger.classList.remove('active');
      if (mobileNav) mobileNav.classList.remove('open');
    });
  });

  /* ──────────────────────────────────────────
     3. PARALLAX EFFECT
  ────────────────────────────────────────── */
  function handleParallax() {
    const scrollY = window.scrollY;
    $$('[data-parallax]').forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }

  /* ──────────────────────────────────────────
     4. FLASH SALE COUNTDOWN
  ────────────────────────────────────────── */
  function updateCountdown() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    const diff = midnight - now;

    if (diff <= 0) return;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = n => String(n).padStart(2, '0');

    const hEl = $('#countdown-hours');
    const mEl = $('#countdown-minutes');
    const sEl = $('#countdown-seconds');
    if (hEl) hEl.textContent = pad(hours);
    if (mEl) mEl.textContent = pad(minutes);
    if (sEl) sEl.textContent = pad(seconds);
  }

  if ($('#countdown-hours')) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* ──────────────────────────────────────────
     5. SCROLL REVEAL (IntersectionObserver)
  ────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* ──────────────────────────────────────────
     6. PRODUCT TAB SWITCHING (product-detail.html)
  ────────────────────────────────────────── */
  $$('.tab-btn').forEach(btn => {
    on(btn, 'click', () => {
      const target = btn.dataset.tab;
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      $$('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const content = $(`#tab-${target}`);
      if (content) content.classList.add('active');
    });
  });

  /* ──────────────────────────────────────────
     7. QUANTITY SELECTOR (product-detail.html)
  ────────────────────────────────────────── */
  const qtyNum = $('#qtyNum');
  const qtyMinus = $('#qtyMinus');
  const qtyPlus = $('#qtyPlus');

  on(qtyMinus, 'click', () => {
    if (qtyNum) {
      let v = parseInt(qtyNum.textContent) || 1;
      if (v > 1) qtyNum.textContent = v - 1;
    }
  });
  on(qtyPlus, 'click', () => {
    if (qtyNum) {
      let v = parseInt(qtyNum.textContent) || 1;
      qtyNum.textContent = v + 1;
    }
  });

  /* ──────────────────────────────────────────
     8. CART COUNT BADGE
  ────────────────────────────────────────── */
  let cartCount = parseInt(localStorage.getItem('akunku_cart') || '0');

  function updateCartBadge() {
    $$('.cart-badge').forEach(badge => {
      badge.textContent = cartCount;
      badge.style.display = cartCount > 0 ? 'flex' : 'none';
    });
  }
  updateCartBadge();

  function addToCart() {
    cartCount++;
    localStorage.setItem('akunku_cart', cartCount);
    updateCartBadge();
    showToast('Produk ditambahkan ke keranjang! 🛒');
  }

  // "Beli Sekarang" buttons
  $$('.add-to-cart').forEach(btn => {
    on(btn, 'click', (e) => {
      e.stopPropagation();
      addToCart();
    });
  });

  /* ──────────────────────────────────────────
     9. WISHLIST TOGGLE
  ────────────────────────────────────────── */
  let wishlist = JSON.parse(localStorage.getItem('akunku_wishlist') || '[]');

  function initWishlist() {
    $$('.wishlist-btn').forEach(btn => {
      const id = btn.dataset.id;
      if (id && wishlist.includes(id)) {
        btn.classList.add('active');
      }
      on(btn, 'click', (e) => {
        e.stopPropagation();
        const productId = btn.dataset.id;
        if (!productId) return;
        if (wishlist.includes(productId)) {
          wishlist = wishlist.filter(w => w !== productId);
          btn.classList.remove('active');
          showToast('Dihapus dari wishlist');
        } else {
          wishlist.push(productId);
          btn.classList.add('active');
          showToast('Ditambahkan ke wishlist ❤️');
        }
        localStorage.setItem('akunku_wishlist', JSON.stringify(wishlist));
      });
    });
  }
  initWishlist();

  /* ──────────────────────────────────────────
     10. TOAST NOTIFICATION
  ────────────────────────────────────────── */
  function showToast(message, type = 'success') {
    let toastContainer = $('#toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText = `
        position: fixed; bottom: 1.5rem; right: 1.5rem;
        z-index: 9999; display: flex; flex-direction: column; gap: 0.5rem;
      `;
      document.body.appendChild(toastContainer);
    }
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: #16162A; border: 1px solid rgba(108,63,232,0.4);
      color: #fff; padding: 0.75rem 1.25rem; border-radius: 10px;
      font-size: 0.875rem; font-family: 'Poppins', sans-serif;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      animation: fadeInUp 0.3s ease both;
      display: flex; align-items: center; gap: 0.5rem;
      max-width: 300px;
    `;
    toast.innerHTML = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  /* ──────────────────────────────────────────
     11. CATEGORY FILTER TABS (products.html)
  ────────────────────────────────────────── */
  $$('.cat-tab').forEach(tab => {
    on(tab, 'click', () => {
      $$('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.dataset.category || 'all';
      $$('.product-card[data-category]').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });

      // Update count
      const visible = $$('.product-card[data-category]').filter(c => c.style.display !== 'none').length;
      const countEl = $('#products-count');
      if (countEl) countEl.innerHTML = `Menampilkan <strong>${visible}</strong> produk`;
    });
  });

  /* ──────────────────────────────────────────
     12. ACCOUNT PAGE — SIDEBAR NAVIGATION
  ────────────────────────────────────────── */
  $$('.sidebar-nav-item[data-view]').forEach(item => {
    on(item, 'click', () => {
      $$('.sidebar-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const view = item.dataset.view;
      $$('.view-section').forEach(s => s.classList.remove('active'));
      const target = $(`#view-${view}`);
      if (target) target.classList.add('active');
    });
  });

  /* ──────────────────────────────────────────
     13. ADMIN PANEL TOGGLE
  ────────────────────────────────────────── */
  $$('.toggle-btn').forEach(btn => {
    on(btn, 'click', () => {
      $$('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.dataset.toggle;
      $$('.admin-sub-view').forEach(v => v.style.display = 'none');
      const view = $(`#admin-${target}`);
      if (view) view.style.display = 'block';
    });
  });

  /* ──────────────────────────────────────────
     14. PRODUCT CARD CLICK → product-detail.html
  ────────────────────────────────────────── */
  $$('.product-card').forEach(card => {
    on(card, 'click', (e) => {
      if (e.target.closest('.wishlist-btn') || e.target.closest('.add-to-cart')) return;
      window.location.href = 'product-detail.html';
    });
  });

  /* ──────────────────────────────────────────
     15. PRICE RANGE SLIDER
  ────────────────────────────────────────── */
  const priceSlider = $('#priceSlider');
  const priceDisplay = $('#priceDisplay');
  on(priceSlider, 'input', () => {
    const val = parseInt(priceSlider.value);
    if (priceDisplay) {
      priceDisplay.textContent = 'Rp ' + val.toLocaleString('id-ID');
    }
    priceSlider.style.background = `linear-gradient(to right, var(--primary) 0%, var(--primary) ${(val/500000)*100}%, rgba(255,255,255,0.15) ${(val/500000)*100}%)`;
  });

  /* ──────────────────────────────────────────
     16. MOBILE FILTER TOGGLE
  ────────────────────────────────────────── */
  const filterToggle = $('#filterToggle');
  const productsLayout = $('#productsLayout');
  on(filterToggle, 'click', () => {
    if (productsLayout) productsLayout.classList.toggle('filter-open');
  });

  /* ──────────────────────────────────────────
     17. PAGINATION (visual only)
  ────────────────────────────────────────── */
  $$('.page-btn[data-page]').forEach(btn => {
    on(btn, 'click', () => {
      $$('.page-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* ──────────────────────────────────────────
     18. DETAIL PAGE BUY BUTTONS
  ────────────────────────────────────────── */
  const buyNowBtn = $('#buyNowBtn');
  const addCartBtn = $('#addCartBtn');
  on(buyNowBtn, 'click', () => {
    addToCart();
    showToast('Mengarahkan ke pembayaran... 🚀');
  });
  on(addCartBtn, 'click', () => {
    addToCart();
  });

  /* ──────────────────────────────────────────
     19. SEARCH ICON CLICK
  ────────────────────────────────────────── */
  const searchBtn = $('#searchBtn');
  on(searchBtn, 'click', () => {
    showToast('Fitur pencarian segera hadir! 🔍');
  });

  /* ──────────────────────────────────────────
     20. HERO CTA — SMOOTH SCROLL
  ────────────────────────────────────────── */
  $$('[data-scroll-to]').forEach(btn => {
    on(btn, 'click', () => {
      const target = $(btn.dataset.scrollTo);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ──────────────────────────────────────────
     21. FLOATING CARD DEPTH ON MOUSE MOVE (hero)
  ────────────────────────────────────────── */
  const heroSection = $('#hero');
  if (heroSection) {
    on(heroSection, 'mousemove', (e) => {
      const { left, top, width, height } = heroSection.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;

      $$('.floating-card').forEach((card, i) => {
        const depth = (i + 1) * 6;
        card.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
    });

    on(heroSection, 'mouseleave', () => {
      $$('.floating-card').forEach(card => {
        card.style.transform = '';
      });
    });
  }

})();
