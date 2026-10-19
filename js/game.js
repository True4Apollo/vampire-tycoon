"use strict";
(()=>{
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const KEY="vampTycoon_v2", CYCLE=120;
let S, buyMode="1", activeEvent=null, eventEnd=0, nextEvent=0, nextGolden=0, dirty=true;

/* ---------- State ---------- */
function fresh(keep){
  const s={v:2,blood:0,run:0,all:0,own:{},chars:{},tree:[],souls:0,prestiges:0,clicks:0,crits:0,goldens:0,events:0,
    ach:[],chapter:0,shown:-1,daily:{last:"",streak:0},streak:0,time:0,last:Date.now(),tut:0,started:Date.now(),
    opts:{sound:true,haptic:true,fx:true},best:0};
  PRODUCERS.forEach(p=>s.own[p.id]=0); CHARACTERS.forEach(c=>s.chars[c.id]=0);
  return keep?Object.assign(s,keep):s;
}
function load(){
  let raw=null; try{raw=JSON.parse(localStorage.getItem(KEY)||"null")}catch(e){}
  S=fresh(); if(raw&&typeof raw==="object"){
    for(const k in raw){ if(k==="own"||k==="chars"||k==="opts"||k==="daily") Object.assign(S[k],raw[k]); else S[k]=raw[k]; }
  }
}
function save(){ S.last=Date.now(); try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){} }

/* ---------- Format ---------- */
const UNITS=["","Tsd.","Mio.","Mrd.","Bio.","Brd.","Trio.","Trd.","Quad.","Qrd.","Quin."];
function fmt(n){
  if(!isFinite(n))return"∞"; if(n<0)return"-"+fmt(-n);
  if(n<10)return (Math.floor(n*10)/10).toLocaleString("de-DE",{maximumFractionDigits:1});
  if(n<1e6)return Math.floor(n).toLocaleString("de-DE");
  let i=0; while(n>=1000&&i<UNITS.length-1){n/=1000;i++}
  return n.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})+" "+UNITS[i];
}
const fmtT=s=>{s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?`${h} Std. ${m} Min.`:m?`${m} Min. ${s%60} s`:`${s} s`};

/* ---------- Economy ---------- */
const has=id=>S.tree.includes(id), lv=id=>S.chars[id]||0;
function nightLen(){return has("n2")?90:60}
function isNight(){return (S.time%(CYCLE+(has("n2")?30:0)))<nightLen()}
function nightMult(){return isNight()?2+(has("n1")?0.5:0)+lv("kade")*0.25:1}
function evMult(k){if(!activeEvent||!activeEvent[k])return 1;return activeEvent[k]*(1+lv("sabine")*0.12)}
function globalMult(){
  return (1+S.souls*0.1)*(1+lv("dorian")*0.15)*(1+S.ach.length*0.02)*(has("n5")?2:1);
}
function prodMult(id){
  const g={bat:"s1",rat:"s1",ghoul:"s2",serv:"s2",bride:"s3",crypt:"s3",bar:"s4",castle:"s4",cult:"s5",realm:"s5"}[id];
  let m=has(g)?3:1;if(managerOf(PRODUCERS.findIndex(p=>p.id===id)))m*=1.5;
  const n=S.own[id]; m*=Math.pow(2,Math.floor(n/25))*(n>=100?2:1); // Meilensteine
  return m;
}
function baseBps(){return PRODUCERS.reduce((a,p)=>a+p.bps*S.own[p.id]*prodMult(p.id),0)*globalMult()}
function bps(){return baseBps()*nightMult()*evMult("prod")}
function clickBase(){
  let c=1*(has("f1")?2:1)*(has("f2")?2:1)*(has("f5")?5:1)*(1+lv("lucien")*0.3);
  c+=bps()*(has("f4")?0.03:0)+bps()*0.01;
  return c*evMult("click")*(1+S.souls*0.1);
}
function critChance(){return (has("f3")?0.05:0)+lv("lucien")*0.02}
function cost(p,n){return Math.ceil(p.cost*Math.pow(1.15,n))}
function bulk(p){
  const o=S.own[p.id]; if(buyMode==="max"){let k=0,t=0;while(k<1000){const c=cost(p,o+k);if(t+c>S.blood)break;t+=c;k++}return{k:Math.max(k,1),t:k?t:cost(p,o)}}
  const k=+buyMode;let t=0;for(let i=0;i<k;i++)t+=cost(p,o+i);return{k,t};
}
function treeCost(n){return Math.ceil(n.cost*(1-Math.min(0.45,lv("sabine")*0.03)))}
function offlineRate(){return has("n3")?0.8:0.5}
function offlineCap(){return (2+(has("n4")?4:0)+lv("mira"))*3600}
function soulGain(){return Math.floor(Math.pow(S.run/1e7,0.5)*(1+lv("mira")*0.12))}

