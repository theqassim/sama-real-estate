/* ======== Property art: refined architectural renders ======== */
const SKY = {
  dawn:['#5b8cc6','#f0d3b9'],
  day: ['#4b84c4','#d3e4f3'],
  dusk:['#2c3e6e','#e7a98c']
};
function defs(id, mood){
  const s = SKY[mood];
  return `<defs>
    <linearGradient id="sk${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s[0]}"/><stop offset="1" stop-color="${s[1]}"/></linearGradient>
    <linearGradient id="hz${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/></linearGradient>
    <linearGradient id="gl${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5d86b4"/><stop offset="1" stop-color="#1b3557"/></linearGradient>
    <linearGradient id="wm${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe3ae"/><stop offset="1" stop-color="#e3a95c"/></linearGradient>
    <linearGradient id="sea${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d7fb0"/><stop offset="1" stop-color="#7fb2d3"/></linearGradient>
    <linearGradient id="shd${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#sk${id})"/>
  <g fill="#fff" opacity=".16"><rect x="10" y="170" width="26" height="90"/><rect x="40" y="150" width="20" height="110"/><rect x="330" y="160" width="24" height="100"/><rect x="360" y="185" width="30" height="75"/></g>
  <rect y="170" width="400" height="130" fill="url(#hz${id})"/>`;
}
function lines(x, y, w, h, step, stroke){
  let d = '';
  for(let yy = y + step; yy < y + h; yy += step) d += `M${x} ${yy}H${x + w}`;
  return `<path d="${d}" stroke="${stroke}" stroke-width="1" fill="none"/>`;
}
const BUILD = {
  apartment: id => {
    let slabs = '', lit = '';
    for(let i = 0; i < 15; i++) slabs += `<rect x="146" y="${52 + i * 13.5}" width="118" height="2.4" fill="#ece6da"/>`;
    for(let r = 0; r < 14; r++) for(let c = 0; c < 4; c++) if((r * 5 + c * 3) % 7 === 0) lit += `<rect x="${158 + c * 25}" y="${55 + r * 13.5}" width="16" height="9" fill="#ffe2a2" opacity=".75"/>`;
    return `<rect y="262" width="400" height="38" fill="#18273d"/>
    <rect x="36" y="150" width="92" height="112" fill="url(#gl${id})"/>${lines(36,150,92,112,10,'rgba(255,255,255,.2)')}
    <rect x="278" y="112" width="86" height="150" fill="url(#gl${id})"/>${lines(278,112,86,150,10,'rgba(255,255,255,.2)')}
    <rect x="150" y="40" width="110" height="222" fill="url(#gl${id})"/>${slabs}${lit}
    <rect x="150" y="40" width="110" height="222" fill="url(#shd${id})"/>
    <rect x="128" y="256" width="154" height="6" fill="#ece6da"/>`;
  },
  villa: id => `
    <rect y="238" width="400" height="62" fill="#34503f"/>
    <rect x="236" y="262" width="130" height="22" rx="2" fill="#78b4d0" opacity=".9"/>
    <rect x="236" y="262" width="130" height="3" fill="#e9e3d6"/>
    <rect x="60" y="168" width="200" height="72" fill="#d6cdbe"/>
    <rect x="78" y="182" width="124" height="58" fill="url(#wm${id})"/>
    ${[1,2,3,4].map(i => `<rect x="${78 + i * 24.8}" y="182" width="2.2" height="58" fill="#d6cdbe"/>`).join('')}
    <rect x="208" y="182" width="40" height="58" fill="#8d6c49"/>${[1,2,3,4,5,6].map(i => `<rect x="${208 + i * 5.7}" y="182" width="1.2" height="58" fill="#6e5236"/>`).join('')}
    <rect x="110" y="108" width="172" height="60" fill="#ece7de"/>
    <rect x="128" y="122" width="96" height="36" fill="url(#gl${id})"/>
    <rect x="98" y="102" width="196" height="7" fill="#f7f4ee"/>
    <rect x="50" y="162" width="224" height="6" fill="#f7f4ee"/>
    <rect x="50" y="168" width="224" height="6" fill="#000" opacity=".12"/>
    <ellipse cx="322" cy="204" rx="9" ry="36" fill="#1f4636"/><ellipse cx="34" cy="212" rx="8" ry="28" fill="#1f4636"/>`,
  commercial: id => `
    <rect y="250" width="400" height="50" fill="#262f42"/><rect y="250" width="400" height="3" fill="#5a6780"/>
    <rect x="40" y="96" width="320" height="154" fill="#cdd5df"/>
    <rect x="60" y="112" width="280" height="40" fill="url(#gl${id})"/>${[1,2,3,4,5,6,7].map(i => `<rect x="${60 + i * 35}" y="112" width="2" height="40" fill="#cdd5df"/>`).join('')}
    <rect x="60" y="164" width="280" height="24" fill="#0b1f3a"/><rect x="60" y="174" width="280" height="3" fill="#c9a24d"/>
    <rect x="50" y="190" width="300" height="6" fill="#c9a24d"/>
    <rect x="60" y="198" width="280" height="52" fill="url(#wm${id})"/>${[1,2,3,4,5,6].map(i => `<rect x="${60 + i * 40}" y="198" width="2.4" height="52" fill="#cdd5df"/>`).join('')}
    <rect x="190" y="206" width="20" height="44" fill="#0b1f3a" opacity=".28"/>
    <rect x="40" y="96" width="320" height="154" fill="url(#shd${id})"/>`,
  land: id => `
    <rect y="176" width="400" height="124" fill="#7b9a63"/><rect y="176" width="400" height="124" fill="url(#hz${id})"/>
    <polygon points="60,292 340,292 292,204 108,204" fill="#8fae74" stroke="#e9e3d6" stroke-width="3"/>
    <rect x="196" y="150" width="5" height="72" fill="#5b4a37"/>
    <rect x="148" y="116" width="102" height="46" rx="3" fill="#0b1f3a"/><rect x="148" y="150" width="102" height="5" fill="#c9a24d"/>
    <rect x="162" y="128" width="74" height="5" fill="#fff" opacity=".85"/><rect x="174" y="139" width="50" height="4" fill="#fff" opacity=".5"/>`,
  chalet: id => `
    <rect y="168" width="400" height="52" fill="url(#sea${id})"/>
    <path d="M0 186q25-5 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0" stroke="#fff" stroke-opacity=".28" stroke-width="2" fill="none"/>
    <path d="M0 202q25-5 50 0t50 0 50 0 50 0 50 0 50 0 50 0 50 0" stroke="#fff" stroke-opacity=".22" stroke-width="2" fill="none"/>
    <rect y="216" width="400" height="84" fill="#e4d6b6"/><rect y="216" width="400" height="4" fill="#cdbd98"/>
    <rect x="96" y="150" width="190" height="70" fill="#f4f1ea"/>
    <rect x="86" y="142" width="210" height="8" fill="#fff"/><rect x="86" y="150" width="210" height="4" fill="#000" opacity=".1"/>
    <rect x="112" y="164" width="108" height="56" fill="url(#gl${id})"/>${[1,2,3].map(i => `<rect x="${112 + i * 27}" y="164" width="2" height="56" fill="#f4f1ea"/>`).join('')}
    <rect x="232" y="164" width="38" height="56" fill="#9a7650"/>${[1,2,3,4,5].map(i => `<rect x="${232 + i * 6.3}" y="164" width="1.2" height="56" fill="#7a5a3a"/>`).join('')}
    <rect x="70" y="226" width="240" height="6" fill="#b79a6a"/>
    <path d="M330 220 q-6-44 8-72" stroke="#6b4a2f" stroke-width="4" fill="none"/>
    <path d="M338 148 q-26-6-34 10 M338 148 q22-10 36 4 M338 148 q-8-22-28-18 M338 148 q12-22 32-14" stroke="#2f7a4d" stroke-width="5" stroke-linecap="round" fill="none"/>`
};
function art(kind, mood, id){
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${defs(id, mood)}${BUILD[kind](id)}</svg>`;
}
