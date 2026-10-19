// Vampire Tycoon – Spieldaten (alle Figuren/Orte frei erfunden)
const PORTRAIT = id => (typeof ART!=="undefined"?ART.portrait(id):`assets/portraits/${id}.svg`);

const PRODUCERS = [
  {id:"bat",   ic:"🦇", name:"Fledermaus",      desc:"Saugt nachts an Viehweiden.",            cost:15,     bps:0.1},
  {id:"rat",   ic:"🐀", name:"Rattenschwarm",   desc:"Unauffällig. Hungrig. Überall.",         cost:100,    bps:1},
  {id:"ghoul", ic:"🧟", name:"Ghul",            desc:"Schlurft über den Friedhof von Nebelhain.", cost:1100, bps:8},
  {id:"serv",  ic:"🤵", name:"Diener",          desc:"Lockt Reisende ins Gasthaus.",           cost:12000,  bps:47},
  {id:"bride", ic:"👰", name:"Vampirbraut",     desc:"Betört die Gäste beim Herbstball.",      cost:130000, bps:260},
  {id:"crypt", ic:"⚰️", name:"Gruft",           desc:"Ein Blutlager unter der alten Kapelle.", cost:1.4e6,  bps:1400},
  {id:"bar",   ic:"🍷", name:"Nachtclub ‚Crimson'", desc:"Die Gäste zahlen gern – mit Blut.",  cost:2e7,    bps:7800},
  {id:"castle",ic:"🏰", name:"Schloss Ravenmoor", desc:"Herrschaftssitz über dem Tal.",         cost:3.3e8,  bps:44000},
  {id:"cult",  ic:"🌕", name:"Blutmond-Kult",   desc:"Hunderte Anhänger, ein Ziel.",           cost:5.1e9,  bps:260000},
  {id:"realm", ic:"🌑", name:"Schattenreich",   desc:"Eine Welt, in der es nie Tag wird.",     cost:7.5e10, bps:1.6e6},
];

// Charaktere: lv0 = gesperrt. unlock = Freischaltkosten. lvCost(lv) = Kosten für nächstes Level.
const CHARACTERS = [
  {id:"dorian", name:"Dorian Ashcroft", role:"Der ältere Bruder · Vampir seit 1864",
   story:"Dorian kämpft seit über 150 Jahren gegen seinen Hunger. Er trägt Tagebücher voller Schuld mit sich und wacht still über Nebelhain – und über die Frau, die einem Bild aus seiner Vergangenheit gleicht.",
   unlock:500, ability:"Ewige Geduld", eff:"+15 % gesamte Produktion pro Level", max:25},
  {id:"lucien", name:"Lucien Ashcroft", role:"Der jüngere Bruder · Charmant & gefährlich",
   story:"Lucien hat seinem Bruder nie verziehen, dass er ihn verwandelte. Er lebt im Exzess, liebt das Chaos – und hasst es, wie sehr er Dorian trotzdem braucht.",
   unlock:25000, ability:"Blutrausch", eff:"+30 % Bisskraft & +2 % Krit-Chance (x10) pro Level", max:25},
  {id:"sabine", name:"Sabine Thornwood", role:"Die Hexe · Letzte ihrer Linie",
   story:"Die Thornwoods hüten Nebelhains Grimoire seit Generationen. Sabine vertraut keinem Vampir – doch der Bann um die Stadt bröckelt, und sie braucht Verbündete.",
   unlock:1e6, ability:"Zirkel der Funken", eff:"Ereignisse +12 % stärker & öfter, Pfade −3 % Kosten pro Level", max:20},
  {id:"kade", name:"Kade Halloway", role:"Der Werwolf · Erbe des Fluchs",
   story:"Ein Unfall weckte den Fluch in seinem Blut. Bei Vollmond verliert Kade sich selbst. Vampire sind seine Erzfeinde – doch der Clan hat ihm Ketten aus Silberkraut geschmiedet.",
   unlock:5e7, ability:"Ruf des Mondes", eff:"Nachtbonus +25 % pro Level", max:20},
  {id:"mira", name:"Mira Vale", role:"Die Doppelgängerin · Spiegelbild einer Toten",
   story:"Mira kam als Waise nach Nebelhain und ahnte nichts. Dann sah sie ein Porträt aus dem Jahr 1864 – mit ihrem Gesicht. Ihr Blut ist der Schlüssel zu einem uralten Ritual.",
   unlock:2.5e9, ability:"Gespiegelte Seele", eff:"+12 % Seelen & +1 h Offline-Limit pro Level", max:15},
];
const charLvCost = (c,lv)=> Math.ceil(c.unlock*Math.pow(2.6,lv));