function earn(n){S.blood+=n;S.run+=n;S.all+=n;dirty=true}

/* ---------- Audio / Haptics ---------- */
let AC=null;
function tone(f,d=0.08,type="sine",vol=0.12,slide=0){
  if(!S.opts.sound)return; try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==="suspended")AC.resume();
    const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;
    o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+d);
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d+0.02);
  }catch(e){}
}
const SFX={
  bite:()=>{tone(180+Math.random()*40,0.07,"triangle",0.15,-90)},
  crit:()=>{tone(520,0.12,"square",0.08,400);setTimeout(()=>tone(880,0.15,"triangle",0.1),60)},
  buy:()=>{tone(440,0.06,"triangle",0.1);setTimeout(()=>tone(660,0.09,"triangle",0.1),50)},
  big:()=>[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,0.25,"triangle",0.1),i*90)),
  err:()=>tone(120,0.12,"sawtooth",0.06),
  ev:()=>[200,150,100].forEach((f,i)=>setTimeout(()=>tone(f,0.4,"sawtooth",0.06),i*150)),
};
// Haptik-Hook: nutzt Capacitor Haptics, wenn vorhanden, sonst navigator.vibrate
function haptic(kind="light"){
  if(!S.opts.haptic)return;
  try{const H=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.Haptics;
    if(H){H.impact({style:kind==="heavy"?"HEAVY":kind==="medium"?"MEDIUM":"LIGHT"});return}
    if(navigator.vibrate)navigator.vibrate(kind==="heavy"?[30,30,30]:kind==="medium"?20:8);}catch(e){}
}

/* ---------- Particles ---------- */
const cv=$("#fx"),cx=cv.getContext("2d");let parts=[];
function resize(){cv.width=innerWidth*devicePixelRatio;cv.height=innerHeight*devicePixelRatio}
addEventListener("resize",resize);resize();
function burst(x,y,n=14,col="#ff2040",sp=6){
  if(!S.opts.fx)return; for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=(Math.random()*.7+.3)*sp;
    parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2,l:1,r:2+Math.random()*4,c:col})}
  if(parts.length>400)parts.splice(0,parts.length-400);
}
function drawParts(){
  const d=devicePixelRatio;cx.clearRect(0,0,cv.width,cv.height);
  for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=0.25;p.vx*=.98;p.l-=0.022;
    cx.globalAlpha=Math.max(0,p.l);cx.fillStyle=p.c;cx.beginPath();cx.arc(p.x*d,p.y*d,p.r*d*p.l+0.5,0,7);cx.fill()}
  cx.globalAlpha=1;parts=parts.filter(p=>p.l>0);
}
function floatText(x,y,t,cls=""){const e=document.createElement("div");e.className="float "+cls;e.textContent=t;e.style.left=(x-30+Math.random()*30)+"px";e.style.top=(y-30)+"px";document.body.appendChild(e);setTimeout(()=>e.remove(),1000)}
function toast(h){const T=$("#toasts");while(T.children.length>=3)T.firstChild.remove();const e=document.createElement("div");e.className="toast";e.innerHTML=h;$("#toasts").appendChild(e);setTimeout(()=>e.remove(),3500)}
function shake(){const a=$("#app");a.classList.remove("shake");void a.offsetWidth;a.classList.add("shake")}

