/* Outils communs aux tests LIBRE (Playwright + node:assert). */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', 'libre');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.css': 'text/css' };

/* Petit serveur statique (aucune dépendance) servant libre/ */
function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      let p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, path.normalize(p));
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rsp.writeHead(404); return rsp.end('404'); }
      rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(f).pipe(rsp);
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, url: `http://127.0.0.1:${srv.address().port}/` }));
  });
}

/* Simulation fidèle de l’API des plugins natifs (même noms, mêmes paramètres, mêmes réponses).
   Le coffre « LibreVault » simulé conserve son contenu dans sessionStorage (survit aux rechargements)
   et le stocke encodé : le test vérifie ainsi qu’aucune donnée ne reste en clair dans localStorage. */
function nativeMock(opts = {}) {
  return ({ platform, vaultBroken, noVault, vaultBusy, ntDenied }) => {
    const vget = () => JSON.parse(sessionStorage.getItem('__vault') || '{}');
    const vset = o => sessionStorage.setItem('__vault', JSON.stringify(o));
    window.__calls = [];
    const call = (n, a) => window.__calls.push([n, a]);
    window.__sched = [];
    const listeners = {};
    const P = {
      LocalNotifications: {
        checkPermissions: async () => ({ display: ntDenied ? 'denied' : 'granted' }), requestPermissions: async () => ({ display: ntDenied ? 'denied' : 'granted' }),
        getPending: async () => ({ notifications: window.__sched.map(n => ({ id: n.id })) }),
        cancel: async ({ notifications }) => { const ids = notifications.map(n => n.id); window.__sched = window.__sched.filter(n => !ids.includes(n.id)); },
        schedule: async ({ notifications }) => { window.__sched.push(...notifications); return { notifications: notifications.map(n => ({ id: n.id })) }; }
      },
      Filesystem: {
        writeFile: async a => { call('Filesystem.writeFile', { path: a.path, directory: a.directory, size: a.data.length }); window.__lastFile = a; return { uri: 'file:///cache/' + a.path }; },
        deleteFile: async a => { call('Filesystem.deleteFile', a); }
      },
      Share: { share: async a => { call('Share.share', a); return { activityType: 'test' }; } },
      App: { addListener: (ev, fn) => { listeners[ev] = fn; return { remove() {} }; }, minimizeApp: async () => call('App.minimizeApp', {}) }
    };
    if (!noVault) P.LibreVault = {
      isAvailable: async () => ({ available: true }),
      read: async ({ name }) => { if (vaultBusy && sessionStorage.getItem('__busy') !== 'off') { const e = new Error('Coffre momentanément inaccessible'); e.code = 'UNAVAILABLE'; throw e; } if (vaultBroken && name === 'state') throw new Error('KEY_MISSING'); const v = vget()[name]; return { data: v == null ? null : decodeURIComponent(escape(atob(v.slice(4)))) }; },
      write: async ({ name, data }) => { const o = vget(); o[name] = 'ENC:' + btoa(unescape(encodeURIComponent(data))); vset(o); return {}; },
      remove: async ({ name }) => { const o = vget(); delete o[name]; vset(o); return {}; },
      biometricStatus: async () => ({ available: true, kind: 'faceid' }),
      biometricAuth: async () => { call('LibreVault.biometricAuth', {}); if (sessionStorage.getItem('__bioFail')) { const e = new Error('Non reconnu'); e.code = 'CANCELED'; throw e; } return {}; },
      move: async ({ from, to }) => { const o = vget(); if (o[from] != null) { o[to] = o[from]; delete o[from]; } else { o[to] = 'ENC:'; } vset(o); call('LibreVault.move', { from, to }); return {}; }
    };
    window.__fire = (ev, d) => listeners[ev] && listeners[ev](d || {});
    window.Capacitor = { isNativePlatform: () => true, getPlatform: () => platform || 'ios', Plugins: P };
  };
}

async function launch() { return chromium.launch(); }

async function page(browser, base, o = {}) {
  const ctx = await browser.newContext({ viewport: o.viewport || { width: 390, height: 844 }, locale: o.locale || 'fr-CH', colorScheme: o.colorScheme || 'light',
    reducedMotion: 'reduce', acceptDownloads: true, ...(o.timezoneId ? { timezoneId: o.timezoneId } : {}) });
  if (o.native) await ctx.addInitScript(nativeMock(), o.native);
  if (o.init) await ctx.addInitScript(o.init.fn, o.init.arg);
  const p = await ctx.newPage();
  p.errors = []; p.external = [];
  p.on('pageerror', e => p.errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|navigator\.vibrate/.test(m.text())) p.errors.push(m.text()); });
  p.on('request', r => { const u = r.url(); if (!u.startsWith(base) && !u.startsWith('data:') && !u.startsWith('blob:') && !u.startsWith('file:')) p.external.push(u); });
  p.state = () => p.evaluate(() => { try { return JSON.parse(localStorage.getItem('libre.v1') || 'null'); } catch (e) { return null; } });
  p.vault = () => p.evaluate(() => JSON.parse(sessionStorage.getItem('__vault') || '{}'));
  p.go = async v => { await p.evaluate(v => { location.hash = v; }, v); await p.waitForFunction(v => document.getElementById('app').dataset.view === v, v, { timeout: 5000 }); await p.waitForTimeout(80); };
  p.openFold = k => p.evaluate(k => { const d = document.querySelector(`details[data-fold="${k}"]`); if (d && !d.open) d.querySelector('summary').click(); }, k);
  p.closeLayer = () => p.evaluate(() => { const l = document.getElementById('layer'); if (l) l.innerHTML = ''; document.querySelectorAll('.toast').forEach(t => t.remove()); });
  /* attend la fin du démarrage (badges, rappels, célébrations éventuelles) puis ferme ce qui s’est ouvert */
  p.settle = async () => { await p.waitForSelector('#app[data-view]'); await p.waitForTimeout(1500); await p.closeLayer(); };
  p.ctx = ctx;
  return p;
}

/* Profil réaliste injecté avant le chargement (données d’un utilisateur, pas le mode démo) */
function profileState(o = {}) {
  const D = 864e5, now = Date.now();
  const habits = (o.types || ['cigarette']).map((t, i) => ({ id: 'h' + i, type: t, goal: 'arreter', qtyPer: 'jour', budgetPer: 'semaine', trackStart: now - (o.days || 20) * D, created: now - (o.days || 20) * D, qty: 10, budget: 30 }));
  return Object.assign({ v: 2, profile: { name: o.name || 'Camille', created: now - (o.days || 20) * D }, habits, logs: [], journal: [], sos: [], tools: { urges: [], cbt: [], plans: [], triggers: [], checkins: {}, goals: {} },
    contacts: [], reasons: ['Ma santé'], notifs: [], unlocked: {}, sent: {}, prefs: { lang: o.lang || 'fr', mainHabit: 'h0' } }, o.extra || {});
}
/* Données injectées une seule fois par onglet, et jamais par-dessus des données déjà présentes (second onglet du même navigateur) */
const seed = (state, key = 'libre.v1') => ({ fn: ([s, k]) => { if (!sessionStorage.getItem('__seeded') && localStorage.getItem(k) == null) { localStorage.setItem(k, JSON.stringify(s)); sessionStorage.setItem('__seeded', '1'); } }, arg: [state, key] });

module.exports = { serve, launch, page, profileState, seed, ROOT };
