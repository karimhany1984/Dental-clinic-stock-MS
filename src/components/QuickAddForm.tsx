import React, { useState } from 'react';
import { PlusCircle, Layers, Calendar, Hash, MapPin, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { DentalCategory, DentalInventoryItem, ItemUnit } from '../types/inventory';

interface QuickAddFormProps {
  onAddItem: (item: Omit<DentalInventoryItem, 'id'>) => void;
}

const CATEGORIES: DentalCategory[] = [
  'حشوات وترميم',
  'تخدير وجراحة',
  'تعقيم ومكافحة عدوى',
  'علاج جذور وأعصاب',
  'مستهلكات ووقاية',
  'طبعات وتقويم',
  'أخرى',
];

const UNITS: ItemUnit[] = ['عبوة', 'علبة', 'حقنة / كاربول', 'قارورة', 'أنبوب', 'طقم', 'قطعة', 'كرتون'];

export const QuickAddForm: React.FC<QuickAddFormProps> = ({ onAddItem }) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [expiry, setExpiry] = useState('');
  const [minQty, setMinQty] = useState('');
  
  // Extended fields
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [category, setCategory] = useState<DentalCategory>('حشوات وترميم');
  const [unit, setUnit] = useState<ItemUnit>('عبوة');
  const [lotNumber, setLotNumber] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !qty || !expiry || !minQty) return;

    onAddItem({
      name: name.trim(),
      qty: parseInt(qty, 10),
      expiry,
      minQty: parseInt(minQty, 10),
      category,
      unit,
      lotNumber: lotNumber.trim() || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      lastUpdated: new Date().toISOString(),
    });

    // Reset inputs
    setName('');
    setQty('');
    setExpiry('');
    setMinQty('');
    setLotNumber('');
    setLocation('');
    setNotes('');
  };

  const applyPreset = (presetName: string, cat: DentalCategory, defaultUnit: ItemUnit, defaultMin: number) => {
    setName(presetName);
    setCategory(cat);
    setUnit(defaultUnit);
    setMinQty(defaultMin.toString());
    // Default expiry 1 year ahead
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    setExpiry(d.toISOString().split('T')[0]);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs mb-8 overflow-hidden transition-all no-print">
      
      {/* Header bar */}
      <div className="px-5 py-4 bg-slate-50/70 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              تسجيل صنف أو دفعة جديدة للمخزون
            </h2>
            <p className="text-[11px] text-slate-500">
              أدخل بيانات الصنف وتاريخ انتهاء الصلاحية لتتبع التنبيهات تلقائياً
            </p>
          </div>
        </div>

        {/* Quick Dental Presets */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-500" /> اقتراحات سريعة:
          </span>
          <button
            type="button"
            onClick={() => applyPreset('Composite A2', 'حشوات وترميم', 'حقنة / كاربول', 3)}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-700 transition text-[11px]"
          >
            كمبوزيت A2
          </button>
          <button
            type="button"
            onClick={() => applyPreset('Septanest 4% Anesthesia', 'تخدير وجراحة', 'علبة', 5)}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-700 transition text-[11px]"
          >
            بنج آرتيكائين
          </button>
          <button
            type="button"
            onClick={() => applyPreset('Dental Bibs', 'مستهلكات ووقاية', 'كرتون', 2)}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-sky-300 hover:text-sky-700 transition text-[11px]"
          >
            مريول وقاية
          </button>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* 1. Item Name */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اسم الصنف / المادة الطبية <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: Composite Z250 (A2) أو Septanest 4%"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition font-sans"
            />
          </div>

          {/* 2. Quantity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الكمية المتوفرة <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="مثال: 10"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition font-mono tabular-nums"
            />
          </div>

          {/* 3. Expiry Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>تاريخ انتهاء الصلاحية <span className="text-rose-500">*</span></span>
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <input
              type="date"
              required
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition font-mono"
            />
          </div>

          {/* 4. Minimum Alert Quantity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              الحد الأدنى للتنبيه <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={minQty}
              onChange={(e) => setMinQty(e.target.value)}
              placeholder="مثال: 3"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition font-mono tabular-nums"
            />
          </div>

        </div>

        {/* Collapsible Clinical Advanced Details */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> التصنيف الطبي
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DentalCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">وحدة القياس / العبوة</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as ItemUnit)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition cursor-pointer"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Lot / Batch Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> رقم الدفعة (Lot #)
              </label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="مثال: LOT-2024-X"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition font-mono"
              />
            </div>

            {/* Storage Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> مكان الحفظ بالعيادة
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: ثلاجة الأدوية أو خزانة 1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-medium text-slate-500 hover:text-sky-700 flex items-center gap-1 transition"
          >
            {showAdvanced ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> إخفاء التفاصيل الإضافية (رقم التشغيلة، الموقع، التصنيف)
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> تفاصيل إضافية (رقم التشغيلة، مكان التخزين، التصنيف الطبي)
              </>
            )}
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs shadow-sky-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>حفظ الصنف إلى المخزون</span>
          </button>
        </div>

      </form>
    </div>
  );
};
