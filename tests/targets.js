/* Zones tactiles (WCAG 2.2 critère 2.5.8 : au moins 24 × 24 px ; liens dans un paragraphe exclus).
   Usage : npm run check:targets   (code 1 si un élément est trop petit) */
const {serve,launch,page,profileState,seed}=require('./helpers.js');let fails=0;
(async()=>{const {srv,url}=await serve();const b=await launch();const D=864e5;
const st=profileState({types:['cigarette','alcool'],days:60});st.journal=[{id:'j1',ts:Date.now()-D,mood:2,craving:4,text:'Note',triggers:['Stress']}];
const p=await page(b,url,{init:seed(st)});await p.goto(url);await p.settle();
const FN=()=>{const out=[];document.querySelectorAll('#app button,#app a,#app input,#app summary,#app [role=button],#layer button,#layer a,#layer input').forEach(e=>{const r=e.getBoundingClientRect();if(!r.width||!r.height)return;if(getComputedStyle(e).visibility==='hidden')return;
 if(e.closest('p,li')&&e.tagName==='A'&&e.closest('p'))return; // liens dans un paragraphe : exception WCAG (inline)
 const af=getComputedStyle(e,'::before');const ext=af.content!=='none'&&af.position==='absolute'?22:0;if(r.width<24||r.height+ext<24)out.push(`${Math.round(r.width)}x${Math.round(r.height)} ${e.tagName.toLowerCase()}[${e.dataset.a||e.type||''}] "${(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,30)}"`)});return [...new Set(out)]};
for(const v of ['accueil','habitudes','stats','calendrier','bilans','journal','outils','biblio','profil']){await p.go(v);await p.waitForTimeout(300);const r=await p.evaluate(FN);if(r.length)fails++,console.log(v,'\n  '+r.join('\n  '))}
await p.go('accueil');await p.click('.hm-sos');await p.waitForTimeout(400);const r=await p.evaluate(FN);if(r.length)fails++,console.log('sos\n  '+r.join('\n  '));
await b.close();srv.close();if(fails){console.log(fails+' écran(s) avec des cibles trop petites');process.exit(1)}console.log('Zones tactiles : toutes au moins 24 × 24 px')})();
