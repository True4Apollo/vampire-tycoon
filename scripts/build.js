// Kopiert die Web-Dateien nach www/ (webDir für Capacitor)
const fs=require("fs"),path=require("path");const out="www";fs.rmSync(out,{recursive:true,force:true});
for(const f of ["index.html","manifest.webmanifest","sw.js","css","js","icons","assets"])fs.cpSync(f,path.join(out,f),{recursive:true});
console.log("Build fertig → www/");
