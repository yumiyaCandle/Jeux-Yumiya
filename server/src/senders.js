// Envoi des codes par e-mail et par SMS.
// - mail « http » : API compatible Resend (POST JSON, clé Bearer). Fournisseur et clé à configurer (voir README).
// - sms « twilio » : API REST Twilio. Compte et numéro d'envoi à configurer.
// - « memory » : uniquement en test/développement ; les messages restent en mémoire, rien n'est envoyé, et le serveur
//   refuse de démarrer en production avec ce mode (aucun envoi simulé en conditions réelles).
'use strict';
const outbox = [];
const T = {
  fr: { subj: 'Ton code LIBRE', body: c => `Ton code LIBRE : ${c}\nIl expire dans 10 minutes. Si tu n'as rien demandé, ignore ce message.`, sms: c => `LIBRE : ton code est ${c}. Il expire dans 10 minutes.`, exists: "Quelqu'un a essayé de créer un compte LIBRE avec cette adresse, qui en a déjà un. Si c'était toi, connecte-toi ou utilise « Mot de passe oublié »." },
  en: { subj: 'Your LIBRE code', body: c => `Your LIBRE code: ${c}\nIt expires in 10 minutes. If you did not ask for it, ignore this message.`, sms: c => `LIBRE: your code is ${c}. It expires in 10 minutes.`, exists: 'Someone tried to create a LIBRE account with this address, which already has one. If it was you, sign in or use “Forgot password”.' },
  de: { subj: 'Dein LIBRE-Code', body: c => `Dein LIBRE-Code: ${c}\nEr läuft in 10 Minuten ab. Falls du ihn nicht angefordert hast, ignoriere diese Nachricht.`, sms: c => `LIBRE: Dein Code lautet ${c}. Er läuft in 10 Minuten ab.`, exists: 'Jemand hat versucht, mit dieser Adresse ein LIBRE-Konto zu erstellen, das bereits existiert. Falls du es warst, melde dich an oder nutze „Passwort vergessen“.' },
  it: { subj: 'Il tuo codice LIBRE', body: c => `Il tuo codice LIBRE: ${c}\nScade tra 10 minuti. Se non l'hai richiesto, ignora questo messaggio.`, sms: c => `LIBRE: il tuo codice è ${c}. Scade tra 10 minuti.`, exists: "Qualcuno ha provato a creare un account LIBRE con questo indirizzo, che ne ha già uno. Se eri tu, accedi o usa «Password dimenticata»." },
  es: { subj: 'Tu código LIBRE', body: c => `Tu código LIBRE: ${c}\nCaduca en 10 minutos. Si no lo has pedido, ignora este mensaje.`, sms: c => `LIBRE: tu código es ${c}. Caduca en 10 minutos.`, exists: 'Alguien intentó crear una cuenta LIBRE con esta dirección, que ya tiene una. Si fuiste tú, inicia sesión o usa «He olvidado mi contraseña».' },
  pt: { subj: 'O teu código LIBRE', body: c => `O teu código LIBRE: ${c}\nExpira em 10 minutos. Se não o pediste, ignora esta mensagem.`, sms: c => `LIBRE: o teu código é ${c}. Expira em 10 minutos.`, exists: 'Alguém tentou criar uma conta LIBRE com este endereço, que já tem uma. Se foste tu, inicia sessão ou usa «Esqueci a palavra-passe».' },
};
const L = l => T[l] || T.fr;
function makeSenders(cfg) {
  async function mail(to, subject, text) {
    if (cfg.mail.provider === 'memory') { outbox.push({ channel: 'email', to, subject, text, ts: Date.now() }); return; }
    const r = await fetch(cfg.mail.apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.mail.apiKey}` }, body: JSON.stringify({ from: cfg.mail.from, to: [to], subject, text }) });
    if (!r.ok) throw new Error('mail_failed_' + r.status);
  }
  async function sms(to, text) {
    if (cfg.sms.provider === 'memory') { outbox.push({ channel: 'sms', to, text, ts: Date.now() }); return; }
    if (cfg.sms.provider !== 'twilio') throw new Error('sms_provider_unknown');
    const body = new URLSearchParams({ To: to, From: cfg.sms.from, Body: text });
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(cfg.sms.sid)}/Messages.json`, { method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(cfg.sms.sid + ':' + cfg.sms.token).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    if (!r.ok) throw new Error('sms_failed_' + r.status);
  }
  return {
    code: (channel, to, code, lang) => channel === 'sms' ? sms(to, L(lang).sms(code)) : mail(to, L(lang).subj, L(lang).body(code)),
    exists: (to, lang) => mail(to, L(lang).subj, L(lang).exists),
  };
}
module.exports = { makeSenders, outbox };
