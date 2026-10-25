import React from 'react';
import { Search, Filter, ArrowUpDown, X, QrCode } from 'lucide-react';
import { DentalCategory, FilterStatus } from '../types/inventory';

interface FilterBarProps {
  statusFilter: FilterStatus;
  onStatusFilterChange: (status: FilterStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  itemCount: number;
  onOpenScanner?: () => void;
}

const CATEGORIES: string[] = [
  'جميع التصنيفات',
  'حشوات وترميم',
  'تخدير وجراحة',
  'تعقيم ومكافحة عدوى',
  'علاج جذور وأعصاب',
  'مستهلكات ووقاية',
  'طبعات وتقويم',
  'أخرى',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortByChange,
  itemCount,
  onOpenScanner,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-4 shadow-xs no-print">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        
        {/* Search Input with Barcode Scan Button */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث بالاسم، رقم الدفعة (Lot #)، مكان التخزين، أو الباركود..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-16 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition"
          />
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {onOpenScanner && (
              <button
                type="button"
                onClick={onOpenScanner}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-600 transition"
                title="مسح باركود بالهاتف للبحث الفوري"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => onStatusFilterChange('warning')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              statusFilter === 'warning'
                ? 'bg-white text-amber-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ينتهي قريباً
          </button>
          <button
            onClick={() => onStatusFilterChange('expired')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              statusFilter === 'expired'
                ? 'bg-white text-rose-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            منتهي
          </button>
          <button
            onClick={() => onStatusFilterChange('low-stock')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              statusFilter === 'low-stock'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            نواقص المخزون
          </button>
        </div>

        {/* Dropdowns (Category & Sort) */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-7 text-xs text-slate-700 font-medium hover:bg-slate-100 transition cursor-pointer outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat === 'جميع التصنيفات' ? 'all' : cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-7 text-xs text-slate-700 font-medium hover:bg-slate-100 transition cursor-pointer outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="expiry-asc">الأقرب انتهاءً (الافتراضي)</option>
              <option value="expiry-desc">الأبعد انتهاءً</option>
              <option value="qty-asc">الكمية: الأقل أولاً</option>
              <option value="qty-desc">الكمية: الأكثر أولاً</option>
              <option value="name-asc">الاسم: أبجدياً</option>
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>

      </div>

      {/* Results summary counter */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div>
          يتم عرض <strong className="font-mono tabular-nums text-slate-700">{itemCount}</strong> صنف مطبق عليه الفرز
        </div>
        {(statusFilter !== 'all' || selectedCategory !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              onStatusFilterChange('all');
              onCategoryChange('all');
              onSearchChange('');
            }}
            className="text-sky-600 hover:underline font-medium"
          >
            إعادة تعيين كافة الفلاتر
          </button>
        )}
      </div>

    </div>
  );
};
