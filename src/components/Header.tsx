import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  Printer, 
  Wifi, 
  WifiOff, 
  Sparkles, 
  RotateCcw,
  Smartphone,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenScanner: () => void;
  onExportCSV: () => void;
  onPrintAudit: () => void;
  onLoadSamples: () => void;
  onResetAll: () => void;
  totalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenScanner,
  onExportCSV,
  onPrintAudit,
  onLoadSamples,
  onResetAll,
  totalCount,
}) => {
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-colors no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 gap-4">
            
            {/* Zone 1: Brand Title with Medical Emblem */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shadow-sm shadow-sky-500/20 ring-1 ring-sky-500/30">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.5 2 6 4.5 6 8c0 3.5 1.5 6 3 9.5 1 2.5 1.5 4.5 3 4.5s2-2 3-4.5c1.5-3.5 3-6 3-9.5 0-3.5-2.5-6-6-6z" />
                  <path d="M12 6v4m-2-2h4" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold tracking-tight text-slate-900 font-sans">
                    دينتـا ستـوك
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/60 font-mono">
                    DentaStock
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                  إدارة المخزون الطبي وتواريخ صلاحية المواد لعيادات الأسنان
                </p>
              </div>
            </div>

            {/* Zone 2: Navigation & Status Indicators */}
            <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200/60 text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>نظام محلي مشفر ومحفوظ ذاتياً</span>
              </div>
              
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 bg-slate-50 border border-slate-200/40">
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-sky-500" />
                    <span>متصل</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-amber-700">وضع عدم الاتصال (Offline)</span>
                  </>
                )}
              </div>
            </div>

            {/* Zone 3: Primary Action Controls */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* PWA Install Button */}
              {!isInstalled && (isInstallable || isIOS) && (
                <button
                  onClick={() => {
                    if (isInstallable) {
                      install();
                    } else if (isIOS) {
                      setShowIOSModal(true);
                    }
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 active:scale-[0.98] rounded-xl border border-sky-200 transition-all shadow-xs"
                  title="تثبيت التطبيق على الشاشة الرئيسية كـ PWA"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>تثبيت التطبيق</span>
                </button>
              )}

              {/* Print Audit Sheet */}
              <button
                onClick={onPrintAudit}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 active:scale-[0.98] rounded-xl border border-slate-200 transition-all shadow-xs"
                title="طباعة تقرير جرد المخزون الطبي"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>طباعة الجرد</span>
              </button>

              {/* Export to Excel */}
              <button
                onClick={onExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:scale-[0.98] rounded-xl border border-emerald-200 transition-all shadow-xs"
                title="تصدير جدول المخزون بصيغة Excel CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">تصدير Excel</span>
                <span className="sm:hidden">تصدير</span>
              </button>

              {/* Barcode & QR Code Scanner Button */}
              <button
                onClick={onOpenScanner}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 active:scale-[0.98] rounded-xl border border-slate-200 transition-all shadow-xs cursor-pointer"
                title="مسح باركود أو كود QR بكاميرا الهاتف"
              >
                <QrCode className="w-3.5 h-3.5 text-sky-600" />
                <span className="hidden sm:inline">مسح باركود / QR</span>
                <span className="sm:hidden">مسح</span>
              </button>

              {/* Add New Item Button */}
              <button
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-linear-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 active:scale-[0.98] rounded-xl shadow-xs shadow-sky-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة صنف</span>
              </button>

              {/* Settings / Actions Menu Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition"
                  aria-label="قائمة الخيارات"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="19" cy="12" r="1.5" />
                    <circle cx="5" cy="12" r="1.5" />
                  </svg>
                </button>

                {showMenu && (
                  <div 
                    className="absolute left-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200/80 shadow-xl p-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150"
                    onClick={() => setShowMenu(false)}
                  >
                    <button
                      onClick={onLoadSamples}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-slate-700 hover:bg-sky-50 hover:text-sky-800 rounded-xl transition text-right"
                    >
                      <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                      <div>
                        <div className="font-semibold">تحميل عينة بيانات أسنان</div>
                        <div className="text-[10px] text-slate-500">10 أصناف طبية شائعة للعيادات</div>
                      </div>
                    </button>

                    <button
                      onClick={onPrintAudit}
                      className="w-full md:hidden flex items-center gap-2.5 px-3 py-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition text-right"
                    >
                      <Printer className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="font-medium">طباعة كشف الجرد</span>
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={onResetAll}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition text-right"
                    >
                      <RotateCcw className="w-4 h-4 shrink-0" />
                      <span>إفراغ كافة بيانات المخزون</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* iOS Installation Guided Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">تثبيت التطبيق على آيفون / آيباد</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4 text-right">
              لتثبيت هذا التطبيق الطبي والعمل به بدون اتصال بالإنترنت في العيادة:
              <br />
              1. اضغط على أيقونة <strong>المشاركة (Share)</strong> في شريط متصفح سفاري السفلي.
              <br />
              2. مرر للأسفل واختر <strong>«إضافة إلى الشاشة الرئيسية» (Add to Home Screen)</strong>.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              تم وفهمت
            </button>
          </div>
        </div>
      )}
    </>
  );
};
