/* Contrôle des contrastes (WCAG 2.2 AA : 4,5:1, 3:1 pour le grand texte) sur les écrans principaux, clair et sombre.
   Approximation : les textes posés sur une photo ou un dégradé sont ignorés ; les ratios < 2 sont des fonds non mesurables.
   Usage : npm run check:contrast   (code 1 si un texte est sous le seuil) */
const {serve,launch,page,profileState,seed}=require('./helpers.js');
const FN=()=>{const P=c=>{const m=c.match(/[\d.]+/g);if(!m)return [0,0,0,0];const n=m.map(Number);if(c.startsWith('color(')){return [n[0]*255,n[1]*255,n[2]*255].concat(n.length>3?[n[3]]:[])}return n};
 const L=([r,g,b])=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
 const bgOf=e=>{let stack=[];while(e){const cs=getComputedStyle(e);if(cs.backgroundImage!=='none'&&!/gradient/.test(cs.backgroundImage))return null;const c=P(cs.backgroundColor);const a=c.length>3?c[3]:1;if(a>0){stack.push([c,a]);if(a>=.95)break}e=e.parentElement}
   let col=[255,255,255];if(!stack.length)return null;for(let i=stack.length-1;i>=0;i--){const [c,a]=stack[i];col=col.map((v,k)=>v*(1-a)+c[k]*a)}return col};
 const out=[];document.querySelectorAll('#app *, #layer *').forEach(e=>{if(!e.childNodes.length||![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))return;const r=e.getBoundingClientRect();if(!r.width||!r.height)return;
  const cs=getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity<.99)return;const bg=bgOf(e);if(!bg)return;const fc=P(cs.color);const fa=fc.length>3?fc[3]:1;const fg=fc.slice(0,3).map((v,k)=>v*fa+bg[k]*(1-fa));
  const l1=L(fg),l2=L(bg),cr=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);const big=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&+cs.fontWeight>=700);
  if(cr>=2&&cr<(big?3:4.5))out.push(`${cr.toFixed(2)} ${e.tagName.toLowerCase()}.${(e.className+'').slice(0,30)} "${e.textContent.trim().slice(0,40)}"`)});return [...new Set(out)]};
let fails=0;(async()=>{const {srv,url}=await serve();const b=await launch();const D=864e5;
for(const scheme of ['light','dark']){
 const st=profileState({types:['cigarette','alcool'],days:60});st.journal=[{id:'j1',ts:Date.now()-D,mood:2,craving:4,text:'Note',triggers:['Stress']}];
 const p=await page(b,url,{init:seed(st),colorScheme:scheme});await p.goto(url);await p.settle();
 for(const v of ['accueil','habitudes','stats','calendrier','bilans','journal','outils','biblio','profil','coach','programme','recompenses','motivations','comprendre','evolution','plan','apercu','strategies','declencheurs','economies']){await p.go(v);await p.waitForTimeout(300);const r=await p.evaluate(FN);if(r.length){fails++;console.log(scheme,v,'\n  '+r.join('\n  '))}}
 await p.go('accueil');await p.evaluate(()=>document.querySelector('[data-a="logForm"]').click());await p.waitForTimeout(400);const r=await p.evaluate(FN);if(r.length)fails++,console.log(scheme,'form','\n  '+r.join('\n  '));await p.closeLayer();
 await p.click('.hm-sos');await p.waitForTimeout(400);const r2=await p.evaluate(FN);if(r2.length)fails++,console.log(scheme,'sos','\n  '+r2.join('\n  '));
 await p.ctx.close()}
await b.close();srv.close();if(fails){console.log(fails+' écran(s) avec un contraste insuffisant');process.exit(1)}console.log('Contrastes : aucun texte mesurable sous le seuil AA')})();
