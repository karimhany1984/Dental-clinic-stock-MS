import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { BarChart3, Layers, ChevronDown, ChevronUp, PackageCheck } from 'lucide-react';
import { DentalInventoryItem, DentalCategory } from '../types/inventory';

interface CategoryStockChartProps {
  items: DentalInventoryItem[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

// Medical & clinical palette for category bars
const CATEGORY_COLORS: Record<string, string> = {
  'حشوات وترميم': '#0284c7', // Sky Blue
  'تخدير وجراحة': '#4f46e5', // Indigo
  'تعقيم ومكافحة عدوى': '#0d9488', // Teal
  'علاج جذور وأعصاب': '#8b5cf6', // Violet
  'مستهلكات ووقاية': '#0891b2', // Cyan
  'طبعات وتقويم': '#059669', // Emerald
  'أخرى': '#64748b', // Slate
};

interface TooltipPayloadItem {
  value: number;
  payload: {
    category: string;
    totalQty: number;
    itemCount: number;
    lowStockCount: number;
  };
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/60 text-xs backdrop-blur-md font-sans">
        <div className="font-bold text-sky-300 text-sm mb-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
          {data.category}
        </div>
        <div className="space-y-1 text-slate-300 text-[11px]">
          <div className="flex justify-between gap-4">
            <span>إجمالي الكميات بالمخزون:</span>
            <strong className="text-white font-mono tabular-nums">{data.totalQty} وحدة</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>عدد الأصناف المسجلة:</span>
            <strong className="text-white font-mono tabular-nums">{data.itemCount} صنف</strong>
          </div>
          {data.lowStockCount > 0 && (
            <div className="flex justify-between gap-4 text-amber-300 font-semibold pt-1 border-t border-slate-800">
              <span>أصناف منخفضة (إعادة طلب):</span>
              <strong className="font-mono tabular-nums">{data.lowStockCount}</strong>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const CategoryStockChart: React.FC<CategoryStockChartProps> = ({
  items,
  selectedCategory,
  onSelectCategory,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [metricMode, setMetricMode] = useState<'qty' | 'count'>('qty');

  // Compute stock quantity and items per category
  const chartData = useMemo(() => {
    const map = new Map<
      string,
      { category: string; totalQty: number; itemCount: number; lowStockCount: number }
    >();

    items.forEach((item) => {
      const cat = item.category || 'أخرى';
      const current = map.get(cat) || {
        category: cat,
        totalQty: 0,
        itemCount: 0,
        lowStockCount: 0,
      };

      current.totalQty += item.qty;
      current.itemCount += 1;
      if (item.qty <= item.minQty) {
        current.lowStockCount += 1;
      }
      map.set(cat, current);
    });

    return Array.from(map.values()).sort((a, b) => b.totalQty - a.totalQty);
  }, [items]);

  // Overall statistics
  const totalStockUnits = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.qty, 0);
  }, [items]);

  const topCategory = chartData[0];

  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs mb-8 overflow-hidden transition-all no-print">
      
      {/* Header bar */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                توزيع كميات المخزون حسب التصنيف الطبي
              </h2>
              {selectedCategory !== 'all' && (
                <span className="text-[10px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                  محدد: {selectedCategory}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              إجمالي الوحدات المتاحة حالياً في العيادة:{' '}
              <strong className="text-slate-800 font-mono tabular-nums">{totalStockUnits}</strong>{' '}
              وحدة عبر{' '}
              <strong className="text-slate-800 font-mono tabular-nums">{chartData.length}</strong>{' '}
              تصنيفات
            </p>
          </div>
        </div>

        {/* Controls: Metric Switch & Collapse Toggle */}
        <div className="flex items-center gap-2 text-xs">
          {/* Metric Selector */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-[11px] font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setMetricMode('qty')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                metricMode === 'qty'
                  ? 'bg-white text-sky-800 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              الكمية المتوفرة
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('count')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                metricMode === 'count'
                  ? 'bg-white text-sky-800 font-bold shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              عدد المواد
            </button>
          </div>

          {/* Toggle minimize */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title={isCollapsed ? 'توسيع الرسم البياني' : 'طي الرسم البياني'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chart Canvas & Insights */}
      {!isCollapsed && (
        <div className="p-5">
          {/* Quick Insights Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <PackageCheck className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-[11px] text-slate-500">التصنيف الأكثر وفرة</div>
                <div className="font-bold text-slate-800 truncate">
                  {topCategory?.category || '-'} ({topCategory?.totalQty || 0} وحدة)
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500">متوسط الوحدات لكل قسم</div>
                <div className="font-bold text-slate-800 font-mono tabular-nums">
                  {chartData.length > 0
                    ? Math.round(totalStockUnits / chartData.length)
                    : 0}{' '}
                  وحدة / قسم
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500">تصفية الجدول بالنقر</div>
                <div className="text-slate-600 text-[11px]">انقر على أي عمود لتصفية الجدول فورياً</div>
              </div>
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => onSelectCategory('all')}
                  className="text-[11px] text-sky-600 hover:underline font-semibold"
                >
                  إلغاء التحديد
                </button>
              )}
            </div>
          </div>

          {/* Recharts Bar Chart Container */}
          <div className="w-full h-64 sm:h-72" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
                onClick={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length) {
                    const clickedCat = state.activePayload[0].payload.category;
                    onSelectCategory(selectedCategory === clickedCat ? 'all' : clickedCat);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Cairo, sans-serif' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  interval={0}
                  tickMargin={8}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(2, 132, 199, 0.05)' }}
                />
                <Bar
                  dataKey={metricMode === 'qty' ? 'totalQty' : 'itemCount'}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                  animationDuration={600}
                  className="cursor-pointer"
                >
                  {chartData.map((entry) => {
                    const isSelected = selectedCategory === entry.category;
                    const baseColor = CATEGORY_COLORS[entry.category] || '#0284c7';
                    return (
                      <Cell
                        key={`cell-${entry.category}`}
                        fill={baseColor}
                        opacity={selectedCategory === 'all' || isSelected ? 1 : 0.35}
                        stroke={isSelected ? '#0f172a' : 'transparent'}
                        strokeWidth={isSelected ? 2 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Chips below chart */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-[11px]">
            {chartData.map((cat) => {
              const isSelected = selectedCategory === cat.category;
              const color = CATEGORY_COLORS[cat.category] || '#0284c7';
              return (
                <button
                  key={cat.category}
                  type="button"
                  onClick={() =>
                    onSelectCategory(selectedCategory === cat.category ? 'all' : cat.category)
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span>{cat.category}</span>
                  <span className="font-mono tabular-nums opacity-75 font-semibold">
                    ({metricMode === 'qty' ? cat.totalQty : cat.itemCount})
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
};
