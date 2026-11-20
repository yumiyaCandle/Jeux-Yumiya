#!/usr/bin/env node
/* Lance la suite : node tests/run.js [filtre]   (ex. node tests/run.js Sauvegarde)
   Écrit tests/RESULTATS.md avec l’état de chaque test : réussi, échoué ou non exécuté (avec la raison). */
const fs = require('fs');
const path = require('path');
const { serve, launch } = require('./helpers');
const suite = require('./suite');

(async () => {
  const filter = process.argv[2] ? new RegExp(process.argv[2], 'i') : null;
  const { srv, url } = await serve();
  const browser = await launch();
  const res = [];
  for (const t of suite.T) {
    if (filter && !filter.test(t.group + ' ' + t.name)) continue;
    const t0 = Date.now(); let status = 'réussi', msg = '';
    try { await Promise.race([t.fn(browser, url), new Promise((_, r) => setTimeout(() => r(new Error('délai dépassé (120 s)')), 120e3))]); }
    catch (e) { status = e.skip ? 'non exécuté' : 'échoué'; msg = (e.message || String(e)).split('\n').slice(0, 3).join(' '); }
    for (const c of browser.contexts()) await c.close().catch(() => {});
    const ms = Date.now() - t0; res.push({ ...t, status, msg, ms });
    console.log(`${status === 'réussi' ? '✔' : status === 'échoué' ? '✘' : '–'} [${t.group}] ${t.name} (${ms} ms)${msg ? '\n    ' + msg : ''}`);
  }
  await browser.close(); srv.close();
  const n = s => res.filter(r => r.status === s).length;
  const perf = suite.lastPerf || require('./suite').lastPerf;
  let md = `# Résultats des tests automatisés\n\nExécutés le ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC, Chromium (Playwright), serveur local.\n\n`;
  md += `**${n('réussi')} réussis · ${n('échoué')} échoués · ${n('non exécuté')} non exécutés** sur ${res.length}.\n\n| Groupe | Test | Résultat | Durée |\n|---|---|---|---|\n`;
  for (const r of res) md += `| ${r.group} | ${r.name} | ${r.status}${r.msg ? ' : ' + r.msg.replace(/\|/g, '/') : ''} | ${(r.ms / 1000).toFixed(1)} s |\n`;
  if (perf) md += `\n## Mesures de charge\n\n${perf.logs} consommations, ${perf.journal} entrées de journal.\n\n| Écran | Temps (ms) |\n|---|---|\n` + Object.entries(perf.times).map(([k, v]) => `| ${k} | ${v} |`).join('\n') + '\n';
  md += `\n## Non couvert ici\n\nCes tests simulent les plugins natifs (mêmes appels, mêmes réponses). Ils ne remplacent pas un essai sur un vrai iPhone et un vrai téléphone Android (voir docs/TESTS-APPAREILS.md) : chiffrement natif réel, HealthKit, notifications réelles, VoiceOver et TalkBack.\n`;
  if (!filter) fs.writeFileSync(path.join(__dirname, 'RESULTATS.md'), md);
  process.exit(n('échoué') ? 1 : 0);
})();
