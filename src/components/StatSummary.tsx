import React from 'react';
import { Package, AlertTriangle, AlertCircle, ShoppingCart } from 'lucide-react';
import { FilterStatus } from '../types/inventory';

interface StatSummaryProps {
  totalItems: number;
  warningItems: number;
  expiredItems: number;
  lowStockItems: number;
  activeFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
}

export const StatSummary: React.FC<StatSummaryProps> = ({
  totalItems,
  warningItems,
  expiredItems,
  lowStockItems,
  activeFilter,
  onSelectFilter,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 no-print">
      
      {/* 1. Total Registered Items */}
      <button
        onClick={() => onSelectFilter('all')}
        className={`group relative text-right p-4.5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer ${
          activeFilter === 'all'
            ? 'border-sky-500 shadow-md shadow-sky-500/10 ring-2 ring-sky-500/20'
            : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">إجمالي الأصناف المسجلة</span>
          <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-sky-50 text-slate-600 group-hover:text-sky-600 flex items-center justify-center transition-colors">
            <Package className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <h3 className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
            {totalItems}
          </h3>
          <span className="text-[11px] font-medium text-slate-400 group-hover:text-sky-600 transition-colors">
            عرض الكل &larr;
          </span>
        </div>
      </button>

      {/* 2. Expiring Soon (< 60 days) */}
      <button
        onClick={() => onSelectFilter('warning')}
        className={`group relative text-right p-4.5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer ${
          activeFilter === 'warning'
            ? 'border-amber-500 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20'
            : 'border-slate-200/80 hover:border-amber-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">قريبة من انتهاء الصلاحية</span>
            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md font-medium">
              &le; 60 يوم
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <h3 className="text-3xl font-extrabold text-amber-600 font-mono tabular-nums tracking-tight">
            {warningItems}
          </h3>
          <span className="text-[11px] font-medium text-slate-400 group-hover:text-amber-600 transition-colors">
            تصفية &larr;
          </span>
        </div>
      </button>

      {/* 3. Expired Items */}
      <button
        onClick={() => onSelectFilter('expired')}
        className={`group relative text-right p-4.5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer ${
          activeFilter === 'expired'
            ? 'border-rose-500 shadow-md shadow-rose-500/10 ring-2 ring-rose-500/20'
            : 'border-slate-200/80 hover:border-rose-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">منتهية الصلاحية (إتلاف)</span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <h3 className="text-3xl font-extrabold text-rose-600 font-mono tabular-nums tracking-tight">
            {expiredItems}
          </h3>
          <span className="text-[11px] font-medium text-slate-400 group-hover:text-rose-600 transition-colors">
            تصفية &larr;
          </span>
        </div>
      </button>

      {/* 4. Low Stock Reorder Alert */}
      <button
        onClick={() => onSelectFilter('low-stock')}
        className={`group relative text-right p-4.5 rounded-2xl bg-white border transition-all duration-200 cursor-pointer ${
          activeFilter === 'low-stock'
            ? 'border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
            : 'border-slate-200/80 hover:border-blue-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">نواقص تحتاج إعادة طلب</span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingCart className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <h3 className="text-3xl font-extrabold text-blue-600 font-mono tabular-nums tracking-tight">
            {lowStockItems}
          </h3>
          <span className="text-[11px] font-medium text-slate-400 group-hover:text-blue-600 transition-colors">
            تصفية &larr;
          </span>
        </div>
      </button>

    </div>
  );
};
