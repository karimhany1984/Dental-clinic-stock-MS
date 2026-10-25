export type DentalCategory =
  | 'حشوات وترميم' // Restorative & Composites
  | 'تخدير وجراحة' // Anesthesia & Surgery
  | 'تعقيم ومكافحة عدوى' // Sterilization & Infection Control
  | 'علاج جذور وأعصاب' // Endodontics
  | 'مستهلكات ووقاية' // Disposables & PPE
  | 'طبعات وتقويم' // Impressions & Ortho
  | 'أخرى'; // Other

export type ItemUnit = 'عبوة' | 'علبة' | 'حقنة / كاربول' | 'قارورة' | 'أنبوب' | 'طقم' | 'قطعة' | 'كرتون';

export interface DentalInventoryItem {
  id: number;
  name: string;
  qty: number;
  expiry: string; // YYYY-MM-DD
  minQty: number;
  category?: DentalCategory;
  lotNumber?: string; // رقم التشغيلة / الدفعة
  location?: string; // مكان الحفظ (ثلاجة، خزانة، غرفة التعقيم)
  unit?: ItemUnit;
  notes?: string;
  lastUpdated?: string;
}

export type FilterStatus = 'all' | 'warning' | 'expired' | 'low-stock';