/* ---------- Modal ---------- */
function modal(html,onClose){$("#mbody").innerHTML=html;$("#modal").classList.remove("hidden");
  $$("#mbody [data-close]").forEach(b=>b.onclick=()=>{closeModal();onClose&&onClose(b.dataset.close)})}
function closeModal(){$("#modal").classList.add("hidden")}
const charById=id=>CHARACTERS.find(c=>c.id===id);
function dlgHtml(lines){return lines.map(([w,t])=>w==="nar"?`<div class="dlg nar"><div>${t}</div></div>`:
  `<div class="dlg"><img src="${PORTRAIT(w)}" alt=""><div><b>${charById(w).name}</b>${t}</div></div>`).join("")}

/* ---------- Actions ---------- */
function bite(e){
  const r=$("#bite").getBoundingClientRect();const x=e&&e.clientX?e.clientX:r.left+r.width/2,y=e&&e.clientY?e.clientY:r.top+r.height/2;
  let v=clickBase();const crit=Math.random()<critChance();if(crit){v*=10;S.crits++}
  earn(v);S.clicks++;
  floatText(x,y,"+"+fmt(v),crit?"crit":"");burst(x,y,crit?40:10,crit?"#ffd24a":"#ff2040",crit?10:5);
  crit?(SFX.crit(),haptic("medium"),shake()):(SFX.bite(),haptic());
  const b=$("#bite");b.classList.add("hit");clearTimeout(b._t);b._t=setTimeout(()=>b.classList.remove("hit"),80);
}
function buyProducer(i){
  const p=PRODUCERS[i],{k,t}=bulk(p);if(S.blood<t){SFX.err();return}
  S.blood-=t;const before=S.own[p.id];S.own[p.id]+=k;
  if(Math.floor(before/25)<Math.floor(S.own[p.id]/25)){toast(`⭐ Meilenstein! ${p.name} Produktion x2`);SFX.big();haptic("heavy")}else SFX.buy();
  haptic();const el=$(`#pi${i}`);if(el){const r=el.getBoundingClientRect();burst(r.right-50,r.top+r.height/2,12,"#e8b84a",4)}
  dirty=true;renderShop();
}
function buyChar(id){
  const c=charById(id),l=lv(id);if(l>=c.max)return;const price=charLvCost(c,l);if(S.blood<price){SFX.err();return}
  S.blood-=price;S.chars[id]++;
  if(l===0){SFX.big();haptic("heavy");modal(`<h2>${c.name} schließt sich an!</h2><img src="${PORTRAIT(id)}" style="width:100%;border-radius:12px;border:2px solid var(--gold)"><p class="center"><b>${c.ability}</b><br><span class="muted">${c.eff}</span></p><button class="btn gold" style="width:100%" data-close>Willkommen im Clan</button>`);
    const r=innerWidth/2;burst(r,innerHeight/2,60,"#e8b84a",12)}
  else{SFX.buy();toast(`⬆️ ${c.name} erreicht Level ${l+1}`)}
  dirty=true;renderClan();renderShop();
}
function buyNode(bi,ni){
  const n=TREE[bi].nodes[ni];if(has(n.id))return;if(ni>0&&!has(TREE[bi].nodes[ni-1].id))return;
  const c=treeCost(n);if(S.blood<c){SFX.err();return}
  S.blood-=c;S.tree.push(n.id);SFX.big();haptic("medium");toast(`🌿 ${n.n}: ${n.d}`);dirty=true;renderTree();
}
function prestige(){
  const g=soulGain();if(g<1)return;
  modal(`<h2>⚱️ Ritual der Unsterblichkeit</h2><p class="center">Du opferst dein Imperium und erhältst <b style="color:#cfc6ff">${g} Seele(n)</b>.<br><span class="muted">Diener, Blut und Pfade werden zurückgesetzt. Clan, Erfolge und Chronik bleiben.</span></p><div class="row gap"><button class="btn" data-close="no">Abbrechen</button><button class="btn blood" data-close="yes">Ritual vollziehen</button></div>`,a=>{
    if(a!=="yes")return;
    const keep={souls:S.souls+g,prestiges:S.prestiges+1,chars:S.chars,ach:S.ach,all:S.all,clicks:S.clicks,crits:S.crits,goldens:S.goldens,events:S.events,
      chapter:S.chapter,shown:S.shown,daily:S.daily,streak:S.streak,tut:S.tut,opts:S.opts,started:S.started,best:Math.max(S.best,S.run)};
    S=fresh(keep);SFX.big();haptic("heavy");burst(innerWidth/2,innerHeight/2,120,"#b77bff",14);save();renderAll();
    toast(`👻 Wiedergeboren mit ${S.souls} Seelen (+${S.souls*10} %)`);
  });
}

