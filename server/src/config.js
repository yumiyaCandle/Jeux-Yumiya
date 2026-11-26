// Configuration du serveur de comptes LIBRE (variables d'environnement). Voir server/README.md.
'use strict';
const env = process.env;
const list = v => (v || '').split(',').map(s => s.trim()).filter(Boolean);
const config = {
  env: env.NODE_ENV || 'development',
  port: +(env.PORT || 8787),
  host: env.HOST || '127.0.0.1',
  dbPath: env.DB_PATH || './libre-accounts.db',
  // Origines autorisées à appeler l'API (app web, app native Capacitor). Vide = même origine uniquement.
  origins: list(env.ALLOWED_ORIGINS),
  // Dossier de l'app web à servir sur la même origine (facultatif), par ex. ../libre
  staticDir: env.STATIC_DIR || '',
  trustProxy: env.TRUST_PROXY === '1',
  sessionDays: +(env.SESSION_DAYS || 30),
  // Fournisseurs d'envoi. « memory » n'est accepté qu'en test et en développement local.
  mail: { provider: env.MAIL_PROVIDER || 'memory', apiUrl: env.MAIL_API_URL || 'https://api.resend.com/emails', apiKey: env.MAIL_API_KEY || '', from: env.MAIL_FROM || '' },
  sms: { provider: env.SMS_PROVIDER || 'memory', sid: env.TWILIO_ACCOUNT_SID || '', token: env.TWILIO_AUTH_TOKEN || '', from: env.TWILIO_FROM || '' },
  appName: 'LIBRE',
};
config.production = config.env === 'production';
function checkProduction() {
  if (!config.production) return [];
  const errs = [];
  if (config.mail.provider === 'memory') errs.push('MAIL_PROVIDER doit être configuré en production (aucun e-mail simulé).');
  if (config.mail.provider !== 'memory' && (!config.mail.apiKey || !config.mail.from)) errs.push('MAIL_API_KEY et MAIL_FROM sont requis.');
  if (config.sms.provider === 'memory') errs.push('SMS_PROVIDER doit être configuré en production (aucun SMS simulé).');
  if (config.sms.provider === 'twilio' && (!config.sms.sid || !config.sms.token || !config.sms.from)) errs.push('TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN et TWILIO_FROM sont requis.');
  if (!config.trustProxy) errs.push('En production, le serveur doit être derrière un proxy HTTPS (TRUST_PROXY=1).');
  return errs;
}
module.exports = { config, checkProduction };