// Blutpfade (Upgrade-Baum). req = vorheriger Knoten.
const TREE = [
  {name:"🦷 Pfad der Fänge", nodes:[
    {id:"f1",ic:"🦷",n:"Spitze Fänge",d:"Biss x2",cost:100},
    {id:"f2",ic:"🩸",n:"Arterienkunde",d:"Biss x2",cost:2500},
    {id:"f3",ic:"💥",n:"Kritischer Biss",d:"+5 % Krit-Chance",cost:50000},
    {id:"f4",ic:"🌊",n:"Blutwelle",d:"Biss +3 % deiner Blut/s",cost:1e6},
    {id:"f5",ic:"👑",n:"Fürstenbiss",d:"Biss x5",cost:5e8},
  ]},
  {name:"🦇 Pfad der Diener", nodes:[
    {id:"s1",ic:"🦇",n:"Schwarmgeist",d:"Fledermäuse & Ratten x3",cost:500},
    {id:"s2",ic:"🧟",n:"Ghulpeitsche",d:"Ghule & Diener x3",cost:20000},
    {id:"s3",ic:"💃",n:"Herbstball",d:"Bräute & Gruften x3",cost:2e6},
    {id:"s4",ic:"🍷",n:"Rote Lounge",d:"Club & Schloss x3",cost:2e8},
    {id:"s5",ic:"🌑",n:"Ewige Finsternis",d:"Kult & Schattenreich x3",cost:5e10},
  ]},
  {name:"🌙 Pfad der Nacht", nodes:[
    {id:"n1",ic:"🌙",n:"Nachtschwärmer",d:"Nachtbonus +50 %",cost:5000},
    {id:"n2",ic:"⏳",n:"Lange Nächte",d:"Nächte dauern 50 % länger",cost:150000},
    {id:"n3",ic:"💤",n:"Schlaf im Sarg",d:"Offline-Ertrag 50 % → 80 %",cost:5e6},
    {id:"n4",ic:"🦉",n:"Wachende Augen",d:"Offline-Limit +4 h",cost:3e8},
    {id:"n5",ic:"🌕",n:"Blutmond-Pakt",d:"Alle Produktion x2",cost:1e11},
  ]},
];

const CHAPTERS = [
  {req:s=>true, goal:"Sammle 50 Blut", check:s=>s.run>=50, lines:[
    ["nar","Nebelhain, Virginia-Tal. Eine Kleinstadt, in der die Uhren langsamer gehen und der Nebel nie ganz verschwindet."],
    ["nar","Du erwachst in einer Gruft. Durst brennt in deiner Kehle. Du bist… neu."],
    ["dorian","Ruhig. Atme – auch wenn du es nicht mehr musst. Ich bin Dorian. Du wirst lernen, zu jagen, ohne zu töten."]]},
  {goal:"Schalte Dorian frei (500 Blut)", check:s=>s.chars.dorian>0, lines:[
    ["dorian","Ein Vampir allein überlebt nicht lange. Gib mir Blut, und ich gebe dir Schutz."],
    ["nar","Dorian blickt hinüber zum Gasthaus. Dort lacht eine junge Frau mit silbernem Haar. Er erstarrt."]]},
  {goal:"Besitze 10 Ghule", check:s=>s.own.ghoul>=10, lines:[
    ["lucien","Na, sieh an. Mein heiliger Bruder hat einen Schützling. Wie rührend."],
    ["dorian","Lucien. Du solltest nicht hier sein."],
    ["lucien","Und du solltest nicht mehr leben. Wir alle haben Enttäuschungen erlebt, Bruder."]]},
  {goal:"Schalte Lucien frei", check:s=>s.chars.lucien>0, lines:[
    ["lucien","Ich bleibe. Nicht für dich – für den Spaß. Diese Stadt war viel zu lange langweilig."],
    ["nar","Ein Kerzenlicht flackert im Fenster der alten Thornwood-Villa. Jemand beobachtet euch."]]},
  {goal:"Erreiche 1 Mio. Blut (gesamt)", check:s=>s.run>=1e6, lines:[
    ["sabine","Ich weiß, was ihr seid. Meine Großmutter hat mir von den Ashcroft-Brüdern erzählt."],
    ["sabine","Der Bann um Nebelhain zerbricht. Wenn ich euch nicht helfe, kommt etwas Schlimmeres als ihr."]]},
  {goal:"Schalte Sabine frei", check:s=>s.chars.sabine>0, lines:[
    ["sabine","Ein Bündnis also. Aber hört gut zu: Rührt ihr einen Menschen in dieser Stadt an, brenne ich euch nieder."],
    ["nar","Draußen heult etwas. Zu laut für einen Hund. Zu nah für einen Wolf."]]},
  {goal:"Besitze 5 Nachtclubs", check:s=>s.own.bar>=5, lines:[
    ["kade","Vampire. In meinem Revier. Ihr riecht nach Tod und Rauch."],
    ["lucien","Und du nach nassem Hund. Wollen wir jetzt reden, oder kläffen?"],
    ["dorian","Lucien. Genug. Der Vollmond kommt in drei Tagen – wir brauchen ihn."]]},
  {goal:"Schalte Kade frei", check:s=>s.chars.kade>0, lines:[
    ["kade","Ich kämpfe nicht für euch. Ich kämpfe gegen das, was hinter dem Nebel lauert."],
    ["sabine","Dann sind wir uns einig. Und es hat einen Namen: Die Gespiegelte."]]},
  {goal:"Besitze ein Schloss Ravenmoor", check:s=>s.own.castle>=1, lines:[
    ["mira","Warum hängt im Schloss ein Gemälde von mir? Von 1864?!"],
    ["dorian","Weil sie aussah wie du. Ihr Name war Isolde. Und sie hat uns beide zerstört."],
    ["lucien","…und jetzt ist sie wieder da. Herrlich. Familienfeiern werden spannend."]]},
  {goal:"Schalte Mira frei", check:s=>s.chars.mira>0, lines:[
    ["mira","Wenn mein Blut der Schlüssel ist, entscheide ICH, welche Tür es öffnet."],
    ["nar","Der Clan von Nebelhain ist vereint. Doch im Spiegel lächelt Isolde."]]},
  {goal:"Werde unsterblich (1. Ritual)", check:s=>s.prestiges>=1, lines:[
    ["sabine","Das Ritual hat funktioniert. Du bist wiedergeboren – stärker als zuvor."],
    ["mira","Und ich höre sie flüstern. Isolde. Sie weiß jetzt, dass wir kommen."],
    ["nar","Ende von Buch I – ‚Blut von Nebelhain'. Fortsetzung folgt…"]]},
];

