import React from 'react';
import { 
  Trash2, 
  Edit3, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Boxes, 
  Layers, 
  MapPin, 
  Hash, 
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { DentalInventoryItem } from '../types/inventory';

interface InventoryTableProps {
  items: DentalInventoryItem[];
  onDeleteItem: (id: number) => void;
  onEditItem: (item: DentalInventoryItem) => void;
  onAdjustQty: (id: number, delta: number) => void;
  onOpenAddModal: () => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onDeleteItem,
  onEditItem,
  onAdjustQty,
  onOpenAddModal,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl mx-auto flex items-center justify-center mb-3">
          <Boxes className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          لا توجد مواد مطابقة في قائمة المخزون
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
          يمكنك إضافة أصناف جديدة، أو إزالة عوامل التصفية الحالية لعرض كافة مستلزمات العيادة.
        </p>
        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صنف جديد الآن</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/90 text-slate-600 border-b border-slate-200 text-xs font-bold select-none">
              <th className="py-3.5 px-4">اسم الصنف والمواصفات</th>
              <th className="py-3.5 px-4">التصنيف الطبي</th>
              <th className="py-3.5 px-4">الكمية المتوفرة</th>
              <th className="py-3.5 px-4">تاريخ انتهاء الصلاحية</th>
              <th className="py-3.5 px-4">الحد الأدنى</th>
              <th className="py-3.5 px-4">حالة الصلاحية والمخزون</th>
              <th className="py-3.5 px-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.map((item) => {
              const expiryDate = new Date(item.expiry);
              expiryDate.setHours(0, 0, 0, 0);
              const diffTime = expiryDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              const isExpired = diffDays < 0;
              const isWarning = diffDays >= 0 && diffDays <= 60;
              const isLowStock = item.qty <= item.minQty;

              return (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isExpired ? 'bg-rose-50/20' : ''
                  }`}
                >
                  {/* 1. Item Name, Lot, Location */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800 text-sm leading-snug">
                      {item.name}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-slate-500">
                      {item.lotNumber && (
                        <span className="inline-flex items-center gap-0.5 font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          <Hash className="w-2.5 h-2.5 text-slate-400" />
                          {item.lotNumber}
                        </span>
                      )}
                      {item.barcode && (
                        <span className="inline-flex items-center gap-0.5 font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200/50">
                          <QrCode className="w-2.5 h-2.5 text-sky-500" />
                          {item.barcode}
                        </span>
                      )}
                      {item.location && (
                        <span className="inline-flex items-center gap-0.5 text-slate-500">
                          <MapPin className="w-2.5 h-2.5 text-slate-400" />
                          {item.location}
                        </span>
                      )}
                      {item.notes && (
                        <span className="text-slate-400 truncate max-w-xs" title={item.notes}>
                          {item.notes}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 2. Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100/90 px-2.5 py-1 rounded-lg">
                      <Layers className="w-3 h-3 text-slate-400" />
                      {item.category || 'عام'}
                    </span>
                  </td>

                  {/* 3. Quantity with Quick Adjustment Controls */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-left font-mono">
                        <span
                          className={`text-sm font-extrabold tabular-nums ${
                            isLowStock ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {item.qty}
                        </span>
                        <span className="text-[10px] text-slate-400 mr-1 font-sans">
                          {item.unit || 'قطعة'}
                        </span>
                      </div>

                      {/* Quick + / - for Fast Inventory Auditing */}
                      <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 no-print">
                        <button
                          type="button"
                          onClick={() => onAdjustQty(item.id, -1)}
                          disabled={item.qty <= 0}
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-rose-600 hover:bg-white rounded transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                          title="إنقاص وحدة (استهلاك)"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAdjustQty(item.id, 1)}
                          className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-emerald-600 hover:bg-white rounded transition cursor-pointer"
                          title="زيادة وحدة (توريد)"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* 4. Expiry Date & Countdown */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-mono tabular-nums text-slate-700 text-xs font-medium">
                      {item.expiry}
                    </div>
                    <div className="text-[10px] mt-0.5 font-medium">
                      {isExpired ? (
                        <span className="text-rose-600 font-bold">
                          منتهي منذ {Math.abs(diffDays)} يوماً
                        </span>
                      ) : isWarning ? (
                        <span className="text-amber-600 font-bold">
                          متبقي {diffDays} يوماً فقط
                        </span>
                      ) : (
                        <span className="text-slate-400">
                          متبقي {diffDays} يوماً
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 5. Minimum Alert Quantity */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono tabular-nums text-slate-500">
                    {item.minQty}
                  </td>

                  {/* 6. Expiry & Stock Status Badges */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      {/* Expiry Badge */}
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>منتهي الصلاحية</span>
                        </span>
                      ) : isWarning ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>قريب الانتهاء</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>صالح للاستخدام</span>
                        </span>
                      )}

                      {/* Low Stock Badge */}
                      {isLowStock && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <AlertTriangle className="w-2.5 h-2.5 text-blue-600" />
                          <span>إعادة طلب ({item.qty}/{item.minQty})</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 7. Row Actions */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-center no-print">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEditItem(item)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-600 transition flex items-center justify-center cursor-pointer"
                        title="تعديل بيانات الصنف"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition flex items-center justify-center cursor-pointer"
                        title="حذف الصنف من المخزون"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