/* ---------- Daily / Offline ---------- */
const today=()=>new Date().toISOString().slice(0,10);
function dailyAvailable(){return S.daily.last!==today()}
function openDaily(){
  const avail=dailyAvailable();const yest=new Date(Date.now()-864e5).toISOString().slice(0,10);
  let streak=avail?(S.daily.last===yest?S.daily.streak+1:1):S.daily.streak;const idx=(streak-1)%7;
  const rew=Math.max(100,baseBps()*60*DAILY[idx].m);
  modal(`<h2>🎁 Tagesbelohnung</h2><p class="center muted">Komm jeden Tag zurück – die Belohnung steigt!</p><div class="daily">${DAILY.map((d,i)=>`<div class="${i===idx?"cur":i<idx?"past":""}">Tag ${i+1}<br>${d.t}</div>`).join("")}</div>
   <p class="center">${avail?`Heute: <b>${fmt(rew)}</b> Blut${idx===6?" + 1 Seele":""}`:"Bereits abgeholt. Komm morgen wieder!"}</p>
   <button class="btn gold" style="width:100%" data-close="${avail?"claim":""}">${avail?"Abholen":"Schließen"}</button>`,a=>{
    if(a!=="claim"||!dailyAvailable())return;S.daily={last:today(),streak};S.streak=Math.max(S.streak,streak);earn(rew);if(idx===6)S.souls++;
    SFX.big();haptic("heavy");burst(innerWidth/2,innerHeight/2,70,"#e8b84a",12);toast(`🎁 +${fmt(rew)} Blut`);save();
  });
}
function offline(){
  const dt=Math.min((Date.now()-(S.last||Date.now()))/1000,offlineCap());
  if(dt<60||baseBps()<=0)return false;
  const gain=baseBps()*dt*offlineRate();
  modal(`<h2>🌙 Während du schliefst…</h2><p class="center">Dein Clan hat ${fmtT(dt)} lang gejagt.</p><p class="center" style="font-size:1.6em">🩸 <b>${fmt(gain)}</b></p><p class="center muted small">Offline-Ertrag ${Math.round(offlineRate()*100)} % · Limit ${fmtT(offlineCap())}</p><button class="btn gold" style="width:100%" data-close>Einsammeln</button>`,()=>{earn(gain);SFX.big();burst(innerWidth/2,innerHeight/2,50,"#ff2040",10)});
  S.time+=dt;return true;
}

