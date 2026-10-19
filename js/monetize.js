// Monetarisierungs-Abstraktion. Im Browser: TEST-Mocks. In der App: Capacitor AdMob + RevenueCat (Stubs).
// Echte IDs vor Release eintragen und isTest=false setzen.
window.MON=(()=>{
const cap=window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform();
const P=(window.Capacitor&&window.Capacitor.Plugins)||{};
const CFG={
  isTest:true,
  admob:{iosRewarded:"ca-app-pub-3940256099942544/1712485313"/*Google-Test-ID*/},
  revenuecat:{iosApiKey:"appl_TEST_KEY_ERSETZEN"},
};
const PRODUCTS=[
  {id:"vt_starter",   type:"once", name:"Starterpaket",      desc:"300 💎 · 4 h x2-Boost · Werbefrei 7 Tage", price:"1,99 €", grant:{diamonds:300,boostH:4,noAdsDays:7}},
  {id:"vt_noads",     type:"once", name:"Werbefrei",          desc:"Alle Belohnungen ohne Werbung – für immer", price:"3,99 €", grant:{noAds:true}},
  {id:"vt_permx2",    type:"once", name:"Ewiger Blutpakt",    desc:"Dauerhaft x2 Produktion",                  price:"5,99 €", grant:{permX2:true}},
  {id:"vt_dia_s",     type:"consumable", name:"Handvoll Blutdiamanten", desc:"120 💎", price:"0,99 €", grant:{diamonds:120}},
  {id:"vt_dia_m",     type:"consumable", name:"Beutel Blutdiamanten",   desc:"700 💎 (+15 % Bonus)", price:"4,99 €", grant:{diamonds:700}},
  {id:"vt_dia_l",     type:"consumable", name:"Truhe Blutdiamanten",    desc:"1.600 💎 (+30 % Bonus)", price:"9,99 €", grant:{diamonds:1600}},
];
let ready=false;
async function init(){
  if(ready)return;ready=true;
  try{
    if(cap&&P.AdMob)await P.AdMob.initialize({initializeForTesting:CFG.isTest});
    if(cap&&P.Purchases)await P.Purchases.configure({apiKey:CFG.revenuecat.iosApiKey});
  }catch(e){console.warn("MON init",e)}
}
function mockAd(){
  return new Promise(res=>{
    const o=document.createElement("div");o.id="adOverlay";
    o.innerHTML=`<div class="adbox"><div class="adtag">TEST-WERBUNG</div><div class="adart">🦇🍷🦇</div><p>Hier läuft in der App eine Video-Werbung.</p><div class="adcount">3</div><button class="btn" id="adSkip">Abbrechen</button></div>`;
    document.body.appendChild(o);let n=3,done=false;
    const t=setInterval(()=>{n--;o.querySelector(".adcount").textContent=n>0?n:"✔";if(n<=0){clearInterval(t);done=true;setTimeout(()=>{o.remove();res(true)},300)}},1000);
    o.querySelector("#adSkip").onclick=()=>{if(done)return;clearInterval(t);o.remove();res(false)};
  });
}
// Belohnte Werbung. noAds => Belohnung sofort.
async function rewarded(reason,noAds){
  await init();
  if(noAds)return true;
  if(cap&&P.AdMob){try{await P.AdMob.prepareRewardVideoAd({adId:CFG.admob.iosRewarded,isTesting:CFG.isTest});const r=await P.AdMob.showRewardVideoAd();return!!r}catch(e){return false}}
  return mockAd();
}
// Kauf. Browser: TEST-Bestätigungsdialog, es wird kein Geld berechnet.
async function purchase(id){
  await init();const p=PRODUCTS.find(x=>x.id===id);if(!p)return null;
  if(cap&&P.Purchases){try{const offerings=await P.Purchases.getOfferings();const pkg=offerings.current.availablePackages.find(k=>k.product.identifier===id);await P.Purchases.purchasePackage({aPackage:pkg});return p}catch(e){return null}}
  return new Promise(res=>{
    const o=document.createElement("div");o.id="adOverlay";
    o.innerHTML=`<div class="adbox"><div class="adtag">TEST-KAUF · kein echtes Geld</div><h3>${p.name}</h3><p>${p.desc}</p><p><b>${p.price}</b></p><div class="row gap"><button class="btn" data-a="0">Abbrechen</button><button class="btn gold" data-a="1">Test-Kauf bestätigen</button></div></div>`;
    document.body.appendChild(o);o.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{o.remove();res(b.dataset.a==="1"?p:null)});
  });
}
async function restore(){await init();if(cap&&P.Purchases){try{const r=await P.Purchases.restorePurchases();return Object.keys(r.customerInfo.entitlements.active||{})}catch(e){}}return null}
return{CFG,PRODUCTS,init,rewarded,purchase,restore,isTest:()=>CFG.isTest};
})();
