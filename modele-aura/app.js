/* =========================================================
   AURA — interactions et animations
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Découpage du titre en lettres ---------- */
  $$('[data-split]').forEach((el) => {
    let c = 0;
    $$('.hl', el).forEach((line) => {
      const walk = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.append(' '); return; }
              const w = document.createElement('span');
              w.className = 'word';
              [...part].forEach((ch) => {
                const s = document.createElement('span');
                s.className = 'char'; s.textContent = ch; s.style.setProperty('--c', c++);
                w.append(s);
              });
              frag.append(w);
            });
            n.replaceWith(frag);
          } else walk(n);
        });
      };
      walk(line);
    });
  });

  /* ---------- Intro : compteur 0 → 100 ---------- */
  const loader = $('#loader');
  const start = () => requestAnimationFrame(() => document.body.classList.add('is-ready'));
  if (reduce) { document.documentElement.classList.add('no-loader'); start(); }
  else {
    const count = $('#loader-count');
    const t0 = performance.now(), dur = 1100;
    const tick = (t) => {
      const k = clamp((t - t0) / dur, 0, 1);
      count.textContent = Math.round(100 * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
      else { loader.classList.add('is-done'); setTimeout(start, 250); setTimeout(() => loader.remove(), 1200); }
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Aurore animée (canvas) ---------- */
  const cv = $('#aurora');
  const ctx = cv.getContext('2d');
  const blobs = [
    { c: [91, 61, 245], x: .25, y: .3, r: .55, sx: .13, sy: .17, p: 0 },
    { c: [255, 91, 58], x: .75, y: .35, r: .45, sx: .11, sy: .09, p: 2 },
    { c: [139, 123, 255], x: .55, y: .75, r: .5, sx: .07, sy: .15, p: 4 },
    { c: [216, 246, 92], x: .85, y: .8, r: .28, sx: .16, sy: .12, p: 1 },
    { c: [56, 189, 248], x: .1, y: .8, r: .35, sx: .1, sy: .14, p: 3 },
  ];
  let heroVisible = true, mx = .5, my = .4, tmx = .5, tmy = .4;
  function sizeCanvas() { cv.width = Math.max(1, Math.round(cv.offsetWidth / 6)); cv.height = Math.max(1, Math.round(cv.offsetHeight / 6)); }
  sizeCanvas(); addEventListener('resize', sizeCanvas);
  function drawAurora(t) {
    const w = cv.width, h = cv.height, s = t / 1000;
    mx = lerp(mx, tmx, .04); my = lerp(my, tmy, .04);
    ctx.fillStyle = '#0a0a0f'; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    blobs.forEach((b, i) => {
      const px = (b.x + Math.sin(s * b.sx + b.p) * .18 + (mx - .5) * .12 * (i % 2 ? 1 : -1)) * w;
      const py = (b.y + Math.cos(s * b.sy + b.p) * .16 + (my - .5) * .1) * h;
      const r = b.r * Math.max(w, h);
      const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, `rgba(${b.c},.55)`); g.addColorStop(1, `rgba(${b.c},0)`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    });
    ctx.globalCompositeOperation = 'source-over';
  }
  (function loop(t) {
    if (heroVisible) drawAurora(reduce ? 0 : t);
    if (!reduce) requestAnimationFrame(loop);
  })(0);
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe($('.hero'));

  // Halo lumineux qui suit la souris
  const hero = $('.hero'), spot = $('#spotlight');
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    tmx = (e.clientX - r.left) / r.width; tmy = (e.clientY - r.top) / r.height;
    spot.style.setProperty('--mx', e.clientX - r.left + 'px');
    spot.style.setProperty('--my', e.clientY - r.top + 'px');
  });

  /* ---------- Apparitions au scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => {
    const sib = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    const i = sib.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i, 6) * .08 + 's');
    io.observe(el);
  });
  io.observe($('#wordmark'));

  /* ---------- Compteurs ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      countIO.unobserve(target);
      const end = parseFloat(target.dataset.count), dec = +(target.dataset.decimals || 0), suf = target.dataset.suffix || '';
      const fmt = (v) => v.toFixed(dec).replace('.', ',') + suf;
      if (reduce) { target.textContent = fmt(end); return; }
      const t0 = performance.now(), dur = 1800;
      const step = (t) => {
        const k = clamp((t - t0) / dur, 0, 1);
        target.textContent = fmt(end * (1 - Math.pow(1 - k, 4)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: .5 });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------- Couleur de page qui change selon la section (style Ciao) ---------- */
  const themed = $$('main > section[data-theme], footer[data-theme]');
  let currentTheme = 'dark';
  function updateTheme() {
    const line = innerHeight * .62;
    let theme = currentTheme;
    for (const s of themed) {
      const r = s.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) { theme = s.dataset.theme; break; }
    }
    if (theme !== currentTheme) {
      currentTheme = theme;
      document.body.dataset.theme = theme;
      $('meta[name="theme-color"]').content = getComputedStyle(document.body).getPropertyValue('--bg').trim() || '#0a0a0f';
    }
  }

  /* ---------- Manifeste : mots qui s'allument ---------- */
  const mani = $('#manifesto');
  const HOT = ['ressentir', 'mouvement', 'détail', 'précis'];
  mani.innerHTML = mani.textContent.trim().split(/\s+/).map((w) => `<span class="w${HOT.some((h) => w.toLowerCase().startsWith(h)) ? ' hot' : ''}">${w}</span>`).join(' ');
  const words = $$('.w', mani);
  function updateManifesto() {
    const r = mani.getBoundingClientRect();
    const p = clamp((innerHeight * .85 - r.top) / (r.height + innerHeight * .35), 0, 1);
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('lit', i < n));
  }

  /* ---------- Scroll horizontal (Méthode) ---------- */
  const hs = $('.hscroll'), htrack = $('#htrack');
  function updateHScroll() {
    if (innerWidth <= 980 || reduce) return;
    const r = hs.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight), 0, 1);
    const max = htrack.scrollWidth - innerWidth;
    htrack.style.transform = `translate3d(${-p * max}px,0,0)`;
  }

  /* ---------- Navigation : masquée en descendant, lien actif ---------- */
  const nav = $('#nav'), progress = $('#progress');
  const navLinks = $$('.nav-links a');
  const navTargets = navLinks.map((a) => $(a.getAttribute('href')));
  let lastY = scrollY;
  function updateNav() {
    const y = scrollY;
    if (!document.body.classList.contains('is-locked')) {
      if (y > lastY + 6 && y > 300) nav.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 300) nav.classList.remove('is-hidden');
    }
    lastY = y;
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    let active = -1;
    navTargets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < innerHeight * .4) active = i; });
    navLinks.forEach((a, i) => a.classList.toggle('is-active', i === active));
  }

  let ticking = false;
  function onScroll() {
    updateNav(); updateTheme(); updateManifesto(); updateHScroll();
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Menu mobile ---------- */
  const burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('is-locked', open);
    nav.style.color = open ? '#fff' : '';
    nav.style.background = open ? 'transparent' : '';
    nav.style.boxShadow = open ? 'none' : '';
  }
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('#menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });

  /* ---------- Boutons magnétiques ---------- */
  if (finePointer && !reduce) {
    $$('.magnetic').forEach((btn) => {
      const inner = btn.querySelector('span');
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * .22}px, ${y * .32}px)`;
        if (inner) inner.style.transform = `translate(${x * .1}px, ${y * .12}px)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = ''; if (inner) inner.style.transform = '';
      });
    });
  }

  /* ---------- Cartes inclinables avec reflet ---------- */
  if (finePointer && !reduce) {
    $$('.tilt').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--ry', (px - .5) * 8 + 'deg');
        card.style.setProperty('--rx', (.5 - py) * 8 + 'deg');
        card.style.setProperty('--gx', px * 100 + '%');
        card.style.setProperty('--gy', py * 100 + '%');
      });
      card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---------- Onglets Usages ---------- */
  const TABS = [
    { title: 'Pour les créateurs', desc: 'Présentez votre univers avec une page qui vous ressemble, sans écrire une ligne de code.', list: ['Portfolio en quelques minutes', 'Mise en page éditoriale', 'Lien unique pour vos réseaux'], c: ['#8b7bff', '#ff5b3a', '#d8f65c'], bg: '#f1eef9' },
    { title: 'Pour les équipes', desc: 'Un site que tout le monde peut mettre à jour, avec des sections prêtes à l\'emploi.', list: ['Édition à plusieurs', 'Sections réutilisables', 'Historique des versions'], c: ['#1aa37a', '#38bdf8', '#d8f65c'], bg: '#eaf6f1' },
    { title: 'Pour les entreprises', desc: 'Une image de marque soignée qui inspire confiance dès la première seconde.', list: ['Design sur mesure', 'Performances optimisées', 'Accessibilité garantie'], c: ['#0ea5e9', '#5b3df5', '#c4b5fd'], bg: '#eaf2fb' },
    { title: 'Pour les événements', desc: 'Annoncez, comptez les jours et remplissez la salle avec une page qui donne envie.', list: ['Compte à rebours', 'Programme en onglets', 'Inscriptions simplifiées'], c: ['#ff5b3a', '#e2a400', '#ff9ac1'], bg: '#fdf0ea' },
  ];
  const tabsEl = $('#tabs'), pill = $('.tabs-pill', tabsEl), panel = $('#tab-panel');
  const ptext = $('#panel-text'), part = $('#panel-art');
  let curTab = -1;
  function movePill(el, thumb) { thumb.style.width = el.offsetWidth + 'px'; thumb.style.transform = `translateX(${el.offsetLeft}px)`; }
  function setTab(i, focus) {
    if (i === curTab) return;
    const first = curTab === -1;
    curTab = i;
    const tabs = $$('.tab', tabsEl);
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    movePill(tabs[i], pill);
    if (focus) tabs[i].focus();
    const d = TABS[i];
    const apply = () => {
      $('#panel-title').textContent = d.title;
      $('#panel-desc').textContent = d.desc;
      $('#panel-list').innerHTML = d.list.map((x) => `<li>${x}</li>`).join('');
      $('#panel-big').textContent = String(i + 1).padStart(2, '0');
      ptext.classList.remove('is-out');
      part.classList.remove('is-swap');
    };
    panel.style.setProperty('--p1', d.c[0]); panel.style.setProperty('--p2', d.c[1]); panel.style.setProperty('--p3', d.c[2]);
    part.style.backgroundColor = d.bg;
    if (first || reduce) apply();
    else { ptext.classList.add('is-out'); part.classList.add('is-swap'); setTimeout(apply, 330); }
  }
  tabsEl.addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (t) setTab(+t.dataset.tab); });
  tabsEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); setTab((curTab + 1) % TABS.length, true); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setTab((curTab + TABS.length - 1) % TABS.length, true); }
  });
  setTab(0);

  /* ---------- Tarifs : mensuel / annuel ---------- */
  const bills = $$('.bill'), thumb = $('.bill-thumb');
  function setBill(mode) {
    bills.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.bill === mode)));
    movePill($(`.bill[data-bill="${mode}"]`), thumb);
    $$('.price b').forEach((b) => {
      const from = parseFloat(b.textContent), to = parseFloat(b.dataset[mode]);
      if (reduce || from === to) { b.textContent = to; return; }
      const t0 = performance.now();
      const step = (t) => {
        const k = clamp((t - t0) / 600, 0, 1);
        b.textContent = Math.round(lerp(from, to, 1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  bills.forEach((b) => b.addEventListener('click', () => setBill(b.dataset.bill)));

  const relayout = () => { movePill($$('.tab', tabsEl)[curTab], pill); movePill($('.bill[aria-pressed="true"]'), thumb); };
  addEventListener('resize', relayout);
  if (document.fonts) document.fonts.ready.then(relayout);
  relayout();

  /* ---------- Carrousel : glisser avec élan ---------- */
  const car = $('#carousel');
  let down = false, sx = 0, ss = 0, moved = false, hist = [];
  car.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    down = true; moved = false; sx = e.clientX; ss = car.scrollLeft; hist = [{ x: e.clientX, t: e.timeStamp }];
  });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (!moved && Math.abs(dx) > 6) { moved = true; car.classList.add('is-drag'); }
    if (moved) { car.scrollLeft = ss - dx; hist.push({ x: e.clientX, t: e.timeStamp }); if (hist.length > 5) hist.shift(); }
  });
  addEventListener('pointerup', () => {
    if (!down) return; down = false;
    car.classList.remove('is-drag');
    if (!moved) return;
    const a = hist[0], b = hist[hist.length - 1];
    const v = b.t > a.t ? (b.x - a.x) / (b.t - a.t) * 1000 : 0;
    const d = .998, proj = (v / 1000) * d / (1 - d); // projection d'élan façon iOS
    car.scrollBy({ left: -proj * .35, behavior: reduce ? 'auto' : 'smooth' });
  });
  const stepW = () => car.firstElementChild.getBoundingClientRect().width + 16;
  $('[data-next]').addEventListener('click', () => car.scrollBy({ left: stepW(), behavior: 'smooth' }));
  $('[data-prev]').addEventListener('click', () => car.scrollBy({ left: -stepW(), behavior: 'smooth' }));

  /* ---------- FAQ : ouverture animée, une seule à la fois ---------- */
  const accs = $$('.acc');
  function closeAcc(d) {
    const body = $('.acc-body', d);
    if (reduce) { d.open = false; return; }
    body.animate([{ height: body.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => { d.open = false; };
  }
  accs.forEach((d) => {
    $('summary', d).addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) { closeAcc(d); return; }
      accs.forEach((o) => { if (o !== d && o.open) closeAcc(o); });
      d.open = true;
      if (reduce) return;
      const body = $('.acc-body', d);
      body.animate([{ height: '0px', opacity: 0 }, { height: body.scrollHeight + 'px', opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.22,1,.36,1)' });
    });
  });

  /* ---------- Formulaire de contact ---------- */
  const form = $('#cta-form'), msg = $('#cta-msg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('#cta-email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      form.classList.remove('is-error'); void form.offsetWidth; form.classList.add('is-error');
      msg.textContent = 'Cette adresse ne semble pas valide.';
      return;
    }
    form.classList.remove('is-error');
    msg.textContent = 'Merci ! On vous répond très vite ✦';
    form.reset();
  });

  $('#to-top').addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  $('#year').textContent = new Date().getFullYear();
})();
