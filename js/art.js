// Cartoon-/Chibi-Grafiken, komplett im Code gezeichnet (SVG)
const ART=(()=>{
const C={
 dorian:{skin:"#f4e9f0",hair:"#2b2140",eye:"#ff3355",coat:"#3b2a5c",trim:"#ff4d6d",style:"slick"},
 lucien:{skin:"#fbecea",hair:"#ffd166",eye:"#ff3355",coat:"#2e2e3a",trim:"#ff7b00",style:"spiky"},
 sabine:{skin:"#ffd9c0",hair:"#e2552b",eye:"#3ddc84",coat:"#5b2a86",trim:"#3ddc84",style:"curly",hat:"witch"},
 kade:{skin:"#e0a77d",hair:"#5a3a22",eye:"#ffb000",coat:"#b23a3a",trim:"#ffb000",style:"shaggy",ears:true},
 mira:{skin:"#fff0f6",hair:"#e9e4ff",eye:"#a66bff",coat:"#7a4fd1",trim:"#ffd6ff",style:"bob"},
};
function hair(s,c){return{
 slick:`<path d="M22 44Q20 14 50 12Q80 14 78 44Q70 26 50 26Q34 26 22 44Z" fill="${c}"/>`,
 spiky:`<path d="M20 46L22 22L30 28L34 10L44 22L52 6L58 22L68 10L70 28L80 22L80 46Q70 28 50 28Q30 28 20 46Z" fill="${c}"/>`,
 curly:[[26,26,12],[38,16,13],[52,13,13],[66,18,13],[76,30,11],[22,42,10],[80,44,10],[22,58,9],[80,58,9]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join(""),
 shaggy:`<path d="M18 50Q16 12 50 12Q84 12 82 50L76 36L70 42L64 30L56 38L48 28L40 38L32 30L26 42Z" fill="${c}"/>`,
 bob:`<path d="M18 66Q14 14 50 12Q86 14 82 66L74 66Q76 30 50 28Q24 30 26 66Z" fill="${c}"/>`,
}[s]}
function chibi(id,size=100){
 const c=C[id];return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="${size}" height="${size*1.2}">
 <ellipse cx="50" cy="116" rx="26" ry="4" fill="#0004"/>
 <path d="M28 118Q28 86 50 84Q72 86 72 118Z" fill="${c.coat}" stroke="#1a0f2e" stroke-width="2.5"/>
 <path d="M42 86L50 100L58 86" fill="${c.trim}"/>
 ${c.ears?`<path d="M24 30L20 8L38 22Z M76 30L80 8L62 22Z" fill="${c.hair}" stroke="#1a0f2e" stroke-width="2.5"/>`:""}
 <circle cx="50" cy="50" r="32" fill="${c.skin}" stroke="#1a0f2e" stroke-width="2.5"/>
 ${hair(c.style,c.hair)}
 <ellipse cx="38" cy="54" rx="6" ry="7.5" fill="#1a0f2e"/><ellipse cx="62" cy="54" rx="6" ry="7.5" fill="#1a0f2e"/>
 <ellipse cx="38" cy="55" rx="4" ry="5" fill="${c.eye}"/><ellipse cx="62" cy="55" rx="4" ry="5" fill="${c.eye}"/>
 <circle cx="36" cy="52" r="1.8" fill="#fff"/><circle cx="60" cy="52" r="1.8" fill="#fff"/>
 <ellipse cx="30" cy="64" rx="5" ry="3" fill="#ff8fab" opacity=".6"/><ellipse cx="70" cy="64" rx="5" ry="3" fill="#ff8fab" opacity=".6"/>
 <path d="M44 68Q50 73 56 68" stroke="#1a0f2e" stroke-width="2" fill="none" stroke-linecap="round"/>
 ${id==="kade"?"":`<path d="M46 69l1.5 4l1.5-3.5M51 69.5l1.5 3.5l1.5-4" fill="#fff" stroke="#1a0f2e" stroke-width=".8"/>`}
 ${c.hat==="witch"?`<path d="M20 26L82 26L58 20L48 -6L40 20Z" fill="#2a1446" stroke="#1a0f2e" stroke-width="2.5"/><rect x="40" y="18" width="20" height="4" fill="#3ddc84"/>`:""}
 </svg>`;
}
const uri=s=>"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s);
// kleiner Arbeiter (Chibi-Diener) – Farbe je Station
function worker(col,hat){return `<svg viewBox="0 0 40 50" width="34" height="42"><ellipse cx="20" cy="48" rx="11" ry="2" fill="#0004"/>
 <g class="legs"><rect class="l1" x="13" y="38" width="5" height="9" rx="2" fill="#1a0f2e"/><rect class="l2" x="22" y="38" width="5" height="9" rx="2" fill="#1a0f2e"/></g>
 <rect x="10" y="26" width="20" height="15" rx="6" fill="${col}" stroke="#1a0f2e" stroke-width="2"/>
 <circle cx="20" cy="17" r="11" fill="#e9f0ff" stroke="#1a0f2e" stroke-width="2"/>
 <circle cx="16" cy="17" r="2" fill="#ff3355"/><circle cx="24" cy="17" r="2" fill="#ff3355"/>
 <path d="M17 22l1 2l1-2M21 22l1 2l1-2" fill="#fff" stroke="#1a0f2e" stroke-width=".6"/>
 <path d="M8 13Q20 0 32 13Q26 8 20 8Q14 8 8 13Z" fill="${hat}" stroke="#1a0f2e" stroke-width="1.5"/>
 <g class="bottle"><rect x="27" y="22" width="9" height="13" rx="3" fill="#ff2f5b" stroke="#1a0f2e" stroke-width="1.5"/><rect x="29.5" y="18" width="4" height="5" fill="#d9d2ff" stroke="#1a0f2e" stroke-width="1"/></g></svg>`}
// Stations-Grafiken
const ST={
 bat:`<svg viewBox="0 0 80 60"><path d="M10 50Q40 0 70 50Z" fill="#4a3a6e" stroke="#1a0f2e" stroke-width="3"/><path d="M28 36q-8-8-16-2q6 0 8 6q4-6 8-4z M52 36q8-8 16-2q-6 0-8 6q-4-6-8-4z" fill="#2b1f44"/><circle cx="40" cy="36" r="6" fill="#2b1f44"/><circle cx="38" cy="35" r="1.3" fill="#ff3355"/><circle cx="42" cy="35" r="1.3" fill="#ff3355"/></svg>`,
 rat:`<svg viewBox="0 0 80 60"><rect x="8" y="22" width="64" height="32" rx="4" fill="#7b5a3a" stroke="#1a0f2e" stroke-width="3"/><path d="M8 30h64M8 42h64" stroke="#5a3f26" stroke-width="2"/><ellipse cx="40" cy="22" rx="12" ry="8" fill="#8a8aa0" stroke="#1a0f2e" stroke-width="2"/><circle cx="34" cy="16" r="4" fill="#ffb3c6"/><circle cx="46" cy="16" r="4" fill="#ffb3c6"/></svg>`,
 ghoul:`<svg viewBox="0 0 80 60"><path d="M24 56V24Q24 10 40 10Q56 10 56 24V56Z" fill="#9aa3b5" stroke="#1a0f2e" stroke-width="3"/><path d="M40 18v20M32 26h16" stroke="#5c6475" stroke-width="4"/><path d="M14 56q6-8 12 0z M58 56q6-10 12 0z" fill="#5fbf6a"/></svg>`,
 serv:`<svg viewBox="0 0 80 60"><rect x="12" y="20" width="56" height="36" rx="3" fill="#a0522d" stroke="#1a0f2e" stroke-width="3"/><path d="M8 22L40 4L72 22Z" fill="#6b2a3a" stroke="#1a0f2e" stroke-width="3"/><rect x="34" y="34" width="12" height="22" fill="#2b1f44"/><rect x="18" y="28" width="10" height="10" fill="#ffd166"/><rect x="52" y="28" width="10" height="10" fill="#ffd166"/></svg>`,
 bride:`<svg viewBox="0 0 80 60"><ellipse cx="40" cy="54" rx="30" ry="5" fill="#ff8fab"/><path d="M40 8l4 10h10l-8 7l3 10l-9-6l-9 6l3-10l-8-7h10z" fill="#ffd166" stroke="#1a0f2e" stroke-width="2"/><circle cx="18" cy="40" r="5" fill="#ff4d6d"/><circle cx="62" cy="40" r="5" fill="#ff4d6d"/></svg>`,
 crypt:`<svg viewBox="0 0 80 60"><path d="M26 6L54 6L62 18L54 56L26 56L18 18Z" fill="#6b3f2a" stroke="#1a0f2e" stroke-width="3"/><path d="M40 16v26M32 24h16" stroke="#ffd166" stroke-width="4"/></svg>`,
 bar:`<svg viewBox="0 0 80 60"><rect x="6" y="34" width="68" height="22" rx="3" fill="#3a1f4a" stroke="#1a0f2e" stroke-width="3"/><path d="M26 10h16l-8 14z" fill="#ff2f5b" stroke="#1a0f2e" stroke-width="2"/><path d="M34 24v10" stroke="#1a0f2e" stroke-width="3"/><text x="52" y="26" font-size="12" fill="#ff4dd2" font-weight="900" font-family="sans-serif">BAR</text></svg>`,
 castle:`<svg viewBox="0 0 80 60"><rect x="16" y="24" width="48" height="32" fill="#6e6a8e" stroke="#1a0f2e" stroke-width="3"/><path d="M10 26L22 6L34 26Z M46 26L58 6L70 26Z" fill="#c43a5a" stroke="#1a0f2e" stroke-width="3"/><rect x="34" y="38" width="12" height="18" rx="6" fill="#2b1f44"/></svg>`,
 cult:`<svg viewBox="0 0 80 60"><circle cx="40" cy="26" r="18" fill="#ff3355" stroke="#1a0f2e" stroke-width="3"/><circle cx="34" cy="22" r="4" fill="#ff7b95"/><path d="M14 56h52l-6-10H20z" fill="#3a1f4a" stroke="#1a0f2e" stroke-width="3"/></svg>`,
 realm:`<svg viewBox="0 0 80 60"><ellipse cx="40" cy="32" rx="24" ry="24" fill="#1a0f2e" stroke="#a66bff" stroke-width="4"/><path d="M28 32q12-16 24 0q-12 16-24 0z" fill="#a66bff"/><circle cx="40" cy="32" r="4" fill="#fff"/></svg>`,
};
const STCOL={bat:["#5b3fa0","#2b1f44"],rat:["#8b5a2b","#5a3f26"],ghoul:["#4f8a4f","#2e5a2e"],serv:["#2a2a3a","#111"],bride:["#e85d8a","#fff0f6"],crypt:["#6b3f2a","#3a1f12"],bar:["#c026d3","#3a1f4a"],castle:["#c43a5a","#6e6a8e"],cult:["#b8002e","#3a1f4a"],realm:["#7a4fd1","#1a0f2e"]};
const BG=["#5b3c8c","#6a3f6e","#3f5b6e","#7a4a3a","#8c3c6a","#4a3a2a","#4a1f6a","#5a5a7a","#6a1f3a","#2a1f4a"];
return{chibi,uri,worker,ST,STCOL,BG,portrait:id=>uri(chibi(id,200))};
})();
