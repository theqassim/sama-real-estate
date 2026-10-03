/* أنواع العقارات: كل نوع بيتحط في قسم (فلتر) وبيتعرض له رسمة مؤقتة لو مفيش صورة.
   عايز تضيف نوع جديد؟ ضيفه هنا، وضيفه كمان في مصفوفة TYPES جوه server.js */
const TYPES = {
  'شقة':        { cat: 'شقق',    kind: 'apartment' },
  'دوبلكس':     { cat: 'شقق',    kind: 'apartment' },
  'استوديو':    { cat: 'شقق',    kind: 'apartment' },
  'فيلا':       { cat: 'فيلات',  kind: 'villa' },
  'تاون هاوس':  { cat: 'فيلات',  kind: 'villa' },
  'محل تجاري':  { cat: 'تجاري',  kind: 'commercial' },
  'مكتب إداري': { cat: 'تجاري',  kind: 'commercial' },
  'شاليه':      { cat: 'الساحل', kind: 'chalet' },
  'أرض':        { cat: 'أراضي',  kind: 'land' }
};
