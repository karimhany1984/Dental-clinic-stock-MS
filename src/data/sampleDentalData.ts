import { DentalInventoryItem } from '../types/inventory';

// Helper to format date offset from today
function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export const SAMPLE_DENTAL_INVENTORY: DentalInventoryItem[] = [
  {
    id: 101,
    name: 'حشوة كمبوزيت نانو هجين Filtek Z250 (A2)',
    qty: 6,
    expiry: getDateOffset(240), // Good
    minQty: 3,
    category: 'حشوات وترميم',
    lotNumber: 'FL-2024-88',
    location: 'خزانة الحشوات C1',
    unit: 'حقنة / كاربول',
    notes: 'لون A2 الأكثر طلباً للأسنان الأمامية والخلفية',
  },
  {
    id: 102,
    name: 'حشوة كمبوزيت سائلة Flowable Composite (A3)',
    qty: 2,
    expiry: getDateOffset(18), // Warning: expiring soon (18 days)
    minQty: 4, // Low stock
    category: 'حشوات وترميم',
    lotNumber: 'FLW-901',
    location: 'خزانة الحشوات C1',
    unit: 'حقنة / كاربول',
    notes: 'كمية منخفضة وقريب الانتهاء - يُرجى إعادة الطلب',
  },
  {
    id: 103,
    name: 'مخدر موضعي آرتيكائين 4% مع أدرينالين (Septanest)',
    qty: 14,
    expiry: getDateOffset(42), // Expiring in 42 days (warning < 60 days)
    minQty: 10,
    category: 'تخدير وجراحة',
    lotNumber: 'SP-77402',
    location: 'ثلاجة الأدوية التحتية',
    unit: 'علبة',
    notes: 'تحتوي العلبة على 50 كاربولة - يجب حفظها بدرجة حرارة أقل من 25°',
  },
  {
    id: 104,
    name: 'مادة لاصقة للأسنان Single Bond Universal 3M',
    qty: 1,
    expiry: getDateOffset(90),
    minQty: 3, // Low stock
    category: 'حشوات وترميم',
    lotNumber: '3M-BND-4',
    location: 'خزانة العيادة 2',
    unit: 'قارورة',
    notes: 'متبقي قارورة واحدة فقط في العيادة',
  },
  {
    id: 105,
    name: 'مطهر هيبوكلوريت الصوديوم NaOCl 5.25% لقنوات الجذور',
    qty: 3,
    expiry: getDateOffset(-12), // Expired 12 days ago!
    minQty: 2,
    category: 'علاج جذور وأعصاب',
    lotNumber: 'ENDO-CL-09',
    location: 'غرفة التعقيم والمخزن',
    unit: 'قارورة',
    notes: 'منتهي الصلاحية - يجب إتلاف العبوات واستبدالها فوراً',
  },
  {
    id: 106,
    name: 'مبارد علاج عصب دوارة ProTaper Gold Rotary Files',
    qty: 12,
    expiry: getDateOffset(500),
    minQty: 5,
    category: 'علاج جذور وأعصاب',
    lotNumber: 'PTG-402',
    location: 'درج أدوات العصب 3',
    unit: 'طقم',
    notes: 'أطقم معقمة جاهزة للاستخدام الفوري',
  },
  {
    id: 107,
    name: 'رولات أكياس تعقيم ذاتية الإغلاق 200mm × 200m',
    qty: 2,
    expiry: getDateOffset(600),
    minQty: 4, // Low stock
    category: 'تعقيم ومكافحة عدوى',
    lotNumber: 'POUCH-2024',
    location: 'غرفة التعقيم المركزية',
    unit: 'كرتون',
    notes: 'تحتاج طلب من المورد الطبي قبل نهاية الأسبوع',
  },
  {
    id: 108,
    name: 'مريلة وقاية للمرضى معزولة Dental Patient Bibs (500 قطعة)',
    qty: 5,
    expiry: getDateOffset(700),
    minQty: 2,
    category: 'مستهلكات ووقاية',
    lotNumber: 'BIB-8820',
    location: 'مستودع المستهلكات الخلفي',
    unit: 'كرتون',
    notes: 'لون أزرق طبي مقاوم للسوائل',
  },
  {
    id: 109,
    name: 'بودرة أخذ طبعات سريعة التصلب Hydrogum 5 Alginate',
    qty: 8,
    expiry: getDateOffset(300),
    minQty: 3,
    category: 'طبعات وتقويم',
    lotNumber: 'ALG-ZG-5',
    location: 'خزانة الجبس والمواد',
    unit: 'عبوة',
    notes: 'عبوات مفرغة من الهواء محكمة الإغلاق',
  },
  {
    id: 110,
    name: 'إبر بنج أسنان معقمة قياس 30G قصيرة (Short Needles)',
    qty: 1,
    expiry: getDateOffset(180),
    minQty: 5, // Low stock
    category: 'تخدير وجراحة',
    lotNumber: 'NDL-30G-9',
    location: 'درج العيادة 1',
    unit: 'علبة',
    notes: 'تحتوي 100 إبرة - المخزون حرج جداً',
  },
];
