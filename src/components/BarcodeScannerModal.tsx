import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  X, 
  Camera, 
  Upload, 
  CheckCircle2, 
  Plus, 
  Minus, 
  PackagePlus, 
  AlertCircle, 
  RefreshCw,
  Sparkles,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import { DentalInventoryItem } from '../types/inventory';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: DentalInventoryItem[];
  onAdjustQty: (id: number, delta: number) => void;
  onRegisterNewItemWithBarcode: (barcodeData: {
    barcode: string;
    lotNumber?: string;
    expiry?: string;
    name?: string;
  }) => void;
}

// Subtle audio beep feedback synthesized with Web Audio API (no external file needed)
function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Audio might be muted or not allowed without user gesture
  }
}

// Parse medical GS1 DataMatrix or standard barcodes
function parseMedicalCode(rawText: string): {
  barcode: string;
  lotNumber?: string;
  expiry?: string;
  name?: string;
} {
  const trimmed = rawText.trim();

  // 1. Try parsing JSON if encoded as a smart dental QR code
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        barcode: parsed.barcode || parsed.code || trimmed,
        name: parsed.name,
        lotNumber: parsed.lot || parsed.lotNumber,
        expiry: parsed.exp || parsed.expiry,
      };
    } catch {
      // ignore
    }
  }

  // 2. Check for GS1 format (common in dental and pharmaceutical packages)
  // Format with brackets: (01)00847291029384(17)261231(10)LOT1234
  // (17) is Expiry date YYMMDD, (10) is Lot, (01) is GTIN
  const gtinMatch = trimmed.match(/\(01\)(\d{14})/) || trimmed.match(/^01(\d{14})/);
  const expMatch = trimmed.match(/\(17\)(\d{6})/) || trimmed.match(/17(\d{6})/);
  const lotMatch = trimmed.match(/\(10\)([A-Za-z0-9\-_]+)/) || trimmed.match(/10([A-Za-z0-9\-_]+)/);

  let formattedExp: string | undefined;
  if (expMatch && expMatch[1]) {
    const rawExp = expMatch[1];
    const yy = parseInt(rawExp.substring(0, 2), 10);
    const mm = rawExp.substring(2, 4);
    const dd = rawExp.substring(4, 6);
    const fullYear = yy < 50 ? 2000 + yy : 1900 + yy;
    formattedExp = `${fullYear}-${mm}-${dd}`;
  }

  return {
    barcode: gtinMatch ? gtinMatch[1] : trimmed,
    lotNumber: lotMatch ? lotMatch[1] : undefined,
    expiry: formattedExp,
  };
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onAdjustQty,
  onRegisterNewItemWithBarcode,
}) => {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [matchedItem, setMatchedItem] = useState<DentalInventoryItem | null>(null);
  const [parsedData, setParsedData] = useState<{
    barcode: string;
    lotNumber?: string;
    expiry?: string;
    name?: string;
  } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize and stop scanner
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setLastScannedCode(null);
      setMatchedItem(null);
      setParsedData(null);
      setScannerError(null);
      return;
    }

    startScanner();

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    setScannerError(null);
    try {
      // Ensure any previous instance is cleaned up
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {
          // ignore
        }
      }

      const qrScanner = new Html5Qrcode('qr-reader', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
        verbose: false,
      });

      html5QrCodeRef.current = qrScanner;

      const config = {
        fps: 15,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
      };

      await qrScanner.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleCodeDetected(decodedText);
        },
        () => {
          // Frame scan error (normal when no QR is in frame)
        }
      );

      setIsScanning(true);
    } catch (err: unknown) {
      console.warn('Failed to start camera:', err);
      setIsScanning(false);
      setScannerError(
        'تعذر الوصول للكاميرا تلقائياً. تأكد من منح إذن الوصول للكاميرا في المتصفح أو اختر رفع صورة الباركود من المعرض.'
      );
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const handleCodeDetected = (codeText: string) => {
    if (codeText === lastScannedCode && matchedItem) {
      return; // prevent spamming the exact same scan in 1 second
    }

    if (soundEnabled) {
      playBeep();
    }
    if (navigator.vibrate) {
      navigator.vibrate(120);
    }

    setLastScannedCode(codeText);
    const parsed = parseMedicalCode(codeText);
    setParsedData(parsed);

    // Look for a matching item in the clinic's inventory
    const found = inventory.find(
      (item) =>
        (item.barcode && item.barcode.trim() === parsed.barcode) ||
        (item.lotNumber && item.lotNumber.trim() === parsed.barcode) ||
        (parsed.lotNumber && item.lotNumber && item.lotNumber.trim() === parsed.lotNumber) ||
        item.name.toLowerCase().includes(parsed.barcode.toLowerCase())
    );

    setMatchedItem(found || null);
  };

  // Upload barcode image fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setScannerError(null);

    try {
      const qrScanner = html5QrCodeRef.current || new Html5Qrcode('qr-reader');
      const result = await qrScanner.scanFile(file, true);
      handleCodeDetected(result);
    } catch {
      setScannerError('لم يتم العثور على باركود أو رمز QR واضح في الصورة. يرجى تجربة صورة أوضح.');
    }
  };

  const handleResumeScan = () => {
    setLastScannedCode(null);
    setMatchedItem(null);
    setParsedData(null);
    if (!isScanning) {
      startScanner();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">قارئ الباركود ورمز QR الطبي</h3>
              <p className="text-[11px] text-slate-400">امسح كود العبوة للبحث السريع أو توريد/استهلاك المادة</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-white flex items-center justify-center transition"
              title={soundEnabled ? 'كتم صوت التنبيه' : 'تشغيل صوت التنبيه'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder Section */}
        <div className="p-5 bg-slate-950 flex flex-col items-center">
          <div className="relative w-full max-w-xs aspect-square bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-inner flex items-center justify-center">
            
            {/* Html5Qrcode video mount element */}
            <div id="qr-reader" className="w-full h-full object-cover" />

            {/* Target Reticle Overlay */}
            {isScanning && !matchedItem && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-dashed border-sky-400/80 rounded-2xl relative">
                  {/* Glowing corners */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-sky-400" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-sky-400" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-sky-400" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-sky-400" />
                  
                  {/* Laser scan line effect */}
                  <div className="w-full h-0.5 bg-linear-to-r from-transparent via-sky-400 to-transparent absolute top-1/2 -translate-y-1/2 animate-pulse" />
                </div>
              </div>
            )}

            {/* Error state */}
            {scannerError && (
              <div className="absolute inset-0 bg-slate-900/90 text-white p-4 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {scannerError}
                </p>
                <button
                  onClick={startScanner}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>إعادة المحاولة</span>
                </button>
              </div>
            )}
          </div>

          {/* Fallback & Helper buttons */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>مسح من صورة بالهاتف</span>
            </button>

            <button
              onClick={handleResumeScan}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>إعادة توجيه الكاميرا</span>
            </button>
          </div>
        </div>

        {/* Scan Result Area */}
        <div className="p-5">
          {matchedItem ? (
            /* 1. Item matched in inventory */
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 animate-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md mb-1.5">
                    <CheckCircle2 className="w-3 h-3" /> تم التعرف على الصنف في المخزون
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {matchedItem.name}
                  </h4>
                </div>
                <div className="text-left font-mono">
                  <span className="text-lg font-black text-slate-900 tabular-nums">
                    {matchedItem.qty}
                  </span>
                  <span className="text-[10px] text-slate-500 mr-1 font-sans">
                    {matchedItem.unit || 'قطعة'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-3 pt-2 border-t border-emerald-200/50">
                <div>تاريخ الصلاحية: <strong className="font-mono text-slate-800">{matchedItem.expiry}</strong></div>
                <div>مكان الحفظ: <strong className="text-slate-800">{matchedItem.location || 'غير محدد'}</strong></div>
                {matchedItem.lotNumber && (
                  <div>رقم الدفعة: <strong className="font-mono text-slate-800">{matchedItem.lotNumber}</strong></div>
                )}
                <div>الحد الأدنى: <strong className="font-mono text-slate-800">{matchedItem.minQty}</strong></div>
              </div>

              {/* Instant Stock Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-emerald-200/60">
                <button
                  onClick={() => onAdjustQty(matchedItem.id, 1)}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+1 توريد صنف</span>
                </button>
                <button
                  onClick={() => onAdjustQty(matchedItem.id, -1)}
                  disabled={matchedItem.qty <= 0}
                  className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>-1 استهلاك بالعيادة</span>
                </button>
                <button
                  onClick={handleResumeScan}
                  className="py-2 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-xl transition cursor-pointer"
                  title="مسح صنف آخر"
                >
                  صنف آخر
                </button>
              </div>
            </div>
          ) : lastScannedCode && parsedData ? (
            /* 2. New code scanned (not in inventory) */
            <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 animate-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center gap-2 text-sky-800 text-xs font-bold mb-1.5">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>تم مسح كود جديد غير مسجل مسبقاً</span>
              </div>
              <div className="font-mono text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-sky-100 mb-3 break-all">
                الكود: {parsedData.barcode}
                {parsedData.lotNumber && (
                  <div className="mt-1 text-[11px] text-slate-500">رقم الدفعة المستخرج: {parsedData.lotNumber}</div>
                )}
                {parsedData.expiry && (
                  <div className="mt-0.5 text-[11px] text-slate-500">تاريخ الصلاحية المستخرج: {parsedData.expiry}</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onRegisterNewItemWithBarcode(parsedData);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-3 bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>تسجيل هذا الصنف الآن بالمخزون</span>
                </button>
                <button
                  onClick={handleResumeScan}
                  className="py-2 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  إعادة المسح
                </button>
              </div>
            </div>
          ) : (
            /* 3. Waiting for scan instructions */
            <div className="text-center py-2 text-xs text-slate-500">
              <Zap className="w-4 h-4 text-sky-500 mx-auto mb-1" />
              وجه كاميرا الهاتف نحو باركود المنتج (Barcode) أو رمز الاستجابة السريعة (QR) الخاص بمواد وأدوية الأسنان.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
