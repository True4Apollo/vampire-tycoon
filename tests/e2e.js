const pp=require("puppeteer-core");const D="/workspace/vampire-tycoon/";
(async()=>{
const b=await pp.launch({executablePath:"/usr/bin/google-chrome",args:["--no-sandbox","--autoplay-policy=no-user-gesture-required"],headless:"new"});
const errs=[];const log=m=>console.log("✔",m);
// icons

const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
p.on("pageerror",e=>errs.push("pageerror: "+e.message));p.on("console",m=>{if(m.type()==="error")errs.push("console: "+m.text())});
p.on("requestfailed",r=>errs.push("reqfail: "+r.url()));
await p.goto("http://localhost:8765/index.html");await p.evaluate(()=>localStorage.clear());await p.reload();await new Promise(r=>setTimeout(r,800));
const sh=async n=>{await p.evaluate(()=>{document.querySelector("#toasts").innerHTML="";const m=document.querySelector("#modal");if(m.classList.contains("hidden"))return;});return p.screenshot({path:D+"screenshots/v5-"+n+".png"})};
await sh("01-intro-story");log("Intro-Kapitel angezeigt: "+await p.$eval("#modal",e=>!e.classList.contains("hidden")));
await p.click("#mbody [data-close]");await new Promise(r=>setTimeout(r,300));await sh("02-tutorial");
for(let i=0;i<30;i++){await p.click("#bite");}
await new Promise(r=>setTimeout(r,300));
let s=await p.evaluate(()=>({b:VT.S.blood,c:VT.S.clicks,tut:VT.S.tut}));log(`30 Bisse → clicks=${s.c}, Blut=${s.b.toFixed(1)}, Tutorial-Schritt=${s.tut}`);
if(s.c!==30)errs.push("click count wrong");
await p.evaluate(()=>{const m=document.querySelector("#mbody [data-close]");if(m)m.click()});
await p.evaluate(()=>{VT.showPlot(0);document.querySelector("#plotPanel [data-p]").click()});
s=await p.evaluate(()=>VT.S.own.bat);log("Fledermaus gekauft: "+s);if(s!==1)errs.push("buy failed");
await p.evaluate(()=>VT.earn(5e6));await new Promise(r=>setTimeout(r,300));
await p.evaluate(()=>{document.querySelector("#plotPanel [data-buy='10']").click()});
for(let i=0;i<5;i++)await p.evaluate(i=>{VT.showPlot(i);document.querySelector("#plotPanel [data-p]").click()},i);
await p.evaluate(()=>{document.querySelector("#mbody [data-close]")?.click()});
await new Promise(r=>setTimeout(r,400));await p.evaluate(()=>VT.showPlot(2));await new Promise(r=>setTimeout(r,500));await sh("03-gebaeude-panel");await p.evaluate(()=>VT.hidePlot());await new Promise(r=>setTimeout(r,300));await sh("03b-karte");
// Drag-Test
const c0=await p.evaluate(()=>({...VT.cam}));await p.mouse.move(200,400);await p.mouse.down();await p.mouse.move(120,250,{steps:8});await p.mouse.up();await new Promise(r=>setTimeout(r,500));
const c1=await p.evaluate(()=>({...VT.cam}));log(`Karte gezogen: ${JSON.stringify(c0)} → ${JSON.stringify(c1)}`);if(c0.x===c1.x&&c0.y===c1.y)errs.push("drag failed");await sh("03c-karte-gezogen");
// Tap auf Gebäude öffnet Panel
await p.evaluate(()=>document.querySelector("#homeBtn").click());await new Promise(r=>setTimeout(r,300));const tp=await p.evaluate(()=>{const r=document.querySelector("#map").getBoundingClientRect(),P=VT.PLOTS[0];return{x:r.left+r.width/2+P.x-VT.cam.x,y:r.top+r.height/2+P.y-VT.cam.y}});
await p.mouse.click(tp.x,tp.y);await new Promise(r=>setTimeout(r,300));const tapOk=await p.evaluate(()=>!document.querySelector("#plotPanel").classList.contains("hidden"));log("Tap öffnet Panel: "+tapOk);if(!tapOk)errs.push("tap failed");await sh("03d-tap-panel");await p.evaluate(()=>VT.hidePlot());
log("x10-Kauf: "+JSON.stringify(await p.evaluate(()=>VT.S.own)));
await p.click("#nav [data-tab=clan]");await p.evaluate(()=>{document.querySelector("#clan [data-c=dorian]").click()});await new Promise(r=>setTimeout(r,400));
await sh("04-charakter-freigeschaltet");await p.evaluate(()=>document.querySelector("#mbody [data-close]")?.click());
await p.evaluate(()=>{document.querySelector("#clan [data-c=lucien]").click()});await p.evaluate(()=>document.querySelector("#mbody [data-close]")?.click());
await p.evaluate(()=>{document.querySelector("#clan [data-c=dorian]").click()});
log("Clan: "+JSON.stringify(await p.evaluate(()=>VT.S.chars)));
await p.evaluate(()=>window.scrollTo(0,0));await new Promise(r=>setTimeout(r,300));await p.evaluate(()=>document.querySelector("#mbody [data-close]")?.click());await sh("05-clan");
await p.evaluate(()=>{VT.earn(1e6);document.querySelector("#mbody [data-close]")?.click()});await p.click("#nav [data-tab=tree]");await p.evaluate(()=>{for(const id of ["0,0","0,1","1,0","2,0"])document.querySelector(`#tree [data-t='${id}']`)?.click()});
log("Blut vor Pfaden/Buttons: "+await p.evaluate(()=>VT.S.blood+" "+[...document.querySelectorAll("#tree [data-t]")].map(b=>b.disabled).join("")));log("Pfade: "+await p.evaluate(()=>VT.S.tree.join(",")));await new Promise(r=>setTimeout(r,300));await p.evaluate(()=>document.querySelector("#mbody [data-close]")?.click());await sh("06-blutpfade");
await p.evaluate(()=>{document.querySelector("#mbody [data-close]")?.click();document.querySelector("#nav [data-tab=hunt]").click();VT.hidePlot()});await new Promise(r=>setTimeout(r,600));await sh("13-karte-manager");
// save/load
const before=await p.evaluate(()=>{VT.save();return JSON.stringify({o:VT.S.own,c:VT.S.chars,t:VT.S.tree})});
await p.reload();await new Promise(r=>setTimeout(r,800));
const after=await p.evaluate(()=>JSON.stringify({o:VT.S.own,c:VT.S.chars,t:VT.S.tree}));log("Save/Load identisch: "+(before===after));if(before!==after)errs.push("save/load mismatch");
await p.evaluate(()=>document.querySelector("#mbody [data-close]")?.click());
// offline
await p.evaluateOnNewDocument(()=>{if(sessionStorage.getItem("offt")==="1"){sessionStorage.setItem("offt","2");const o=JSON.parse(localStorage.getItem("vampTycoon_v2"));o.last=Date.now()-3*3600e3;localStorage.setItem("vampTycoon_v2",JSON.stringify(o))}});
await p.evaluate(()=>sessionStorage.setItem("offt","1"));
await p.goto("http://localhost:8765/index.html");await new Promise(r=>setTimeout(r,800));
log("Offline-Modal: "+await p.$eval("#mbody",e=>e.innerText.replace(/\n+/g," | ")));await sh("07-offline");
await p.evaluate(()=>document.querySelector("#mbody [data-close]")?.click());
// daily
await p.click("#nav [data-tab=hunt]");await p.evaluate(()=>document.querySelector("#dailyBtn").click());await new Promise(r=>setTimeout(r,300));await sh("08-tagesbelohnung");
await p.evaluate(()=>document.querySelector("#mbody [data-close]").click());log("Daily-Streak: "+await p.evaluate(()=>VT.S.daily.streak));
// prestige
await p.evaluate(()=>VT.earn(5e9));const g=await p.evaluate(()=>VT.soulGain());
await p.click("#nav [data-tab=more]");await new Promise(r=>setTimeout(r,300));await sh("09-mehr-unsterblichkeit");
await p.evaluate(()=>document.querySelector("#mbody [data-close]")?.click());await p.evaluate(()=>document.querySelector("#prestige").click());await new Promise(r=>setTimeout(r,200));await p.evaluate(()=>document.querySelector("#mbody [data-close=yes]").click());
s=await p.evaluate(()=>({souls:VT.S.souls,bat:VT.S.own.bat,blood:VT.S.blood,chars:VT.S.chars.dorian,p:VT.S.prestiges}));log(`Prestige (erwartet ${g} Seelen): `+JSON.stringify(s));
if(s.souls<g||s.bat!==0||s.p!==1)errs.push("prestige wrong");
// event + golden
await p.evaluate(()=>document.querySelector("#mbody [data-close]")?.click());
await p.click("#nav [data-tab=hunt]");
await p.evaluate(()=>{const g=document.querySelector("#golden");g.classList.remove("hidden")});await new Promise(r=>setTimeout(r,2500));
await sh("10-goldene-fledermaus");await p.evaluate(()=>document.querySelector("#golden").click());await new Promise(r=>setTimeout(r,500));
log("Goldene Fledermaus gefangen: "+await p.evaluate(()=>VT.S.goldens));
await p.evaluate(()=>document.querySelector("#storyBtn").click());await new Promise(r=>setTimeout(r,300));await sh("11-chronik");
// Monetarisierung
await p.evaluate(()=>{document.querySelector("#mbody [data-close]")?.click();document.querySelector("#nav [data-tab=shop]").click()});
await new Promise(r=>setTimeout(r,400));await sh("shop");
await p.evaluate(()=>document.querySelector("[data-fr=boost]").click());await new Promise(r=>setTimeout(r,1200));await sh("shop-ad");
await new Promise(r=>setTimeout(r,3000));log("Boost aktiv nach Werbung: "+await p.evaluate(()=>VT.S.boostEnd>Date.now()));
await p.evaluate(()=>document.querySelector("[data-iap=vt_starter]").click());await new Promise(r=>setTimeout(r,300));await sh("shop-kauf");
await p.evaluate(()=>document.querySelector("#adOverlay [data-a='1']").click());await new Promise(r=>setTimeout(r,300));
let m=await p.evaluate(()=>({d:VT.S.diamonds,na:VT.S.noAdsUntil>Date.now(),b:VT.S.bought}));log("Starterpaket: "+JSON.stringify(m));if(m.d<300)errs.push("iap failed");
await p.evaluate(()=>document.querySelector("[data-du=hour]").click());log("Diamanten nach 1h-Ertrag: "+await p.evaluate(()=>VT.S.diamonds));
await p.evaluate(()=>document.querySelector("[data-fr=chest]").click());await new Promise(r=>setTimeout(r,500));log("Truhe (werbefrei, sofort): "+await p.evaluate(()=>VT.S.chestLast>0));
await p.evaluate(()=>{VT.save()});await p.reload();await new Promise(r=>setTimeout(r,800));log("Diamanten nach Reload: "+await p.evaluate(()=>VT.S.diamonds));
await p.evaluate(()=>{document.querySelector("#mbody [data-close]")?.click();document.querySelector("#nav [data-tab=shop]").click()});await new Promise(r=>setTimeout(r,500));await sh("shop");
// desktop
await p.evaluate(()=>document.querySelector("#mbody [data-close]")?.click());
await p.setViewport({width:1280,height:800});await new Promise(r=>setTimeout(r,500));await sh("12-desktop");
log("Erfolge: "+await p.evaluate(()=>VT.S.ach.length));
console.log(errs.length?"FEHLER:\n"+errs.join("\n"):"KEINE FEHLER");await b.close();
})().catch(e=>{console.error("TESTCRASH",e);process.exit(1)});
