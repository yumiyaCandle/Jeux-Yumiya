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

  // Chaque nouvelle page s'ouvre en haut (sauf lien vers une ancre précise)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const toTop = () => { if (!location.hash) scrollTo(0, 0); else { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); } };
  toTop(); addEventListener('load', () => { toTop(); setTimeout(toTop, 60); });
  addEventListener('pageshow', (e) => { if (e.persisted) toTop(); });

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
    const blobs = [[217, 185, 138, .5, .42, .42, .13, .17, 0], [116, 32, 58, .2, .3, .5, .11, .09, 2], [90, 21, 38, .82, .7, .5, .07, .15, 4], [176, 138, 82, .7, .25, .32, .16, .12, 1], [244, 233, 220, .45, .55, .18, .1, .14, 3]];
    let vis = true, mx = .5, my = .5, tx = .5, ty = .5;
    const size = () => { cv.width = Math.max(1, Math.round(cv.offsetWidth / 6)); cv.height = Math.max(1, Math.round(cv.offsetHeight / 6)); };
    size(); addEventListener('resize', size);
    cv.parentElement.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; });
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; }).observe(cv);
    const draw = (t) => {
      if (vis) {
        const w = cv.width, h = cv.height, s = t / 1000; mx = lerp(mx, tx, .04); my = lerp(my, ty, .04);
        ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#140d0b'; ctx.fillRect(0, 0, w, h);
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
    updateHome();
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

  /* ----- Accueil : bougie du héros et vitrine façon Ciao ----- */
  const heroCandle = $('.hero-candle img'), sides = $$('.hero-side');
  const show = $('#vitrine');
  const SHOW = [
    { bg: '#e4dbef', bits: ['sprig', 'heart', 'sprig', 'choco', 'heart', 'sprig'], c: ['#9b7cc8', '#b596dc', '#7a5aa6'] },
    { bg: '#f2dcc6', bits: ['apple', 'leaf', 'apple', 'leaf', 'dollop', 'leaf'], c: ['#ea7f1e', '#c8561c', '#d9a35a'] },
    { bg: '#f3dcdd', bits: ['tulip', 'petal', 'leaf', 'tulip', 'petal', 'petal'], c: ['#e07c8c', '#c94a61', '#8b5bb5'] },
    { bg: '#efe6da', bits: ['bow', 'heart', 'star', 'bow', 'heart', 'star'], c: ['#5a1526', '#e07c8c', '#d9b98a'] },
  ];
  // Petits éléments qui flottent autour de la bougie (lavande, pommes, pétales, rubans…)
  const BIT = {
    sprig: (c) => `<svg viewBox="0 0 40 90"><path d="M20 88C20 60 22 40 20 6" stroke="#6f8f4e" stroke-width="2.4" fill="none" stroke-linecap="round"/>${[10, 20, 30, 40, 50].map((y, i) => `<ellipse cx="${i % 2 ? 26 : 14}" cy="${y}" rx="6" ry="9" fill="${c[i % 3]}" transform="rotate(${i % 2 ? 25 : -25} ${i % 2 ? 26 : 14} ${y})"/>`).join('')}</svg>`,
    heart: (c) => `<svg viewBox="0 0 40 36"><path d="M20 10C14-2 0 2 2 14c1 8 10 14 18 20 8-6 17-12 18-20C40 2 26-2 20 10Z" fill="${c[1]}"/><ellipse cx="11" cy="11" rx="4" ry="2.6" fill="#fff" opacity=".5"/></svg>`,
    choco: (c) => `<svg viewBox="0 0 50 40"><rect x="2" y="2" width="46" height="36" rx="5" fill="${c[2]}"/><path d="M17 2v36M33 2v36M2 20h46" stroke="rgba(0,0,0,.18)" stroke-width="2"/><rect x="6" y="6" width="8" height="8" rx="2" fill="#fff" opacity=".25"/></svg>`,
    apple: (c) => `<svg viewBox="0 0 60 64"><path d="M30 16C18 6 2 12 4 32c2 18 14 30 26 28 12 2 24-10 26-28C58 12 42 6 30 16Z" fill="${c[0]}"/><path d="M30 16c0-6 2-10 6-14" stroke="#6b4a2a" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M34 8c8-6 16-2 16 2-6 4-12 4-16-2Z" fill="#7a9a4a"/><ellipse cx="17" cy="28" rx="5" ry="9" fill="#fff" opacity=".28"/></svg>`,
    leaf: (c) => `<svg viewBox="0 0 60 60"><path d="M6 54C6 24 26 6 56 4 54 34 36 54 6 54Z" fill="${c[2]}"/><path d="M8 52C22 38 36 22 52 8" stroke="rgba(0,0,0,.18)" stroke-width="2" fill="none"/></svg>`,
    dollop: () => `<svg viewBox="0 0 60 50"><ellipse cx="30" cy="40" rx="26" ry="9" fill="#e6d9c6"/><circle cx="30" cy="32" r="20" fill="#fdf8f0"/><circle cx="28" cy="18" r="13" fill="#fffdf8"/><circle cx="27" cy="7" r="6" fill="#fff"/></svg>`,
    tulip: (c) => `<svg viewBox="0 0 50 90"><path d="M25 88V40" stroke="#6f9a4e" stroke-width="3" stroke-linecap="round"/><path d="M25 70c-14-4-18-14-16-22 8 2 14 10 16 22Z" fill="#7daa5b"/><path d="M10 14c0 18 6 28 15 28s15-10 15-28c-5 4-8 6-10 2-2-6-3-10-5-14-2 4-3 8-5 14-2 4-5 2-10-2Z" fill="${c[0]}"/><path d="M25 2c-2 4-3 8-5 14 2 2 8 2 10 0-2-6-3-10-5-14Z" fill="${c[1]}"/></svg>`,
    petal: (c) => `<svg viewBox="0 0 40 50"><path d="M20 2C34 14 38 30 20 48 2 30 6 14 20 2Z" fill="${c[0]}"/><path d="M20 8v34" stroke="rgba(255,255,255,.4)" stroke-width="2"/></svg>`,
    bow: (c) => `<svg viewBox="0 0 80 50"><path d="M40 22C26 4 6 4 6 16s16 20 34 8ZM40 22C54 4 74 4 74 16s-16 20-34 8Z" fill="${c[0]}"/><path d="M36 26 24 48l8-2 6 4 2-22ZM44 26l12 22-8-2-6 4-2-22Z" fill="${c[0]}" opacity=".85"/><rect x="34" y="16" width="12" height="14" rx="4" fill="${c[0]}" stroke="rgba(0,0,0,.2)"/></svg>`,
    star: (c) => `<svg viewBox="0 0 40 40"><path d="M20 2l5 12 13 1-10 8 3 13-11-7-11 7 3-13L2 15l13-1Z" fill="${c[2]}"/></svg>`,
  };
  const SPOTS = [[30, 24, 86, -18], [70, 20, 72, 16], [27, 52, 66, 22], [73, 54, 88, -12], [37, 84, 58, 30], [63, 86, 64, -24]];
  let showIdx = -1;
  function setShow(i) {
    if (i === showIdx) return;
    showIdx = i;
    const f = SHOW[i];
    $('.show-bg', show).style.setProperty('--sbg', f.bg);
    $$('.show-name', show).forEach((el, k) => { el.classList.toggle('on', k === i); el.classList.toggle('out', k < i); });
    $$('.show-candle', show).forEach((el, k) => { el.classList.toggle('on', k === i); el.classList.toggle('out', k < i); });
    $$('.show-info > div', show).forEach((el, k) => el.classList.toggle('on', k === i));
    $$('.show-nav button', show).forEach((el, k) => el.setAttribute('aria-current', String(k === i)));
    const bits = $('.show-bits', show);
    bits.innerHTML = f.bits.map((b, k) => { const [x, y, sz, r] = SPOTS[k]; return `<span class="bit" style="--x:${x}%;--y:${y}%;--s:${sz}px;--r:${r}deg;--dl:${k * 70}ms">${BIT[b](f.c)}</span>`; }).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.bit', bits).forEach((b) => b.classList.add('on'))));
  }
  if (show) {
    setShow(0);
    $$('.show-nav button', show).forEach((b, k) => b.addEventListener('click', () => {
      const top = show.getBoundingClientRect().top + scrollY, span = show.offsetHeight - innerHeight;
      scrollTo({ top: top + span * (k + .5) / SHOW.length, behavior: reduce ? 'auto' : 'smooth' });
    }));
  }
  function updateHome() {
    if (heroCandle && !reduce) {
      const y = Math.min(scrollY, innerHeight);
      heroCandle.style.transform = `translateY(${y * -.18}px) scale(${1 + y * .0004})`;
      sides.forEach((el, k) => { el.style.translate = `0 ${y * (k ? -.4 : -.3)}px`; });
    }
    if (show && !reduce) {
      const r = show.getBoundingClientRect();
      const p = clamp(-r.top / (show.offsetHeight - innerHeight), 0, .999);
      setShow(Math.floor(p * SHOW.length));
    }
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

    // Dessin de la bougie gourmande : verre en volume, couches ombrées, chantilly pochée
    const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.round(clamp(k < 0 ? v * (1 + k) : v + (255 - v) * k, 0, 255)); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
    function deco(type, x, y, c, s = 1) {
      const t = `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`, d = shade(c, -.25), l = shade(c, .45);
      switch (type) {
        case 'coeurs': return `<g transform="${t}"><path d="M0 5C-7-2-12 3-8 8L0 15L8 8C12 3 7-2 0 5Z" fill="${c}" stroke="${d}" stroke-width=".8"/><ellipse cx="-4" cy="3" rx="2.2" ry="1.4" fill="${l}" opacity=".8"/></g>`;
        case 'tablette': return `<g transform="${t} rotate(-14)"><rect x="-10" y="-7" width="20" height="14" rx="2" fill="${d}"/><rect x="-9" y="-6" width="18" height="12" rx="1.6" fill="${c}"/><path d="M-3-6v12M3-6v12M-9 0h18" stroke="${d}" stroke-width="1"/><rect x="-8" y="-5" width="4" height="4" rx="1" fill="${l}" opacity=".7"/></g>`;
        case 'papillons': return `<g transform="${t}"><path d="M0 0C-4-10-14-10-12-2C-11 3-5 3 0 0ZM0 0C4-10 14-10 12-2C11 3 5 3 0 0ZM0 0C-3 5-9 9-9 4C-9 1-4 0 0 0ZM0 0C3 5 9 9 9 4C9 1 4 0 0 0Z" fill="${c}" stroke="${d}" stroke-width=".8"/><rect x="-1" y="-6" width="2" height="11" rx="1" fill="${d}"/></g>`;
        case 'fleurs': return `<g transform="${t}">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="${(Math.cos(a * Math.PI / 180) * 5.5).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 5.5).toFixed(1)}" rx="4.6" ry="3.4" transform="rotate(${a} ${(Math.cos(a * Math.PI / 180) * 5.5).toFixed(1)} ${(Math.sin(a * Math.PI / 180) * 5.5).toFixed(1)})" fill="${c}" stroke="${d}" stroke-width=".6"/>`).join('')}<circle r="3.2" fill="#e9c66a"/><circle cx="-1" cy="-1" r="1.1" fill="#fff3c4"/></g>`;
        case 'etoiles': return `<g transform="${t}"><path d="M0-9 2.6-2.8 9-2.8 3.9 1.1 5.8 7.8 0 3.9-5.8 7.8-3.9 1.1-9-2.8-2.6-2.8Z" fill="${c}" stroke="${d}" stroke-width=".8" stroke-linejoin="round"/><path d="M0-6 1.4-2.4 0-1Z" fill="${l}"/></g>`;
        default: return `<g transform="${t}"><circle r="4.2" fill="url(#pearl)"/></g>`;
      }
    }
    function dollop(x, y, r) {
      return `<g><ellipse cx="${x}" cy="${y + r * .25}" rx="${r * 1.05}" ry="${r * .7}" fill="#e9dfd0"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#cream)"/>
        <circle cx="${x - r * .08}" cy="${y - r * .55}" r="${r * .68}" fill="url(#cream)"/><circle cx="${x - r * .12}" cy="${y - r * 1.02}" r="${r * .36}" fill="url(#cream)"/>
        <path d="M${x - r * .8} ${y - r * .1}q${r * .8} ${r * .5} ${r * 1.6} 0M${x - r * .55} ${y - r * .62}q${r * .55} ${r * .35} ${r * 1.1} 0" stroke="rgba(150,120,95,.25)" stroke-width="1" fill="none"/></g>`;
    }
    function candle() {
      const big = CFG.size === 'grande', W = big ? 156 : 140, H = big ? 196 : 176, cx = 120, rx = W / 2, ry = 13, x0 = cx - rx, x1 = cx + rx, yb = 276, yt = yb - H;
      const wrx = rx - 7, wry = ry - 1.5, wx0 = cx - wrx, wx1 = cx + wrx;
      const F = .6 * (H - 14), L = CFG.layers.slice(0, CFG.n), lh = F / L.length, y0 = yb - 5, ct = y0 - F;
      const band = (yl, yh) => `M${wx0} ${yh}L${wx0} ${yl}A${wrx} ${wry} 0 0 0 ${wx1} ${yl}L${wx1} ${yh}A${wrx} ${wry} 0 0 1 ${wx0} ${yh}Z`;
      let g = `<svg viewBox="0 0 240 300" role="img" aria-label="Aperçu de votre bougie"><defs>
        <linearGradient id="shade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".26"/><stop offset=".22" stop-color="#000" stop-opacity="0"/><stop offset=".42" stop-color="#fff" stop-opacity=".22"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
        <radialGradient id="cream" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#fffefb"/><stop offset=".6" stop-color="#f8f1e6"/><stop offset="1" stop-color="#e6d9c6"/></radialGradient>
        <radialGradient id="pearl" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#f1ebf3"/><stop offset="1" stop-color="#cfc4d4"/></radialGradient>
        <radialGradient id="glow"><stop offset="0" stop-color="#ffd58a" stop-opacity=".7"/><stop offset="1" stop-color="#ffd58a" stop-opacity="0"/></radialGradient>
        <radialGradient id="fl" cx="50%" cy="72%" r="62%"><stop offset="0" stop-color="#fffbe6"/><stop offset=".5" stop-color="#ffd476"/><stop offset="1" stop-color="#ff9a3d"/></radialGradient>
        <linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".12" stop-color="#fff" stop-opacity=".08"/><stop offset=".8" stop-color="#fff" stop-opacity=".04"/><stop offset=".92" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity=".1"/></linearGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
        <clipPath id="lbl"><circle cx="${cx}" cy="${yb - F * .42}" r="27"/></clipPath></defs>
        <ellipse cx="${cx}" cy="${yb + 10}" rx="${rx + 6}" ry="10" fill="rgba(30,21,18,.22)" filter="url(#soft)"/>
        <path d="M${x0} ${yt}L${x0} ${yb}A${rx} ${ry} 0 0 0 ${x1} ${yb}L${x1} ${yt}Z" fill="rgba(255,255,255,.28)"/>
        <ellipse cx="${cx}" cy="${yt}" rx="${rx}" ry="${ry}" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.9)" stroke-width="1.5"/>`;
      L.forEach((c, i) => { const yl = y0 - i * lh, yh = yl - lh - (i < L.length - 1 ? 1 : 0); g += `<path d="${band(yl, yh)}" fill="${c}"/><path d="${band(yl, yh)}" fill="url(#shade)"/>`; });
      g += `<ellipse cx="${cx}" cy="${ct}" rx="${wrx}" ry="${wry}" fill="${shade(L[L.length - 1], .15)}"/>`;
      // chantilly
      let peak;
      if (CFG.topping === 'fouettee') {
        const ring = [...Array(8)].map((_, k) => { const a = k / 8 * Math.PI * 2; return { x: cx + Math.cos(a) * wrx * .74, y: ct + Math.sin(a) * wry * .9 - 4, z: Math.sin(a) }; }).sort((a, b) => a.z - b.z);
        ring.forEach((d) => { g += dollop(d.x, d.y, 15 + d.z * 1.5); });
        g += dollop(cx, ct - 18, 20);
        peak = ct - 18 - 20 * 1.3;
      } else {
        for (let k = 0; k < 5; k++) { const ry2 = 11 - k, rr = wrx * (1 - k * .17), yy = ct - 4 - k * 12; g += `<ellipse cx="${cx}" cy="${yy + 3}" rx="${rr}" ry="${ry2}" fill="#e6d9c6"/><ellipse cx="${cx}" cy="${yy}" rx="${rr}" ry="${ry2}" fill="url(#cream)"/><path d="M${cx - rr * .85} ${yy + 2}q${rr * .85} ${ry2 * 1.1} ${rr * 1.7} 0" stroke="rgba(150,120,95,.22)" fill="none"/>`; }
        g += `<path d="M${cx - 8} ${ct - 52}q8-16 9-6q1 6 7 6z" fill="url(#cream)"/>`;
        peak = ct - 60;
      }
      // décors
      const n = { peu: 2, normal: 3, beaucoup: 5 }[CFG.qty];
      const spots = CFG.topping === 'fouettee' ? [[-44, -14], [42, -10], [-20, -30], [22, -34], [0, -6], [-56, 2], [56, 4], [-4, -46]] : [[-40, -8], [38, -12], [-22, -28], [20, -36], [0, -14], [-30, -44], [10, -52], [48, 0]];
      let k = 0;
      CFG.decos.forEach((d) => { for (let i = 0; i < n; i++) { const [dx, dy] = spots[k++ % spots.length]; g += deco(d, cx + dx * (wrx / 63), ct + dy, d === 'perles' ? '#fff' : CFG.deco, 1.05); } });
      // mèche et flamme
      g += `<circle cx="${cx}" cy="${peak - 30}" r="34" fill="url(#glow)"/><path d="M${cx} ${peak + 4}v-14" stroke="#3a2a2f" stroke-width="2.2" stroke-linecap="round"/><path class="flame" d="M${cx} ${peak - 46}c7 10 11 17 11 24a11 11 0 0 1-22 0c0-7 4-14 11-24Z" fill="url(#fl)"/>`;
      // étiquette (logo) et verre avant
      g += `<image href="img/logo.webp" x="${cx - 27}" y="${yb - F * .42 - 27}" width="54" height="54" clip-path="url(#lbl)" style="mix-blend-mode:multiply" opacity=".92"/>
        <path d="M${x0} ${yt}L${x0} ${yb}A${rx} ${ry} 0 0 0 ${x1} ${yb}L${x1} ${yt}A${rx} ${ry} 0 0 1 ${x0} ${yt}Z" fill="url(#glass)" stroke="rgba(255,255,255,.95)" stroke-width="1.6"/>
        <path d="M${x0} ${yt}A${rx} ${ry} 0 0 0 ${x1} ${yt}" fill="none" stroke="#fff" stroke-width="2.2" opacity=".95"/>
        <path d="M${x0 + 12} ${yt + 22}V${yb - 18}" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5"/><path d="M${x1 - 14} ${yt + 30}V${yb - 40}" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".45"/>
        <ellipse cx="${cx}" cy="${yb}" rx="${rx - 2}" ry="${ry - 2}" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="3"/></svg>`;
      return g;
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
