/* لوحة التحكم: تسجيل دخول + إدارة العقارات + الإعدادات */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => Number(n || 0).toLocaleString('en-US');

let token = sessionStorage.getItem('sama_token') || '';
let items = [];
let editingId = null;
let imageUrl = '';          // الصورة الحالية للعقار اللي بيتعدل

/* ---------- API ---------- */
async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (token) headers.Authorization = 'Bearer ' + token;
  let payload = body;
  if (body && !(body instanceof FormData)) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  const r = await fetch('/api' + path, { method, headers, body: payload });
  const data = await r.json().catch(() => ({}));
  if (r.status === 401 && path !== '/login') { logout(); throw new Error('الجلسة خلصت، ادخل تاني'); }
  if (!r.ok) throw new Error(data.error || 'حصل خطأ');
  return data;
}
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

/* ---------- الدخول والخروج ---------- */
function showApp() { $('loginView').hidden = true; $('appView').hidden = false; load(); loadSettings(); }
function logout() {
  token = ''; sessionStorage.removeItem('sama_token');
  $('appView').hidden = true; $('loginView').hidden = false; $('pw').value = '';
}
$('loginForm').addEventListener('submit', async e => {
  e.preventDefault(); $('loginErr').textContent = '';
  try {
    const r = await api('/login', { method: 'POST', body: { password: $('pw').value } });
    token = r.token; sessionStorage.setItem('sama_token', token); showApp();
  } catch (err) { $('loginErr').textContent = err.message; }
});
$('logoutBtn').addEventListener('click', logout);

/* ---------- التبويبات ---------- */
function tab(which) {
  const p = which === 'p';
  $('paneP').hidden = !p; $('paneS').hidden = p;
  $('tabP').setAttribute('aria-selected', p); $('tabS').setAttribute('aria-selected', !p);
}
$('tabP').addEventListener('click', () => tab('p'));
$('tabS').addEventListener('click', () => tab('s'));

/* ---------- قائمة العقارات ---------- */
async function load() {
  try { items = await api('/admin/properties'); render(); }
  catch (e) { $('list').innerHTML = `<div class="empty">${esc(e.message)}</div>`; }
}
function render() {
  const shown = items.filter(p => p.published).length;
  $('count').textContent = items.length ? `${items.length} عقار (${shown} ظاهر في الموقع)` : '';
  if (!items.length) { $('list').innerHTML = '<div class="empty">لسه مفيش عقارات. اضغط «إضافة عقار» عشان تبدأ.</div>'; return; }
  $('list').innerHTML = items.map(p => `
    <div class="item" data-id="${esc(p.id)}">
      <div class="thumb">${p.image ? `<img src="${esc(p.image)}" alt="">` : esc(p.type)}</div>
      <div>
        <h3>${esc(p.title)}</h3>
        <div class="meta">${esc(p.type)} · ${p.mode === 'rent' ? 'للإيجار' : 'للبيع'} · ${fmt(p.price)} ج.م${p.mode === 'rent' ? ' / شهر' : ''}</div>
        <div class="meta">${esc(p.location)} ${p.published ? '' : '<span class="badge off">مخفي</span>'}</div>
      </div>
      <div class="actions">
        <button class="btn btn-ghost btn-sm" data-act="edit">تعديل</button>
        <button class="btn btn-ghost btn-sm" data-act="toggle">${p.published ? 'إخفاء' : 'إظهار'}</button>
        <button class="btn btn-danger btn-sm" data-act="del">حذف</button>
      </div>
    </div>`).join('');
}
$('list').addEventListener('click', async e => {
  const btn = e.target.closest('[data-act]'); if (!btn) return;
  const id = btn.closest('.item').dataset.id;
  const p = items.find(x => x.id === id);
  try {
    if (btn.dataset.act === 'edit') return openForm(p);
    if (btn.dataset.act === 'toggle') {
      await api('/properties/' + id, { method: 'PUT', body: { ...p, published: !p.published } });
      toast(p.published ? 'العقار اتخفى' : 'العقار ظهر في الموقع');
    }
    if (btn.dataset.act === 'del') {
      if (!confirm(`متأكد إنك عايز تحذف «${p.title}»؟ مش هتقدر ترجّعه.`)) return;
      await api('/properties/' + id, { method: 'DELETE' });
      toast('اتحذف');
    }
    load();
  } catch (err) { alert(err.message); }
});

