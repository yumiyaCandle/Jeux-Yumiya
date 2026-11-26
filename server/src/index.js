// Démarrage : node server/src/index.js (voir server/README.md)
'use strict';
const { config, checkProduction } = require('./config');
const { open } = require('./db');
const { createApp } = require('./app');
const errs = checkProduction();
if (errs.length) { console.error('Configuration de production incomplète :\n- ' + errs.join('\n- ')); process.exit(1); }
const db = open(config.dbPath);
createApp(config, db).listen(config.port, config.host, () => console.log(`LIBRE comptes : http://${config.host}:${config.port} (${config.env}, e-mail : ${config.mail.provider}, SMS : ${config.sms.provider})`));
