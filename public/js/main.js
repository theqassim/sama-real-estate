/* ======== helpers ======== */
let seed = 11;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const R = (a, b) => a + rnd() * (b - a);

/* ======== Realistic clouds (SVG turbulence) ======== */
let cid = 0;
function addCloud(parent, o){
  const id = 'cf' + (cid++);
  const k = o.k || 3.4, b = o.b || -1.25;
  parent.insertAdjacentHTML('beforeend',
  `<svg class="cl" viewBox="0 0 1600 600" preserveAspectRatio="none" style="width:${o.w}%;opacity:${o.op};--drift:${o.drift}%;--dur:${o.dur}s">
    <defs>
      <filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="${o.fx} ${o.fy}" numOctaves="5" seed="${o.seed}" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  ${k} 0 0 0 ${b}" result="w"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 .46  0 0 0 0 .60  0 0 0 0 .80  ${k} 0 0 0 ${b + .12}" result="s0"/>
        <feOffset in="s0" dy="${o.shade || 22}" result="s"/>
        <feMerge><feMergeNode in="s"/><feMergeNode in="w"/></feMerge>
      </filter>
    </defs>
    <rect width="1600" height="600" filter="url(#${id})"/>
  </svg>`);
}
addCloud(document.getElementById('farLayer'), {w:240, op:.5,  drift:-38, dur:170, fx:.0026, fy:.0058, seed:4,  k:3.4, b:-1.3});
addCloud(document.getElementById('midLayer'), {w:220, op:.8,  drift:-34, dur:130, fx:.0034, fy:.0072, seed:13, k:3.6, b:-1.38});
addCloud(document.getElementById('bankL'),    {w:150, op:1,   drift:-18, dur:110, fx:.0036, fy:.0075, seed:23, k:3.8, b:-1.35, shade:26});
addCloud(document.getElementById('bankR'),    {w:150, op:1,   drift:-16, dur:100, fx:.0036, fy:.0075, seed:41, k:3.8, b:-1.35, shade:26});

/* ======== Skyline (hazy glass towers) ======== */
(function(){
  const W = 1440, H = 340;
  const rows = [
    {fill:'var(--hz-far)',   hmin:130, hmax:270, wmin:36, wmax:70,  glass:false},
    {fill:'var(--hz-mid)',   hmin:84,  hmax:220, wmin:42, wmax:84,  glass:true},
    {fill:'var(--hz-front)', hmin:46,  hmax:160, wmin:48, wmax:100, glass:true}
  ];
  let out = '';
  rows.forEach(r => {
    let x = -20;
    while(x < W){
      const w = R(r.wmin, r.wmax), h = R(r.hmin, r.hmax), y = H - h, t = Math.floor(rnd() * 4);
      const st = `style="fill:${r.fill}"`;
      if(t === 0) out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" ${st}/>`;
      else if(t === 1) out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" ${st}/><rect x="${(x + w * .2).toFixed(1)}" y="${(y - h * .1).toFixed(1)}" width="${(w * .6).toFixed(1)}" height="${(h * .1 + 1).toFixed(1)}" ${st}/>`;
      else if(t === 2) out += `<polygon points="${x.toFixed(1)},${H} ${x.toFixed(1)},${(y + 22).toFixed(1)} ${(x + w).toFixed(1)},${y.toFixed(1)} ${(x + w).toFixed(1)},${H}" ${st}/>`;
      else out += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" ${st}/><polygon points="${(x + w / 2 - 1.5).toFixed(1)},${y.toFixed(1)} ${(x + w / 2 + 1.5).toFixed(1)},${y.toFixed(1)} ${(x + w / 2).toFixed(1)},${(y - 34).toFixed(1)}" ${st}/>`;
      if(r.glass){
        let d = '';
        for(let gx = x + 7; gx < x + w - 3; gx += 9) d += `M${gx.toFixed(1)} ${(y + 4).toFixed(1)}V${H}`;
        out += `<path d="${d}" stroke="rgba(255,255,255,.14)" stroke-width="1" fill="none"/>`;
      }
      x += w - 3 + rnd() * 8;
    }
  });
  document.getElementById('skyline').innerHTML = out;
})();

/* ======== Hero scroll + pointer parallax, nav state ======== */
const hero = document.querySelector('.hero');
const nav = document.getElementById('nav');
let ticking = false;
function update(){
  const p = Math.min(Math.max(scrollY / (hero.offsetHeight * .75), 0), 1);
  hero.style.setProperty('--p', p.toFixed(3));
  nav.classList.toggle('stuck', scrollY > 60);
  ticking = false;
}
addEventListener('scroll', () => { if(!ticking){ ticking = true; requestAnimationFrame(update); } }, {passive:true});
update();
hero.addEventListener('pointermove', e => {
  hero.style.setProperty('--mx', ((e.clientX / innerWidth - .5) * 2).toFixed(3));
}, {passive:true});

/* ======== Night section: stars ======== */
(function(){
  const st = document.getElementById('stars');
  for(let i = 0; i < 45; i++){
    const s = document.createElement('span');
    s.className = 'star';
    const z = R(1, 2.4);
    s.style.cssText = `left:${R(0,100)}%;top:${R(14,95)}%;width:${z}px;height:${z}px;--t:${R(3,7).toFixed(1)}s;--d:-${R(0,6).toFixed(1)}s`;
    st.appendChild(s);
  }
})();