/* ---------- Story / Achievements / Tutorial ---------- */
function showChapter(i,replay){const ch=CHAPTERS[i];modal(`<h2>📜 Kapitel ${i+1}</h2>${dlgHtml(ch.lines)}<button class="btn gold" style="width:100%" data-close>${replay?"Schließen":"Weiter"}</button>`)}
function checkStory(){
  if(S.shown<S.chapter&&$("#modal").classList.contains("hidden")){S.shown=S.chapter;showChapter(S.chapter)}
  const ch=CHAPTERS[S.chapter];if(ch&&S.shown>=S.chapter&&ch.check(S)&&S.chapter<CHAPTERS.length-1){S.chapter++;dirty=true;toast("📜 Neues Kapitel freigeschaltet!")}
}
function openChronicle(){modal(`<h2>📜 Chronik von Nebelhain</h2>${CHAPTERS.slice(0,S.chapter+1).map((c,i)=>`<button class="btn" style="width:100%;margin:3px 0" data-close="${i}">Kapitel ${i+1}</button>`).join("")}<button class="btn gold" style="width:100%;margin-top:8px" data-close>Schließen</button>`,a=>{if(a!==""&&a!==undefined)setTimeout(()=>showChapter(+a,true),10)})}
function checkAch(){for(const[id,n,d,f]of ACHIEVEMENTS)if(!S.ach.includes(id)&&f(S)){S.ach.push(id);toast(`🏆 <b>${n}</b> – ${d}<br><small>+2 % Produktion</small>`);SFX.big();haptic("medium");dirty=true}}
function tutorial(){
  $$(".hl").forEach(e=>e.classList.remove("hl"));
  const st=TUTORIAL[S.tut];if(!st){$("#tut").classList.add("hidden");return}
  if(!$("#modal").classList.contains("hidden")){$("#tut").classList.add("hidden");return}
  if(!st.last&&st.until(S)){S.tut++;return tutorial()}
  $("#tut").classList.remove("hidden");$("#tutText").textContent=st.t;$("#tutNext").classList.toggle("hidden",!st.last);
  const el=$(st.el);if(el)el.classList.add("hl");
}

/* ---------- Events ---------- */
function startEvent(){
  const e=EVENTS[Math.floor(Math.random()*EVENTS.length)];activeEvent=e;eventEnd=Date.now()+e.dur*1000*(1+lv("sabine")*0.12);S.events++;
  SFX.ev();haptic("heavy");toast(e.t);if(e.id==="bloodmoon")burst(innerWidth/2,80,80,"#ff0030",10);
}
function spawnGolden(){
  const g=$("#golden");g.classList.remove("hidden");g.style.animation="none";void g.offsetWidth;g.style.animation="";
  clearTimeout(g._t);g._t=setTimeout(()=>g.classList.add("hidden"),9000);
}
$("#golden").onclick=e=>{const g=$("#golden");g.classList.add("hidden");S.goldens++;
  const r=Math.random();if(r<0.5){const v=Math.max(50,bps()*45+clickBase()*30);earn(v);toast(`🦇 Seltene Beute: +${fmt(v)} Blut!`)}else startEvent();
  burst(e.clientX,e.clientY,50,"#ffd24a",10);SFX.crit();haptic("heavy")};