/* ---------- فورم العقار ---------- */
Object.keys(TYPES).forEach(t => { const o = document.createElement('option'); o.textContent = t; $('fType').appendChild(o); });
function setPreview(url) {
  imageUrl = url || '';
  $('preview').hidden = !imageUrl;
  $('prevImg').src = imageUrl;
}
function priceHint() { $('priceHint').textContent = $('fMode').value === 'rent' ? 'الإيجار الشهري' : 'السعر الكلي'; }
$('fMode').addEventListener('change', priceHint);
$('fFile').addEventListener('change', () => {
  const f = $('fFile').files[0];
  if (f) { $('prevImg').src = URL.createObjectURL(f); $('preview').hidden = false; }
});
$('rmImg').addEventListener('click', () => { $('fFile').value = ''; setPreview(''); });

function openForm(p) {
  editingId = p ? p.id : null;
  $('dlgTitle').textContent = p ? 'تعديل عقار' : 'إضافة عقار';
  $('fTitle').value = p ? p.title : '';
  $('fType').value = p ? p.type : 'شقة';
  $('fMode').value = p ? p.mode : 'sale';
  $('fLocation').value = p ? p.location : '';
  $('fPrice').value = p ? p.price : '';
  $('fArea').value = p && p.area ? p.area : '';
  $('fBeds').value = p && p.beds ? p.beds : '';
  $('fBaths').value = p && p.baths ? p.baths : '';
  $('fPub').checked = p ? p.published : true;
  $('fFile').value = ''; $('fErr').textContent = '';
  setPreview(p ? p.image : '');
  priceHint();
  $('dlg').showModal();
}
$('addBtn').addEventListener('click', () => openForm(null));
$('cancelBtn').addEventListener('click', () => $('dlg').close());

$('propForm').addEventListener('submit', async e => {
  e.preventDefault(); $('fErr').textContent = '';
  const save = $('saveBtn'); save.disabled = true; save.textContent = 'جاري الحفظ...';
  try {
    let image = imageUrl;
    const file = $('fFile').files[0];
    if (file) {
      const fd = new FormData(); fd.append('image', file);
      image = (await api('/upload', { method: 'POST', body: fd })).url;
    }
    const body = {
      title: $('fTitle').value, type: $('fType').value, mode: $('fMode').value,
      location: $('fLocation').value, price: $('fPrice').value, area: $('fArea').value,
      beds: $('fBeds').value, baths: $('fBaths').value, image, published: $('fPub').checked
    };
    if (editingId) await api('/properties/' + editingId, { method: 'PUT', body });
    else await api('/properties', { method: 'POST', body });
    $('dlg').close(); toast('اتحفظ'); load();
  } catch (err) { $('fErr').textContent = err.message; }
  finally { save.disabled = false; save.textContent = 'حفظ'; }
});

/* ---------- الإعدادات ---------- */
async function loadSettings() {
  try { const s = await fetch('/api/settings').then(r => r.json()); $('sPhone').value = s.phone || ''; $('sAddress').value = s.address || ''; } catch (e) {}
}
$('settingsForm').addEventListener('submit', async e => {
  e.preventDefault(); $('sErr').textContent = '';
  try { await api('/settings', { method: 'PUT', body: { phone: $('sPhone').value, address: $('sAddress').value } }); toast('اتحفظ'); }
  catch (err) { $('sErr').textContent = err.message; }
});

/* ---------- بداية ---------- */
if (token) showApp();
