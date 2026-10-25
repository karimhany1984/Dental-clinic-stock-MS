import React from 'react';
import { DentalInventoryItem } from '../types/inventory';

interface AuditReportPrintProps {
  items: DentalInventoryItem[];
}

export const AuditReportPrint: React.FC<AuditReportPrintProps> = ({ items }) => {
  const currentDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="hidden print:block p-6 text-black bg-white">
      {/* Header */}
      <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold font-sans">
            تقرير جرد المخزون الطبي وصلاحيات المواد - عيادة الأسنان
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            كشف رقابة الجودة والمخزون الصيدلاني المعتمد
          </p>
        </div>
        <div className="text-left text-xs font-mono">
          <div>تاريخ الجرد: {currentDate}</div>
          <div>إجمالي الأصناف: {items.length}</div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-right border-collapse text-xs mb-8">
        <thead>
          <tr className="bg-slate-100 border border-slate-400 font-bold">
            <th className="p-2 border border-slate-300">#</th>
            <th className="p-2 border border-slate-300">اسم الصنف والمادة</th>
            <th className="p-2 border border-slate-300">التصنيف</th>
            <th className="p-2 border border-slate-300">الكمية</th>
            <th className="p-2 border border-slate-300">تاريخ الصلاحية</th>
            <th className="p-2 border border-slate-300">الحد الأدنى</th>
            <th className="p-2 border border-slate-300">حالة الصلاحية</th>
            <th className="p-2 border border-slate-300">الموقع / الملاحظات</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const exp = new Date(item.expiry);
            exp.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            let statusText = 'صالح';
            if (diffDays < 0) statusText = 'منتهي الصلاحية (إتلاف)';
            else if (diffDays <= 60) statusText = `قريب الانتهاء (${diffDays} يوم)`;

            return (
              <tr key={item.id} className="border border-slate-300">
                <td className="p-2 border border-slate-300 font-mono text-center">{idx + 1}</td>
                <td className="p-2 border border-slate-300 font-bold">{item.name}</td>
                <td className="p-2 border border-slate-300">{item.category || '-'}</td>
                <td className="p-2 border border-slate-300 font-mono text-center">{item.qty} {item.unit || ''}</td>
                <td className="p-2 border border-slate-300 font-mono text-center">{item.expiry}</td>
                <td className="p-2 border border-slate-300 font-mono text-center">{item.minQty}</td>
                <td className="p-2 border border-slate-300 font-semibold">{statusText}</td>
                <td className="p-2 border border-slate-300 text-slate-600">{item.location || item.notes || '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Signature Section */}
      <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-300 text-xs">
        <div>
          <div className="font-bold mb-1">المسؤول عن الجرد:</div>
          <div className="text-slate-500">الاسم: ................................</div>
          <div className="text-slate-500 mt-2">التوقيع: ................................</div>
        </div>
        <div>
          <div className="font-bold mb-1">طبيب العيادة المشرف:</div>
          <div className="text-slate-500">الاسم: ................................</div>
          <div className="text-slate-500 mt-2">التوقيع: ................................</div>
        </div>
        <div>
          <div className="font-bold mb-1">اعتماد إدارة الجودة:</div>
          <div className="text-slate-500">التاريخ: ................................</div>
          <div className="text-slate-500 mt-2">الختم الرسمي:</div>
        </div>
      </div>
    </div>
  );
};
