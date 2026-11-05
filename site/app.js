/* =========================================================
   Yumiya Candle — interactions
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const chf = (n) => n.toFixed(2) + ' CHF';

  document.documentElement.classList.remove('no-js');

  /* ---------------------------------------------------------
     CATALOGUE — modifie ici tes produits.
     img : photo du produit (assets/...). Si le fichier n'existe
     pas, une illustration de bougie s'affiche à la place.
     --------------------------------------------------------- */
  const PRODUCTS = [
    { id: 'rose-litchi',   name: 'Rose & Litchi',     sub: 'Floral · fruité',    price: 34, cats: ['new', 'best', 'floral'],   badge: 'Nouveau',     wax: '#f7c6d6', bg: ['#fde3ea', '#e8799e'], label: '#ffffff', img: 'assets/produit-rose-litchi.jpg' },
    { id: 'vanille',       name: 'Vanille Bourbon',   sub: 'Gourmand · chaud',   price: 32, cats: ['best', 'gourmand'],        badge: 'Best-seller', wax: '#f6e6c8', bg: ['#fbefdc', '#d9a66b'], label: '#5a1a33', img: 'assets/produit-vanille.jpg' },
    { id: 'figue',         name: 'Figue Noire',       sub: 'Boisé · fruité',     price: 36, cats: ['new', 'boise'],            badge: 'Nouveau',     wax: '#cdb7d9', bg: ['#ece2f2', '#7b4b94'], label: '#ffffff', img: 'assets/produit-figue.jpg' },
    { id: 'coton',         name: 'Fleur de Coton',    sub: 'Frais · poudré',     price: 30, cats: ['best', 'frais'],           wax: '#ffffff', bg: ['#eef1f7', '#9fb0d0'], label: '#c94e79', img: 'assets/produit-coton.jpg' },
    { id: 'ambre',         name: 'Ambre & Santal',    sub: 'Boisé · ambré',      price: 38, old: 44, cats: ['best', 'boise'],  badge: '−15 %',       wax: '#e9c79c', bg: ['#f4e5d2', '#a0764f'], label: '#ffffff', img: 'assets/produit-ambre.jpg' },
    { id: 'peche',         name: 'Pêche Melba',       sub: 'Gourmand · fruité',  price: 32, cats: ['new', 'gourmand'],         badge: 'Nouveau',     wax: '#ffd2b3', bg: ['#ffeadb', '#f08a5d'], label: '#5a1a33', img: 'assets/produit-peche.jpg' },
    { id: 'the-blanc',     name: 'Thé Blanc & Menthe',sub: 'Frais · vert',       price: 30, cats: ['frais'],                   wax: '#d8eedf', bg: ['#e6f4ea', '#3f8a68'], label: '#ffffff', img: 'assets/produit-the-blanc.jpg' },
    { id: 'cerise',        name: 'Cerise Griotte',    sub: 'Gourmand · acidulé', price: 34, cats: ['gourmand', 'new'],         wax: '#f0a1ad', bg: ['#ffe1e4', '#d94f5c'], label: '#ffffff', img: 'assets/produit-cerise.jpg' },
    { id: 'pivoine',       name: 'Pivoine Poudrée',   sub: 'Floral · doux',      price: 34, cats: ['floral'],                  wax: '#f9d6e3', bg: ['#fdeaf1', '#d4608a'], label: '#5a1a33', img: 'assets/produit-pivoine.jpg' },
    { id: 'jasmin',        name: 'Jasmin de Nuit',    sub: 'Floral · intense',   price: 36, cats: ['floral', 'limitee'],       badge: 'Édition limitée', dark: true, wax: '#fff3d6', bg: ['#2a0f1c', '#8d2c55'], label: '#e8799e', img: 'assets/produit-jasmin.jpg' },
    { id: 'cedre',         name: 'Cèdre Givré',       sub: 'Boisé · frais',      price: 38, cats: ['limitee', 'boise'],        badge: 'Édition limitée', dark: true, wax: '#e3eef2', bg: ['#16324a', '#5f8fae'], label: '#ffffff', img: 'assets/produit-cedre.jpg' },
    { id: 'marron',        name: 'Marron Glacé',      sub: 'Gourmand · cocooning', price: 36, cats: ['limitee', 'gourmand'],   badge: 'Édition limitée', dark: true, wax: '#e6cdb4', bg: ['#3b2015', '#a0764f'], label: '#ffffff', img: 'assets/produit-marron.jpg' },
    { id: 'coffret-duo',   name: 'Coffret Duo',       sub: '2 bougies au choix', price: 59, old: 66, cats: ['coffrets'], badge: 'Cadeau',  duo: true, wax: '#f7c6d6', wax2: '#f6e6c8', bg: ['#fde3ea', '#c94e79'], label: '#ffffff', img: 'assets/produit-coffret-duo.jpg' },
    { id: 'coffret-trio',  name: 'Coffret Découverte',sub: '3 mini-bougies',     price: 49, cats: ['coffrets'],                badge: 'Cadeau', duo: true, wax: '#cdb7d9', wax2: '#d8eedf', bg: ['#efe6f5', '#7b4b94'], label: '#ffffff', img: 'assets/produit-coffret-trio.jpg' },
    { id: 'coffret-hiver', name: 'Coffret Jardin d\'Hiver', sub: 'Bougie + fondants', price: 72, cats: ['coffrets', 'limitee'], badge: 'Édition limitée', dark: true, duo: true, wax: '#fff3d6', wax2: '#e3eef2', bg: ['#2a0f1c', '#5f8fae'], label: '#ffffff', img: 'assets/produit-coffret-hiver.jpg' },
    { id: 'fondants',      name: 'Fondants Parfumés', sub: 'Lot de 6 · au choix', price: 14, cats: ['coffrets'],              wax: '#f9d6e3', bg: ['#fdeaf1', '#ee93b2'], label: '#5a1a33', img: 'assets/produit-fondants.jpg' },
    { id: 'oranger',       name: 'Fleur d\'Oranger',  sub: 'Floral · solaire',   price: 34, cats: ['floral'],                  wax: '#fff0d4', bg: ['#fff4e0', '#f2a541'], label: '#5a1a33', img: 'assets/produit-oranger.jpg' },
    { id: 'cachemire',     name: 'Bois de Cachemire', sub: 'Boisé · musqué',     price: 38, cats: ['boise'],                   wax: '#e7d8cf', bg: ['#f1e7e1', '#8b6a5c'], label: '#ffffff', img: 'assets/produit-cachemire.jpg' },
    { id: 'citron',        name: 'Citron & Basilic',  sub: 'Frais · zesté',      price: 30, cats: ['frais'],                   wax: '#f6f3c4', bg: ['#f8f6d8', '#b5b33a'], label: '#ffffff', img: 'assets/produit-citron.jpg' },
    { id: 'marine',        name: 'Brise Marine',      sub: 'Frais · iodé',       price: 32, cats: ['frais'],                   wax: '#d6ecf5', bg: ['#e2f2f8', '#3f8fb0'], label: '#ffffff', img: 'assets/produit-marine.jpg' },
  ];
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

  /* ---------- Illustration de bougie (SVG) ---------- */
  let svgUid = 0;
  function jar(x, w, wax, label, uid) {
    const h = w * 1.18, y = 160 - h - 4, cx = x + w / 2;
    return `
      <g>
        <path class="flame" d="M${cx} ${y - 34}c6 9 10 15 10 22a10 10 0 0 1-20 0c0-7 4-13 10-22Z" fill="url(#fl${uid})"/>
        <path d="M${cx} ${y - 3}v-10" stroke="#3a2a2f" stroke-width="2" stroke-linecap="round"/>
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * .18}" fill="rgba(255,255,255,.38)" stroke="rgba(255,255,255,.85)" stroke-width="2"/>
        <rect x="${x + 4}" y="${y + 9}" width="${w - 8}" height="${h - 13}" rx="${w * .14}" fill="${wax}"/>
        <ellipse cx="${cx}" cy="${y + 10}" rx="${w / 2 - 5}" ry="4" fill="rgba(255,255,255,.55)"/>
        <rect x="${x + w * .16}" y="${y + h * .42}" width="${w * .68}" height="${h * .32}" rx="4" fill="${label}" opacity=".95"/>
        <text x="${cx}" y="${y + h * .6}" text-anchor="middle" font-family="Playfair Display, serif" font-size="${w * .13}" letter-spacing="1.5" fill="${label === '#ffffff' ? '#5a1a33' : '#ffffff'}">YUMIYA</text>
        <rect x="${x + 7}" y="${y + 14}" width="${w * .08}" height="${h * .6}" rx="3" fill="rgba(255,255,255,.55)"/>
      </g>`;
  }
  function candleSVG(p) {
    const uid = ++svgUid;
    const defs = `<defs><radialGradient id="fl${uid}" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fffbe0"/><stop offset=".55" stop-color="#ffd166"/><stop offset="1" stop-color="#ff8a3d"/></radialGradient></defs>`;
    const body = p.duo
      ? jar(8, 58, p.wax, p.label, uid) + jar(56, 58, p.wax2 || p.wax, p.label, uid)
      : jar(22, 76, p.wax, p.label, uid);
    return `<svg viewBox="0 0 122 162" aria-hidden="true">${defs}${body}</svg>`;
  }

  /* ---------- Emplacements médias ---------- */
  const ICON_IMG = '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 8"/></svg>';
  const ICON_VID = '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="14" height="14" rx="3"/><path d="m17 10 4-2.5v9L17 14"/></svg>';

  function initSlot(el) {
    if (el.dataset.ready) return;
    el.dataset.ready = '1';
    const label = el.dataset.label;
    if (label) {
      const ph = document.createElement('div');
      ph.className = 'slot-ph';
      ph.innerHTML = `<span class="slot-chip">${el.dataset.video ? ICON_VID : ICON_IMG}${label}</span>`;
      el.appendChild(ph);
    }
    const useImg = () => {
      if (!el.dataset.img) return;
      const img = new Image();
      img.alt = el.dataset.alt || '';
      img.decoding = 'async';
      img.loading = 'lazy';
      img.onload = () => el.classList.add('has-media');
      img.onerror = () => img.remove();
      img.src = el.dataset.img;
      el.prepend(img);
    };
    if (el.dataset.video) {
      const v = document.createElement('video');
      v.muted = true; v.playsInline = true; v.loop = !('controls' in el.dataset);
      v.preload = 'metadata';
      v.setAttribute('playsinline', '');
      if ('controls' in el.dataset) v.controls = true; else v.autoplay = !reduceMotion;
      v.addEventListener('loadeddata', () => { el.classList.add('has-media'); }, { once: true });
      v.addEventListener('error', () => { v.remove(); useImg(); }, { once: true });
      v.src = el.dataset.video;
      el.prepend(v);
      videoObserver.observe(el);
    } else {
      useImg();
    }
  }
  // Les vidéos ne jouent que lorsqu'elles sont visibles (économie de batterie)
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      const v = target.querySelector('video');
      if (!v || v.controls) return;
      if (isIntersecting && !reduceMotion) v.play().catch(() => {}); else v.pause();
    });
  }, { threshold: .25 });

  $$('[data-slot]').forEach(initSlot);

  /* ---------- Apparitions au scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); revealObserver.unobserve(e.target); }
    });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  function observeReveals(root = document) {
    // Petit décalage en cascade entre éléments voisins
    $$('.reveal, .reveal-scale', root).forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      const i = sibs.indexOf(el);
      if (i > 0) el.style.setProperty('--d', Math.min(i, 6) * 0.07 + 's');
      revealObserver.observe(el);
    });
  }
  observeReveals();

  requestAnimationFrame(() => document.body.classList.add('is-loaded'));

  /* ---------- Bandeau d'annonce rotatif ---------- */
  const annItems = $$('#announce p');
  let annIdx = 0;
  setInterval(() => {
    const cur = annItems[annIdx];
    cur.classList.remove('is-active'); cur.classList.add('is-leaving');
    setTimeout(() => cur.classList.remove('is-leaving'), 700);
    annIdx = (annIdx + 1) % annItems.length;
    annItems[annIdx].classList.add('is-active');
  }, 4200);

  /* ---------- Navigation : transparente → verre dépoli, masquée au scroll ---------- */
  const nav = $('#nav');
  const hero = $('.hero');
  const heroMedia = $('#hero-media');
  const heroContent = $('.hero-content');
  let lastY = scrollY;
  let ticking = false;

  function onScroll() {
    const y = scrollY;
    const heroH = hero.offsetHeight;

    nav.classList.toggle('is-solid', y > heroH - nav.offsetHeight - 40 || nav.classList.contains('search-open'));
    const goingDown = y > lastY + 4, goingUp = y < lastY - 4;
    if (!document.body.classList.contains('is-locked') && !megaWrap.classList.contains('is-open')) {
      if (goingDown && y > heroH) nav.classList.add('is-hidden');
      else if (goingUp || y < heroH) nav.classList.remove('is-hidden');
    }
    lastY = y;

    // Hero façon Apple : le média rétrécit et s'arrondit
    if (!reduceMotion && y < heroH * 1.2) {
      const p = clamp(y / heroH, 0, 1);
      heroMedia.style.transform = `translateY(${p * heroH * .35}px) scale(${1 - p * .1})`;
      heroMedia.style.borderRadius = `${p * 40}px`;
      heroContent.style.transform = `translateY(${p * -60}px)`;
      heroContent.style.opacity = String(1 - p * 1.4);
    }

    updateStory();
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* ---------- Méga menu ---------- */
  const megaWrap = $('.has-mega');
  const megaBtn = $('.has-mega > .nav-link');
  let megaTimer;
  const setMega = (open) => {
    clearTimeout(megaTimer);
    megaWrap.classList.toggle('is-open', open);
    megaBtn.setAttribute('aria-expanded', String(open));
    if (open) nav.classList.add('is-solid'); else onScroll();
  };
  megaWrap.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { clearTimeout(megaTimer); megaTimer = setTimeout(() => setMega(true), 80); } });
  megaWrap.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { clearTimeout(megaTimer); megaTimer = setTimeout(() => setMega(false), 180); } });
  megaBtn.addEventListener('click', () => setMega(!megaWrap.classList.contains('is-open')));
  $$('.mega a').forEach((a) => a.addEventListener('click', () => setMega(false)));

  /* ---------- Menu mobile ---------- */
  const burger = $('#burger');
  const mobileMenu = $('#mobile-menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    nav.classList.toggle('menu-open', open);
    document.body.classList.toggle('is-locked', open);
    if (open) nav.classList.remove('is-hidden');
  }
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('#mobile-menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ---------- Onglets produits ---------- */
  const tabsEl = $('#product-tabs');
  const pill = $('.tab-pill', tabsEl);
  const productsEl = $('#products');
  const favs = new Set(load('yumiya-favs', []));

  function movePill(tab) {
    pill.style.width = tab.offsetWidth + 'px';
    pill.style.transform = `translateX(${tab.offsetLeft}px)`;
  }

  function productCard(p, i) {
    const badge = p.badge ? `<span class="badge ${p.dark ? 'badge--dark' : ''}">${p.badge}</span>` : '';
    const price = p.old ? `<s>${p.old} CHF</s>${p.price} CHF` : `${p.price} CHF`;
    return `
      <article class="card" style="animation-delay:${i * 60}ms">
        <div class="card-media">
          <div class="slot" data-slot data-img="${p.img}" style="--c1:${p.bg[0]};--c2:${p.bg[1]}">
            <div class="candle-art">${candleSVG(p)}</div>
          </div>
          ${badge}
          <button class="fav" aria-label="Ajouter ${p.name} aux favoris" aria-pressed="${favs.has(p.id)}" data-fav="${p.id}">
            <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>
          </button>
          <button class="quick-add" data-add="${p.id}" aria-label="Ajouter ${p.name} au panier">
            <span aria-hidden="true">＋</span><span class="qa-label">Ajouter au panier</span>
          </button>
        </div>
        <div class="card-info">
          <div>
            <h3 class="card-name">${p.name}</h3>
            <p class="card-sub">${p.sub}</p>
          </div>
          <p class="card-price">${price}</p>
        </div>
      </article>`;
  }

  function showTab(key, { focus = false } = {}) {
    const tab = $(`[data-tab="${key}"]`, tabsEl);
    if (!tab) return;
    $$('.tab', tabsEl).forEach((t) => { t.setAttribute('aria-selected', String(t === tab)); t.tabIndex = t === tab ? 0 : -1; });
    movePill(tab);
    tab.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    if (focus) tab.focus();
    const list = PRODUCTS.filter((p) => p.cats.includes(key)).slice(0, 8);
    productsEl.innerHTML = list.map(productCard).join('');
    $$('[data-slot]', productsEl).forEach(initSlot);
  }

  tabsEl.addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (t) showTab(t.dataset.tab); });
  tabsEl.addEventListener('keydown', (e) => {
    const tabs = $$('.tab', tabsEl);
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); showTab(tabs[(i + 1) % tabs.length].dataset.tab, { focus: true }); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); showTab(tabs[(i - 1 + tabs.length) % tabs.length].dataset.tab, { focus: true }); }
  });
  $$('[data-tab-link]').forEach((a) => a.addEventListener('click', () => showTab(a.dataset.tabLink)));
  addEventListener('resize', () => movePill($('[aria-selected="true"]', tabsEl)));
  if (document.fonts) document.fonts.ready.then(() => movePill($('[aria-selected="true"]', tabsEl)));
  showTab('new');

  productsEl.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add) {
      addToCart(add.dataset.add, add);
      add.classList.add('is-added');
      add.querySelector('.qa-label').textContent = 'Ajouté ✓';
      setTimeout(() => { add.classList.remove('is-added'); add.querySelector('.qa-label').textContent = 'Ajouter au panier'; }, 1600);
    }
    const fav = e.target.closest('[data-fav]');
    if (fav) {
      const id = fav.dataset.fav;
      const on = !favs.has(id);
      on ? favs.add(id) : favs.delete(id);
      fav.setAttribute('aria-pressed', String(on));
      save('yumiya-favs', [...favs]);
      toast(on ? `${byId[id].name} ajouté aux favoris ♥` : 'Retiré des favoris');
    }
  });

  /* ---------- Panier ---------- */
  let cart = load('yumiya-cart', []).filter((l) => byId[l.id]);
  const drawer = $('#drawer');
  const scrim = $('#scrim');
  const FREE_SHIP = 60;

  function renderCart() {
    const count = cart.reduce((s, l) => s + l.qty, 0);
    const total = cart.reduce((s, l) => s + l.qty * byId[l.id].price, 0);
    const countEl = $('#cart-count');
    countEl.textContent = count;
    countEl.classList.toggle('has-items', count > 0);
    $('#drawer-total').textContent = chf(total);
    $('#ship-bar').style.width = clamp(total / FREE_SHIP * 100, 0, 100) + '%';
    $('#ship-text').innerHTML = total >= FREE_SHIP
      ? '🎉 La livraison est <strong>offerte</strong>'
      : `Plus que <strong>${chf(FREE_SHIP - total)}</strong> pour la livraison offerte`;
    const items = $('#drawer-items');
    if (!cart.length) {
      items.innerHTML = `<li class="drawer-empty"><p>Ton panier est vide… pour l'instant.</p><a href="#collections" class="btn btn--dark" data-close-cart>Découvrir nos bougies</a></li>`;
    } else {
      items.innerHTML = cart.map((l) => {
        const p = byId[l.id];
        return `<li class="d-item">
          <div class="d-thumb"><div class="slot" style="--c1:${p.bg[0]};--c2:${p.bg[1]}">${candleSVG(p)}</div></div>
          <div><p class="d-name">${p.name}</p><p class="d-price">${chf(p.price)}</p>
            <div class="qty"><button data-dec="${p.id}" aria-label="Retirer un ${p.name}">−</button><span>${l.qty}</span><button data-inc="${p.id}" aria-label="Ajouter un ${p.name}">+</button></div>
          </div>
          <p class="d-line">${chf(p.price * l.qty)}</p>
        </li>`;
      }).join('');
    }
    save('yumiya-cart', cart);
  }
  function addToCart(id, fromEl) {
    const line = cart.find((l) => l.id === id);
    line ? line.qty++ : cart.push({ id, qty: 1 });
    renderCart();
    const c = $('#cart-count');
    c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    if (fromEl && !reduceMotion) flyToCart(fromEl, byId[id]);
    toast(`${byId[id].name} ajouté au panier`);
  }
  // Petite bulle qui « vole » jusqu'au panier
  function flyToCart(fromEl, p) {
    const a = fromEl.getBoundingClientRect();
    const b = $('#cart-btn').getBoundingClientRect();
    const dot = document.createElement('div');
    Object.assign(dot.style, {
      position: 'fixed', zIndex: 120, left: a.left + a.width / 2 - 14 + 'px', top: a.top + a.height / 2 - 14 + 'px',
      width: '28px', height: '28px', borderRadius: '50%', background: p.bg[1], boxShadow: '0 6px 18px rgba(0,0,0,.25)', pointerEvents: 'none',
    });
    document.body.appendChild(dot);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    dot.animate([
      { transform: 'translate(0,0) scale(1)' },
      { transform: `translate(${dx * .5}px, ${dy * .5 - 80}px) scale(1.1)`, offset: .5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.3)`, opacity: .6 },
    ], { duration: 750, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => dot.remove();
  }
  function setDrawer(open) {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('is-locked', open);
    if (open) { scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add('is-open')); $('#drawer-close').focus(); }
    else { scrim.classList.remove('is-open'); setTimeout(() => { scrim.hidden = true; }, 500); }
  }
  $('#cart-btn').addEventListener('click', () => setDrawer(true));
  $('#drawer-close').addEventListener('click', () => setDrawer(false));
  scrim.addEventListener('click', () => setDrawer(false));
  $('#drawer-items').addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    if (inc) { cart.find((l) => l.id === inc.dataset.inc).qty++; renderCart(); }
    if (dec) {
      const l = cart.find((x) => x.id === dec.dataset.dec);
      l.qty--; if (l.qty <= 0) cart = cart.filter((x) => x !== l);
      renderCart();
    }
    if (e.target.closest('[data-close-cart]')) setDrawer(false);
  });
  renderCart();

  /* ---------- Recherche ---------- */
  const search = $('#search');
  const sInput = $('#search-input');
  const sResults = $('#search-results');
  function setSearch(open) {
    search.hidden = !open;
    nav.classList.toggle('search-open', open);
    if (open) { nav.classList.add('is-solid'); sInput.value = ''; renderSearch(''); sInput.focus(); }
    else onScroll();
  }
  function renderSearch(q) {
    const n = q.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const list = (n ? PRODUCTS.filter((p) => norm(p.name + ' ' + p.sub).includes(n)) : PRODUCTS.filter((p) => p.cats.includes('best'))).slice(0, 6);
    sResults.innerHTML = list.length
      ? (n ? '' : '<p class="empty">Les plus aimées</p>') + list.map((p) => `<button data-goto="${p.id}"><span class="sr-thumb"><span class="slot" style="--c1:${p.bg[0]};--c2:${p.bg[1]};display:grid;place-items:center">${candleSVG(p)}</span></span><span><strong>${p.name}</strong><small>${p.sub} · ${p.price} CHF</small></span></button>`).join('')
      : `<p class="empty">Aucun résultat pour « ${q.replace(/[<>&]/g, '')} ».</p>`;
  }
  $('#search-btn').addEventListener('click', () => setSearch(true));
  $('#search-close').addEventListener('click', () => setSearch(false));
  sInput.addEventListener('input', () => renderSearch(sInput.value));
  sResults.addEventListener('click', (e) => {
    const b = e.target.closest('[data-goto]');
    if (!b) return;
    const p = byId[b.dataset.goto];
    setSearch(false);
    showTab(p.cats[0]);
    $('#collections').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Histoire : étapes pilotées par le scroll ---------- */
  const story = $('.story');
  const steps = $$('#story-steps li');
  const slides = $$('.story-slide');
  const storyBar = $('#story-bar');
  let storyIdx = 0;
  function setStory(i) {
    if (i === storyIdx) return;
    storyIdx = i;
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
  }
  function updateStory() {
    if (innerWidth <= 900) return;
    const r = story.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight), 0, 1);
    storyBar.style.transform = `scaleX(${p})`;
    setStory(Math.min(steps.length - 1, Math.floor(p * steps.length * .999)));
  }
  // Sur mobile, les photos défilent toutes seules
  setInterval(() => { if (innerWidth <= 900) setStory((storyIdx + 1) % steps.length); }, 3500);

  /* ---------- Compteurs ---------- */
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      countObserver.unobserve(target);
      const end = parseFloat(target.dataset.count);
      const dec = +(target.dataset.decimals || 0);
      const suf = target.dataset.suffix || '';
      const fmt = (v) => v.toFixed(dec).replace('.', ',') + suf;
      if (reduceMotion) { target.textContent = fmt(end); return; }
      const t0 = performance.now(), dur = 1600;
      const tick = (t) => {
        const k = clamp((t - t0) / dur, 0, 1);
        target.textContent = fmt(end * (1 - Math.pow(1 - k, 4)));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach((el) => countObserver.observe(el));

  /* ---------- Trouver mon parfum ---------- */
  const MOODS = {
    cocon:    { id: 'coton',    kicker: 'Pour toi : douceur absolue', desc: 'Un linge propre séché au soleil, un plaid, un livre. Une odeur qui rassure dès la première flamme.', notes: [['Tête', 'Aldéhydes'], ['Cœur', 'Fleur de coton'], ['Fond', 'Musc blanc']] },
    gourmand: { id: 'vanille',  kicker: 'Pour toi : la gourmandise', desc: 'Une gousse de vanille de Madagascar, une pointe de caramel. Comme une pâtisserie qui sort du four.', notes: [['Tête', 'Lait d\'amande'], ['Cœur', 'Vanille Bourbon'], ['Fond', 'Fève tonka']] },
    floral:   { id: 'rose-litchi', kicker: 'Pour toi : le romantisme', desc: 'Une rose fraîchement coupée, un litchi juteux. Floral sans être sage, lumineux du matin au soir.', notes: [['Tête', 'Litchi'], ['Cœur', 'Rose de Damas'], ['Fond', 'Bois blond']] },
    frais:    { id: 'the-blanc', kicker: 'Pour toi : un grand bol d\'air', desc: 'Des feuilles de thé infusées, de la menthe froissée. Parfait pour la cuisine ou la salle de bain.', notes: [['Tête', 'Menthe'], ['Cœur', 'Thé blanc'], ['Fond', 'Vétiver']] },
  };
  const finder = $('#parfums');
  const finderInfo = $('.finder-info');
  const finderCandle = $('#finder-candle');
  let currentMood = 'cocon';
  function renderMood(key, animate) {
    const m = MOODS[key], p = byId[m.id];
    currentMood = key;
    const apply = () => {
      $('#finder-kicker').textContent = m.kicker;
      $('#finder-name').textContent = p.name;
      $('#finder-desc').textContent = m.desc;
      $('#finder-notes').innerHTML = m.notes.map(([k, v]) => `<li><b>${k}</b>${v}</li>`).join('');
      $('#finder-price').textContent = p.price + ' CHF';
      finderCandle.innerHTML = candleSVG(p);
      finderInfo.classList.remove('is-changing');
    };
    finder.dataset.mood = key;
    $$('.mood').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mood === key)));
    if (animate && !reduceMotion) {
      finderInfo.classList.add('is-changing');
      finderCandle.classList.remove('swap'); void finderCandle.offsetWidth; finderCandle.classList.add('swap');
      setTimeout(apply, 320);
    } else apply();
  }
  $('#moods').addEventListener('click', (e) => { const b = e.target.closest('.mood'); if (b && b.dataset.mood !== currentMood) renderMood(b.dataset.mood, true); });
  $('#finder-add').addEventListener('click', (e) => addToCart(MOODS[currentMood].id, e.currentTarget));
  renderMood('cocon', false);

  /* ---------- Carrousels : glisser à la souris avec élan ---------- */
  $$('.carousel').forEach((track) => {
    let down = false, startX = 0, startScroll = 0, moved = false, hist = [];
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return; // le tactile utilise le défilement natif
      down = true; moved = false; startX = e.clientX; startScroll = track.scrollLeft; hist = [{ x: e.clientX, t: e.timeStamp }];
    });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('is-dragging'); }
      if (moved) {
        track.scrollLeft = startScroll - dx;
        hist.push({ x: e.clientX, t: e.timeStamp }); if (hist.length > 5) hist.shift();
      }
    });
    addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      if (!moved) return;
      // Projection de l'élan (formule de décélération utilisée par iOS)
      const a = hist[0], b = hist[hist.length - 1];
      const v = (b.t - a.t) > 0 ? (b.x - a.x) / (b.t - a.t) * 1000 : 0; // px/s
      const d = .998;
      const projected = (v / 1000) * d / (1 - d);
      track.classList.remove('is-dragging');
      track.scrollBy({ left: -projected * .35, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  });
  $$('[data-carousel-next], [data-carousel-prev]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const track = $('#' + (btn.dataset.carouselNext || btn.dataset.carouselPrev));
      const item = track.firstElementChild;
      const step = item.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16);
      track.scrollBy({ left: btn.dataset.carouselNext ? step : -step, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });
  // Les reels se lancent au survol si une vidéo est présente
  $$('.reel').forEach((r) => {
    r.addEventListener('pointerenter', () => { const v = r.querySelector('video'); if (v) v.play().catch(() => {}); });
  });

  /* ---------- Faux score du mini-jeu ---------- */
  const fakeScore = $('#fake-score');
  let fs = 0;
  const gameObserver = new IntersectionObserver(([e]) => { fakeScore.dataset.on = e.isIntersecting ? '1' : ''; });
  gameObserver.observe($('.game-card'));
  setInterval(() => { if (fakeScore.dataset.on) { fs = (fs + 7) % 12000; fakeScore.textContent = fs; } }, 60);

  /* ---------- Accordéon FAQ (un seul ouvert, ouverture animée) ---------- */
  $$('#accordion .acc').forEach((d) => {
    const summary = d.querySelector('summary');
    const body = d.querySelector('.acc-body');
    summary.addEventListener('click', (e) => {
      e.preventDefault();
      const opening = !d.open;
      if (opening) {
        $$('#accordion .acc[open]').forEach((o) => { if (o !== d) closeAcc(o); });
        d.open = true;
        if (reduceMotion) return;
        const h = body.scrollHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' });
      } else closeAcc(d);
    });
  });
  function closeAcc(d) {
    const body = d.querySelector('.acc-body');
    if (reduceMotion) { d.open = false; return; }
    const anim = body.animate([{ height: body.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)' });
    anim.onfinish = () => { d.open = false; };
  }

  // Footer : colonnes repliées sur mobile
  const fcols = $$('.fcol');
  const syncFooter = () => fcols.forEach((f) => { f.open = innerWidth > 900; });
  syncFooter();
  let lastW = innerWidth;
  addEventListener('resize', () => { if ((lastW > 900) !== (innerWidth > 900)) syncFooter(); lastW = innerWidth; });

  /* ---------- Newsletter ---------- */
  const form = $('#news-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#news-email').value.trim();
    const msg = $('#news-msg');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      form.classList.remove('is-error'); void form.offsetWidth; form.classList.add('is-error');
      msg.textContent = 'Oups, cette adresse e-mail ne semble pas valide.';
      return;
    }
    form.classList.remove('is-error');
    msg.textContent = 'Bienvenue au Club ! Ton code −10 % arrive par e-mail ✦';
    form.reset();
  });

  /* ---------- Film ---------- */
  const film = $('#film');
  function setFilm(open) {
    film.hidden = !open;
    document.body.classList.toggle('is-locked', open);
    const v = film.querySelector('video');
    if (v) { if (open) v.play().catch(() => {}); else v.pause(); }
    if (open) $('#film-close').focus();
  }
  $('#play-film').addEventListener('click', () => setFilm(true));
  $('#film-close').addEventListener('click', () => setFilm(false));
  film.addEventListener('click', (e) => { if (e.target === film) setFilm(false); });

  /* ---------- Échap ferme tout ---------- */
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!film.hidden) setFilm(false);
    if (drawer.classList.contains('is-open')) setDrawer(false);
    if (!search.hidden) setSearch(false);
    if (megaWrap.classList.contains('is-open')) setMega(false);
    if (mobileMenu.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2200);
  }

  /* ---------- Stockage local (protégé) ---------- */
  function load(k, fallback) { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* navigation privée */ } }

  $('#year').textContent = new Date().getFullYear();
  onScroll();
})();