const ACHIEVEMENTS = [
  ["c1","Erster Biss","1 Mal gebissen",s=>s.clicks>=1],
  ["c2","Blutdurst","500 Bisse",s=>s.clicks>=500],
  ["c3","Fänge aus Stahl","5.000 Bisse",s=>s.clicks>=5000],
  ["b1","Ein Schluck","1.000 Blut gesammelt",s=>s.all>=1e3],
  ["b2","Blutbank","1 Mio. Blut gesammelt",s=>s.all>=1e6],
  ["b3","Rotes Meer","1 Mrd. Blut gesammelt",s=>s.all>=1e9],
  ["b4","Ozean der Nacht","1 Bio. Blut gesammelt",s=>s.all>=1e12],
  ["p1","Kleiner Hofstaat","50 Diener insgesamt",s=>Object.values(s.own).reduce((a,b)=>a+b,0)>=50],
  ["p2","Armee der Nacht","250 Diener insgesamt",s=>Object.values(s.own).reduce((a,b)=>a+b,0)>=250],
  ["p3","Fledermauskönig","100 Fledermäuse",s=>s.own.bat>=100],
  ["k1","Bruderzwist","Beide Ashcroft-Brüder freigeschaltet",s=>s.chars.dorian>0&&s.chars.lucien>0],
  ["k2","Der ganze Clan","Alle 5 Charaktere",s=>CHARACTERS.every(c=>s.chars[c.id]>0)],
  ["k3","Veteran","Ein Charakter auf Level 10",s=>Object.values(s.chars).some(l=>l>=10)],
  ["e1","Goldene Beute","Eine seltene Fledermaus gefangen",s=>s.goldens>=1],
  ["e2","Blutmond","Ein Blutmond-Ereignis erlebt",s=>s.events>=1],
  ["d1","Treue Seele","7-Tage-Serie",s=>s.streak>=7],
  ["u1","Wiedergeboren","Erstes Unsterblichkeits-Ritual",s=>s.prestiges>=1],
  ["u2","Uralt","25 Seelen",s=>s.souls>=25],
  ["t1","Pfadfinder","Einen Blutpfad vollendet",s=>TREE.some(b=>b.nodes.every(n=>s.tree.includes(n.id)))],
  ["x1","Kritiker","100 kritische Bisse",s=>s.crits>=100],
];

const DAILY = [ {m:5,t:"5 Min. Ertrag"},{m:10,t:"10 Min."},{m:20,t:"20 Min."},{m:30,t:"30 Min."},{m:45,t:"45 Min."},{m:60,t:"1 Std."},{m:120,t:"2 Std. + 👻"} ];

const TUTORIAL = [
  {t:"Willkommen in Nebelhain, junger Vampir. Tippe auf den Bluttropfen, um zu beißen und Blut zu sammeln!", el:"#bite", until:s=>s.clicks>=10},
  {t:"Sehr gut! Scrolle nach unten zum Fledermausturm und kaufe eine Fledermaus – sie sammelt Blut für dich, auch wenn du nicht tippst.", el:"#mansion [data-p='0']", until:s=>s.own.bat>=1},
  {t:"Dein Imperium wächst! Nachts (🌙) verdoppelt sich die Produktion. Schalte unter 🧛 Clan deinen ersten Verbündeten frei, sobald du 500 Blut hast.", el:"#nav [data-tab=clan]", until:s=>s.chars.dorian>0},
  {t:"Unter 🌿 Pfade findest du mächtige Verbesserungen. Und hol dir täglich deine 🎁 Belohnung! Viel Spaß, Kind der Nacht.", el:"#nav [data-tab=tree]", until:s=>true, last:true},
];

const EVENTS = [
  {id:"bloodmoon", t:"🌕 BLUTMOND! Produktion x7", dur:20, prod:7},
  {id:"coven", t:"🔮 Hexenzirkel! Bisse x10", dur:15, click:10},
  {id:"festival", t:"🎃 Gründerfest! Alles x3", dur:30, prod:3, click:3},
];
