import React, { useState, useEffect } from 'react';
import { X, Save, Layers, Calendar, MapPin, Hash, FileText, QrCode } from 'lucide-react';
import { DentalCategory, DentalInventoryItem, ItemUnit } from '../types/inventory';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<DentalInventoryItem, 'id'> | DentalInventoryItem) => void;
  initialItem?: DentalInventoryItem | null;
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

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [expiry, setExpiry] = useState('');
  const [minQty, setMinQty] = useState('3');
  const [category, setCategory] = useState<DentalCategory>('حشوات وترميم');
  const [unit, setUnit] = useState<ItemUnit>('عبوة');
  const [lotNumber, setLotNumber] = useState('');
  const [barcode, setBarcode] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setQty(initialItem.qty.toString());
      setExpiry(initialItem.expiry);
      setMinQty(initialItem.minQty.toString());
      setCategory(initialItem.category || 'حشوات وترميم');
      setUnit(initialItem.unit || 'عبوة');
      setLotNumber(initialItem.lotNumber || '');
      setBarcode(initialItem.barcode || '');
      setLocation(initialItem.location || '');
      setNotes(initialItem.notes || '');
    } else {
      setName('');
      setQty('');
      // Default expiry date 1 year from now
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      setExpiry(d.toISOString().split('T')[0]);
      setMinQty('3');
      setCategory('حشوات وترميم');
      setUnit('عبوة');
      setLotNumber('');
      setBarcode('');
      setLocation('');
      setNotes('');
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !qty || !expiry || !minQty) return;

    const payload = {
      name: name.trim(),
      qty: parseInt(qty, 10),
      expiry,
      minQty: parseInt(minQty, 10),
      category,
      unit,
      lotNumber: lotNumber.trim() || undefined,
      barcode: barcode.trim() || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      lastUpdated: new Date().toISOString(),
    };

    if (initialItem) {
      onSave({ ...payload, id: initialItem.id });
    } else {
      onSave(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {initialItem ? 'تعديل بيانات الصنف الطبي' : 'إضافة صنف أو مادة جديدة للمخزون'}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم الصنف / المادة الطبية <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: Filtek Z250 Universal Composite A2"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> التصنيف
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DentalCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition"
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">وحدة التعبئة</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as ItemUnit)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الكمية الحالية *</label>
              <input
                type="number"
                min="0"
                required
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition font-mono tabular-nums"
              />
            </div>

            {/* Minimum Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الحد الأدنى *</label>
              <input
                type="number"
                min="0"
                required
                value={minQty}
                onChange={(e) => setMinQty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition font-mono tabular-nums"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>تاريخ الصلاحية *</span>
                <Calendar className="w-3 h-3 text-slate-400" />
              </label>
              <input
                type="date"
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Barcode */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-slate-400" /> الباركود / QR
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="رمز الباركود للمادة"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition font-mono"
              />
            </div>

            {/* Lot / Batch # */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> رقم الدفعة (Lot #)
              </label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="مثال: LOT-4491-B"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition font-mono"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> موقع الحفظ بالعيادة
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="مثال: ثلاجة العيادة"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> ملاحظات أو تعليمات الاستخدام
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: يُحفظ بعيداً عن الضوء المباشر بدرجة حرارة أقل من 25 درجة..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:scale-[0.98] rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{initialItem ? 'تحديث الصنف' : 'حفظ الصنف'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
