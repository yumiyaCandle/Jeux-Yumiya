/* =========================================================
   YUMIYA CANDLE — script commun à toutes les pages
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const chf = (n) => n.toFixed(2) + ' CHF';
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PAGE = document.body.dataset.page;

  /* =========================================================
     RÉGLAGES DE LA BOUTIQUE (repris du site actuel)
     ========================================================= */
  const SITE = {
    email: 'yumiyacandle@outlook.com',
    instagram: 'yumiya.candle',
    shipping: 8.90,
    formspree: 'https://formspree.io/f/xlgzandp',
    twint: 'https://go.twint.ch/1/e/tw?tw=acq.Ym3w05jiSvied2R3BRgLV99gzY1xEgp4HkHFveezjEUlzb_7czPOsxlqogPRkuSn',
    emailjs: { publicKey: 'Z6kx6GmRHGnW63JHW', serviceId: 'service_1exfcph', templateId: 'template_yg7yy6z' },
  };

  /* Catalogue — active:false affiche le produit comme épuisé */
  const PRODUCTS = {
    lav: { n: '01', cat: 'gourmande', active: true, price: 10.90, theme: 'lav', tint: '#dccaf2', dots: ['#B596DC', '#F2ECE3'],
      name: 'Lavande', full: 'Bougie gourmande Lavande', line: 'Bougie gourmande', mood: 'Florale & apaisante', notes: 'Lavande · Crème',
      cut: 'img/cut-lav.webp', imgs: ['img/p-lav.webp'],
      desc: 'La douceur apaisante de la lavande. Nuances de violet et de crème, chantilly blanche travaillée à la main, petits cœurs et tablette de chocolat violette.',
      facts: [['Senteur', 'Lavande'], ['Décor', 'Chantilly, cœurs et chocolat violet']] },
    aut: { n: '02', cat: 'gourmande', active: true, price: 10.90, theme: 'aut', tint: '#f7b877', dots: ['#EA7F1E', '#F2ECE3'], badge: 'Édition d’automne',
      name: 'Automne', full: 'Bougie gourmande Automne', line: 'Bougie gourmande', mood: 'Chaleureuse & gourmande', notes: 'Pomme · Crème',
      cut: 'img/cut-aut.webp', imgs: ['img/p-aut.webp'],
      desc: 'L’atmosphère chaleureuse de l’automne, portée par de douces notes de pomme. Couches de cire orange et crème, chantilly et décorations gourmandes faites à la main.',
      facts: [['Senteur', 'Pomme'], ['Décor', 'Chantilly et décorations gourmandes']] },
    tulip: { n: '03', cat: 'florale', active: true, price: 6.30, theme: 'rose', tint: '#f7c9d1', dots: ['#E07C8C', '#F0A877', '#C23B3B', '#8B5BB5'], wide: true,
      name: 'Tulipe', full: 'Bougie Tulipe', line: 'Bougie florale', mood: 'Florale & délicate', notes: 'Vanille · Fraise',
      cut: 'img/cut-tulip.webp', imgs: ['img/spring1.webp', 'img/real.webp'],
      desc: 'Un bouquet de tulipes en cire posé sur un socle vert mousse, dans son verre. Une note vanille-fraise, délicate et printanière, pour fleurir la maison toute l’année.',
      colors: [
        { n: 'Rose', c: ['#E07C8C'], img: 'img/tulip-hq-rose.webp' },
        { n: 'Orange clair', c: ['#F0A877'], img: 'img/tulip-hq-corail.webp' },
        { n: 'Rouge & Bleu clair', c: ['#C23B3B', '#86BFE0'], img: 'img/tulip-hq-rose.webp' },
        { n: 'Violet', c: ['#8B5BB5'], img: 'img/tulip-hq-violet.webp' },
      ],
      facts: [['Senteur', 'Vanille, fraise'], ['Décor', 'Tulipes en cire, socle vert mousse'], ['Contenant', 'Verre transparent']] },
    box: { n: '04', cat: 'coffret', active: true, price: 13.30, theme: 'cream', tint: '#f3dcd6', dots: ['#F2D6D2', '#D6303D', '#E07C8C'], badge: 'Prêt à offrir',
      name: 'Coffret Yumiya', full: 'Box Cadeau Yumiya', line: 'Coffret cadeau', mood: 'Le duo prêt à offrir', notes: 'Gourmande + Tulipe',
      cut: 'img/cut-box2.webp', imgs: ['img/p-box.webp', 'img/giftbox.webp', 'img/box-white.webp'],
      desc: 'Un duo prêt à offrir : une bougie gourmande marshmallow-framboise et une bougie tulipe vanille-fraise, réunies dans une boîte cadeau aux tons pastel. Plus avantageux que les deux bougies achetées séparément.',
      facts: [['Contenu', '1 bougie marshmallow-framboise, 1 bougie tulipe'], ['Écrin', 'Boîte cadeau nouée d’un ruban']] },
  };
  const COMMON = [['Cire', 'Soja 100 % végétale, sans paraffine'], ['Mèche', 'Coton'], ['Fabrication', 'À la main, à La Neuveville'], ['Livraison', 'Partout en Suisse · 8.90 CHF']];

  /* =========================================================
     EN-TÊTE, MENU, PANIER ET PIED DE PAGE (communs)
     ========================================================= */
  const NAV = [['index', 'index.html', 'Accueil'], ['boutique', 'boutique.html', 'Boutique'], ['nouveautes', 'nouveautes.html', 'Nouveautés'], ['atelier', 'atelier.html', 'L’atelier'], ['creer', 'creer.html', 'Créer'], ['journal', 'journal.html', 'Journal'], ['maison', 'maison.html', 'La maison']];
  const cur = (k) => (k === PAGE || (PAGE === 'produit' && k === 'boutique') ? ' aria-current="page"' : '');
  const ICON = {
    bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6Z"/><path d="m9 12 2 2 4-4"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg>',
    hand: '<svg viewBox="0 0 24 24"><path d="M12 3c2.5 3.2 4 5.6 4 7.6a4 4 0 0 1-8 0C8 8.6 9.5 6.2 12 3Z"/><path d="M6 21h12M9 17h6"/></svg>',
  };

  document.body.insertAdjacentHTML('afterbegin', `
    <a class="skip" href="#main">Aller au contenu</a>
    <div class="progress" id="progress" aria-hidden="true"></div>
    <header class="nav" id="nav">
      <a class="brand" href="index.html" aria-label="Yumiya Candle, accueil"><img src="img/logo.webp" alt="" width="38" height="38"><span>YUMIYA<small>CANDLE · HANDMADE</small></span></a>
      <nav class="nav-links" aria-label="Navigation principale">${NAV.map(([k, h, l]) => `<a href="${h}"${cur(k)}>${l}</a>`).join('')}</nav>
      <div class="nav-actions">
        <button class="icon-btn" id="bag-btn" aria-label="Ouvrir le panier">${ICON.bag}<b class="bag-n" id="bag-n">0</b></button>
        <button class="icon-btn burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
      </div>
    </header>
    <div class="menu" id="menu" aria-hidden="true">
      <nav aria-label="Menu mobile">${NAV.map(([k, h, l], i) => `<a href="${h}"${cur(k)}><small>0${i + 1}</small>${l}</a>`).join('')}</nav>
      <p class="menu-foot">Fait main à La Neuveville · Livraison partout en Suisse</p>
    </div>`);

  document.body.insertAdjacentHTML('beforeend', `
    <footer class="footer" data-theme="plum">
      <div class="container">
        <div class="footer-top">
          <div>
            <a class="brand" href="index.html"><img src="img/logo.webp" alt="" width="38" height="38"><span>YUMIYA<small>CANDLE · HANDMADE</small></span></a>
            <p class="f-about">Bougies coulées et décorées à la main par cinq élèves de l’École Supérieure de Commerce de La Neuveville.</p>
          </div>
          <div><p class="f-title">Boutique</p><a href="boutique.html">Toutes les bougies</a><a href="produit.html?p=box">Coffret cadeau</a><a href="creer.html">Créer la vôtre</a><a href="nouveautes.html">Nouveautés</a></div>
          <div><p class="f-title">Yumiya</p><a href="maison.html">La maison</a><a href="atelier.html">L’atelier</a><a href="journal.html">Journal</a><a href="journal.html#questions">Questions fréquentes</a></div>
          <div><p class="f-title">Contact</p><a href="mailto:${SITE.email}">${SITE.email}</a><a href="https://instagram.com/${SITE.instagram}" target="_blank" rel="noopener">Instagram @${SITE.instagram}</a><a href="legal.html#mentions">Mentions légales</a><a href="legal.html#cgv">Conditions de vente</a></div>
        </div>
        <div class="wordmark" id="wordmark" aria-hidden="true"><span>Y</span><span>u</span><span>m</span><span>i</span><span>y</span><span>a</span></div>
        <div class="footer-bottom">
          <p>© ${new Date().getFullYear()} Yumiya Candle · La Neuveville, Suisse</p>
          <p>Paiement TWINT · Livraison 8.90 CHF · Retour sous 30 jours</p>
        </div>
      </div>
    </footer>
    <div class="scrim" id="scrim" hidden></div>
    <aside class="drawer" id="drawer" aria-label="Panier" aria-hidden="true">
      <div class="drawer-head"><h2>Votre panier</h2><button class="icon-btn" id="drawer-close" aria-label="Fermer le panier">${ICON.x}</button></div>
      <ul class="drawer-items" id="drawer-items"></ul>
      <div class="drawer-foot" id="drawer-foot"></div>
    </aside>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>`);

  /* ---------- Toast ---------- */
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
  }

  /* ---------- Stockage protégé ---------- */
  const load = (k, f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* navigation privée */ } };

  /* =========================================================
     PANIER
     ========================================================= */
  let cart = load('yumiya-cart', []);
  const cartTotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);
  function addItem(item, fromEl) {
    const line = cart.find((i) => i.id === item.id);
    line ? (line.qty += item.qty || 1) : cart.push({ qty: 1, ...item });
    save('yumiya-cart', cart); renderCart();
    const b = $('#bag-n'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    if (fromEl && !reduce) fly(fromEl, item.img);
    toast(item.name + ' ajouté au panier');
  }
  function addProduct(key, opts = {}, fromEl) {
    const p = PRODUCTS[key];
    if (!p.active) { toast('Ce produit est épuisé pour le moment'); return; }
    const color = p.colors ? p.colors[opts.color || 0] : null;
    addItem({ id: key + (color ? '-' + color.n : ''), key, name: p.name, label: color ? 'Coloris ' + color.n : p.line, price: p.price, qty: opts.qty || 1, img: color ? color.img : p.cut, tint: p.tint }, fromEl);
  }
  function fly(fromEl, img) {
    const a = fromEl.getBoundingClientRect(), b = $('#bag-btn').getBoundingClientRect();
    const el = document.createElement('img');
    el.src = img; el.alt = '';
    Object.assign(el.style, { position: 'fixed', zIndex: 250, left: a.left + a.width / 2 - 30 + 'px', top: a.top + a.height / 2 - 30 + 'px', width: '60px', height: '60px', objectFit: 'contain', pointerEvents: 'none' });
    document.body.appendChild(el);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    el.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx * .5}px,${dy * .5 - 90}px) scale(1.1)`, offset: .5 }, { transform: `translate(${dx}px,${dy}px) scale(.2)`, opacity: .4 }], { duration: 800, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => el.remove();
  }
  function renderCart() {
    const n = cart.reduce((s, i) => s + i.qty, 0), bn = $('#bag-n');
    bn.textContent = n; bn.classList.toggle('on', n > 0);
    const list = $('#drawer-items'), foot = $('#drawer-foot');
    if (!cart.length) {
      list.innerHTML = `<li class="drawer-empty"><p>Votre panier est vide pour l’instant.</p><a class="btn btn--fg" href="boutique.html"><span>Voir les bougies</span></a></li>`;
      foot.innerHTML = '';
    } else {
      list.innerHTML = cart.map((i, k) => `<li class="d-item"><img src="${i.img}" alt="" style="--d:${i.tint || '#f3ebe2'}">
        <div><p class="d-name">${esc(i.name)}</p>${i.label ? `<p class="d-label">${esc(i.label)}</p>` : ''}
        <div class="d-qty"><button data-dec="${k}" aria-label="Retirer un ${esc(i.name)}">−</button><span>${i.qty}</span><button data-inc="${k}" aria-label="Ajouter un ${esc(i.name)}">+</button></div></div>
        <p class="d-line">${chf(i.price * i.qty)}</p></li>`).join('');
      foot.innerHTML = `<div class="sum-row"><span>Sous-total</span><span class="price">${chf(cartTotal())}</span></div>
        <div class="sum-row"><span>Livraison en Suisse</span><span class="price">${chf(SITE.shipping)}</span></div>
        <div class="sum-row total"><span>Total</span><span class="price">${chf(cartTotal() + SITE.shipping)}</span></div>
        <a class="btn btn--fg btn--block" href="commande.html"><span>Commander</span></a>`;
    }
    save('yumiya-cart', cart);
    if (PAGE === 'commande') renderSummary();
  }
  const drawer = $('#drawer'), scrim = $('#scrim');
  function setDrawer(open) {
    drawer.classList.toggle('on', open); drawer.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('is-locked', open);
    if (open) { scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add('on')); $('#drawer-close').focus(); }
    else { scrim.classList.remove('on'); setTimeout(() => { scrim.hidden = true; }, 500); }
  }
  $('#bag-btn').addEventListener('click', () => setDrawer(true));
  $('#drawer-close').addEventListener('click', () => setDrawer(false));
  scrim.addEventListener('click', () => setDrawer(false));
  $('#drawer-items').addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    if (inc) cart[+inc.dataset.inc].qty++;
    if (dec) { const k = +dec.dataset.dec; cart[k].qty--; if (cart[k].qty <= 0) cart.splice(k, 1); }
    if (inc || dec) renderCart();
  });
  addEventListener('storage', (e) => { if (e.key === 'yumiya-cart') { cart = load('yumiya-cart', []); renderCart(); } });

  /* ---------- Menu mobile ---------- */
  const burger = $('#burger'), menu = $('#menu'), nav = $('#nav');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('is-locked', open);
    Object.assign(nav.style, open ? { color: '#f8f0ea', background: 'transparent', boxShadow: 'none' } : { color: '', background: '', boxShadow: '' });
  }
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (menu.classList.contains('is-open')) setMenu(false);
    if (drawer.classList.contains('on')) setDrawer(false);
  });

  /* =========================================================
     CARTES PRODUITS (boutique, accueil, produit)
     ========================================================= */
  function card(key, i = 0) {
    const p = PRODUCTS[key];
    return `<a class="pcard reveal" href="produit.html?p=${key}" data-cat="${p.cat}" style="--t:${p.tint}">
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}<span class="num">${p.n}</span>
      <div class="pcard-media"><img src="${p.cut}" alt="${esc(p.full)}" loading="lazy"${p.wide ? ' class="wide"' : ''}></div>
      <div class="pcard-body"><div class="pcard-top"><h3 class="pcard-name">${p.name}</h3><span class="price">${p.active ? chf(p.price) : 'Épuisé'}</span></div>
        <p class="pcard-sub">${p.mood} · ${p.notes}</p>
        <div class="dots">${p.dots.map((d) => `<i style="--d:${d}"></i>`).join('')}</div></div>
      <button class="qa" data-add="${key}" aria-label="Ajouter ${esc(p.name)} au panier">+</button>
    </a>`;
  }
  document.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (!add) return;
    e.preventDefault(); e.stopPropagation();
    const key = add.dataset.add;
    if (PRODUCTS[key].colors && add.classList.contains('qa')) { location.href = 'produit.html?p=' + key; return; }
    addProduct(key, {}, add);
    add.classList.add('done'); setTimeout(() => add.classList.remove('done'), 1400);
  });
  $$('[data-products]').forEach((el) => {
    const keys = el.dataset.products === 'all' ? Object.keys(PRODUCTS) : el.dataset.products.split(',');
    el.innerHTML = keys.map(card).join('');
  });

  /* =========================================================
     ANIMATIONS COMMUNES
     ========================================================= */
  // Titres découpés en lettres
  $$('[data-split]').forEach((el) => {
    let c = 0;
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'word';
          [...part].forEach((ch) => { const s = document.createElement('span'); s.className = 'char'; s.textContent = ch; s.style.setProperty('--c', c++); w.append(s); });
          frag.append(w);
        });
        n.replaceWith(frag);
      } else walk(n);
    });
    walk(el);
  });
  requestAnimationFrame(() => setTimeout(() => document.body.classList.add('is-ready'), 60));

  // Apparitions
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  function observe(root = document) {
    $$('.reveal', root).forEach((el) => {
      const sib = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      const i = sib.indexOf(el); if (i > 0) el.style.setProperty('--d', Math.min(i, 6) * .08 + 's');
      io.observe(el);
    });
  }
  observe(); io.observe($('#wordmark'));

  // Compteurs
  const cio = new IntersectionObserver((es) => es.forEach(({ target, isIntersecting }) => {
    if (!isIntersecting) return; cio.unobserve(target);
    const end = parseFloat(target.dataset.count), suf = target.dataset.suffix || '';
    if (reduce) { target.textContent = end + suf; return; }
    const t0 = performance.now();
    const step = (t) => { const k = clamp((t - t0) / 1600, 0, 1); target.textContent = Math.round(end * (1 - Math.pow(1 - k, 4))) + suf; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .5 });
  $$('[data-count]').forEach((el) => cio.observe(el));

  // Aurore (fond animé des en-têtes sombres)
  $$('canvas.aurora').forEach((cv) => {
    const ctx = cv.getContext('2d');
    const blobs = [[181, 150, 220, .25, .3, .55, .13, .17, 0], [234, 127, 30, .78, .35, .42, .11, .09, 2], [224, 124, 140, .55, .78, .5, .07, .15, 4], [243, 223, 162, .88, .82, .28, .16, .12, 1], [107, 59, 110, .1, .85, .4, .1, .14, 3]];
    let vis = true, mx = .5, my = .5, tx = .5, ty = .5;
    const size = () => { cv.width = Math.max(1, Math.round(cv.offsetWidth / 6)); cv.height = Math.max(1, Math.round(cv.offsetHeight / 6)); };
    size(); addEventListener('resize', size);
    cv.parentElement.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; });
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(cv);
    const draw = (t) => {
      if (vis) {
        const w = cv.width, h = cv.height, s = t / 1000; mx = lerp(mx, tx, .04); my = lerp(my, ty, .04);
        ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#24121f'; ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        blobs.forEach(([r, g, b, x, y, rad, sx, sy, p], i) => {
          const px = (x + Math.sin(s * sx + p) * .18 + (mx - .5) * .12 * (i % 2 ? 1 : -1)) * w, py = (y + Math.cos(s * sy + p) * .16 + (my - .5) * .1) * h, R = rad * Math.max(w, h);
          const gr = ctx.createRadialGradient(px, py, 0, px, py, R); gr.addColorStop(0, `rgba(${r},${g},${b},.34)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
        });
      }
      if (!reduce) requestAnimationFrame(draw);
    };
    draw(0);
  });

  // Boutons magnétiques
  if (fine && !reduce) $$('.magnetic').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => { const r = btn.getBoundingClientRect(); btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`; });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });

  // Onglets à pilule glissante (filtres)
  function pillTabs(wrap, onPick) {
    const pill = $('.tabs-pill', wrap), btns = $$('.tab', wrap);
    const move = (b) => { pill.style.width = b.offsetWidth + 'px'; pill.style.transform = `translateX(${b.offsetLeft}px)`; };
    const pick = (b) => { btns.forEach((x) => x.setAttribute('aria-selected', String(x === b))); move(b); onPick(b.dataset.f); };
    btns.forEach((b) => b.addEventListener('click', () => pick(b)));
    const sync = () => move(btns.find((b) => b.getAttribute('aria-selected') === 'true') || btns[0]);
    addEventListener('resize', sync); if (document.fonts) document.fonts.ready.then(sync); sync();
  }

  // FAQ : une seule réponse ouverte, ouverture animée
  $$('.acc').forEach((d) => {
    const body = $('.acc-body', d);
    const close = (x) => { const b = $('.acc-body', x); if (reduce) { x.open = false; return; } b.animate([{ height: b.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 360, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => { x.open = false; }; };
    $('summary', d).addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) { close(d); return; }
      $$('.acc[open]', d.parentElement).forEach((o) => o !== d && close(o));
      d.open = true;
      if (!reduce) body.animate([{ height: '0px', opacity: 0 }, { height: body.scrollHeight + 'px', opacity: 1 }], { duration: 460, easing: 'cubic-bezier(.22,1,.36,1)' });
    });
  });

  // Manifeste : mots qui s'allument au scroll
  const mani = $('#manifesto');
  let words = [];
  if (mani) {
    const HOT = ['main', 'unique', 'patience', 'soja'];
    mani.innerHTML = mani.textContent.trim().split(/\s+/).map((w) => `<span class="w${HOT.some((h) => w.toLowerCase().startsWith(h)) ? ' hot' : ''}">${w}</span>`).join(' ');
    words = $$('.w', mani);
  }

  /* ---------- Envoi des formulaires (Formspree, comme le site actuel) ---------- */
  function sendForm(data) {
    const fd = () => { const f = new FormData(); Object.keys(data).forEach((k) => { if (data[k] != null && data[k] !== '') f.append(k, data[k]); }); return f; };
    const once = () => fetch(SITE.formspree, { method: 'POST', headers: { Accept: 'application/json' }, body: fd() }).then((r) => r.ok);
    return once().catch(() => new Promise((r) => setTimeout(r, 1200)).then(once)).catch(() => false);
  }
  const mailtoFor = (subject, data) => 'mailto:' + SITE.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(Object.keys(data).filter((k) => data[k] && k[0] !== '_' && k !== 'articles').map((k) => k.replace(/_/g, ' ') + ' : ' + data[k]).join('\n'));
  const EMAIL = (x) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
  function check(rules) {
    let ok = true, first = null;
    rules.forEach(([id, fn]) => { const el = $('#' + id); const good = fn(el.value.trim()); el.closest('.field').classList.toggle('bad', !good); if (!good) { ok = false; first = first || el; } });
    if (first) first.focus();
    return ok;
  }

  /* =========================================================
     DÉFILEMENT : thème de couleur, nav, barre, effets
     ========================================================= */
  const themed = $$('main > section[data-theme], footer[data-theme]');
  let theme = document.body.dataset.theme;
  const steps = $('.steps-scroll');
  let lastY = scrollY;
  function onScroll() {
    const y = scrollY;
    if (!document.body.classList.contains('is-locked')) {
      if (y > lastY + 6 && y > 300) nav.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 300) nav.classList.remove('is-hidden');
    }
    lastY = y;
    const h = document.documentElement.scrollHeight - innerHeight;
    $('#progress').style.transform = `scaleX(${h > 0 ? y / h : 0})`;

    const line = innerHeight * .6;
    for (const s of themed) {
      const r = s.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) { if (s.dataset.theme !== theme) { theme = s.dataset.theme; document.body.dataset.theme = theme; } break; }
    }
    if (mani) {
      const r = mani.getBoundingClientRect();
      const p = clamp((innerHeight * .85 - r.top) / (r.height + innerHeight * .35), 0, 1);
      const n = Math.round(p * words.length); words.forEach((w, i) => w.classList.toggle('lit', i < n));
    }
    if (!reduce) $$('[data-parallax]').forEach((el) => {
      const r = el.getBoundingClientRect(); const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.transform = `translateY(${k * -parseFloat(el.dataset.parallax)}px) rotate(${k * -4}deg)`;
    });
    if (steps && innerWidth > 980) {
      const r = steps.getBoundingClientRect(); const p = clamp(-r.top / (r.height - innerHeight), 0, 1);
      const items = $$('.step-list li'), figs = $$('.step-frame figure'); const k = Math.min(items.length - 1, Math.floor(p * items.length * .999));
      items.forEach((x, i) => x.classList.toggle('on', i === k)); figs.forEach((x, i) => x.classList.toggle('on', i === k));
      $('.step-bar span').style.transform = `scaleX(${p})`;
    }
  }
  let tick = false;
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { onScroll(); tick = false; }); } }, { passive: true });
  addEventListener('resize', onScroll);

  /* =========================================================
     PAGES
     ========================================================= */

  /* ----- Accueil : bougies qui suivent la souris ----- */
  const stage = $('.hero-stage');
  if (stage && fine && !reduce) {
    const imgs = $$('img', stage);
    $('.hero').addEventListener('pointermove', (e) => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      imgs.forEach((im, i) => { const d = (i + 1) * 10; im.style.transform = `translate(${x * d}px, ${y * d}px) rotate(${i === 1 ? -8 + x * 4 : x * 4}deg)`; });
    });
  }

  /* ----- Boutique : filtres + quiz ----- */
  const filt = $('#filters');
  if (filt) pillTabs(filt, (f) => {
    $$('#shop .pcard').forEach((c) => {
      const show = f === 'all' || c.dataset.cat === f;
      if (show && c.classList.contains('is-out')) { c.classList.remove('is-out'); c.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.22,1,.36,1)' }); }
      else if (!show) c.classList.add('is-out');
    });
  });

  const quiz = $('#quiz');
  if (quiz) {
    const QUIZ = [
      { q: 'Pour qui est cette bougie ?', a: [['Pour moi', { lav: 1, aut: 1, tulip: 1 }], ['Pour offrir', { box: 3, tulip: 1 }], ['Pour un événement', { box: 1, tulip: 1, custom: 3 }]] },
      { q: 'Quelle ambiance vous fait envie ?', a: [['Douceur gourmande', { aut: 3, lav: 1, box: 1 }], ['Bouquet floral', { tulip: 3, lav: 1 }], ['Cocon chaleureux', { aut: 3, lav: 1 }], ['Calme & détente', { lav: 3, tulip: 1 }]] },
      { q: 'À quel moment l’allumerez-vous ?', a: [['Une soirée cosy', { aut: 2, lav: 1 }], ['Un matin lumineux', { tulip: 2, lav: 1 }], ['Un moment pour soi', { lav: 2, aut: 1 }], ['Pour décorer', { tulip: 2, box: 1 }]] },
    ];
    let step = 0, score = {};
    const body = $('.quiz-body', quiz), bars = $$('.quiz-steps i', quiz);
    const render = () => {
      bars.forEach((b, i) => b.classList.toggle('on', i <= step));
      if (step < QUIZ.length) {
        const q = QUIZ[step];
        body.innerHTML = `<p class="eyebrow">Question ${step + 1} sur ${QUIZ.length}</p><p class="quiz-q">${q.q}</p><div class="quiz-a">${q.a.map((a, i) => `<button data-a="${i}">${a[0]}</button>`).join('')}</div>`;
      } else {
        const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
        if (best === 'custom') {
          body.innerHTML = `<div class="quiz-res"><img src="img/cut-marsh.webp" alt=""><div><p class="eyebrow">Notre conseil</p><p class="quiz-q">Une création sur mesure</p><p class="muted" style="margin-bottom:22px">Pour un mariage, un baptême ou un anniversaire, nous imaginons des bougies à vos couleurs.</p><div class="row"><a class="btn btn--fg" href="creer.html#sur-mesure"><span>Faire une demande</span></a><button class="btn btn--ghost" data-restart><span>Recommencer</span></button></div></div></div>`;
        } else {
          const p = PRODUCTS[best];
          body.innerHTML = `<div class="quiz-res"><img src="${p.cut}" alt="${esc(p.full)}"><div><p class="eyebrow">Votre bougie</p><p class="quiz-q">${p.name}</p><p class="muted" style="margin-bottom:22px">${p.desc}</p><div class="row"><a class="btn btn--fg" href="produit.html?p=${best}"><span>Découvrir · ${chf(p.price)}</span></a><button class="btn btn--ghost" data-restart><span>Recommencer</span></button></div></div></div>`;
        }
      }
    };
    quiz.addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]');
      if (a) {
        Object.entries(QUIZ[step].a[+a.dataset.a][1]).forEach(([k, v]) => { score[k] = (score[k] || 0) + v; });
        step++;
        if (reduce) render(); else { body.classList.add('is-out'); setTimeout(() => { render(); body.classList.remove('is-out'); }, 280); }
      }
      if (e.target.closest('[data-restart]')) { step = 0; score = {}; render(); }
    });
    render();
  }

  /* ----- Fiche produit ----- */
  const pp = $('#pp');
  if (pp) {
    const key = new URLSearchParams(location.search).get('p');
    const p = PRODUCTS[key] || PRODUCTS.lav, k = PRODUCTS[key] ? key : 'lav';
    document.title = p.full + ' — Yumiya Candle';
    document.body.dataset.theme = p.theme; theme = p.theme;
    pp.dataset.theme = p.theme;
    let color = 0, qty = 1;
    const gallery = [p.cut, ...p.imgs];
    pp.innerHTML = `<div class="container pp-grid">
      <div class="pp-gallery">
        <div class="pp-main" style="background:${p.tint}"><img id="pp-img" src="${p.colors ? p.colors[0].img : p.cut}" alt="${esc(p.full)}"></div>
        <div class="thumbs" role="group" aria-label="Photos">${gallery.map((src, i) => `<button class="thumb" aria-pressed="${i === 0}" data-src="${src}" aria-label="Photo ${i + 1}"><img src="${src}" alt=""></button>`).join('')}</div>
      </div>
      <div class="pp-info">
        <a href="boutique.html" class="link-arrow" style="opacity:.7">← Toutes les bougies</a>
        <p class="pp-line">${p.line} · N° ${p.n}${p.badge ? ' · ' + p.badge : ''}</p>
        <h1 class="h1" data-split>${p.name}</h1>
        <p class="pp-price price">${p.active ? chf(p.price) : 'Épuisé'}</p>
        <p class="pp-desc">${p.desc}</p>
        ${p.colors ? `<div><p class="opt-label">Coloris <span id="pp-color">${p.colors[0].n}</span></p><div class="swatches">${p.colors.map((c, i) => `<button class="sw" aria-pressed="${i === 0}" data-color="${i}"><i style="--c:${c.c.length > 1 ? `linear-gradient(135deg, ${c.c[0]} 50%, ${c.c[1]} 50%)` : c.c[0]}"></i>${c.n}</button>`).join('')}</div></div>` : ''}
        <div class="row">
          <div class="qty" role="group" aria-label="Quantité"><button data-q="-1" aria-label="Moins">−</button><output id="pp-qty">1</output><button data-q="1" aria-label="Plus">+</button></div>
          <button class="btn btn--fg magnetic" id="pp-add" ${p.active ? '' : 'disabled'}><span>Ajouter au panier</span></button>
        </div>
        <p class="note">Livraison partout en Suisse pour 8.90 CHF, en 5 à 10 jours ouvrables. Paiement par TWINT. Retour possible sous 30 jours.</p>
        <dl class="facts">${[...p.facts, ...COMMON].map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>
      </div></div>`;
    const img = $('#pp-img');
    const swap = (src) => {
      if (img.getAttribute('src') === src) return;
      img.classList.add('is-swap');
      setTimeout(() => { img.src = src; img.classList.toggle('photo', !src.includes('cut-') && !src.includes('tulip-hq')); img.classList.remove('is-swap'); }, 220);
    };
    pp.addEventListener('click', (e) => {
      const t = e.target.closest('.thumb');
      if (t) { $$('.thumb', pp).forEach((x) => x.setAttribute('aria-pressed', String(x === t))); swap(t.dataset.src); }
      const c = e.target.closest('[data-color]');
      if (c) { color = +c.dataset.color; $$('[data-color]', pp).forEach((x) => x.setAttribute('aria-pressed', String(x === c))); $('#pp-color').textContent = p.colors[color].n; swap(p.colors[color].img); }
      const q = e.target.closest('[data-q]');
      if (q) { qty = clamp(qty + +q.dataset.q, 1, 20); $('#pp-qty').textContent = qty; }
      if (e.target.closest('#pp-add')) addProduct(k, { color, qty }, e.target.closest('#pp-add'));
    });
    const others = Object.keys(PRODUCTS).filter((x) => x !== k);
    const rel = $('#related'); if (rel) { rel.innerHTML = others.map(card).join(''); observe(rel); }
    // re-découpe du titre inséré
    $$('#pp [data-split]').forEach((el) => { let c = 0; el.innerHTML = el.textContent.split(/(\s+)/).map((part) => /^\s+$/.test(part) ? ' ' : `<span class="word">${[...part].map((ch) => `<span class="char" style="--c:${c++}">${esc(ch)}</span>`).join('')}</span>`).join(''); });
  }

  /* ----- Créer : composer sa bougie ----- */
  const cfgEl = $('#cfg');
  if (cfgEl) {
    const PAL = [['#F2ECE3', 'Crème'], ['#F3DFA2', 'Vanille'], ['#B596DC', 'Lavande'], ['#E8A0B4', 'Rose'], ['#D6303D', 'Framboise'], ['#EA7F1E', 'Abricot'], ['#A8C686', 'Pistache'], ['#9CC7E6', 'Ciel'], ['#6B3B6E', 'Prune'], ['#7A4B32', 'Chocolat']];
    const OPT = {
      type: [['lav', 'Lavande', 'Notre gourmande signature'], ['aut', 'Automne', 'Pomme, chantilly, décor'], ['gourmande', 'Gourmande sur mesure', 'Vos couleurs, votre décor'], ['tulipe', 'Tulipe', 'Bouquet de tulipes en cire'], ['coffret', 'Coffret Yumiya', 'Deux bougies, un écrin']],
      boxG: [['lav', 'Lavande', 'Lavande · Crème'], ['aut', 'Automne', 'Pomme · Crème'], ['marsh', 'Marshmallow-framboise', 'Notre classique du coffret']],
      size: [['petite', 'Petite', '90 g · ~12 h'], ['grande', 'Grande', '180 g · ~18 h']],
      topping: [['fouettee', 'Fouettée'], ['spirale', 'Spirale']],
      decos: [['coeurs', 'Cœurs'], ['tablette', 'Tablette'], ['papillons', 'Papillons'], ['fleurs', 'Fleurs'], ['etoiles', 'Étoiles'], ['perles', 'Perles nacrées']],
      qty: [['peu', 'Discret'], ['normal', 'Normal'], ['beaucoup', 'Généreux', '+1.50 CHF']],
      scent: [['Lavande'], ['Vanille'], ['Fraise'], ['Pomme'], ['Rose'], ['Violette'], ['Sans parfum']],
    };
    const CFG = { type: 'gourmande', size: 'petite', n: 2, layers: ['#F2ECE3', '#B596DC'], topping: 'fouettee', decos: ['coeurs'], deco: '#D6303D', qty: 'normal', tulip: 0, scent: 'Lavande', boxG: 'marsh' };
    const lbl = (k, v) => (OPT[k].find((o) => o[0] === v) || [v, v])[1];
    const colName = (c) => (PAL.find((x) => x[0] === c) || [c, c])[1];
    const extra = () => (CFG.type !== 'gourmande' ? 0 : Math.max(0, CFG.decos.length - 2) * .5 + (CFG.qty === 'beaucoup' ? 1.5 : 0));
    const price = () => CFG.type === 'gourmande' ? (CFG.size === 'grande' ? 12 : 10) + extra() : CFG.type === 'coffret' ? PRODUCTS.box.price : CFG.type === 'tulipe' ? PRODUCTS.tulip.price : PRODUCTS[CFG.type].price;
    const summary = () => {
      const L = [];
      if (CFG.type === 'lav' || CFG.type === 'aut') L.push(['Modèle', lbl('type', CFG.type)]);
      else if (CFG.type === 'coffret') L.push(['Modèle', 'Coffret Yumiya'], ['Dans le coffret', lbl('boxG', CFG.boxG) + ' + Tulipe ' + PRODUCTS.tulip.colors[CFG.tulip].n]);
      else if (CFG.type === 'tulipe') L.push(['Modèle', 'Tulipe'], ['Coloris', PRODUCTS.tulip.colors[CFG.tulip].n]);
      else L.push(['Modèle', 'Gourmande sur mesure · ' + lbl('size', CFG.size)], ['Cire', CFG.layers.slice(0, CFG.n).map(colName).join(' / ')], ['Chantilly', lbl('topping', CFG.topping)], ['Décor', CFG.decos.length ? CFG.decos.map((d) => lbl('decos', d)).join(', ') + ' · ' + colName(CFG.deco) + ' · ' + lbl('qty', CFG.qty) : 'Aucun'], ['Mèche', 'Coton']);
      if (CFG.type === 'gourmande' || CFG.type === 'tulipe') L.push(['Senteur', CFG.scent]);
      else if (CFG.type === 'lav' || CFG.type === 'aut') L.push(['Senteur', CFG.type === 'lav' ? 'Lavande' : 'Pomme']);
      if (extra()) L.push(['Suppléments', '+' + chf(extra())]);
      return L;
    };

    // Dessin de la bougie gourmande (SVG)
    function deco(type, x, y, c, s = 1) {
      const t = `translate(${x} ${y}) scale(${s})`;
      switch (type) {
        case 'coeurs': return `<path transform="${t}" d="M0 4C-6-2-10 2-7 6L0 12L7 6C10 2 6-2 0 4Z" fill="${c}"/>`;
        case 'tablette': return `<g transform="${t} rotate(-12)"><rect x="-9" y="-6" width="18" height="12" rx="2" fill="${c}"/><path d="M-3-6v12M3-6v12M-9 0h18" stroke="rgba(0,0,0,.18)" stroke-width="1"/></g>`;
        case 'papillons': return `<g transform="${t}"><ellipse cx="-5" cy="0" rx="5" ry="7" fill="${c}"/><ellipse cx="5" cy="0" rx="5" ry="7" fill="${c}"/><rect x="-1" y="-6" width="2" height="12" rx="1" fill="rgba(0,0,0,.35)"/></g>`;
        case 'fleurs': return `<g transform="${t}">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${Math.cos(a * Math.PI / 180) * 5}" cy="${Math.sin(a * Math.PI / 180) * 5}" r="4" fill="${c}"/>`).join('')}<circle r="3" fill="#F3DFA2"/></g>`;
        case 'etoiles': return `<path transform="${t}" d="M0-8 2.4-2.5 8-2.5 3.5 1 5.2 7 0 3.6-5.2 7-3.5 1-8-2.5-2.4-2.5Z" fill="${c}"/>`;
        default: return `<g transform="${t}"><circle r="3.6" fill="#fffaf2"/><circle cx="-1" cy="-1" r="1.2" fill="#fff"/></g>`;
      }
    }
    function candle() {
      const big = CFG.size === 'grande', W = big ? 132 : 120, H = big ? 178 : 160, x0 = 100 - W / 2, yb = 238, yt = yb - H;
      const inner = H - 12, fill = .64 * inner, L = CFG.layers.slice(0, CFG.n), lh = fill / L.length;
      let svg = `<svg viewBox="0 0 200 260" role="img" aria-label="Aperçu de votre bougie"><defs><clipPath id="jar"><rect x="${x0 + 5}" y="${yt + 6}" width="${W - 10}" height="${H - 10}" rx="12"/></clipPath>
        <radialGradient id="fl" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fffbe0"/><stop offset=".55" stop-color="#ffd166"/><stop offset="1" stop-color="#ff8a3d"/></radialGradient></defs>
        <ellipse cx="100" cy="${yb + 6}" rx="${W / 2 + 6}" ry="6" fill="rgba(36,18,31,.15)"/><g clip-path="url(#jar)">`;
      L.forEach((c, i) => { svg += `<rect x="${x0}" y="${yb - 4 - lh * (i + 1)}" width="${W}" height="${lh + 1}" fill="${c}"/>`; });
      const ct = yb - 4 - fill; // haut de la cire
      if (CFG.topping === 'fouettee') {
        svg += `<rect x="${x0}" y="${ct - 6}" width="${W}" height="12" fill="#fbf6ee"/>`;
        for (let i = 0; i < 7; i++) svg += `<circle cx="${x0 + 10 + i * (W - 20) / 6}" cy="${ct - 6}" r="11" fill="#fdf9f2"/>`;
        for (let i = 0; i < 5; i++) svg += `<circle cx="${x0 + 22 + i * (W - 44) / 4}" cy="${ct - 18}" r="10" fill="#fffdf8"/>`;
      } else {
        svg += `<rect x="${x0}" y="${ct - 4}" width="${W}" height="8" fill="#fbf6ee"/>`;
        [[W / 2 - 4, 0], [W / 2 - 14, -10], [W / 2 - 24, -19], [W / 2 - 34, -27]].forEach(([rx, dy]) => { svg += `<ellipse cx="100" cy="${ct - 6 + dy}" rx="${rx}" ry="8" fill="#fdf9f2" stroke="rgba(0,0,0,.05)"/>`; });
      }
      svg += `</g>`;
      // mèche + flamme
      const top = ct - (CFG.topping === 'fouettee' ? 26 : 38);
      svg += `<path d="M100 ${top + 6}v-14" stroke="#3a2a2f" stroke-width="2" stroke-linecap="round"/><path class="flame" d="M100 ${top - 34}c6 9 10 15 10 22a10 10 0 0 1-20 0c0-7 4-13 10-22Z" fill="url(#fl)"/>`;
      // décors
      const n = { peu: 2, normal: 3, beaucoup: 5 }[CFG.qty];
      const spots = [[-32, 2], [30, 0], [-12, -10], [16, -12], [0, 4], [-44, 8], [44, 6]];
      CFG.decos.forEach((d, j) => { for (let i = 0; i < n; i++) { const [dx, dy] = spots[(i * 2 + j * 3) % spots.length]; svg += deco(d, 100 + dx * (W / 120), ct - 10 + dy + (CFG.topping === 'fouettee' ? -6 : -10), d === 'perles' ? '#fff' : CFG.deco, .9); } });
      // verre + étiquette
      svg += `<rect x="${x0}" y="${yt}" width="${W}" height="${H}" rx="16" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.95)" stroke-width="2.5"/>
        <rect x="${x0 + 8}" y="${yt + 14}" width="6" height="${H - 40}" rx="3" fill="rgba(255,255,255,.6)"/>
        <circle cx="100" cy="${yb - fill * .45}" r="22" fill="none" stroke="#2c2228" stroke-width="1.1"/>
        <text x="100" y="${yb - fill * .45 - 4}" text-anchor="middle" font-family="Instrument Serif, serif" font-size="7.5" fill="#2c2228">Yumiya Candle</text>
        <text x="100" y="${yb - fill * .45 + 9}" text-anchor="middle" font-family="Inter Tight, sans-serif" font-size="4.5" letter-spacing="1" fill="#2c2228">HANDMADE</text></svg>`;
      return svg;
    }

    const group = (key, label, value, html) => `<div class="cfg-group"><p>${label}${value ? `<span>${value}</span>` : ''}</p>${html}</div>`;
    const opts = (k, isOn, attr = k) => `<div class="opts">${OPT[k].map((o) => `<button class="opt" aria-pressed="${isOn(o[0])}" data-${attr}="${o[0]}">${o[1] || o[0]}${o[2] ? `<small>${o[2]}</small>` : ''}</button>`).join('')}</div>`;
    const colors = (attr, isOn) => `<div class="colors">${PAL.map(([c, n]) => `<button class="color" style="--c:${c}" aria-pressed="${isOn(c)}" data-${attr}="${c}" aria-label="${n}" title="${n}"></button>`).join('')}</div>`;

    function render() {
      const form = $('#cfg-form'), prev = $('#cfg-preview');
      let h = group('type', 'Modèle', '', opts('type', (v) => v === CFG.type));
      if (CFG.type === 'gourmande') {
        h += group('size', 'Taille', '', opts('size', (v) => v === CFG.size));
        h += group('n', 'Couches de cire', '', `<div class="opts">${[1, 2, 3].map((n) => `<button class="opt" aria-pressed="${CFG.n === n}" data-n="${n}">${n} couche${n > 1 ? 's' : ''}</button>`).join('')}</div>`);
        for (let i = CFG.n - 1; i >= 0; i--) h += `<div class="layer-row"><span>Couche ${CFG.n - i === 1 ? 'du haut' : CFG.n - i === CFG.n ? 'du bas' : 'du milieu'} · ${colName(CFG.layers[i])}</span>${colors('layer-' + i, (c) => c === CFG.layers[i])}</div>`;
        h += group('topping', 'Chantilly', '', opts('topping', (v) => v === CFG.topping));
        h += group('decos', 'Décors', '2 inclus, +0.50 CHF par décor en plus', opts('decos', (v) => CFG.decos.includes(v)));
        h += group('deco', 'Couleur des décors', colName(CFG.deco), colors('deco', (c) => c === CFG.deco));
        h += group('qty', 'Quantité de décors', '', opts('qty', (v) => v === CFG.qty));
        h += group('scent', 'Senteur', '', opts('scent', (v) => v === CFG.scent));
      } else if (CFG.type === 'tulipe' || CFG.type === 'coffret') {
        if (CFG.type === 'coffret') h += group('boxG', 'Bougie gourmande du coffret', '', opts('boxG', (v) => v === CFG.boxG));
        h += group('tulip', 'Coloris de la tulipe', '', `<div class="swatches">${PRODUCTS.tulip.colors.map((c, i) => `<button class="sw" aria-pressed="${CFG.tulip === i}" data-tulip="${i}"><i style="--c:${c.c.length > 1 ? `linear-gradient(135deg, ${c.c[0]} 50%, ${c.c[1]} 50%)` : c.c[0]}"></i>${c.n}</button>`).join('')}</div>`);
        if (CFG.type === 'tulipe') h += group('scent', 'Senteur', '', opts('scent', (v) => v === CFG.scent));
      }
      h += `<div class="cfg-summary">${summary().map(([a, b]) => `<span><em>${a}</em> — ${esc(b)}</span>`).join('')}</div>
        <button class="btn btn--fg btn--block magnetic" id="cfg-add"><span>Ajouter au panier · ${chf(price())}</span></button>`;
      form.innerHTML = h;
      const art = CFG.type === 'gourmande' ? candle()
        : CFG.type === 'tulipe' ? `<img src="${PRODUCTS.tulip.colors[CFG.tulip].img}" alt="Bougie tulipe">`
        : CFG.type === 'coffret' ? `<img src="img/cut-box2.webp" alt="Coffret Yumiya">`
        : `<img src="${PRODUCTS[CFG.type].cut}" alt="${PRODUCTS[CFG.type].full}">`;
      prev.innerHTML = art + `<span class="cfg-price">${chf(price())}</span>`;
    }
    $('#cfg-form').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const d = b.dataset;
      if (d.type) { CFG.type = d.type; if (d.type === 'gourmande' && !CFG.scent) CFG.scent = 'Lavande'; }
      else if (d.size) CFG.size = d.size;
      else if (d.n) { CFG.n = +d.n; while (CFG.layers.length < CFG.n) CFG.layers.push(PAL[CFG.layers.length + 2][0]); }
      else if (d.topping) CFG.topping = d.topping;
      else if (d.decos) { const i = CFG.decos.indexOf(d.decos); i >= 0 ? CFG.decos.splice(i, 1) : CFG.decos.push(d.decos); }
      else if (d.deco) CFG.deco = d.deco;
      else if (d.qty) CFG.qty = d.qty;
      else if (d.scent) CFG.scent = d.scent;
      else if (d.boxG) CFG.boxG = d.boxG;
      else if (d.tulip) CFG.tulip = +d.tulip;
      else { const lay = Object.keys(d).find((x) => x.startsWith('layer-')); if (lay) CFG.layers[+lay.split('-')[1]] = d[lay]; }
      if (b.id === 'cfg-add') {
        const s = summary(), name = CFG.type === 'gourmande' ? 'Gourmande sur mesure' : CFG.type === 'coffret' ? 'Coffret Yumiya' : CFG.type === 'tulipe' ? 'Tulipe' : PRODUCTS[CFG.type].name;
        const label = s.map(([, v], i) => (i === 0 ? v.replace(name, '').replace(/^ · /, '') : v)).filter(Boolean).join(' · ');
        const img = CFG.type === 'gourmande' ? 'img/cut-marsh.webp' : CFG.type === 'tulipe' ? PRODUCTS.tulip.colors[CFG.tulip].img : CFG.type === 'coffret' ? 'img/cut-box2.webp' : PRODUCTS[CFG.type].cut;
        addItem({ id: 'cfg-' + name + '-' + label, key: CFG.type, name, label, price: price(), img, tint: '#f3ebe2' }, b);
        return;
      }
      const y = scrollY; render(); scrollTo(0, y);
    });
    render();

    // Demande sur mesure
    const bsp = $('#bsp-form');
    bsp.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!check([['b-name', (x) => x.length > 1], ['b-email', EMAIL], ['b-msg', (x) => x.length > 5]])) return;
      const v = (id) => $('#' + id).value.trim();
      const data = { _subject: 'Demande sur mesure — ' + v('b-name'), nom: v('b-name'), email: v('b-email'), _replyto: v('b-email'), occasion: v('b-occ'), quantite: v('b-qty'), date: v('b-date'), message: v('b-msg') };
      const msg = $('#bsp-msg'), btn = $('button[type=submit]', bsp);
      btn.disabled = true; msg.textContent = 'Envoi en cours…';
      sendForm(data).then((ok) => {
        btn.disabled = false;
        if (ok) { msg.textContent = 'Merci ! Votre demande est bien arrivée, nous vous répondons par email très vite.'; bsp.reset(); }
        else msg.innerHTML = `L’envoi automatique n’a pas fonctionné. <a class="link-arrow" href="${mailtoFor(data._subject, data)}">Envoyer la demande par email <span>→</span></a>`;
      });
    });
  }

  /* ----- Nouveautés : alerte ----- */
  const alertForm = $('#alert-form');
  if (alertForm) alertForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!check([['a-email', EMAIL]])) return;
    const em = $('#a-email').value.trim(), msg = $('#alert-msg');
    msg.textContent = 'Inscription en cours…';
    sendForm({ _subject: 'Alerte nouveautés — ' + em, email: em, _replyto: em, demande: 'Prévenir à la sortie des nouveautés' }).then((ok) => {
      msg.innerHTML = ok ? 'C’est noté ! Nous vous écrivons dès la sortie.' : `L’inscription n’a pas pu partir. <a class="link-arrow" href="mailto:${SITE.email}?subject=${encodeURIComponent('Alerte nouveautés')}">Écrivez-nous <span>→</span></a>`;
      if (ok) alertForm.reset();
    });
  });

  /* ----- Commande ----- */
  let order = null;
  function renderSummary() {
    const box = $('#co-summary'); if (!box) return;
    const items = order ? order._items : cart, total = items.reduce((s, i) => s + i.price * i.qty, 0);
    box.innerHTML = items.length ? `<ul class="sum-list">${items.map((i) => `<li class="sum-item"><img src="${i.img}" alt=""><div><b>${esc(i.name)}</b> × ${i.qty}${i.label ? `<small>${esc(i.label)}</small>` : ''}</div><span class="price">${chf(i.price * i.qty)}</span></li>`).join('')}</ul>
      <div class="sum-row"><span>Sous-total</span><span class="price">${chf(total)}</span></div>
      <div class="sum-row"><span>Livraison (Suisse)</span><span class="price">${chf(SITE.shipping)}</span></div>
      <div class="sum-row total"><span>Total</span><span class="price">${chf(total + SITE.shipping)}</span></div>`
      : `<p class="muted">Votre panier est vide.</p><a class="btn btn--fg" style="margin-top:16px" href="boutique.html"><span>Voir les bougies</span></a>`;
    const f = $('#co-form'); if (f && !order) { f.hidden = !cart.length; $('#co-empty').hidden = !!cart.length; }
  }
  const coForm = $('#co-form');
  if (coForm) {
    renderSummary();
    coForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!check([['o-fn', (x) => x.length > 0], ['o-ln', (x) => x.length > 0], ['o-ad', (x) => x.length > 3], ['o-npa', (x) => /^\d{4}$/.test(x)], ['o-city', (x) => x.length > 1], ['o-em', EMAIL], ['o-ph', (x) => x.replace(/\D/g, '').length >= 9]])) return;
      const v = (id) => $('#' + id).value.trim();
      const total = cartTotal() + SITE.shipping;
      const lignes = cart.map((i) => i.name + (i.label ? ' (' + i.label + ')' : '') + ' ×' + i.qty + ' ' + chf(i.price * i.qty)); lignes.push('Frais de livraison ' + chf(SITE.shipping));
      order = { reference: 'YC-' + Date.now().toString(36).slice(-5).toUpperCase(), prenom: v('o-fn'), nom: v('o-ln'), email: v('o-em'), telephone: v('o-ph'), adresse: v('o-ad'), npa: v('o-npa'), ville: v('o-city'),
        commande: lignes.join(' | '), message_cadeau: v('o-note'), montant: chf(total), langue: 'FR', date: new Date().toLocaleString('fr-CH'),
        articles: JSON.stringify(cart.map((i) => ({ key: i.key, nom: i.name, qte: i.qty, prix: i.price }))), statut: 'Nouvelle', _items: cart.slice(), _total: total, _sent: false };
      const amt = total.toFixed(2);
      $('#co-step1').hidden = true; $('#co-step2').hidden = false;
      $$('.co-steps i').forEach((x, i) => x.classList.toggle('on', i < 2));
      $('#pay-amount').textContent = chf(total); $('#pay-ref').textContent = order.reference;
      $('#pay-twint').href = SITE.twint + '&amount=' + amt + '&trxInfo=' + encodeURIComponent(order.reference);
      scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
    $('#co-back').addEventListener('click', () => { order = null; $('#co-step1').hidden = false; $('#co-step2').hidden = true; $$('.co-steps i').forEach((x, i) => x.classList.toggle('on', i < 1)); renderSummary(); });
    $('#pay-twint').addEventListener('click', () => {
      if (!order || order._sent) return;
      order._sent = true;
      $('#pay-ok').hidden = false; $$('.co-steps i').forEach((x) => x.classList.add('on'));
      const subj = 'À VÉRIFIER — paiement TWINT — ' + order.reference + ' — ' + order.prenom + ' ' + order.nom + ' — ' + order.montant;
      const data = Object.assign({}, order, { moyen: 'TWINT', statut: 'En attente de paiement' });
      ['_items', '_total', '_sent'].forEach((k) => delete data[k]);
      sendConfirmation(order);
      sendForm(Object.assign({ _subject: subj }, data, { _replyto: order.email })).then((ok) => {
        if (!ok) { const w = $('#pay-warn'); w.hidden = false; w.innerHTML = `<b>Envoi automatique impossible</b><span>Votre commande n’a pas pu nous être transmise automatiquement. Envoyez-nous le récapitulatif (déjà rédigé) en un clic.</span><a class="btn btn--fg" href="${mailtoFor(subj, data)}"><span>Envoyer par email</span></a>`; }
      });
      cart = []; save('yumiya-cart', cart); renderCart();
    });
  }
  // Email de confirmation au client (EmailJS, comme le site actuel)
  function sendConfirmation(o) {
    const E = SITE.emailjs; if (!E.publicKey) return;
    const rows = o._items.map((i) => `<tr><td style="padding:10px 0;border-bottom:1px solid #eee">${esc(i.name)}${i.label ? ' <span style="color:#857">· ' + esc(i.label) + '</span>' : ''} × ${i.qty}</td><td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${chf(i.price * i.qty)}</td></tr>`).join('');
    const twint = SITE.twint + '&amount=' + o._total.toFixed(2) + '&trxInfo=' + encodeURIComponent(o.reference);
    const params = {
      to_email: o.email, to_name: o.prenom, reply_to: SITE.email, reference: o.reference, subject: 'Votre commande Yumiya Candle ' + o.reference, title: 'Commande reçue, ' + o.prenom,
      intro: 'Votre commande est en attente de paiement. Nous vérifions la réception de votre paiement, puis nous vous écrivons pour la confirmer et préparons vos bougies à la main.',
      items_html: rows, shipping: chf(SITE.shipping), total: chf(o._total), label_shipping: 'Livraison (Suisse)', label_total: 'Total', label_ref: 'Référence',
      address: `${esc(o.prenom)} ${esc(o.nom)}<br>${esc(o.adresse)}<br>${esc(o.npa)} ${esc(o.ville)}`, label_address: 'Adresse de livraison',
      gift: o.message_cadeau ? `<p style="margin:0 0 6px;color:#857;font-size:13px">Message cadeau</p><p style="margin:0 0 24px;font-style:italic">« ${esc(o.message_cadeau)} »</p>` : '',
      pay_title: 'Pas encore payé ?', pay_text: 'Sans paiement, la commande n’est pas envoyée. Réglez ' + chf(o._total) + ' par TWINT, avec la référence ' + o.reference + '.',
      twint_url: twint, sumup_url: '', label_twint: 'Payer avec TWINT', label_card: 'Payer par carte',
      eta: 'Livraison prévue 5 à 10 jours ouvrables après réception du paiement.', outro: 'Une question ? Répondez simplement à cet email.',
    };
    fetch('https://api.emailjs.com/api/v1.0/email/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ service_id: E.serviceId, template_id: E.templateId, user_id: E.publicKey, template_params: params }) }).catch(() => {});
  }
  $$('[data-copy]').forEach((b) => b.addEventListener('click', () => {
    const txt = $(b.dataset.copy).textContent.replace(' CHF', '');
    const done = (ok) => toast(ok ? 'Copié : ' + txt : txt);
    navigator.clipboard ? navigator.clipboard.writeText(txt).then(() => done(true), () => done(false)) : done(false);
  }));

  renderCart();
  onScroll();
})();
