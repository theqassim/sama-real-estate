/* بيحمّل الإعدادات والعقارات من السيرفر وبيعرضهم في الصفحة */
const SETTINGS = { phone: '201000000000', address: 'القاهرة، مصر' };
let PROPS = [];
let current = 'الكل';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => Number(n || 0).toLocaleString('en-US');
const wa  = text => `https://wa.me/${SETTINGS.phone}?text=${encodeURIComponent(text)}`;
const CAT_ORDER = ['شقق', 'فيلات', 'تجاري', 'الساحل', 'أراضي'];
const MOOD_LIST = ['dawn', 'day', 'dusk'];

const ICON = {
  pin:'<svg class="ico" viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  bed:'<svg class="ico" viewBox="0 0 24 24"><path d="M3 19v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8M3 15h18M7 9V6h10v3"/></svg>',
  bath:'<svg class="ico" viewBox="0 0 24 24"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3zM6 12V6a2 2 0 0 1 4 0"/></svg>',
  area:'<svg class="ico" viewBox="0 0 24 24"><path d="M4 4h16v16H4zM4 10h6M10 4v6"/></svg>'
};

const grid  = document.getElementById('grid');
const chips = document.getElementById('chips');

function card(p, i){
  const t = TYPES[p.type] || TYPES['شقة'];
  const rent = p.mode === 'rent';
  const msg = `أهلاً سما العقارية، أنا مهتم بالوحدة دي: ${p.title} (${p.location}) - ${fmt(p.price)} ج.م${rent ? ' / شهر' : ''}`;
  const visual = p.image
    ? `<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">`
    : art(t.kind, MOOD_LIST[i % 3], i);
  return `<article class="card">
    <div class="art">${visual}<span class="tag">${rent ? 'للإيجار' : 'للبيع'}</span></div>
    <div class="card-body">
      <span class="kind">${esc(p.type)}</span>
      <h3>${esc(p.title)}</h3>
      ${p.location ? `<div class="loc">${ICON.pin}<span>${esc(p.location)}</span></div>` : ''}
      <div class="specs">
        ${p.beds  > 0 ? `<span>${ICON.bed}${esc(p.beds)} غرف</span>` : ''}
        ${p.baths > 0 ? `<span>${ICON.bath}${esc(p.baths)} حمام</span>` : ''}
        ${p.area  > 0 ? `<span>${ICON.area}${esc(p.area)} م²</span>` : ''}
      </div>
      <div class="card-foot">
        <div class="price">${fmt(p.price)}<small>${rent ? 'ج.م / شهر' : 'ج.م'}</small></div>
        <a class="btn btn-ask" href="${wa(msg)}" target="_blank" rel="noopener">اسأل عن الوحدة</a>
      </div>
    </div>
  </article>`;
}

function render(){
  const list = PROPS.map((p, i) => ({p, i})).filter(o => current === 'الكل' || (TYPES[o.p.type] || {}).cat === current);
  grid.innerHTML = list.length
    ? list.map(o => card(o.p, o.i)).join('')
    : `<div class="state">مفيش وحدات في القسم ده دلوقتي. <a href="${wa('أهلاً سما العقارية، عايز أعرف الوحدات المتاحة')}" target="_blank" rel="noopener">كلمنا على واتساب</a> وهنوصلك بأقرب وحدة مناسبة.</div>`;
  chips.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.cat === current));
}

function buildChips(){
  chips.innerHTML = '';
  const cats = CAT_ORDER.filter(c => PROPS.some(p => (TYPES[p.type] || {}).cat === c));
  ['الكل', ...cats].forEach(c => {
    const b = document.createElement('button');
    b.className = 'chip'; b.type = 'button'; b.textContent = c; b.dataset.cat = c;
    b.addEventListener('click', () => { current = c; render(); });
    chips.appendChild(b);
  });
}

function applySettings(){
  const local = SETTINGS.phone.startsWith('20') ? '0' + SETTINGS.phone.slice(2) : SETTINGS.phone;
  document.getElementById('phoneText').textContent = local.replace(/^(\d{4})(\d{3})(\d{4})$/, '$1 $2 $3');
  document.getElementById('phoneLink').href = `https://wa.me/${SETTINGS.phone}`;
  document.getElementById('addressText').textContent = SETTINGS.address;
}

async function init(){
  grid.innerHTML = '<div class="state">جاري تحميل العقارات...</div>';
  try{
    const [s, p] = await Promise.all([
      fetch('/api/settings').then(r => { if(!r.ok) throw 0; return r.json(); }),
      fetch('/api/properties').then(r => { if(!r.ok) throw 0; return r.json(); })
    ]);
    Object.assign(SETTINGS, s);
    PROPS = p;
  }catch(e){
    applySettings();
    grid.innerHTML = '<div class="state">مقدرناش نحمّل العقارات. اتأكد إن السيرفر شغّال (<code>npm start</code>) وإنك فاتح الموقع من <code>http://localhost:3000</code>.</div>';
    return;
  }
  applySettings();
  buildChips();
  render();
}
init();

/* ======== فورم التواصل -> واتساب ======== */
document.getElementById('leadForm').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const msg = `أهلاً سما العقارية، أنا ${f.get('name')} (${f.get('phone')}).\n${f.get('need')}.` + (f.get('notes') ? `\n${f.get('notes')}` : '');
  window.open(wa(msg), '_blank', 'noopener');
});