/* ---------- Rendering ---------- */
function workers(n){return n<=0?0:Math.min(4,1+Math.floor(Math.log2(n)/2))}
function managerOf(i){const c=CHARACTERS[Math.floor(i/2)];return c&&lv(c.id)>0?c:null}
function renderShop(){
  const vis=i=>i===0||S.own[PRODUCERS[i-1].id]>0||S.own[PRODUCERS[i].id]>0||S.run>=PRODUCERS[i].cost*0.5;
  $("#mansion").innerHTML=PRODUCERS.map((p,i)=>{const o=S.own[p.id],[col,hat]=ART.STCOL[p.id];
    if(!vis(i))return`<div class="floor locked" style="--fb:${ART.BG[i]}"><div class="boards">🚧 ??? – noch im Nebel verborgen 🚧</div></div>`;
    const m=managerOf(i),nw=workers(o);
    const ws=Array.from({length:nw},(_,k)=>`<div class="wk" style="--d:${5+k*1.3}s;--dl:-${k*1.7}s;animation-duration:${5+k*1.3}s;animation-delay:-${k*1.7}s"><div class="wkin" style="animation-duration:${5+k*1.3}s;animation-delay:-${k*1.7}s">${ART.worker(col,hat)}</div></div>`).join("");
    return`<div class="floor ${o?"":"empty"}" id="pi${i}" style="--fb:${ART.BG[i]}">
      <div class="flabel"><span class="lv">${o}</span>${p.name}</div>
      <div class="station">${ART.ST[p.id]}</div>
      ${m?`<div class="mgr" title="Manager: ${m.name}"><img src="${PORTRAIT(m.id)}" alt=""><span>Manager</span></div>`:`<div class="mgr none" data-goclan>👤<span>Manager?</span></div>`}
      <div class="walk">${ws||(o?"":`<div class="hint">Kaufe den ersten ${p.name}!</div>`)}</div>
      <div class="drop">${o?"🍾".repeat(Math.min(3,1+Math.floor(o/25))):""}</div>
      <div class="fctrl"><small>+${fmt(p.bps*o*prodMult(p.id)*globalMult())}/s · ⭐${25-(o%25)}</small><button class="btn buy" data-p="${i}"></button></div>
    </div>`}).join("");
  $$("#mansion [data-p]").forEach(b=>b.onclick=()=>buyProducer(+b.dataset.p));
  $$("#mansion [data-goclan]").forEach(b=>b.onclick=()=>$("#nav [data-tab=clan]").click());
  updateShop();
}
function updateShop(){$$("#mansion [data-p]").forEach(b=>{const p=PRODUCERS[+b.dataset.p],{k,t}=bulk(p);b.innerHTML=`${S.own[p.id]?"⬆️":"🔓"} ${buyMode==="1"?"":"x"+k+" "}${fmt(t)}`;b.disabled=S.blood<t;b.closest(".floor").classList.toggle("can",S.blood>=t)});const c=$("#cellarAmt");if(c)c.textContent=fmt(S.blood)+" 🩸"}
function renderClan(){
  $("#clan").innerHTML=CHARACTERS.map(c=>{const l=lv(c.id),price=charLvCost(c,l);
    return`<div class="char ${l?"":"locked"}"><img src="${PORTRAIT(c.id)}" alt="${c.name}"><div style="flex:1"><b>${l?c.name:"??? – "+c.name.split(" ")[0]}</b><div class="role">${c.role}</div><p class="muted">${c.story}</p><div class="abil">✦ <b>${c.ability}</b>: ${c.eff}</div><div class="abil">🏷️ Manager: ${PRODUCERS.slice(CHARACTERS.indexOf(c)*2,CHARACTERS.indexOf(c)*2+2).map(p=>p.name).join(" & ")} (+50 %)</div>
    ${l>=c.max?`<p class="muted">Maximales Level</p>`:`<button class="btn ${l?"":"gold"}" data-c="${c.id}" style="margin-top:6px">${l?`Level ${l+1} · `:"Freischalten · "}${fmt(price)}🩸</button>`}</div>${l?`<span class="lvl">Lv ${l}</span>`:""}</div>`}).join("");
  $$("#clan [data-c]").forEach(b=>b.onclick=()=>buyChar(b.dataset.c));updateClan();
}
function updateClan(){$$("#clan [data-c]").forEach(b=>{const c=charById(b.dataset.c);b.disabled=S.blood<charLvCost(c,lv(c.id))})}
function renderTree(){
  $("#tree").innerHTML=`<div class="tree">${TREE.map((br,bi)=>`<div class="branch"><h3>${br.name}</h3><div class="nodes">${br.nodes.map((n,ni)=>{const done=has(n.id),open=ni===0||has(br.nodes[ni-1].id);
    return`<div class="node ${done?"done":open?"":"lock"}"><span class="ni">${n.ic}</span><span class="nt"><b>${n.n}</b><small>${n.d}</small></span>${done?"":`<button class="btn" data-t="${bi},${ni}" ${open?"":"disabled"}>${fmt(treeCost(n))}🩸</button>`}</div>`}).join("")}</div></div>`).join("")}</div>`;
  $$("#tree [data-t]").forEach(b=>b.onclick=()=>{const[a,c]=b.dataset.t.split(",");buyNode(+a,+c)});updateTree();
}
function updateTree(){$$("#tree [data-t]").forEach(b=>{const[a,c]=b.dataset.t.split(",").map(Number);const open=c===0||has(TREE[a].nodes[c-1].id);b.disabled=!open||S.blood<treeCost(TREE[a].nodes[c])})}
function renderAch(){$("#ach").innerHTML=ACHIEVEMENTS.map(([id,n,d])=>`<div class="ach ${S.ach.includes(id)?"got":""}"><b>${S.ach.includes(id)?"🏆":"🔒"} ${n}</b>${d}</div>`).join("");$("#achCount").textContent=`${S.ach.length}/${ACHIEVEMENTS.length} · +${S.ach.length*2} %`}
function renderMore(){
  renderAch();const g=soulGain();
  $("#soulinfo").innerHTML=`Seelen: <b>${S.souls}</b> · Beim Ritual: <b style="color:#cfc6ff">+${g}</b><br><small class="muted">Ab 10 Mio. Blut in diesem Leben. Aktuell: ${fmt(S.run)}</small>`;$("#prestige").disabled=g<1;
  $("#stats").innerHTML=[["Blut gesamt",fmt(S.all)],["Blut dieses Leben",fmt(S.run)],["Bisse",fmt(S.clicks)],["Kritische Bisse",fmt(S.crits)],["Rituale",S.prestiges],["Goldene Fledermäuse",S.goldens],["Ereignisse",S.events],["Gesamtmultiplikator","x"+fmt(globalMult())],["Spielzeit",fmtT((Date.now()-S.started)/1000)]].map(([a,b])=>`<span>${a}</span><span>${b}</span>`).join("");
}
function renderChapter(){
  const ch=CHAPTERS[S.chapter];const done=S.chapter>=CHAPTERS.length-1&&ch.check(S);const w=ch.lines.find(l=>l[0]!=="nar");
  $("#chapter").innerHTML=`<img src="${PORTRAIT(w?w[0]:"dorian")}" alt=""><div style="flex:1"><small class="muted">Kapitel ${S.chapter+1} / ${CHAPTERS.length}</small><br><b>${done?"Buch I abgeschlossen ✔":ch.goal}</b></div>`;
}
function renderAll(){renderShop();renderClan();renderTree();renderMore();renderChapter();dirty=true}
let lastHud=0;
function hud(){
  $("#blood").textContent=fmt(S.blood);$("#bps").textContent=fmt(bps())+" /s";$("#souls").textContent=S.souls;
  const n=isNight(),per=CYCLE+(has("n2")?30:0),t=S.time%per,left=n?nightLen()-t:per-t;
  $("#cycle").className="cycle "+(n?"n":"d");$("#cycle").textContent=n?`🌙 Nacht x${fmt(nightMult())} · ${Math.ceil(left)}s`:`☀️ Tag · Nacht in ${Math.ceil(left)}s`;
  document.body.classList.toggle("night",n);
  $("#clickinfo").textContent=`+${fmt(clickBase())} pro Biss`+(critChance()?` · ${Math.round(critChance()*100)} % Krit`:"");
  if(activeEvent){$("#eventbar").classList.remove("hidden");$("#eventbar").textContent=`${activeEvent.t} · ${Math.ceil((eventEnd-Date.now())/1000)}s`}else $("#eventbar").classList.add("hidden");
  $("#dailyBtn").classList.toggle("glow",dailyAvailable());
  $("#clanDot").classList.toggle("hidden",!CHARACTERS.some(c=>lv(c.id)<c.max&&S.blood>=charLvCost(c,lv(c.id))));
  $("#treeDot").classList.toggle("hidden",!TREE.some(b=>{const i=b.nodes.findIndex(n=>!has(n.id));return i>=0&&S.blood>=treeCost(b.nodes[i])}));
  $("#moreDot").classList.toggle("hidden",soulGain()<1);
  const tab=$(".tab.active").id;if(tab==="tab-hunt")updateShop();else if(tab==="tab-clan")updateClan();else if(tab==="tab-tree")updateTree();else if(tab==="tab-more")renderMore();
  renderChapter();
}

