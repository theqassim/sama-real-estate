/* سيرفر موقع سما العقارية
   - بيخدم صفحات الموقع
   - API للعقارات والإعدادات (القراءة للكل، والتعديل للأدمن بس)
   - رفع الصور
   البيانات متخزنة في data/*.json والصور في public/uploads */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// تحميل ملف .env بدون أي مكتبة إضافية
try {
  fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });
} catch (e) {}

const express = require('express');
const multer = require('multer');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sama2026';
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOAD_DIR = path.join(PUBLIC_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* لازم تتطابق مع public/js/types.js */
const TYPES = ['شقة', 'دوبلكس', 'استوديو', 'فيلا', 'تاون هاوس', 'محل تجاري', 'مكتب إداري', 'شاليه', 'أرض'];

/* ---------- تخزين JSON ---------- */
const file = name => path.join(DATA_DIR, name);
function readJSON(name, fallback) {
  try { return JSON.parse(fs.readFileSync(file(name), 'utf8')); } catch (e) { return fallback; }
}
function writeJSON(name, data) {
  const tmp = file(name) + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, file(name));
}

/* ---------- تسجيل الدخول ---------- */
const sessions = new Map();           // token -> expiry
const attempts = new Map();           // ip -> { count, until }
const SESSION_MS = 12 * 60 * 60 * 1000;
const sha = s => crypto.createHash('sha256').update(String(s)).digest();

function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const exp = sessions.get(token);
  if (!exp || exp < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ error: 'سجّل دخول الأول' });
  }
  next();
}

/* ---------- تنضيف المدخلات ---------- */
function httpError(status, message) { const e = new Error(message); e.status = status; return e; }
function cleanProperty(b) {
  const s = (v, max) => String(v ?? '').trim().slice(0, max);
  const n = (v, max) => { const x = Number(v); return Number.isFinite(x) && x >= 0 ? Math.min(x, max) : 0; };
  const out = {
    title: s(b.title, 120),
    type: TYPES.includes(b.type) ? b.type : null,
    mode: b.mode === 'rent' ? 'rent' : 'sale',
    location: s(b.location, 120),
    area: n(b.area, 1e6),
    beds: Math.round(n(b.beds, 50)),
    baths: Math.round(n(b.baths, 50)),
    price: n(b.price, 1e12),
    image: s(b.image, 300),
    published: b.published !== false
  };
  if (!out.title) throw httpError(400, 'اكتب عنوان العقار');
  if (!out.type) throw httpError(400, 'اختار نوع العقار');
  if (out.image && !/^\/uploads\/[\w.-]+$/.test(out.image) && !/^https:\/\/\S+$/i.test(out.image)) {
    throw httpError(400, 'رابط الصورة غير صالح');
  }
  return out;
}
function removeImageIfUnused(image, list) {
  if (!image || !image.startsWith('/uploads/')) return;
  if (list.some(p => p.image === image)) return;
  fs.unlink(path.join(PUBLIC_DIR, image), () => {});
}

/* ---------- التطبيق ---------- */
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.post('/api/login', (req, res) => {
  const ip = req.ip;
  const a = attempts.get(ip);
  if (a && a.until > Date.now()) return res.status(429).json({ error: 'محاولات كتير، جرّب بعد شوية' });
  const ok = crypto.timingSafeEqual(sha(req.body.password), sha(ADMIN_PASSWORD));
  if (!ok) {
    const c = (a ? a.count : 0) + 1;
    attempts.set(ip, { count: c, until: c >= 5 ? Date.now() + 5 * 60 * 1000 : 0 });
    return res.status(401).json({ error: 'الباسورد غلط' });
  }
  attempts.delete(ip);
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, Date.now() + SESSION_MS);
  res.json({ token });
});

/* عام: العقارات الظاهرة بس، الأحدث الأول */
app.get('/api/properties', (req, res) => {
  res.json(readJSON('properties.json', []).filter(p => p.published));
});
app.get('/api/settings', (req, res) => res.json(readJSON('settings.json', {})));

/* أدمن */
app.get('/api/admin/properties', requireAuth, (req, res) => res.json(readJSON('properties.json', [])));

app.post('/api/properties', requireAuth, (req, res) => {
  const list = readJSON('properties.json', []);
  const prop = { id: crypto.randomUUID(), ...cleanProperty(req.body) };
  list.unshift(prop);                       // الأحدث الأول
  writeJSON('properties.json', list);
  res.status(201).json(prop);
});

app.put('/api/properties/:id', requireAuth, (req, res) => {
  const list = readJSON('properties.json', []);
  const i = list.findIndex(p => p.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'العقار مش موجود' });
  const old = list[i];
  list[i] = { id: old.id, ...cleanProperty(req.body) };
  writeJSON('properties.json', list);
  if (old.image !== list[i].image) removeImageIfUnused(old.image, list);
  res.json(list[i]);
});

app.delete('/api/properties/:id', requireAuth, (req, res) => {
  const list = readJSON('properties.json', []);
  const i = list.findIndex(p => p.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'العقار مش موجود' });
  const [gone] = list.splice(i, 1);
  writeJSON('properties.json', list);
  removeImageIfUnused(gone.image, list);
  res.json({ ok: true });
});

app.put('/api/settings', requireAuth, (req, res) => {
  const phone = String(req.body.phone || '').replace(/\D/g, '');
  if (phone.length < 8 || phone.length > 15) return res.status(400).json({ error: 'رقم الواتساب لازم يكون بالصيغة الدولية، مثال: 201012345678' });
  const settings = { phone, address: String(req.body.address || '').trim().slice(0, 120) };
  writeJSON('settings.json', settings);
  res.json(settings);
});

/* رفع الصور */
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, f, cb) => cb(null, crypto.randomBytes(12).toString('hex') + EXT[f.mimetype])
  }),
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (req, f, cb) => EXT[f.mimetype] ? cb(null, true) : cb(new Error('الصورة لازم تكون JPG أو PNG أو WebP'))
});
app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'مفيش صورة اترفعت' });
  res.json({ url: '/uploads/' + req.file.filename });
});

app.use(express.static(PUBLIC_DIR));

app.use((err, req, res, next) => {
  const status = err.status || (err.code === 'LIMIT_FILE_SIZE' ? 413 : 400);
  const msg = err.code === 'LIMIT_FILE_SIZE' ? 'حجم الصورة أكبر من 6 ميجا' : err.message;
  res.status(status).json({ error: msg || 'حصل خطأ' });
});

app.listen(PORT, () => {
  console.log(`\n  سما العقارية شغّالة على:   http://localhost:${PORT}`);
  console.log(`  لوحة التحكم:                http://localhost:${PORT}/admin/\n`);
  if (ADMIN_PASSWORD === 'sama2026') console.log('  تنبيه: غيّر ADMIN_PASSWORD في ملف .env قبل ما ترفع الموقع أونلاين.\n');
});
