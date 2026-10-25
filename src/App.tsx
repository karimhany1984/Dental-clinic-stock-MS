/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { StatSummary } from './components/StatSummary';
import { CategoryStockChart } from './components/CategoryStockChart';
import { QuickAddForm } from './components/QuickAddForm';
import { FilterBar } from './components/FilterBar';
import { InventoryTable } from './components/InventoryTable';
import { ItemModal } from './components/ItemModal';
import { AuditReportPrint } from './components/AuditReportPrint';
import { DentalInventoryItem, FilterStatus } from './types/inventory';
import { SAMPLE_DENTAL_INVENTORY } from './data/sampleDentalData';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { ShieldCheck, WifiOff, Sparkles, Check, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'clinic_inventory';

export default function App() {
  const isOnline = useOnlineStatus();

  // State
  const [items, setItems] = useState<DentalInventoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return SAMPLE_DENTAL_INVENTORY;
  });

  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('expiry-asc');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DentalInventoryItem | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // LocalStorage quota or access error
    }
  }, [items]);

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let warningCount = 0;
    let expiredCount = 0;
    let lowStockCount = 0;

    items.forEach((item) => {
      const expDate = new Date(item.expiry);
      expDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        expiredCount++;
      } else if (diffDays <= 60) {
        warningCount++;
      }

      if (item.qty <= item.minQty) {
        lowStockCount++;
      }
    });

    return {
      total: items.length,
      warning: warningCount,
      expired: expiredCount,
      lowStock: lowStockCount,
    };
  }, [items]);

  // Filtered and Sorted Items
  const filteredItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return items
      .filter((item) => {
        // Status filter
        if (statusFilter !== 'all') {
          const expDate = new Date(item.expiry);
          expDate.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (statusFilter === 'warning' && (diffDays > 60 || diffDays < 0)) return false;
          if (statusFilter === 'expired' && diffDays >= 0) return false;
          if (statusFilter === 'low-stock' && item.qty > item.minQty) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const nameMatch = item.name.toLowerCase().includes(q);
          const lotMatch = item.lotNumber ? item.lotNumber.toLowerCase().includes(q) : false;
          const locMatch = item.location ? item.location.toLowerCase().includes(q) : false;
          const catMatch = item.category ? item.category.toLowerCase().includes(q) : false;
          if (!nameMatch && !lotMatch && !locMatch && !catMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'expiry-asc') {
          return new Date(a.expiry).getTime() - new Date(b.expiry).getTime();
        }
        if (sortBy === 'expiry-desc') {
          return new Date(b.expiry).getTime() - new Date(a.expiry).getTime();
        }
        if (sortBy === 'qty-asc') {
          return a.qty - b.qty;
        }
        if (sortBy === 'qty-desc') {
          return b.qty - a.qty;
        }
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name, 'ar');
        }
        return 0;
      });
  }, [items, statusFilter, selectedCategory, searchQuery, sortBy]);

  // Handlers
  const handleAddItem = (newItem: Omit<DentalInventoryItem, 'id'>) => {
    const itemWithId: DentalInventoryItem = {
      ...newItem,
      id: Date.now(),
    };
    setItems((prev) => [itemWithId, ...prev]);
    showToast(`تمت إضافة "${newItem.name}" بنجاح إلى المخزون`);
  };

  const handleEditItem = (item: DentalInventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveModalItem = (itemData: Omit<DentalInventoryItem, 'id'> | DentalInventoryItem) => {
    if ('id' in itemData && itemData.id) {
      setItems((prev) => prev.map((it) => (it.id === itemData.id ? (itemData as DentalInventoryItem) : it)));
      showToast(`تم تحديث الصنف بنجاح`);
    } else {
      handleAddItem(itemData);
    }
  };

  const handleDeleteItem = (id: number) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    if (window.confirm(`هل أنت متأكد من حذف الصنف "${target.name}" من المخزون؟`)) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast(`تم حذف الصنف من المخزون`, 'info');
    }
  };

  const handleAdjustQty = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.qty + delta);
          return { ...item, qty: newQty, lastUpdated: new Date().toISOString() };
        }
        return item;
      })
    );
  };

  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Arabic support in Excel
    csvContent += 'اسم الصنف,التصنيف,الكمية المتوفرة,الوحدة,تاريخ انتهاء الصلاحية,الحد الأدنى,رقم التشغيلة (Lot #),مكان الحفظ,حالة الصلاحية,ملاحظات\n';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    items.forEach((item) => {
      const expDate = new Date(item.expiry);
      expDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let statusStr = 'صالح';
      if (diffDays < 0) statusStr = 'منتهي الصلاحية';
      else if (diffDays <= 60) statusStr = `قريب الانتهاء (${diffDays} يوم)`;

      const cleanName = `"${(item.name || '').replace(/"/g, '""')}"`;
      const cleanNotes = `"${(item.notes || '').replace(/"/g, '""')}"`;
      const cleanLoc = `"${(item.location || '').replace(/"/g, '""')}"`;

      csvContent += `${cleanName},${item.category || ''},${item.qty},${item.unit || ''},${item.expiry},${item.minQty},${item.lotNumber || ''},${cleanLoc},${statusStr},${cleanNotes}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `جرد_مخزون_الأسنان_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('تم تصدير ملف Excel بنجاح');
  };

  const handlePrintAudit = () => {
    window.print();
  };

  const handleLoadSamples = () => {
    if (window.confirm('هل تود تحميل نموذج بيانات لعيادة الأسنان؟ (لن يتم حذف بياناتك، بل دمجها)')) {
      const newItems = [...SAMPLE_DENTAL_INVENTORY.map((it) => ({ ...it, id: Date.now() + Math.floor(Math.random() * 10000) })), ...items];
      // remove duplicates by name
      const unique = Array.from(new Map(newItems.map((item) => [item.name, item])).values());
      setItems(unique);
      showToast('تم تحميل بيانات العيادة النموذجية بنجاح');
    }
  };

  const handleResetAll = () => {
    if (window.confirm('تحذير: هل أنت متأكد من رغبتك في إفراغ كافة بيانات المخزون نهائياً؟')) {
      setItems([]);
      showToast('تم إفراغ المخزون بالكامل', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans">
      
      {/* Printable Audit Sheet (Only visible during print) */}
      <AuditReportPrint items={items} />

      {/* Screen Interface */}
      <div className="no-print flex-1 flex flex-col">
        
        {/* Header */}
        <Header
          onOpenAddModal={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          onExportCSV={handleExportCSV}
          onPrintAudit={handlePrintAudit}
          onLoadSamples={handleLoadSamples}
          onResetAll={handleResetAll}
          totalCount={items.length}
        />

        {/* Offline Notice Banner (Shows automatically if connection drops) */}
        {!isOnline && (
          <div className="bg-amber-500 text-slate-900 px-4 py-2 text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-xs">
            <WifiOff className="w-4 h-4" />
            <span>
              أنت تعمل حالياً دون اتصال بالإنترنت (Offline Mode). جميع العمليات والتعديلات تُحفظ تلقائياً في ذاكرة جهازك.
            </span>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Quick Stats Panel (Interactive Filters) */}
          <StatSummary
            totalItems={stats.total}
            warningItems={stats.warning}
            expiredItems={stats.expired}
            lowStockItems={stats.lowStock}
            activeFilter={statusFilter}
            onSelectFilter={(f) => setStatusFilter(f)}
          />

          {/* Category Stock Distribution Bar Chart (Recharts) */}
          <CategoryStockChart
            items={items}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Quick Registration Form */}
          <QuickAddForm onAddItem={handleAddItem} />

          {/* Filter Bar with Live Search & Sort */}
          <FilterBar
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            itemCount={filteredItems.length}
          />

          {/* High-Density Dental Stock Table */}
          <InventoryTable
            items={filteredItems}
            onDeleteItem={handleDeleteItem}
            onEditItem={handleEditItem}
            onAdjustQty={handleAdjustQty}
            onOpenAddModal={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
          />

        </main>

        {/* Footer */}
        <footer className="mt-auto py-6 border-t border-slate-200/80 bg-white text-slate-500 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">دينتـا ستـوك (DentaStock)</span>
              <span>·</span>
              <span>نظام إدارة المخزون الطبي للأسنان وتتبع الصلاحيات (PWA)</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                حفظ محلي آمن في المتصفح
              </span>
              <span>تحديث البيانات لحظي</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Item Modal (Add/Edit) */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveModalItem}
        initialItem={editingItem}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl animate-in slide-in-from-bottom-3 duration-200 no-print">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification.message}</span>
        </div>
      )}

    </div>
  );
}