/* ---------- Loop ---------- */
let last=performance.now(),acc=0;
function frame(now){
  const dt=Math.min((now-last)/1000,1);last=now;
  S.time+=dt;earn(bps()*dt);
  if(activeEvent&&Date.now()>eventEnd)activeEvent=null;
  if(Date.now()>nextEvent){if(nextEvent)startEvent();nextEvent=Date.now()+(90+Math.random()*90)*1000/(1+lv("sabine")*0.12)}
  if(Date.now()>nextGolden){if(nextGolden)spawnGolden();nextGolden=Date.now()+(45+Math.random()*60)*1000}
  acc+=dt;if(acc>0.1){acc=0;hud();checkAch();checkStory();tutorial()}
  drawParts();requestAnimationFrame(frame);
}

/* ---------- Wiring ---------- */
$("#bite").addEventListener("pointerdown",e=>{e.preventDefault();bite(e)});
$$("#nav button").forEach(b=>b.onclick=()=>{$$("#nav button").forEach(x=>x.classList.toggle("on",x===b));$$(".tab").forEach(t=>t.classList.toggle("active",t.id==="tab-"+b.dataset.tab));
  ({hunt:renderShop,clan:renderClan,tree:renderTree,more:renderMore})[b.dataset.tab]?.();tone(330,0.04,"triangle",0.05);haptic()});
$$(".seg button").forEach(b=>b.onclick=()=>{buyMode=b.dataset.buy;$$(".seg button").forEach(x=>x.classList.toggle("on",x===b));updateShop()});
$("#dailyBtn").onclick=openDaily;$("#storyBtn").onclick=openChronicle;$("#prestige").onclick=prestige;
$("#tutNext").onclick=()=>{S.tut++;tutorial()};
$("#saveBtn").onclick=()=>{save();toast("💾 Gespeichert")};
$("#exportBtn").onclick=()=>{save();const d=btoa(unescape(encodeURIComponent(JSON.stringify(S))));navigator.clipboard?.writeText(d).catch(()=>{});modal(`<h2>📤 Export</h2><textarea style="width:100%;height:120px" readonly>${d}</textarea><button class="btn gold" style="width:100%" data-close>OK</button>`)};
$("#importBtn").onclick=()=>{modal(`<h2>📥 Import</h2><textarea id="imp" style="width:100%;height:120px"></textarea><div class="row gap"><button class="btn" data-close>Abbrechen</button><button class="btn gold" id="impGo">Laden</button></div>`);
  $("#impGo").onclick=()=>{try{const o=JSON.parse(decodeURIComponent(escape(atob($("#imp").value.trim()))));localStorage.setItem(KEY,JSON.stringify(o));load();closeModal();renderAll();toast("✅ Importiert")}catch(e){toast("❌ Ungültiger Spielstand")}}};
$("#resetBtn").onclick=()=>modal(`<h2>🗑️ Alles löschen?</h2><p class="center">Dein gesamter Fortschritt – inklusive Seelen und Clan – geht unwiderruflich verloren.</p><div class="row gap"><button class="btn" data-close="no">Abbrechen</button><button class="btn danger" data-close="yes">Endgültig löschen</button></div>`,a=>{if(a==="yes"){localStorage.removeItem(KEY);S=fresh();save();renderAll();toast("Neuanfang…")}});
["sound","haptic","fx"].forEach(k=>{const el=$("#opt"+k[0].toUpperCase()+k.slice(1));el.onchange=()=>{S.opts[k]=el.checked;save()}});
document.addEventListener("visibilitychange",()=>{if(document.hidden)save();else if(Date.now()-S.last>60000){offline();last=performance.now()}});
addEventListener("pagehide",save);
setInterval(save,10000);

load();
["sound","haptic","fx"].forEach(k=>$("#opt"+k[0].toUpperCase()+k.slice(1)).checked=S.opts[k]);
const hadOffline=offline();
renderAll();
if(!hadOffline&&dailyAvailable()&&S.clicks>0)setTimeout(()=>{if($("#modal").classList.contains("hidden"))openDaily()},800);
requestAnimationFrame(frame);
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
window.VT={get S(){return S},save,load,bps,soulGain,earn:n=>earn(n),renderAll}; // Debug/Test-Hook
})();
