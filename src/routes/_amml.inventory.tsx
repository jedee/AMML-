import React, { useState, useEffect } from 'react';
import { createRoute, Link, useBlocker } from '@tanstack/react-router';
import { Route as AmmlLayoutRoute } from './_amml';
import { useAmmlStore } from '../lib/amml/store';
import { AmmlAsset, AmmlAssetStock, AmmlPurchaseOrder } from '../lib/amml/types';
import { 
  Package, Search, PlusCircle, Trash, Edit3, ArrowLeft, RefreshCw, 
  HelpCircle, Database, TrendingUp, ShoppingBag, Plus, Info, Check, 
  AlertTriangle, Play, CheckCircle2, ChevronRight, X, Layers,
  Download, FileText, Printer, Radio
} from 'lucide-react';

export const Route = createRoute({
  getParentRoute: () => AmmlLayoutRoute,
  path: '/inventory',
  component: InventoryRouteComponent,
});

function InventoryRouteComponent() {
  const { 
    markets, 
    assets, setAssets, 
    assetStocks, setAssetStocks, 
    purchaseOrders, setPurchaseOrders,
    session, 
    auditLog 
  } = useAmmlStore();

  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'orders' | 'forecast' | 'sync' | 'hr_admin' | 'reorder_checklist'>('reorder_checklist');

  useBlocker({
    shouldBlockFn: () => {
      const isUnsaved = localStorage.getItem('amml_reorder_is_unsaved') === 'true';
      if (isUnsaved) {
        const leave = window.confirm("You have unsaved stationery quotation configurations. Would you like to discard them and leave this page?");
        return !leave;
      }
      return false;
    }
  });

  // Streamlined HR/Admin Supplies state with direct persistence
  const initialHrAdminItems = [
    // Office Stationery (28 items)
    { id: 'hr-st-1', category: 'Stationery', description: 'Writing pad', qty: 3, unit: 'packs' },
    { id: 'hr-st-2', category: 'Stationery', description: 'Stick-on paper', qty: 3, unit: 'packs' },
    { id: 'hr-st-3', category: 'Stationery', description: 'Gum', qty: 2, unit: 'packs' },
    { id: 'hr-st-4', category: 'Stationery', description: 'Paper clip (Medium size)', qty: 6, unit: 'packs' },
    { id: 'hr-st-5', category: 'Stationery', description: 'Paper clip (Small size)', qty: 2, unit: 'packs' },
    { id: 'hr-st-6', category: 'Stationery', description: 'Coloring paper clips', qty: 5, unit: 'packs' },
    { id: 'hr-st-7', category: 'Stationery', description: 'Office pins', qty: 10, unit: 'packs' },
    { id: 'hr-st-8', category: 'Stationery', description: 'Staple pins', qty: 3, unit: 'packs' },
    { id: 'hr-st-9', category: 'Stationery', description: 'Correction pin', qty: 3, unit: 'packs' },
    { id: 'hr-st-10', category: 'Stationery', description: 'Blue and black biro', qty: 3, unit: 'packs' },
    { id: 'hr-st-11', category: 'Stationery', description: 'A4 paper', qty: 5, unit: 'cartons' },
    { id: 'hr-st-12', category: 'Stationery', description: 'Brown and white envelopes (Small size)', qty: 10, unit: 'packs' },
    { id: 'hr-st-13', category: 'Stationery', description: 'Punch', qty: 3, unit: 'packs' },
    { id: 'hr-st-14', category: 'Stationery', description: 'Stapler', qty: 3, unit: 'packs' },
    { id: 'hr-st-15', category: 'Stationery', description: 'Flat file', qty: 1.5, unit: 'packs' },
    { id: 'hr-st-16', category: 'Stationery', description: 'A4 envelope (Brown and white)', qty: 3, unit: 'packs' },
    { id: 'hr-st-17', category: 'Stationery', description: 'Arc file', qty: 0.5, unit: 'pack' },
    { id: 'hr-st-18', category: 'Stationery', description: 'Conqueror Paper (Off-White)', qty: 1, unit: 'pack' },
    { id: 'hr-st-19', category: 'Stationery', description: 'Rubber Band', qty: 0.5, unit: 'pack' },
    { id: 'hr-st-20', category: 'Stationery', description: 'Ruler', qty: 3, unit: 'packs' },
    { id: 'hr-st-21', category: 'Stationery', description: 'Transparent File', qty: 3, unit: 'packs' },
    { id: 'hr-st-22', category: 'Stationery', description: 'Masking tape', qty: 6, unit: 'pieces' },
    { id: 'hr-st-23', category: 'Stationery', description: 'Sellotape', qty: 12, unit: 'pieces' },
    { id: 'hr-st-24', category: 'Stationery', description: 'A3 envelope', qty: 2, unit: 'packs' },
    { id: 'hr-st-25', category: 'Stationery', description: 'Calculator', qty: 5, unit: 'packs' },
    { id: 'hr-st-26', category: 'Stationery', description: 'Highlighter', qty: 0, unit: 'packs' },
    { id: 'hr-st-27', category: 'Stationery', description: 'Marker', qty: 4, unit: 'pieces' },
    { id: 'hr-st-28', category: 'Stationery', description: 'A3 paper', qty: 0.5, unit: 'carton' },
  
    // Laser Jet Toners (12 items)
    { id: 'hr-to-1', category: 'Toner', description: 'Laser Jet Toner 203A', qty: 1, unit: 'pcs' },
    { id: 'hr-to-2', category: 'Toner', description: 'Laser Jet Toner 130A', qty: 1, unit: 'pcs' },
    { id: 'hr-to-3', category: 'Toner', description: 'Laser Jet Toner 49A', qty: 3, unit: 'pcs' },
    { id: 'hr-to-4', category: 'Toner', description: 'Laser Jet Toner 53A', qty: 3, unit: 'pcs' },
    { id: 'hr-to-5', category: 'Toner', description: 'Laser Jet Toner 17A', qty: 8, unit: 'pcs' },
    { id: 'hr-to-6', category: 'Toner', description: 'Laser Jet Toner 80A', qty: 0, unit: 'pcs' },
    { id: 'hr-to-7', category: 'Toner', description: 'Laser Jet Toner 05A', qty: 3, unit: 'pcs' },
    { id: 'hr-to-8', category: 'Toner', description: 'Laser Jet Toner 59A', qty: 0, unit: 'pcs' },
    { id: 'hr-to-9', category: 'Toner', description: 'Laser Jet Toner 85A', qty: 3, unit: 'pcs' },
    { id: 'hr-to-10', category: 'Toner', description: 'Laser Jet Toner 126A', qty: 0, unit: 'pcs' },
    { id: 'hr-to-11', category: 'Toner', description: 'Ink 652', qty: 0, unit: 'pcs' },
    { id: 'hr-to-12', category: 'Toner', description: 'Laser Jet Toner 106A', qty: 0, unit: 'pcs' },
  ];
  
  const [hrAdminItems, setHrAdminItems] = useState<{ id: string; category: string; description: string; qty: number; unit: string }[]>(() => {
    try {
      const raw = localStorage.getItem('amml_hr_admin_items');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse hr admin items:', e);
    }
    return initialHrAdminItems;
  });
  
  // Requisition form / shopping cart states
  const [requisitionCart, setRequisitionCart] = useState<{ [itemId: string]: number }>({});
  const [requisitionUnit, setRequisitionUnit] = useState('AD');
  const [requisitionOfficer, setRequisitionOfficer] = useState('');
  const [requisitionMemo, setRequisitionMemo] = useState('');
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);

  // --- START REORDER CHECKLIST STATES & UTILITIES ---
  const defaultQuotationItems = [
    { sn: 1, name: "LASEPJET TONER 17A", qty: 6, unit: "PACKETS", rate: 35000 },
    { sn: 2, name: "LASERJET TONER 80A", qty: 2, unit: "PACKETS", rate: 40000 },
    { sn: 3, name: "LASERJET TONER 05A", qty: 3, unit: "PACKETS", rate: 35000 },
    { sn: 4, name: "LASERJET TONER 59A", qty: 4, unit: "PACKETS", rate: 65000 },
    { sn: 5, name: "LASERJET TONER 85A", qty: 2, unit: "PACKETS", rate: 35000 },
    { sn: 6, name: "LASERJET TONER 126A", qty: 1, unit: "PIECES", rate: 40000 },
    { sn: 7, name: "INK 652", qty: 1, unit: "SET", rate: 60000 },
    { sn: 8, name: "LASERJET TONER 106A", qty: 2, unit: "PACKETS", rate: 45000 },
    { sn: 9, name: "WRITING PAD", qty: 2, unit: "PACKETS", rate: 3500 },
    { sn: 10, name: "STICK-ON-PAPER", qty: 5, unit: "PACKETS", rate: 2000 },
    { sn: 11, name: "GUM", qty: 1, unit: "PACKETS", rate: 4000 },
    { sn: 12, name: "PAPER CLIP (MEDIUM SIZE)", qty: 2, unit: "PACKETS", rate: 3000 },
    { sn: 13, name: "PAPER CLIP (SMALL SIZEO)", qty: 2, unit: "PACKETS", rate: 2500 },
    { sn: 14, name: "COLOUR PAPER CLIPS", qty: 5, unit: "PACKETS", rate: 800 },
    { sn: 15, name: "OFFICE PINS", qty: 3, unit: "PACKETS", rate: 800 },
    { sn: 16, name: "STAPLE PINS", qty: 5, unit: "PACKETS", rate: 1200 },
    { sn: 17, name: "CORRECTION PIN", qty: 2, unit: "PACKETS", rate: 4000 },
    { sn: 18, name: "BLUE & BLACK BIRO", qty: 3, unit: "PACKETS", rate: 4500 },
    { sn: 19, name: "A4 PAPERS", qty: 20, unit: "CARTONS", rate: 27000 },
    { sn: 20, name: "BROWN & WHITE ENVELOPE (SMALL SIZE)", qty: 5, unit: "PACKETS", rate: 1200 },
    { sn: 21, name: "PUNCH", qty: 3, unit: "PACKETS", rate: 6000 },
    { sn: 22, name: "STAPLER", qty: 1, unit: "PACKETS", rate: 60000 },
    { sn: 23, name: "FLAT FILE", qty: 2, unit: "PACKETS", rate: 18000 },
    { sn: 24, name: "A4 ENVELOFE BROWN & WHITE", qty: 10, unit: "PACKETS", rate: 2500 },
    { sn: 25, name: "ARCH FILE", qty: 1, unit: "CARTONS", rate: 90000 },
    { sn: 26, name: "CONQUEROR PAPER (OFF WHITE)", qty: 2, unit: "PACKETS", rate: 34000 },
    { sn: 27, name: "RUBBER BAND", qty: 3, unit: "PACKETS", rate: 2500 },
    { sn: 28, name: "RULER", qty: 2, unit: "PACKETS", rate: 2500 },
    { sn: 29, name: "TRANSPARENT FILE", qty: 4, unit: "PACKETS", rate: 3500 }
  ];

  const getMappedHrItemIdOfQuotation = (quoteName: string): string => {
    const norm = quoteName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (norm.includes('17a')) return 'hr-to-5';
    if (norm.includes('80a')) return 'hr-to-6';
    if (norm.includes('05a')) return 'hr-to-7';
    if (norm.includes('59a')) return 'hr-to-8';
    if (norm.includes('85a')) return 'hr-to-9';
    if (norm.includes('126a')) return 'hr-to-10';
    if (norm.includes('652')) return 'hr-to-11';
    if (norm.includes('106a')) return 'hr-to-12';
    if (norm.includes('writingpad')) return 'hr-st-1';
    if (norm.includes('stickon')) return 'hr-st-2';
    if (norm.includes('gum')) return 'hr-st-3';
    if (norm.includes('mediumsize')) return 'hr-st-4';
    if (norm.includes('smallsizeo') || norm.includes('smallsize')) {
      if (norm.includes('envelope')) return 'hr-st-12';
      return 'hr-st-5';
    }
    if (norm.includes('colourpaper') || norm.includes('coloring')) return 'hr-st-6';
    if (norm.includes('officepin')) return 'hr-st-7';
    if (norm.includes('staplepin')) return 'hr-st-8';
    if (norm.includes('correctionpin')) return 'hr-st-9';
    if (norm.includes('blueblack') || norm.includes('biro')) return 'hr-st-10';
    if (norm.includes('a4paper') || norm.includes('a4papers')) return 'hr-st-11';
    if (norm.includes('punch')) return 'hr-st-13';
    if (norm.includes('stapler')) return 'hr-st-14';
    if (norm.includes('flatfile')) return 'hr-st-15';
    if (norm.includes('a4envelope')) return 'hr-st-16';
    if (norm.includes('archfile') || norm.includes('arcfile')) return 'hr-st-17';
    if (norm.includes('conqueror')) return 'hr-st-18';
    if (norm.includes('rubberband')) return 'hr-st-19';
    if (norm.includes('ruler')) return 'hr-st-20';
    if (norm.includes('transparentfile')) return 'hr-st-21';
    return '';
  };

  const [checklistCustomVals, setChecklistCustomVals] = useState<{
    [sn: number]: { qty: number; rate: number; selected: boolean }
  }>(() => {
    try {
      const saved = localStorage.getItem('amml_reorder_checklist_custom_vals');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    const initial: { [sn: number]: { qty: number; rate: number; selected: boolean } } = {};
    defaultQuotationItems.forEach(item => {
      initial[item.sn] = { qty: item.qty, rate: item.rate, selected: true };
    });
    return initial;
  });

  const [extraReorderItems, setExtraReorderItems] = useState<{
    id: string;
    name: string;
    qty: number;
    unit: string;
    rate: number;
    selected: boolean;
  }[]>(() => {
    try {
      const saved = localStorage.getItem('amml_reorder_extra_items');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  const [quoteDate, setQuoteDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('amml_quote_date');
      if (saved) return saved;
    } catch (e) {}
    return '2025-09-15';
  });

  const [quoteTime, setQuoteTime] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('amml_quote_time');
      if (saved) return saved;
    } catch (e) {}
    return '10:00';
  });

  const [quoteRef, setQuoteRef] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('amml_quote_ref');
      if (saved) return saved;
    } catch (e) {}
    return '1P05 - 2034';
  });

  const [quoteDocCode, setQuoteDocCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('amml_quote_doc_code');
      if (saved) return saved;
    } catch (e) {}
    return '3pc6 - 494 x';
  });

  const [quoteSubjectCode, setQuoteSubjectCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('amml_quote_sub_code');
      if (saved) return saved;
    } catch (e) {}
    return '2ps-534';
  });

  const [quotationHistory, setQuotationHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('amml_quotation_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');

  // Prompt the user on beforeunload (browser close/refresh) if they have unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const isUnsaved = localStorage.getItem('amml_reorder_is_unsaved') === 'true';
      if (isUnsaved) {
        e.preventDefault();
        e.returnValue = 'You have unsaved stationery quotation changes. Would you like to save them first?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Monitor unsaved quotation configurations compared to saved log history
  useEffect(() => {
    const activeEntry = quotationHistory.find(x => x.id === activeHistoryId);
    if (activeEntry) {
      const isDiff = 
        quoteDate !== activeEntry.quoteDate ||
        (quoteTime || '10:00') !== (activeEntry.quoteTime || '10:00') ||
        quoteRef !== activeEntry.quoteRef ||
        quoteDocCode !== activeEntry.quoteDocCode ||
        quoteSubjectCode !== activeEntry.quoteSubjectCode ||
        JSON.stringify(checklistCustomVals) !== JSON.stringify(activeEntry.checklistCustomVals || {}) ||
        JSON.stringify(extraReorderItems) !== JSON.stringify(activeEntry.extraReorderItems || []);
      
      localStorage.setItem('amml_reorder_is_unsaved', isDiff ? 'true' : 'false');
    } else {
      const hasOverrides = Object.keys(checklistCustomVals).length > 0 || extraReorderItems.length > 0;
      localStorage.setItem('amml_reorder_is_unsaved', hasOverrides ? 'true' : 'false');
    }
  }, [quoteDate, quoteTime, quoteRef, quoteDocCode, quoteSubjectCode, checklistCustomVals, extraReorderItems, activeHistoryId, quotationHistory]);

  useEffect(() => {
    localStorage.setItem('amml_reorder_checklist_custom_vals', JSON.stringify(checklistCustomVals));
  }, [checklistCustomVals]);

  useEffect(() => {
    localStorage.setItem('amml_reorder_extra_items', JSON.stringify(extraReorderItems));
  }, [extraReorderItems]);

  useEffect(() => {
    localStorage.setItem('amml_quote_date', quoteDate);
  }, [quoteDate]);

  useEffect(() => {
    localStorage.setItem('amml_quote_time', quoteTime);
  }, [quoteTime]);

  useEffect(() => {
    localStorage.setItem('amml_quote_ref', quoteRef);
  }, [quoteRef]);

  useEffect(() => {
    localStorage.setItem('amml_quote_doc_code', quoteDocCode);
  }, [quoteDocCode]);

  useEffect(() => {
    localStorage.setItem('amml_quote_sub_code', quoteSubjectCode);
  }, [quoteSubjectCode]);

  useEffect(() => {
    localStorage.setItem('amml_quotation_history', JSON.stringify(quotationHistory));
  }, [quotationHistory]);

  const handleSaveToHistory = () => {
    let cumulativeSum = 0;
    defaultQuotationItems.forEach(item => {
      const mappedId = getMappedHrItemIdOfQuotation(item.name);
      const hrItem = hrAdminItems.find(h => h.id === mappedId);
      const currentStock = hrItem ? hrItem.qty : 0;
      const calculatedReorderQty = Math.max(0, item.qty - currentStock);

      const custom = checklistCustomVals[item.sn] || { qty: undefined, rate: item.rate, selected: true };
      if (custom.selected !== false) {
        const finalQty = custom.qty !== undefined ? custom.qty : calculatedReorderQty;
        const finalRate = custom.rate !== undefined ? custom.rate : item.rate;
        cumulativeSum += finalQty * finalRate;
      }
    });
    extraReorderItems.forEach(item => {
      if (item.selected !== false) {
        cumulativeSum += item.qty * item.rate;
      }
    });

    const newEntry = {
      id: 'quote_' + Date.now(),
      savedAt: new Date().toLocaleString(),
      quoteDate,
      quoteTime,
      quoteRef,
      quoteDocCode,
      quoteSubjectCode,
      checklistCustomVals,
      extraReorderItems,
      totalAmount: cumulativeSum
    };

    const updated = [newEntry, ...quotationHistory];
    setQuotationHistory(updated);
    setActiveHistoryId(newEntry.id);
    showToast(`Quotation ${quoteRef} saved to history successfully!`);
    auditLog('INVENTORY', 'Save Quotation', `Saved quotation checklist to history with ref ${quoteRef}`);
  };

  const handleRecallQuotation = (entry: any) => {
    setQuoteDate(entry.quoteDate);
    setQuoteTime(entry.quoteTime || '10:00');
    setQuoteRef(entry.quoteRef);
    setQuoteDocCode(entry.quoteDocCode);
    setQuoteSubjectCode(entry.quoteSubjectCode);
    setChecklistCustomVals(entry.checklistCustomVals || {});
    setExtraReorderItems(entry.extraReorderItems || []);
    setActiveHistoryId(entry.id);
    showToast(`Recalled quotation ${entry.quoteRef} configuration.`);
    auditLog('INVENTORY', 'Recall Quotation', `Recalled past quotation configuration with ref ${entry.quoteRef}`);
  };

  const handleDeleteHistoryEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this historical quotation log?")) {
      const updated = quotationHistory.filter(x => x.id !== id);
      setQuotationHistory(updated);
      if (activeHistoryId === id) {
        setActiveHistoryId(null);
      }
      showToast("Quotation history entry deleted.");
    }
  };

  const exportToExcel = () => {
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>AMML Quotation</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .header { font-size: 16px; font-weight: bold; text-align: center; background-color: #0064B4; color: white; }
          .subheader { font-size: 11px; text-align: center; font-style: italic; background-color: #f3f4f6; }
          th { background-color: #0f172a; color: white; font-weight: bold; font-size: 11px; border: 1px solid #cbd5e1; padding: 6px; }
          td { font-size: 11px; border: 1px solid #e2e8f0; padding: 6px; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .exhausted { color: #dc2626; background-color: #fef2f2; font-weight: bold; }
          .manual-override { color: #d97706; background-color: #fffbeb; }
          .total-row { background-color: #f1f5f9; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="7" class="header">ABUJA MARKETS MANAGEMENT LTD (AMML)</td></tr>
          <tr><td colspan="7" class="subheader">HR & Administrative Services Directorate - Stationery & Toner Reorder Quotation</td></tr>
          <tr><td colspan="7" class="text-center bold">Reference: ${quoteRef || '1P05 - 2034'} | Subject Code: ${quoteSubjectCode || '2ps-534'}</td></tr>
          <tr><td colspan="7" class="text-center">Date: ${formatDateHuman(quoteDate)} @ ${quoteTime}</td></tr>
          <tr><td colspan="7"></td></tr>
          <thead>
            <tr>
              <th>S/N</th>
              <th>Item Description</th>
              <th>Current Stock</th>
              <th>Ordered Previously</th>
              <th>Reorder Needed</th>
              <th>Rate (₦)</th>
              <th>Total (₦)</th>
            </tr>
          </thead>
          <tbody>
    `;

    let index = 1;
    let cumulativeSum = 0;

    defaultQuotationItems.forEach(item => {
      const mappedId = getMappedHrItemIdOfQuotation(item.name);
      const hrItem = hrAdminItems.find(h => h.id === mappedId);
      const currentStock = hrItem ? hrItem.qty : 0;
      const calculatedReorderQty = Math.max(0, item.qty - currentStock);

      const custom = checklistCustomVals[item.sn] || { qty: undefined, rate: item.rate, selected: true };
      if (custom.selected !== false) {
        const finalQty = custom.qty !== undefined ? custom.qty : calculatedReorderQty;
        const finalRate = custom.rate !== undefined ? custom.rate : item.rate;
        const amount = finalQty * finalRate;
        cumulativeSum += amount;

        const isExh = currentStock === 0;
        const isOverride = custom.qty !== undefined;

        html += `
          <tr>
            <td class="text-center">${index}</td>
            <td>${item.name}</td>
            <td class="text-center ${isExh ? 'exhausted' : ''}">${currentStock} ${item.unit} ${isExh ? '(EXHAUSTED)' : ''}</td>
            <td class="text-center">${item.qty} ${item.unit}</td>
            <td class="text-center ${isOverride ? 'manual-override' : ''}">${finalQty} ${item.unit} ${isOverride ? '(Override)' : ''}</td>
            <td class="text-right">${finalRate}</td>
            <td class="text-right bold">${amount}</td>
          </tr>
        `;
        index++;
      }
    });

    extraReorderItems.forEach(item => {
      if (item.selected !== false) {
        const amount = item.qty * item.rate;
        cumulativeSum += amount;

        html += `
          <tr>
            <td class="text-center">${index}</td>
            <td>${item.name} (Custom Item)</td>
            <td class="text-center italic">-</td>
            <td class="text-center italic">-</td>
            <td class="text-center manual-override">${item.qty} ${item.unit}</td>
            <td class="text-right">${item.rate}</td>
            <td class="text-right bold">${amount}</td>
          </tr>
        `;
        index++;
      }
    });

    html += `
          <tr class="total-row">
            <td colspan="6" class="text-right bold">GRAND TOTAL (₦):</td>
            <td class="text-right bold">${cumulativeSum}</td>
          </tr>
        </tbody>
      </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AMML_Stationery_Quotation_${quoteDate || new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    showToast("Quotation checklist Excel exported successfully.");
    auditLog('INVENTORY', 'Export Excel', 'Exported stationery quotation checklist to Excel (.xls) format');
  };

  const handlePrintToPDF = () => {
    const printableArea = document.getElementById('amml-printable-quotation');
    if (!printableArea) {
      showToast("Error: Printable quotation sheet not found.");
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Popup blocked! Falling back to standard print. For best formatting, allow popups.");
      window.print();
      return;
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('\n');

    printWindow.document.write(`
      <html>
        <head>
          <title>AMML Reorder Quotation - ${quoteRef}</title>
          ${styles}
          <style>
            body {
              background-color: white !important;
              color: black !important;
              padding: 24px !important;
              font-family: monospace !important;
              font-size: 11px !important;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 15mm;
            }
          </style>
        </head>
        <body>
          <div class="bg-white">
            ${printableArea.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    auditLog('INVENTORY', 'Print Quotation', `Printed stationery quotation sheet (Ref: ${quoteRef})`);
    showToast("Quotation print window opened.");
  };

  const handlePrintInteractiveLedgerPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Popup blocked! For best printing, please allow popups in your browser settings.");
      return;
    }

    // Calculations
    const totalItems = defaultQuotationItems.length;
    let totalExhausted = 0;
    let totalSelected = 0;

    const rowsHtml = defaultQuotationItems.map(item => {
      const mappedId = getMappedHrItemIdOfQuotation(item.name);
      const hrItem = hrAdminItems.find(h => h.id === mappedId);
      const currentStock = hrItem ? hrItem.qty : 0;
      
      const custom = checklistCustomVals[item.sn] || { qty: undefined, rate: item.rate, selected: true };
      const calculatedReorderQty = Math.max(0, item.qty - currentStock);
      const currentReorderQty = custom.qty !== undefined ? custom.qty : calculatedReorderQty;
      const isSelected = custom.selected !== false;
      const isExhausted = currentStock === 0;

      if (isExhausted) totalExhausted++;
      if (isSelected) totalSelected++;

      const unitText = hrItem ? (hrItem.unit === 'cartons' ? 'crt' : hrItem.unit === 'packs' ? 'pks' : 'pcs') : item.unit.toLowerCase();

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; ${isExhausted ? 'background-color: #fef2f2;' : ''}">
          <td style="padding: 10px 8px; text-align: center; font-size: 11px; font-weight: bold; color: #64748b; font-family: monospace;">${item.sn}</td>
          <td style="padding: 10px 12px; font-size: 12px; font-weight: 600; color: #1e293b;">
            <div>${item.name}</div>
            <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Unit Type: ${item.unit}</div>
          </td>
          <td style="padding: 10px 8px; text-align: center; font-size: 11px; font-family: monospace; font-weight: bold; color: ${isExhausted ? '#ef4444' : '#334155'};">
            ${currentStock} <span style="font-size: 9px; color: #94a3b8; font-weight: normal;">${unitText}</span>
            ${isExhausted ? '<div style="font-size: 8px; background: #fee2e2; color: #b91c1c; border-radius: 4px; padding: 1px 4px; display: inline-block; margin-top: 2px; font-weight: bold; text-transform: uppercase;">Exhausted</div>' : ''}
          </td>
          <td style="padding: 10px 8px; text-align: center; font-size: 11px; font-family: monospace; color: #64748b;">
            ${item.qty} <span style="font-size: 9px; color: #cbd5e1;">${item.unit.toLowerCase()}</span>
          </td>
          <td style="padding: 10px 8px; text-align: center; font-size: 11px; font-family: monospace; font-weight: bold; color: #4f46e5;">
            ${currentReorderQty} <span style="font-size: 9px; color: #94a3b8; font-weight: normal;">${item.unit.toLowerCase()}</span>
            ${custom.qty !== undefined ? '<span style="font-size: 8px; background: #fef3c7; color: #b45309; border-radius: 4px; padding: 1px 4px; display: inline-block; margin-top: 2px; font-weight: bold;">Manual</span>' : ''}
          </td>
          <td style="padding: 10px 8px; text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; font-family: sans-serif; ${
              isSelected ? 'background-color: #e0f2fe; color: #0369a1;' : 'background-color: #f1f5f9; color: #64748b;'
            }">${isSelected ? 'Included' : 'Excluded'}</span>
          </td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>AMML Base Quotation Interactive Ledger</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
              padding: 40px; 
              color: #0f172a; 
              line-height: 1.5; 
              background-color: #ffffff;
            }
            .header { 
              border-bottom: 2px solid #e2e8f0; 
              padding-bottom: 20px; 
              margin-bottom: 25px; 
            }
            .logo-text { 
              font-size: 24px; 
              font-weight: 800; 
              margin: 0; 
              letter-spacing: -0.5px; 
              color: #0f172a; 
              text-transform: uppercase;
            }
            .sub-title { 
              font-size: 12px; 
              color: #4f46e5; 
              font-weight: bold;
              margin-top: 4px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .meta { 
              font-size: 11px; 
              color: #64748b; 
              margin-top: 4px; 
              font-family: monospace;
            }
            .kpi-container {
              display: flex;
              gap: 16px;
              margin-bottom: 25px;
            }
            .kpi-card {
              flex: 1;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 12px 16px;
            }
            .kpi-title {
              font-size: 9px;
              font-weight: bold;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .kpi-value {
              font-size: 20px;
              font-weight: bold;
              color: #0f172a;
              margin-top: 4px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 15px; 
            }
            th { 
              background-color: #f1f5f9; 
              border-bottom: 2px solid #cbd5e1; 
              padding: 10px 8px; 
              font-size: 10px; 
              font-weight: bold; 
              color: #475569; 
              text-transform: uppercase; 
              text-align: left; 
            }
            @media print {
              body { padding: 0; }
              .kpi-card { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="logo-text">Abuja Markets Management Limited</h1>
            <div class="sub-title">Base Quotation Items (29 Items) Interactive Ledger</div>
            <p class="meta">Report Generated: ${new Date().toLocaleString()}</p>
            <p class="meta">Subject/Code: Stationery Supply Stock & Reorder Checklist Status</p>
          </div>
          
          <div class="kpi-container">
            <div class="kpi-card">
              <div class="kpi-title">Total Base Items</div>
              <div class="kpi-value">${totalItems} Items</div>
            </div>
            <div class="kpi-card" style="border-left: 4px solid #ef4444;">
              <div class="kpi-title" style="color: #ef4444;">Exhausted Items</div>
              <div class="kpi-value" style="color: #ef4444;">${totalExhausted} / ${totalItems}</div>
            </div>
            <div class="kpi-card" style="border-left: 4px solid #0284c7;">
              <div class="kpi-title" style="color: #0284c7;">Items Reordering</div>
              <div class="kpi-value" style="color: #0284c7;">${totalSelected} Included</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="text-align: center; width: 40px;">S/N</th>
                <th>Item Description</th>
                <th style="text-align: center; width: 120px;">Current Stock</th>
                <th style="text-align: center; width: 120px;">Ordered Previously</th>
                <th style="text-align: center; width: 130px;">Reorder Needed</th>
                <th style="text-align: center; width: 100px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <div>Report verified by AMML Systems Administration</div>
            <div>Authorized Signature & Stamp: ___________________________</div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    auditLog('INVENTORY', 'Print Interactive Ledger', `Printed 29-item base quotation stock & reorder ledger`);
    showToast("Interactive Ledger print window opened.");
  };

  const handlePrintRequisitionDocument = () => {
    const printableArea = document.getElementById('requisition-print-document');
    if (!printableArea) {
      showToast("Error: Printable requisition document not found.");
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Popup blocked! Falling back to standard print. For best formatting, allow popups.");
      window.print();
      return;
    }

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('\n');

    printWindow.document.write(`
      <html>
        <head>
          <title>AMML Requisition Voucher</title>
          ${styles}
          <style>
            body {
              background-color: white !important;
              color: black !important;
              padding: 24px !important;
              font-family: sans-serif !important;
              font-size: 12px !important;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 15mm;
            }
          </style>
        </head>
        <body>
          <div class="bg-white">
            ${printableArea.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    auditLog('INVENTORY', 'Print Voucher', `Printed requisition voucher document`);
    showToast("Requisition voucher print window opened.");
  };

  const formatDateHuman = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}${suffix} ${month}, ${year}`;
  };

  const numberToWords = (num: number): string => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';

    const formatHundreds = (n: number) => {
      let str = '';
      if (n >= 100) {
        str += a[Math.floor(n / 100)] + ' Hundred';
        n %= 100;
        if (n > 0) str += ' and ';
      }
      if (n >= 20) {
        str += b[Math.floor(n / 10)];
        if (n % 10 > 0) str += '-' + a[n % 10];
      } else if (n > 0) {
        str += a[n];
      }
      return str;
    };

    let rem = num;
    let wordList = [];
    
    if (rem >= 1000000) {
      wordList.push(formatHundreds(Math.floor(rem / 1000000)) + ' Million');
      rem %= 1000000;
    }
    if (rem >= 1000) {
      wordList.push(formatHundreds(Math.floor(rem / 1000)) + ' Thousand');
      rem %= 1000;
    }
    if (rem > 0) {
      wordList.push(formatHundreds(rem));
    }

    return wordList.join(', ') + ' Naira Only';
  };
  // --- END REORDER CHECKLIST STATES & UTILITIES ---
  
  // Custom new supply item states
  const [isAddNewSupplyOpen, setIsAddNewSupplyOpen] = useState(false);
  const [newSupplyDesc, setNewSupplyDesc] = useState('');
  const [newSupplyCategory, setNewSupplyCategory] = useState<'Stationery' | 'Toner'>('Stationery');
  const [newSupplyQty, setNewSupplyQty] = useState<number>(0);
  const [newSupplyUnit, setNewSupplyUnit] = useState('packs');
  
  // Search & Filters for HR Supplies
  const [hrSearchTerm, setHrSearchTerm] = useState('');
  const [hrCategoryFilter, setHrCategoryFilter] = useState<'ALL' | 'Stationery' | 'Toner'>('ALL');
  const [hrStockFilter, setHrStockFilter] = useState<'ALL' | 'LOW' | 'IN_STOCK'>('ALL');
  
  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('amml_hr_admin_items', JSON.stringify(hrAdminItems));
  }, [hrAdminItems]);

  interface AssetHistoryEvent {
    id: string;
    itemId: string;
    date: string;
    time: string;
    operator: string;
    action: string;
    details: string;
  }

  // Operational Status and Selected States
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Maintenance' | 'Offline'>('ALL');
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [selectedAssetForHistory, setSelectedAssetForHistory] = useState<AmmlAsset | null>(null);
  
  // Custom tag batch input state
  const [bulkTagInput, setBulkTagInput] = useState('');
  const [bulkStatusSelect, setBulkStatusSelect] = useState<'Active' | 'Maintenance' | 'Offline'>('Active');
  const [customCommentText, setCustomCommentText] = useState('');

  const [assetHistory, setAssetHistory] = useState<AssetHistoryEvent[]>([
    {
      id: 'EVT-101',
      itemId: 'item-1',
      date: '2026-06-15',
      time: '14:20:00',
      operator: 'Superadmin Admin',
      action: 'Routine Maintenance Servicing',
      details: 'All diagnostic sweeps optimal. Fuel filters cleaned, oil levels topped up.'
    },
    {
      id: 'EVT-102',
      itemId: 'item-1',
      date: '2026-06-10',
      time: '09:12:44',
      operator: 'HQ Operator',
      action: 'Inter-Market Asset Dispatch',
      details: 'Transferred 1 unit to Kugbo International Market Hub under logistics ticket #LOG-12.'
    },
    {
      id: 'EVT-201',
      itemId: 'item-2',
      date: '2026-06-16',
      time: '18:45:10',
      operator: 'Wuse Supervisor',
      action: 'Battery Bank Diagnostics',
      details: 'Overheating cells detected. Status flagged: Maintenance. Diagnostic team dispatched.'
    },
    {
      id: 'EVT-202',
      itemId: 'item-2',
      date: '2026-06-14',
      time: '11:00:00',
      operator: 'System Automation',
      action: 'Status Modified to Maintenance',
      details: 'Inverter output variance warning. Auto-triggered preventative system flag.'
    },
    {
      id: 'EVT-301',
      itemId: 'item-3',
      date: '2026-06-12',
      time: '10:05:00',
      operator: 'HQ Security Desk',
      action: 'Firmware Patch AMML-v2.09',
      details: 'Successfully flashed security firmware bundle. Offline recognition speeds elevated by 14%.'
    },
    {
      id: 'EVT-501',
      itemId: 'item-5',
      date: '2026-06-11',
      time: '17:30:15',
      operator: 'HQ Logistics Desk',
      action: 'Status Shift to Offline',
      details: 'Outdoor waterproof LED display dismantled for structural repairs. Scheduled return set for next week.'
    }
  ]);

  const handleAddCustomHistoryEvent = () => {
    if (!selectedAssetForHistory || !customCommentText.trim()) return;
    const newEvt: AssetHistoryEvent = {
      id: `EVT-${Date.now()}`,
      itemId: selectedAssetForHistory.id,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 8),
      operator: session?.name || 'Administrator',
      action: 'Administrative Note/Memo Added',
      details: customCommentText.trim()
    };
    setAssetHistory(prev => [newEvt, ...prev]);
    setCustomCommentText('');
    showToast('Chronological event record logged successfully.');
  };

  const handleBulkUpdateStatus = (status: 'Active' | 'Maintenance' | 'Offline') => {
    if (selectedAssetIds.length === 0) return;
    
    setAssets(prev => prev.map(asset => {
      if (selectedAssetIds.includes(asset.id)) {
        const event: AssetHistoryEvent = {
          id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          itemId: asset.id,
          date: new Date().toISOString().slice(0, 10),
          time: new Date().toTimeString().slice(0, 8),
          operator: session?.name || 'Administrator',
          action: 'Batch Operational Status Update',
          details: `Flagged status as ${status} via logistics bulk action.`
        };
        setAssetHistory(prevHistory => [event, ...prevHistory]);
        
        return { ...asset, status };
      }
      return asset;
    }));

    auditLog('INVENTORY', 'Bulk Status Update', `Updated operational status of ${selectedAssetIds.length} assets to ${status}`);
    showToast(`Successfully updated ${selectedAssetIds.length} assets to ${status}.`);
    setSelectedAssetIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedAssetIds.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedAssetIds.length} selected assets permanently? This cannot be undone.`)) {
      return;
    }

    setAssets(prev => prev.filter(a => !selectedAssetIds.includes(a.id)));
    setAssetStocks(prev => prev.filter(s => !selectedAssetIds.includes(s.itemId)));
    setPurchaseOrders(prev => prev.filter(o => !selectedAssetIds.includes(o.itemId)));

    auditLog('INVENTORY', 'Bulk Asset Deletion', `Permanently deleted ${selectedAssetIds.length} assets from logistics registry`);
    showToast(`Removed ${selectedAssetIds.length} assets from active inventory registry.`);
    setSelectedAssetIds([]);
  };

  const handleBulkAddTag = (tagText: string) => {
    if (!tagText.trim() || selectedAssetIds.length === 0) return;
    const formattedTag = tagText.trim().toUpperCase();

    setAssets(prev => prev.map(asset => {
      if (selectedAssetIds.includes(asset.id)) {
        const alreadyHasTag = asset.name.includes(`[${formattedTag}]`);
        const updatedName = alreadyHasTag ? asset.name : `[${formattedTag}] ${asset.name}`;

        const event: AssetHistoryEvent = {
          id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          itemId: asset.id,
          date: new Date().toISOString().slice(0, 10),
          time: new Date().toTimeString().slice(0, 8),
          operator: session?.name || 'Administrator',
          action: 'Batch Tag Assignment',
          details: `Assigned meta tag [${formattedTag}] to asset name.`
        };
        setAssetHistory(prevHistory => [event, ...prevHistory]);

        return { ...asset, name: updatedName };
      }
      return asset;
    }));

    auditLog('INVENTORY', 'Bulk Tag Assignment', `Assigned tag [${formattedTag}] to ${selectedAssetIds.length} assets`);
    showToast(`Applied meta tag [${formattedTag}] to selected assets.`);
    setBulkTagInput('');
    setSelectedAssetIds([]);
  };

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortField, setSortField] = useState<'sku' | 'name' | 'totalQty'>('sku');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Modal control
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedAssetForAdjust, setSelectedAssetForAdjust] = useState<AmmlAsset | null>(null);

  // New Item Form State
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemBarcode, setNewItemBarcode] = useState('');
  const [newItemMinLevel, setNewItemMinLevel] = useState(5);
  const [newItemReorderQty, setNewItemReorderQty] = useState(25);
  const [newItemLeadTime, setNewItemLeadTime] = useState(7);
  const [newItemUnitCost, setNewItemUnitCost] = useState(15000);
  const [newItemInitialStocks, setNewItemInitialStocks] = useState<Record<string, number>>({});

  // AMML Custom Asset Tagging Wizard State
  const [tagPrefix, setTagPrefix] = useState('AMML');
  const [tagLocation, setTagLocation] = useState('HO');
  const [tagDept, setTagDept] = useState('HR');
  const [tagCategory, setTagCategory] = useState('OE');
  const [tagSerial, setTagSerial] = useState('171');

  // PO Form State
  const [poItemId, setPoItemId] = useState('');
  const [poMarketName, setPoMarketName] = useState('');
  const [poQty, setPoQty] = useState(10);

  // Sync / Simulator Log state
  const [syncLogs, setSyncLogs] = useState<Array<{ id: string; time: string; action: string; count: number }>>([
    { id: 'SYNC-911', time: '10:15:30', action: 'API Snapshot Push Ingestion', count: 5 },
    { id: 'SYNC-804', time: '08:30:12', action: 'ZKTeco Log Sync', count: 42 },
  ]);
  const [syncing, setSyncing] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // AMML Official SLA Locations Registry
  const ammlLocations = [
    { code: 'HO', name: 'Head Office' },
    { code: 'GD', name: 'Gudu market' },
    { code: 'WS', name: 'Wuse market' },
    { code: 'KD', name: 'Kado market' },
    { code: 'KM', name: 'Karimo market' },
    { code: 'KI', name: 'Kugbo International market' },
    { code: '710', name: 'Area 7/10 market' },
    { code: 'GI', name: 'Garki International market' },
    { code: 'GM', name: 'Garki Model market' },
    { code: 'Z3', name: 'Zone 3 market' },
    { code: 'APO', name: 'Apo Zone A, D & E shopping complex' },
    { code: '12', name: 'Area 1 & 2 market' },
    { code: 'NY', name: 'Nyanya market' },
    { code: 'A3', name: 'Area 3 Neighborhood Center' },
    { code: 'KR', name: 'Kaura market' },
    { code: 'A10', name: 'Area 10 market' },
    { code: 'DD', name: 'Dei-dei market' }
  ];

  // Sequential SKU Generator for Durable Assets (maintaining leading zero width)
  const generateSequentialSkus = (baseSku: string, count: number, existingAssets: AmmlAsset[]) => {
    const parts = baseSku.trim().toUpperCase().split('/');
    if (parts.length !== 5) {
      return Array.from({ length: count }, (_, i) => ({
        sku: count === 1 ? baseSku : `${baseSku}-${i + 1}`,
        barcode: count === 1 ? baseSku.replace(/\//g, '') : `${baseSku.replace(/\//g, '')}${i + 1}`
      }));
    }

    const [prefix, loc, dept, cat, serialStr] = parts;
    const serialLength = serialStr.length;
    const startSerial = parseInt(serialStr) || 1;

    const result: { sku: string; barcode: string }[] = [];
    let currentSerial = startSerial;

    for (let i = 0; i < count; i++) {
      while (true) {
        const paddedSerial = String(currentSerial).padStart(serialLength, '0');
        const candidateSku = `${prefix}/${loc}/${dept}/${cat}/${paddedSerial}`;
        const exists = existingAssets.some(a => a.sku.toUpperCase() === candidateSku.toUpperCase());
        if (!exists && !result.some(r => r.sku === candidateSku)) {
          result.push({
            sku: candidateSku,
            barcode: candidateSku.replace(/\//g, '')
          });
          currentSerial++;
          break;
        }
        currentSerial++;
      }
    }

    return result;
  };

  // Dynamic Validation Helper for AMML SLA Asset Tagging format
  const getTagValidation = (tag: string) => {
    const trimmed = (tag || '').trim().toUpperCase();
    if (!trimmed) {
      return { isValid: false, isConsumable: false, error: 'Asset Tag is empty.' };
    }
    const parts = trimmed.split('/');

    // Validate Consumables format: PREFIX/LOCATION/DEPT/CS (exactly 4 segments, ending with CS)
    if (parts.length === 4 && parts[3] === 'CS') {
      const validChars = parts.every(p => /^[A-Z0-9]+$/.test(p));
      return {
        isValid: validChars,
        isConsumable: true,
        error: validChars ? undefined : 'Tag contains invalid characters. Alphanumeric segments only.'
      };
    }

    // Validate Serialized format: PREFIX/LOCATION/DEPT/CATEGORY/SERIAL (exactly 5 segments)
    if (parts.length === 5) {
      const [prefix, loc, dept, cat, serial] = parts;
      const validPrefix = /^[A-Z0-9]+$/.test(prefix);
      const validLoc = /^[A-Z0-9]+$/.test(loc);
      const validDept = /^[A-Z0-9]+$/.test(dept);
      const validCat = /^[A-Z0-9]+$/.test(cat);
      const validSerial = /^[0-9]+$/.test(serial);

      const isValid = validPrefix && validLoc && validDept && validCat && validSerial && cat !== 'CS';
      let errorMsg;
      if (!isValid) {
        if (cat === 'CS') {
          errorMsg = 'Consumables must not have a serial number (format: PREFIX/LOCATION/DEPT/CS).';
        } else if (!validSerial) {
          errorMsg = 'Serial number must be entirely numeric (e.g. 171).';
        } else {
          errorMsg = 'Incorrect characters in segments. Must be alphanumeric segments.';
        }
      }

      return {
        isValid,
        isConsumable: false,
        error: errorMsg
      };
    }

    // Format description error fallback
    let errorMsg = 'Invalid Format. Must strictly follow: PREFIX/LOCATION/DEPT/CS for Consumables OR PREFIX/LOCATION/DEPT/CATEGORY/SERIAL (e.g., AMML/HO/HR/OE/171) for standard assets.';
    if (parts.includes('CS') && parts.length !== 4) {
      errorMsg = 'Consumable tag (CS) must have exactly 4 segments (e.g., AMML/HO/HR/CS).';
    } else if (!parts.includes('CS') && parts.length !== 5 && parts.length > 0) {
      errorMsg = 'Serialized asset tags must have exactly 5 segments (e.g., AMML/HO/HR/OE/171).';
    }

    return {
      isValid: false,
      isConsumable: false,
      error: errorMsg
    };
  };

  const handleExportCSV = () => {
    const dataToExport = sortedAssets;
    if (dataToExport.length === 0) {
      showToast("No records available to export.");
      return;
    }

    const headers = ["SKU", "Asset Name", "Barcode", "Minimum Alert Level", "Reorder Level", "Lead Time (Days)", "Unit Cost (NGN)", "Total Stock (pcs)", "Total Valuation (NGN)"];
    
    const rows = dataToExport.map(item => {
      const totalStock = getAssetTotalStock(item.id);
      const sanitName = item.name.replace(/,/g, '').replace(/"/g, '""');
      return [
        item.sku,
        `"${sanitName}"`,
        item.barcode,
        item.minLevel,
        item.reorderQty,
        item.leadTimeDays,
        item.unitCost,
        totalStock,
        item.unitCost * totalStock
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AMML_Asset_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Downloaded active CSV ledger.");
    auditLog('INVENTORY', 'Exported CSV Ledger', `Downloaded CSV report of ${dataToExport.length} assets`);
  };

  // Helper functions
  const getAssetTotalStock = (itemId: string) => {
    return assetStocks
      .filter(s => s.itemId === itemId)
      .reduce((sum, s) => sum + s.quantity, 0);
  };

  const getAssetMarketStock = (itemId: string, marketName: string) => {
    const record = assetStocks.find(s => s.itemId === itemId && s.warehouseId === marketName);
    return record ? record.quantity : 0;
  };

  const currentTheme = session?.level || 'OFFICER';

  // Sort & Filter Logics
  const filteredAssets = assets.filter(item => {
    const matchesSearch = 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm);
    
    if (!matchesSearch) return false;

    if (statusFilter !== 'ALL') {
      const liveStatus = item.status || 'Active';
      if (liveStatus !== statusFilter) return false;
    }

    if (locationFilter) {
      const stockInLoc = assetStocks.find(
        s => s.itemId === item.id && s.warehouseId === locationFilter && s.quantity > 0
      );
      return !!stockInLoc;
    }
    return true;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    let valA: any = a[sortField === 'totalQty' ? 'sku' : sortField];
    let valB: any = b[sortField === 'totalQty' ? 'sku' : sortField];

    if (sortField === 'totalQty') {
      valA = getAssetTotalStock(a.id);
      valB = getAssetTotalStock(b.id);
    }

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  // Paginated list
  const totalPages = Math.max(1, Math.ceil(sortedAssets.length / pageSize));
  const paginatedAssets = sortedAssets.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (field: 'sku' | 'name' | 'totalQty') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setPage(1);
  };

  // KPIs
  const totalSKUs = assets.length;
  const totalUnits = assetStocks.reduce((sum, s) => sum + s.quantity, 0);
  const lowStockCount = assets.filter(i => {
    const qty = getAssetTotalStock(i.id);
    return qty > 0 && qty < i.minLevel;
  }).length;
  const criticalCount = assets.filter(i => getAssetTotalStock(i.id) === 0).length;

  // Add Asset Submission
  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemSku || !newItemName || !newItemBarcode) {
      showToast('Please fill all required fields');
      return;
    }

    // Strict format check using the official tag validation helper
    const tagVal = getTagValidation(newItemSku);
    if (!tagVal.isValid) {
      showToast(`Action Blocked: ${tagVal.error}`);
      return;
    }

    if (assets.some(a => a.sku.toUpperCase() === newItemSku.toUpperCase())) {
      showToast(`SKU ${newItemSku} is already registered.`);
      return;
    }

    const isActuallyConsumable = tagVal.isConsumable;
    
    // Sum the initial stock quantities
    const totalInitialStock = Object.values(newItemInitialStocks).reduce((sum, q) => sum + q, 0);

    if (!isActuallyConsumable && totalInitialStock > 1) {
      // Sequential/Bulk generation for non-consumable (durable) assets
      const seqSkus = generateSequentialSkus(newItemSku, totalInitialStock, assets);

      const newCreatedAssets: AmmlAsset[] = [];
      const newStocksToInsert: AmmlAssetStock[] = [];
      const newHistoryEvents: AssetHistoryEvent[] = [];

      let seqIndex = 0;
      Object.keys(newItemInitialStocks).forEach(marketName => {
        const qty = newItemInitialStocks[marketName];
        for (let q = 0; q < qty; q++) {
          if (seqIndex < seqSkus.length) {
            const seq = seqSkus[seqIndex];
            const newAssetId = `item-init-${Date.now()}-${seqIndex}`;
            
            const newAsset: AmmlAsset = {
              id: newAssetId,
              sku: seq.sku,
              name: newItemName.trim(),
              barcode: seq.barcode,
              minLevel: 0,
              reorderQty: 0,
              leadTimeDays: Number(newItemLeadTime) || 1,
              unitCost: Number(newItemUnitCost) || 0,
            };

            newCreatedAssets.push(newAsset);
            newStocksToInsert.push({
              itemId: newAssetId,
              warehouseId: marketName,
              quantity: 1
            });

            newHistoryEvents.push({
              id: `EVT-${Date.now()}-${seqIndex}`,
              itemId: newAssetId,
              date: new Date().toISOString().slice(0, 10),
              time: new Date().toTimeString().slice(0, 8),
              operator: session?.name || 'Administrator',
              action: 'Asset Registered (Bulk)',
              details: `Auto-registered as part of sequential batch of ${totalInitialStock} items. Initial stock: 1 unit placed at ${marketName}.`
            });

            seqIndex++;
          }
        }
      });

      setAssets(prev => [...prev, ...newCreatedAssets]);
      setAssetStocks(prev => [...prev, ...newStocksToInsert]);
      setAssetHistory(prev => [...newHistoryEvents, ...prev]);

      auditLog(
        'INVENTORY',
        'Bulk Assets Registered',
        `Registered batch of ${totalInitialStock} durable assets starting at ${seqSkus[0]?.sku}`
      );

      showToast(`Success: Auto-registered ${totalInitialStock} separate assets with sequential tags: ${seqSkus[0]?.sku} to ${seqSkus[seqSkus.length - 1]?.sku}.`);
      setAddModalOpen(false);
      resetAssetForm();
      return;
    }

    const newId = `item-${Date.now()}`;
    const newAsset: AmmlAsset = {
      id: newId,
      sku: newItemSku.toUpperCase().trim(),
      name: newItemName.trim(),
      barcode: newItemBarcode.trim(),
      minLevel: isActuallyConsumable ? (Number(newItemMinLevel) || 0) : 0,
      reorderQty: isActuallyConsumable ? (Number(newItemReorderQty) || 0) : 0,
      leadTimeDays: Number(newItemLeadTime) || 1,
      unitCost: Number(newItemUnitCost) || 0,
    };

    // Add to assets
    setAssets(prev => [...prev, newAsset]);

    // Add stock records
    const newStocksToInsert: AmmlAssetStock[] = [];
    Object.keys(newItemInitialStocks).forEach(marketName => {
      const quantity = newItemInitialStocks[marketName];
      if (quantity > 0) {
        newStocksToInsert.push({
          itemId: newId,
          warehouseId: marketName,
          quantity
        });
      }
    });

    if (newStocksToInsert.length > 0) {
      setAssetStocks(prev => [...prev, ...newStocksToInsert]);
    }

    // Register initial Chronicle event log
    const initialStocksSummary = newStocksToInsert.map(s => `${s.warehouseId}: ${s.quantity} pcs`).join(', ') || '0 initial pcs';
    const initEvt: AssetHistoryEvent = {
      id: `EVT-${Date.now()}`,
      itemId: newId,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 8),
      operator: session?.name || 'Administrator',
      action: 'Asset Registered',
      details: `Initialized new SKU ${newAsset.sku} in AMML Ledger. Initial Stocks: ${initialStocksSummary}`
    };
    setAssetHistory(prev => [initEvt, ...prev]);

    auditLog(
      'INVENTORY', 
      'Asset registered', 
      `Registered asset SKU ${newAsset.sku} - ${newAsset.name} valued at ₦${newAsset.unitCost.toLocaleString()}`
    );

    showToast(`Asset "${newAsset.sku}" has been registered successfully.`);
    setAddModalOpen(false);
    resetAssetForm();
  };

  const resetAssetForm = () => {
    setNewItemSku('');
    setNewItemName('');
    setNewItemBarcode('');
    setNewItemMinLevel(5);
    setNewItemReorderQty(25);
    setNewItemLeadTime(7);
    setNewItemUnitCost(15000);
    setNewItemInitialStocks({});
    setTagPrefix('AMML');
    setTagLocation('HO');
    setTagDept('HR');
    setTagCategory('OE');
    setTagSerial('171');
  };

  // Adjust stock
  const handleOpenAdjustModal = (asset: AmmlAsset) => {
    setSelectedAssetForAdjust(asset);
    setAdjustModalOpen(true);
  };

  const handleSaveStockAdjustment = () => {
    if (!selectedAssetForAdjust) return;

    // Filter out stocks of other assets
    const remainingStocks = assetStocks.filter(s => s.itemId !== selectedAssetForAdjust.id);

    // Build lists of newly adjusted stocks
    const updatedStocks: AmmlAssetStock[] = [];
    markets.forEach(m => {
      const inputEl = document.getElementById(`adj-qty-${m.name}`) as HTMLInputElement;
      const quantity = inputEl ? parseInt(inputEl.value) || 0 : 0;
      if (quantity > 0) {
        updatedStocks.push({
          itemId: selectedAssetForAdjust.id,
          warehouseId: m.name,
          quantity
        });
      }
    });

    setAssetStocks([...remainingStocks, ...updatedStocks]);

    // Build chronicle timeline trace logs entry
    const stockChangeDetails = updatedStocks.map(s => `${s.warehouseId}: ${s.quantity} pcs`).join(', ');
    const newEvt: AssetHistoryEvent = {
      id: `EVT-${Date.now()}`,
      itemId: selectedAssetForAdjust.id,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 8),
      operator: session?.name || 'Administrator',
      action: 'Stock Level Adjusted',
      details: `Rebalanced market quantities: ${stockChangeDetails || 'all depots set to 0 quantities.'}`
    };
    setAssetHistory(prev => [newEvt, ...prev]);

    auditLog(
      'INVENTORY', 
      'Stock layout updated', 
      `Adjusted stock volumes for asset ${selectedAssetForAdjust.sku} across AMML hubs`
    );

    showToast(`Stock layout for ${selectedAssetForAdjust.sku} updated successfully.`);
    setAdjustModalOpen(false);
    setSelectedAssetForAdjust(null);
  };

  // Delete Asset
  const handleDeleteAsset = (id: string, name: string, sku: string) => {
    if (!window.confirm(`Are you sure you want to permanently remove asset [${sku}] ${name}? This action cannot be undone.`)) {
      return;
    }
    setAssets(prev => prev.filter(a => a.id !== id));
    setAssetStocks(prev => prev.filter(s => s.itemId !== id));
    setPurchaseOrders(prev => prev.filter(o => o.itemId !== id));

    auditLog('INVENTORY', 'Asset deleted', `Removed asset registration: ${sku}`);
    showToast(`Asset ${sku} was deleted.`);
  };

  // Create Purchase Order
  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poItemId || !poMarketName || poQty <= 0) {
      showToast('Select a valid asset and destination outpost with quantity.');
      return;
    }

    const linkedAsset = assets.find(a => a.id === poItemId);
    if (!linkedAsset) return;

    const newPO: AmmlPurchaseOrder = {
      id: `PO-2026-${String(purchaseOrders.length + 101)}`,
      itemId: poItemId,
      warehouseId: poMarketName,
      qty: Number(poQty),
      status: 'PENDING',
      totalCost: Number(poQty) * linkedAsset.unitCost,
      suggestedByAI: false,
      createdAt: new Date().toISOString()
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    auditLog(
      'INVENTORY', 
      'Purchase Order raised', 
      `Dispatched PO ${newPO.id} for ${newPO.qty} units of ${linkedAsset.sku} to [${newPO.warehouseId}]`
    );

    showToast(`Purchase order ${newPO.id} raised successfully.`);
    setPoItemId('');
    setPoMarketName('');
    setPoQty(10);
  };

  // Quick quantity modification helper
  const handleAdjustHrQty = (itemId: string, increment: number) => {
    setHrAdminItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(0, parseFloat((item.qty + increment).toFixed(2)));
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  // Add item to shopping cart / requisition list
  const handleAddToCart = (itemId: string) => {
    const item = hrAdminItems.find(x => x.id === itemId);
    if (!item) return;
    if (item.qty <= 0) {
      showToast("Warning: This item is currently out of stock in Admin stores. Please adjust stock level to approve requisition.");
      return;
    }
    setRequisitionCart(prev => {
      const currentReq = prev[itemId] || 0;
      if (currentReq >= item.qty) {
        showToast(`Cannot request more than available store stock (${item.qty} ${item.unit}).`);
        return prev;
      }
      return { ...prev, [itemId]: currentReq + 1 };
    });
  };

  // Decrease quantity in requisition list
  const handleRemoveFromCart = (itemId: string) => {
    setRequisitionCart(prev => {
      const next = { ...prev };
      if (next[itemId] <= 1) {
        delete next[itemId];
      } else {
        next[itemId] = next[itemId] - 1;
      }
      return next;
    });
  };

  // Departments Mapping Full Labels
  const getDeptLabel = (code: string) => {
    const map: {[key: string]: string} = {
      'HR': 'Human Resources',
      'AD': 'Admin',
      'IT': 'Tech Dept',
      'OE': 'Operations',
      'FI': 'Finance & Accounting',
      'AUD': 'Audit',
      'REC': 'Reconciliation',
      'REG': 'Registry',
      'HOD': 'HOD Operations Office',
      'CSO': 'Company Secretary\'s Office',
      'SC': 'Security',
      'LG': 'Logistics'
    };
    return map[code] || code;
  };

  // Process disbursement of stock (deducting quantities and closing slip)
  const handleDisburseRequisition = () => {
    setHrAdminItems(prev => prev.map(item => {
      const reqQty = requisitionCart[item.id] || 0;
      if (reqQty > 0) {
        return { ...item, qty: Math.max(0, item.qty - reqQty) };
      }
      return item;
    }));

    const detailsSummary = Object.keys(requisitionCart).map(id => {
      const item = hrAdminItems.find(x => x.id === id);
      return `${requisitionCart[id]} ${item?.unit} x ${item?.description}`;
    }).join(', ');

    const deptName = getDeptLabel(requisitionUnit);

    auditLog(
      'HR_ADMIN',
      'Office Supplies Disbursed',
      `Disbursed to ${requisitionOfficer || 'Admin Staff'} [${deptName}]: ${detailsSummary}. Memo: ${requisitionMemo || 'N/A'}`
    );

    showToast(`Success: Office supplies successfully disbursed to ${requisitionOfficer || 'Staff'} (${deptName}). Ledger records auto-deducted.`);
    setRequisitionCart({});
    setRequisitionOfficer('');
    setRequisitionMemo('');
    setIsRequisitionModalOpen(false);
  };

  // Add newly defined custom stationery or toner to catalog list
  const handleAddNewSupply = () => {
    if (!newSupplyDesc.trim()) {
      showToast("Error: Item description cannot be empty.");
      return;
    }
    const alreadyExists = hrAdminItems.some(item => item.description.toLowerCase().trim() === newSupplyDesc.toLowerCase().trim());
    if (alreadyExists) {
      showToast("Warning: This item already exists in the catalog.");
      return;
    }
    const newId = `hr-custom-${Date.now()}`;
    const newItem = {
      id: newId,
      category: newSupplyCategory,
      description: newSupplyDesc.trim(),
      qty: Number(newSupplyQty) || 0,
      unit: newSupplyUnit.trim() || 'packs'
    };
    setHrAdminItems(prev => [...prev, newItem]);
    setIsAddNewSupplyOpen(false);
    setNewSupplyDesc('');
    setNewSupplyQty(0);
    setNewSupplyUnit('packs');
    showToast(`Success: Registered "${newItem.description}" to office supplies directory.`);
    auditLog('HR_ADMIN', 'New Supply Registered', `Added ${newItem.description} under ${newItem.category}`);
  };

  // Approve PO
  const handleApprovePO = (orderId: string) => {
    setPurchaseOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'APPROVED' } : o));
    auditLog('INVENTORY', 'Purchase Order approved', `Administrative authorization granted for ${orderId}`);
    showToast(`Approved ${orderId}. Ready for outpost delivery.`);
  };

  // Receive PO (increments stock)
  const handleReceivePO = (orderId: string) => {
    const o = purchaseOrders.find(x => x.id === orderId);
    if (!o) return;

    const linkedAsset = assets.find(a => a.id === o.itemId);
    if (!linkedAsset) return;

    // Set order to delivered
    setPurchaseOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: 'DELIVERED' } : order));

    const isCons = getTagValidation(linkedAsset.sku).isConsumable;

    if (isCons) {
      // Standard consumable flow - just increment the quantity on the same item ID
      const existingIndex = assetStocks.findIndex(s => s.itemId === o.itemId && s.warehouseId === o.warehouseId);
      if (existingIndex !== -1) {
        setAssetStocks(prev => prev.map((s, idx) => idx === existingIndex ? { ...s, quantity: s.quantity + o.qty } : s));
      } else {
        setAssetStocks(prev => [...prev, { itemId: o.itemId, warehouseId: o.warehouseId, quantity: o.qty }]);
      }

      auditLog(
        'INVENTORY', 
        'Purchase Order received', 
        `In-gate consignment verified: Delivered ${o.qty} units of ${linkedAsset.sku} to ${o.warehouseId}`
      );
      showToast(`Consignment verified. ${o.qty} pcs registered at ${o.warehouseId}.`);
    } else {
      // Non-consumable (durable) flow:
      // Generate o.qty sequential serial numbers starting from next available serial!
      const seqSkus = generateSequentialSkus(linkedAsset.sku, o.qty, assets);

      const newCreatedAssets: AmmlAsset[] = [];
      const newStocksToInsert: AmmlAssetStock[] = [];
      const newHistoryEvents: AssetHistoryEvent[] = [];

      seqSkus.forEach((seq, index) => {
        const newAssetId = `item-po-${Date.now()}-${index}`;
        newCreatedAssets.push({
          ...linkedAsset,
          id: newAssetId,
          sku: seq.sku,
          barcode: seq.barcode,
          minLevel: 0,
          reorderQty: 0
        });
        newStocksToInsert.push({
          itemId: newAssetId,
          warehouseId: o.warehouseId,
          quantity: 1
        });
        newHistoryEvents.push({
          id: `EVT-PO-${Date.now()}-${index}`,
          itemId: newAssetId,
          date: new Date().toISOString().slice(0, 10),
          time: new Date().toTimeString().slice(0, 8),
          operator: session?.name || 'Administrator',
          action: 'Asset Registered via PO',
          details: `Auto-registered via Purchase Order receipt ${orderId}. Initial stock: 1 unit placed at ${o.warehouseId}.`
        });
      });

      setAssets(prev => [...prev, ...newCreatedAssets]);
      setAssetStocks(prev => [...prev, ...newStocksToInsert]);
      setAssetHistory(prev => [...newHistoryEvents, ...prev]);

      auditLog(
        'INVENTORY',
        'Bulk Assets Received via PO',
        `Received ${o.qty} units of durable asset via PO ${orderId}. Auto-generated sequential serials: ${seqSkus.map(s => s.sku).join(', ')}`
      );

      showToast(`Success: Auto-registered ${o.qty} individual items with sequential serials: ${seqSkus[0]?.sku} to ${seqSkus[seqSkus.length - 1]?.sku}.`);
    }
  };

  // Run Forecast Heuristics
  const triggerForecastRun = () => {
    showToast('Running predictive stock-risk heuristics...');
  };

  // Simulate ERP Push Sync
  const triggerSyncSim = () => {
    setSyncing(true);
    setTimeout(() => {
      const randomizedNewCount = Math.floor(10 + Math.random() * 30);
      const newLog = {
        id: `SYNC-${Math.floor(100 + Math.random() * 900)}`,
        time: new Date().toLocaleTimeString('en-NG'),
        action: 'API Gateway Inbound Sync Streamed',
        count: randomizedNewCount
      };
      setSyncLogs(prev => [newLog, ...prev]);
      setSyncing(false);
      showToast(`Bulk Synchronisation completed: committed +${randomizedNewCount} asset snapshots.`);
      auditLog('SYSTEM', 'Inbound inventory sync complete', `Committed ${randomizedNewCount} real-time stock validations`);
    }, 1200);
  };

  return (
    <div id="amml-inventory-ledger-root" className="space-y-6 animate-stage-wake relative">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-amml-blue text-white font-mono text-xs font-bold px-4 py-3 rounded-lg shadow-xl border border-amml-line animate-stage-wake flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono select-none">
        <div>
          <div className="flex items-center gap-2">
            <Link 
              to="/dashboard" 
              className="p-1 px-2 bg-amml-panel hover:bg-amml-line border border-amml-line rounded text-amml-green text-[10px] uppercase transition-colors"
            >
              <div className="flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                <span>Return</span>
              </div>
            </Link>
            <span className="text-amml-muted">•</span>
            <span className="text-[10px] font-bold text-amml-orange uppercase tracking-widest">corporate logistics desk</span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-wider mt-1.5 uppercase">AMML Corporate Assets & Inventory System</h1>
        </div>

        <div className="flex items-center gap-2 text-xs text-amml-muted bg-amml-panel border border-amml-line px-3 py-1.5 rounded">
          <Database className="h-4 w-4 text-amml-orange" />
          <span>LEDGER LOGISTICS MODULE: ENABLED</span>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-amml-panel border border-amml-line rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">Registered SKUs</span>
            <span className="block text-2xl font-serif font-black text-white mt-1">{totalSKUs}</span>
          </div>
          <div className="p-3 bg-amml-blue/10 text-amml-blue border border-amml-blue/25 rounded-xl">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-amml-panel border border-amml-line rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">Total Capital Units</span>
            <span className="block text-2xl font-serif font-black text-white mt-1">
              {totalUnits.toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-xl">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-amml-panel border border-amml-line rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">Low Outposts Stock</span>
            <span className={`block text-2xl font-serif font-black mt-1 ${lowStockCount > 0 ? 'text-amber-500 font-bold' : 'text-white'}`}>
              {lowStockCount}
            </span>
          </div>
          <div className={`p-3 rounded-xl border ${lowStockCount > 0 ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' : 'bg-amml-line text-slate-400'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-amml-panel border border-amml-line rounded-xl p-4.5 shadow-sm flex items-center justify-between">
          <div>
            <span className="block font-mono text-[9px] uppercase tracking-wider text-slate-400 font-bold">Out of Stock Assets</span>
            <span className={`block text-2xl font-serif font-black mt-1 ${criticalCount > 0 ? 'text-red-500 font-black animate-pulse' : 'text-slate-400'}`}>
              {criticalCount}
            </span>
          </div>
          <div className={`p-3 rounded-xl border ${criticalCount > 0 ? 'bg-red-500/10 text-red-400 border-red-500/25' : 'bg-slate-800 text-slate-500'}`}>
            <X className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Tab Navigation Layout */}
      <div className="bg-amml-panel p-6 rounded-2xl border border-amml-line shadow-xl">
        <div className="flex border-b border-amml-line mb-6 pb-2">
          <button 
            type="button"
            onClick={() => setActiveSubTab('reorder_checklist')}
            className={`mr-6 pb-3 text-xs font-mono uppercase font-extrabold tracking-widest cursor-pointer transition-colors relative ${activeSubTab === 'reorder_checklist' ? 'text-amml-orange' : 'text-slate-400 hover:text-white'}`}
          >
            📋 Reorder Checklist
            {activeSubTab === 'reorder_checklist' && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-amml-orange" />}
          </button>

          <button 
            type="button"
            onClick={() => setActiveSubTab('hr_admin')}
            className={`mr-6 pb-3 text-xs font-mono uppercase font-extrabold tracking-widest cursor-pointer transition-colors relative ${activeSubTab === 'hr_admin' ? 'text-amml-orange' : 'text-slate-400 hover:text-white'}`}
          >
            💼 HR/Admin Supplies
            {activeSubTab === 'hr_admin' && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-amml-orange" />}
          </button>

          <button 
            type="button"
            onClick={() => setActiveSubTab('inventory')}
            className={`mr-6 pb-3 text-xs font-mono uppercase font-extrabold tracking-widest cursor-pointer transition-colors relative ${activeSubTab === 'inventory' ? 'text-amml-orange' : 'text-slate-400 hover:text-white'}`}
          >
            📋 Inventory Ledger
            {activeSubTab === 'inventory' && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-amml-orange" />}
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveSubTab('orders')}
            className={`mr-6 pb-3 text-xs font-mono uppercase font-extrabold tracking-widest cursor-pointer transition-colors relative ${activeSubTab === 'orders' ? 'text-amml-orange' : 'text-slate-400 hover:text-white'}`}
          >
            📦 Purchase Outpost Orders
            {activeSubTab === 'orders' && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-amml-orange" />}
          </button>

          <button 
            type="button"
            onClick={() => setActiveSubTab('forecast')}
            className={`mr-6 pb-3 text-xs font-mono uppercase font-extrabold tracking-widest cursor-pointer transition-colors relative ${activeSubTab === 'forecast' ? 'text-amml-orange' : 'text-slate-400 hover:text-white'}`}
          >
            📉 Heuristic Demand Forecast
            {activeSubTab === 'forecast' && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-amml-orange" />}
          </button>

          <button 
            type="button"
            onClick={() => setActiveSubTab('sync')}
            className={`pb-3 text-xs font-mono uppercase font-extrabold tracking-widest cursor-pointer transition-colors relative ${activeSubTab === 'sync' ? 'text-amml-orange' : 'text-slate-400 hover:text-white'}`}
          >
            🔗 APIs & ERP Sync
            {activeSubTab === 'sync' && <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-amml-orange" />}
          </button>
        </div>

        {/* ========== INVENTORY SUB TAB ========== */}
        {activeSubTab === 'inventory' && (() => {
          const countAll = assets.length;
          const countActive = assets.filter(a => (a.status || 'Active') === 'Active').length;
          const countMaintenance = assets.filter(a => a.status === 'Maintenance').length;
          const countOffline = assets.filter(a => a.status === 'Offline').length;

          return (
            <div className="space-y-4 animate-stage-wake">
              {/* Quick-filter operational status chips */}
              <div className="flex flex-wrap items-center gap-2 bg-amml-surface border border-amml-line p-3 rounded-xl select-none">
                <span className="font-mono text-[10px] text-slate-450 uppercase tracking-widest font-extrabold mr-2 flex items-center gap-1">
                  <Radio className="h-3.5 w-3.5 text-amml-orange animate-pulse" /> Operational Level Chips:
                </span>
                
                <button
                  type="button"
                  onClick={() => { setStatusFilter('ALL'); setPage(1); }}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase transition-all border rounded-lg cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-[#0064B4]/20 border-[#0064B4] text-sky-400 font-extrabold pb-1'
                      : 'bg-amml-surface2 border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🌐 All Assets</span>
                  <span className="bg-[#0b1424] text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-700/50">{countAll}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setStatusFilter('Active'); setPage(1); }}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase transition-all border rounded-lg cursor-pointer ${
                    statusFilter === 'Active'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-extrabold pb-1'
                      : 'bg-amml-surface2 border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🟢 Active</span>
                  <span className="bg-[#0b1424] text-emerald-450 text-[10px] px-1.5 py-0.5 rounded border border-emerald-900/50">{countActive}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setStatusFilter('Maintenance'); setPage(1); }}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase transition-all border rounded-lg cursor-pointer ${
                    statusFilter === 'Maintenance'
                      ? 'bg-amber-500/20 border-amber-550 text-amber-400 font-extrabold pb-1'
                      : 'bg-amml-surface2 border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🔧 Maintenance</span>
                  <span className="bg-[#0b1424] text-amber-450 text-[10px] px-1.5 py-0.5 rounded border border-amber-900/50">{countMaintenance}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setStatusFilter('Offline'); setPage(1); }}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase transition-all border rounded-lg cursor-pointer ${
                    statusFilter === 'Offline'
                      ? 'bg-rose-500/10 border-rose-550 text-rose-400 font-extrabold pb-1'
                      : 'bg-amml-surface2 border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🔴 Offline</span>
                  <span className="bg-[#0b1424] text-rose-450 text-[10px] px-1.5 py-0.5 rounded border border-rose-900/50">{countOffline}</span>
                </button>
              </div>

              {/* ========== TAG DISTRIBUTION SUMMARY DASHBOARD WIDGET ========== */}
              {(() => {
                const hoTagsCount = assets.filter(a => (a.sku || '').split('/')[1] === 'HO').length;
                const outpostTagsCount = assets.length - hoTagsCount;

                // Department counts breakdown helper
                const deptBreakdown: Record<string, number> = {};
                assets.forEach(a => {
                  const parts = (a.sku || '').split('/');
                  const d = parts[2];
                  if (d) {
                    deptBreakdown[d] = (deptBreakdown[d] || 0) + 1;
                  } else {
                    deptBreakdown['Unspecified'] = (deptBreakdown['Unspecified'] || 0) + 1;
                  }
                });

                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amml-surface border border-amml-line p-4 rounded-xl animate-stage-wake select-none">
                    {/* Location breakdown (HO vs others) */}
                    <div className="bg-[#0b1424] border border-slate-800 rounded-lg p-3.5 space-y-2.5">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                        <h5 className="font-mono text-[10.5px] text-slate-400 font-extrabold uppercase tracking-wider">🏢 Location Quick Count</h5>
                        <span className="text-[9px] font-mono text-amml-orange font-bold uppercase pb-0.5">HO vs Others</span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-1">
                        <div className="text-left">
                          <div className="text-[10px] text-slate-450 uppercase font-mono">Head Office (HO)</div>
                          <div className="text-lg font-bold text-white font-mono mt-0.5">
                            {hoTagsCount} <span className="text-[11px] text-emerald-400 font-normal">({assets.length > 0 ? Math.round((hoTagsCount / assets.length) * 100) : 0}%)</span>
                          </div>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-800" />
                        <div className="text-right">
                          <div className="text-[10px] text-slate-450 uppercase font-mono">Other Outposts</div>
                          <div className="text-lg font-bold text-white font-mono mt-0.5">
                            {outpostTagsCount} <span className="text-[11px] text-emerald-400 font-normal">({assets.length > 0 ? Math.round((outpostTagsCount / assets.length) * 100) : 0}%)</span>
                          </div>
                        </div>
                      </div>
                      {/* Miniature progress track bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded flex overflow-hidden">
                        <div 
                          className="bg-amml-orange transition-all duration-300" 
                          style={{ width: `${assets.length > 0 ? (hoTagsCount / assets.length) * 100 : 0}%` }} 
                        />
                        <div 
                          className="bg-sky-500 transition-all duration-300" 
                          style={{ width: `${assets.length > 0 ? (outpostTagsCount / assets.length) * 100 : 0}%` }} 
                        />
                      </div>
                    </div>

                    {/* Department breakdown grid */}
                    <div className="bg-[#0b1424] border border-slate-800 rounded-lg p-3.5 col-span-1 md:col-span-2 space-y-2.5">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                        <h5 className="font-mono text-[10.5px] text-slate-400 font-extrabold uppercase tracking-wider">🗂️ Department Segment breakdown</h5>
                        <span className="text-[9px] font-mono text-slate-500 uppercase font-bold text-sky-400">Ledger Distribution</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 py-0.5 max-h-[85px] overflow-y-auto pr-1">
                        {Object.entries(deptBreakdown).length === 0 ? (
                          <span className="text-[10.5px] text-slate-500 font-mono">No parsed departments registered.</span>
                        ) : (
                          Object.entries(deptBreakdown).map(([deptName, dCount]) => (
                            <div key={deptName} className="flex items-center gap-2 bg-amml-surface border border-slate-800/80 px-2.5 py-1 rounded-lg text-xs font-mono">
                              <span className="font-extrabold text-white text-[10.5px]">{deptName}</span>
                              <span className="h-3 w-[1px] bg-slate-800" />
                              <span className="bg-[#060D1A] px-1.5 py-0.5 text-amml-orange rounded text-[10px] font-semibold border border-amml-orange/20">
                                {dCount} {dCount === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Bulk Actions Workspace Toolbar if items are selected */}
              {selectedAssetIds.length > 0 && (
                <div className="bg-[#1e0e02]/95 border-2 border-amml-orange rounded-xl p-4 shadow-2xl animate-stage-wake flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amml-orange/20 rounded-lg text-amml-orange">
                      <Layers className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xs font-mono uppercase tracking-wider">Bulk Workflows & Operations Workspace</h4>
                      <p className="text-[10.5px] text-slate-300 font-mono">
                        Selected <strong>{selectedAssetIds.length}</strong> {selectedAssetIds.length === 1 ? 'logistics item' : 'logistics items'} for team batch execution.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* Status update batch */}
                    <div className="flex items-center gap-1.5 bg-amml-surface2 px-2.5 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Set Status:</span>
                      <select
                        value={bulkStatusSelect}
                        onChange={(e) => setBulkStatusSelect(e.target.value as any)}
                        className="bg-amml-surface text-[11px] font-bold text-white tracking-wide rounded border border-slate-705 px-1 py-0.5 cursor-pointer focus:outline-none"
                      >
                        <option value="Active">🟢 Active</option>
                        <option value="Maintenance">🔧 Maintenance</option>
                        <option value="Offline">🔴 Offline</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleBulkUpdateStatus(bulkStatusSelect)}
                        className="bg-amml-blue hover:bg-amml-blue-dk text-white text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Tag assignment batch */}
                    <div className="flex items-center gap-1.5 bg-amml-surface2 px-2.5 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Assign Tag:</span>
                      <input
                        type="text"
                        placeholder="e.g. CORE-SEC"
                        value={bulkTagInput}
                        onChange={(e) => setBulkTagInput(e.target.value)}
                        className="w-24 bg-amml-surface border border-slate-705 py-0.5 px-1.5 rounded text-[11px] text-white focus:outline-none focus:border-amml-orange placeholder:text-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleBulkAddTag(bulkTagInput)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        Assign
                      </button>
                    </div>

                    {/* Batch Delete */}
                    {session?.level !== 'OFFICER' && (
                      <button
                        type="button"
                        onClick={handleBulkDelete}
                        className="bg-[#c2213d] hover:bg-red-850 text-white text-[10.5px] uppercase font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1 ml-auto xl:ml-0"
                      >
                        <Trash className="h-3.5 w-3.5" />
                        <span>Delete Selected</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedAssetIds([])}
                      className="text-slate-450 hover:text-white transition-colors text-[10px] uppercase font-mono tracking-wider ml-1 whitespace-nowrap"
                    >
                      Deselect
                    </button>
                  </div>
                </div>
              )}

              {/* Grid-col Split for Side History Traceview panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className={`${selectedAssetForHistory ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300 space-y-4`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {/* Search Bar */}
                      <div className="relative flex-1 sm:flex-initial min-w-[240px]">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search SKU, name, barcode..."
                          value={searchTerm}
                          onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                          className="w-full bg-amml-surface2 border border-amml-line rounded-lg py-2 pl-9 pr-4 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-amml-orange"
                        />
                      </div>

                      {/* Location Outpost Dropdown */}
                      <select 
                        value={locationFilter}
                        onChange={e => { setLocationFilter(e.target.value); setPage(1); }}
                        className="bg-amml-surface2 border border-amml-line rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amml-orange cursor-pointer"
                      >
                        <option value="">All Markets & HQ</option>
                        {markets.map(m => (
                          <option key={m.id} value={m.name}>🏪 {m.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Action Button Cluster */}
                    <div className="flex items-center flex-wrap gap-2">
                      <button 
                        type="button"
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 bg-amml-surface border border-amml-line hover:bg-amml-surface3 text-slate-200 px-3 py-2 rounded-lg text-xs font-mono tracking-wider uppercase font-bold transition-all shadow-sm cursor-pointer"
                        title="Export current inventory list as CSV"
                      >
                        <Download className="h-3.5 w-3.5 text-amml-blue" /> 
                        <span>Export CSV</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setReportModalOpen(true)}
                        className="flex items-center gap-1.5 bg-amml-surface border border-amml-line hover:bg-amml-surface3 text-slate-200 px-3 py-2 rounded-lg text-xs font-mono tracking-wider uppercase font-bold transition-all shadow-sm cursor-pointer"
                        title="Generate structured printable report"
                      >
                        <FileText className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Audit Report</span>
                      </button>

                      {session?.level !== 'OFFICER' && (
                        <button 
                          type="button"
                          onClick={() => setAddModalOpen(true)}
                          className="flex items-center gap-1.5 bg-amml-orange hover:bg-amml-orange-lt text-white px-3.5 py-2 rounded-lg text-xs font-mono tracking-wider uppercase font-bold transition-all shadow-sm cursor-pointer"
                        >
                          <PlusCircle className="h-4 w-4" /> Register New Asset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Main Asset Table */}
                  <div className="overflow-x-auto border border-amml-line bg-amml-surface2 rounded-xl">
                    <table className="w-full text-xs text-left border-collapse font-mono">
                      <thead>
                        <tr className="border-b border-amml-line text-slate-400 bg-amml-panel">
                          <th className="p-3.5 text-left w-12">
                            <input 
                              type="checkbox"
                              checked={paginatedAssets.length > 0 && paginatedAssets.every(item => selectedAssetIds.includes(item.id))}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const visiblySelected = paginatedAssets.map(item => item.id);
                                  setSelectedAssetIds(prev => Array.from(new Set([...prev, ...visiblySelected])));
                                } else {
                                  const visibleIds = paginatedAssets.map(item => item.id);
                                  setSelectedAssetIds(prev => prev.filter(id => !visibleIds.includes(id)));
                                }
                              }}
                              className="h-3.5 w-3.5 rounded border-slate-701 bg-amml-surface text-amml-orange focus:ring-amml-orange cursor-pointer"
                              title="Select/Deselect visible assets"
                            />
                          </th>
                    <th className="p-3.5 text-left cursor-pointer hover:text-white" onClick={() => handleSort('sku')}>
                      SKU {sortField === 'sku' ? (sortAsc ? '▲' : '▼') : '↕'}
                    </th>
                    <th className="p-3.5 text-left cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                      Asset Name & Tag {sortField === 'name' ? (sortAsc ? '▲' : '▼') : '↕'}
                    </th>
                    <th className="p-3.5 text-left">Barcode</th>
                    <th className="p-3.5 text-right cursor-pointer hover:text-white" onClick={() => handleSort('totalQty')}>
                      Total Stock {sortField === 'totalQty' ? (sortAsc ? '▲' : '▼') : '↕'}
                    </th>
                    <th className="p-3.5 text-right">Min Level</th>
                    <th className="p-3.5 text-right">Reorder Qty</th>
                    <th className="p-3.5 text-right">Lead Times</th>
                    <th className="p-3.5 className text-right">Unit Value (₦)</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center w-28">Administrative</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssets.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-12 text-center text-slate-500 font-mono">
                        <Package className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                        <span>No asset records located matching current filters.</span>
                      </td>
                    </tr>
                  ) : (
                    paginatedAssets.map((item, idx) => {
                      const totalQty = getAssetTotalStock(item.id);
                      let statusText = 'OK';
                      let statusClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                      
                      if (totalQty === 0) {
                        statusText = 'CRITICAL';
                        statusClass = 'bg-red-500/20 text-red-400 border border-red-500/30 font-bold';
                      } else if (totalQty < item.minLevel) {
                        statusText = 'LOW STOCK';
                        statusClass = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
                      }

                      // Operational Status class configurations
                      const opStatus = item.status || 'Active';
                      let opClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                      let opDotSymbol = '🟢';
                      if (opStatus === 'Maintenance') {
                        opClass = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
                        opDotSymbol = '🔧';
                      } else if (opStatus === 'Offline') {
                        opClass = 'bg-rose-500/10 text-rose-450 border border-rose-500/20';
                        opDotSymbol = '🔴';
                      }

                      return (
                        <tr 
                          key={item.id} 
                          className={`border-b border-amml-line hover:bg-amml-surface3/40 transition-all ${
                            selectedAssetForHistory?.id === item.id ? 'bg-[#0064b4]/10 border-l border-l-[#0064b4]' : ''
                          }`}
                        >
                          <td className="p-3.5 text-slate-400">
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox"
                                checked={selectedAssetIds.includes(item.id)}
                                onChange={() => {
                                  setSelectedAssetIds(prev => 
                                    prev.includes(item.id) 
                                      ? prev.filter(id => id !== item.id) 
                                      : [...prev, item.id]
                                  );
                                }}
                                className="h-3.5 w-3.5 rounded border-slate-701 bg-amml-surface text-amml-orange focus:ring-amml-orange cursor-pointer"
                              />
                              <span className="text-[10px] text-slate-500 font-mono">{(page - 1) * pageSize + idx + 1}</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-bold text-white tracking-wider uppercase">{item.sku}</td>
                          <td className="p-3.5 font-sans font-medium text-slate-100">
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-white">{item.name}</span>
                              <div className="flex flex-wrap items-center gap-1.5">
                                {item.serialNumber && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sky-950/90 border border-sky-600/50 text-sky-300 font-mono text-[9px] font-bold">
                                    S/N: {item.serialNumber}
                                  </span>
                                )}
                                {item.notes && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/50 text-slate-300 text-[9px]">
                                    {item.notes}
                                  </span>
                                )}
                                {!item.serialNumber && !item.notes && (
                                  <span className="font-mono text-[9px] text-slate-450 uppercase tracking-widest">Type: Asset register Item</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-400 text-[11px]">{item.barcode}</td>
                          <td className="p-3.5 text-right font-bold text-slate-200">{totalQty} pcs</td>
                          <td className="p-3.5 text-right text-slate-300">
                            {getTagValidation(item.sku).isConsumable ? item.minLevel : <span className="text-slate-500 italic" title="Not Applicable for Durable Assets">—</span>}
                          </td>
                          <td className="p-3.5 text-right text-slate-400">
                            {getTagValidation(item.sku).isConsumable ? item.reorderQty : <span className="text-slate-500 italic" title="Not Applicable for Durable Assets">—</span>}
                          </td>
                          <td className="p-3.5 text-right text-slate-400">{item.leadTimeDays}d</td>
                          <td className="p-3.5 text-right font-bold text-slate-250">
                            ₦{item.unitCost.toLocaleString()}
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex flex-col gap-1 items-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusClass}`}>
                                Stock: {statusText}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${opClass} flex items-center gap-1`}>
                                <span>{opDotSymbol}</span>
                                <span>{opStatus}</span>
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex gap-1.5 justify-center">
                              <button 
                                onClick={() => handleOpenAdjustModal(item)}
                                className="bg-amml-panel border border-amml-line text-white hover:border-amml-blue px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="Adjust local market stocks"
                              >
                                Layout
                              </button>

                              <button 
                                onClick={() => setSelectedAssetForHistory(item)}
                                className={`px-1.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 text-center whitespace-nowrap ${
                                  selectedAssetForHistory?.id === item.id 
                                    ? 'bg-[#0064B4] border border-[#0064B4] text-white' 
                                    : 'bg-amml-panel border border-amml-line text-slate-200 hover:border-amml-blue'
                                }`}
                                title="Open historical event timeline traceview"
                              >
                                History Log
                              </button>
                              
                              {session?.level !== 'OFFICER' && (
                                <button 
                                  onClick={() => handleDeleteAsset(item.id, item.name, item.sku)}
                                  className="border border-red-500/20 hover:bg-red-500/10 text-red-400 p-1 rounded transition-all cursor-pointer h-fit"
                                  title="Delete asset registration"
                                >
                                  <Trash className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 pt-2 select-none">
              <span>Showing {sortedAssets.length === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, sortedAssets.length)} of {sortedAssets.length} assets</span>
              <div className="flex items-center gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 border border-amml-line rounded-lg text-white hover:bg-amml-surface3 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ◀
                </button>
                <span className="text-white font-bold">{page} / {totalPages}</span>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1.5 border border-amml-line rounded-lg text-white hover:bg-amml-surface3 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>

          {/* Right hand Column: Selected Asset Chronological Events side-panel */}
          {selectedAssetForHistory && (
            <div className="lg:col-span-4 bg-[#0a1524] border border-[#0064b4]/40 rounded-2xl p-5 shadow-2xl animate-stage-wake space-y-4 text-left">
              {/* Side-panel Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 h-fit">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-1.5 bg-amml-blue/15 text-sky-450 border border-amml-blue/20 rounded font-mono text-[9px] uppercase font-bold">
                    TRACEVIEW CHRONOLOGY
                  </div>
                  <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wide">Asset history</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAssetForHistory(null)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Collapse traceview panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Asset Brief */}
              <div className="bg-amml-surface/60 border border-slate-800 p-3 rounded-xl font-mono text-xs space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-amml-orange font-bold uppercase">{selectedAssetForHistory.sku}</span>
                  <span className="text-slate-500">ID: {selectedAssetForHistory.id}</span>
                </div>
                <h4 className="font-sans font-extrabold text-white text-[13px] leading-snug">
                  {selectedAssetForHistory.name}
                </h4>
                
                <div className="grid grid-cols-2 gap-2 border-t border-dashed border-white/5 pt-2 text-[10px] text-slate-400 uppercase">
                  <div>
                    <span>Tag (Barcode):</span>
                    <span className="block font-bold text-slate-300 text-[10.5px] truncate">{selectedAssetForHistory.barcode}</span>
                  </div>
                  <div className="text-right">
                    <span>Valuation:</span>
                    <span className="block font-bold text-white text-[10.5px]">
                      ₦{(getAssetTotalStock(selectedAssetForHistory.id) * selectedAssetForHistory.unitCost).toLocaleString()}
                    </span>
                  </div>
                </div>

                {selectedAssetForHistory.serialNumber && (
                  <div className="border-t border-dashed border-white/5 pt-2 flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-bold uppercase">Serial No (S/N):</span>
                    <span className="font-mono text-sky-400 font-bold bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/40">
                      {selectedAssetForHistory.serialNumber}
                    </span>
                  </div>
                )}

                {selectedAssetForHistory.notes && (
                  <div className="border-t border-dashed border-white/5 pt-2 text-[10px] text-slate-300">
                    <span className="text-slate-400 font-bold uppercase block mb-0.5">Notes / Remark:</span>
                    <span className="bg-slate-900 p-1.5 rounded block text-[10px] border border-slate-800 italic">
                      {selectedAssetForHistory.notes}
                    </span>
                  </div>
                )}

                <div className="border-t border-dashed border-white/5 pt-2 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-bold uppercase">Operational Level:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    (selectedAssetForHistory.status || 'Active') === 'Active' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : (selectedAssetForHistory.status === 'Maintenance')
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/25'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                  }`}>
                    {selectedAssetForHistory.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Inline Quick Status Selector directly inside the side-panel */}
              <div className="form-group bg-[#060D1A] border border-white/5 p-2.5 rounded-lg flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300 font-bold text-[10px] uppercase">Toggle Status:</span>
                <select
                  value={selectedAssetForHistory.status || 'Active'}
                  onChange={(e) => {
                    const targetVal = e.target.value as 'Active' | 'Maintenance' | 'Offline';
                    const originalStatus = selectedAssetForHistory.status || 'Active';
                    
                    setAssets(prev => prev.map(a => a.id === selectedAssetForHistory.id ? { ...a, status: targetVal } : a));
                    setSelectedAssetForHistory(prev => prev ? { ...prev, status: targetVal } : null);
                    
                    const newEvt: AssetHistoryEvent = {
                      id: `EVT-${Date.now()}`,
                      itemId: selectedAssetForHistory.id,
                      date: new Date().toISOString().slice(0, 10),
                      time: new Date().toTimeString().slice(0, 8),
                      operator: session?.name || 'Administrator',
                      action: 'Status Change Overridden',
                      details: `Assisted manual status change from ${originalStatus} ➔ ${targetVal}`
                    };
                    setAssetHistory(prev => [newEvt, ...prev]);
                    
                    auditLog('INVENTORY', 'Status override', `Set ${selectedAssetForHistory.sku} status to ${targetVal}`);
                    showToast(`Set operational status of ${selectedAssetForHistory.sku} to ${targetVal}.`);
                  }}
                  className="bg-amml-panel border border-slate-700 py-1 px-2.5 rounded text-[11px] text-white outline-none cursor-pointer"
                >
                  <option value="Active">🟢 Active</option>
                  <option value="Maintenance">🔧 Maintenance</option>
                  <option value="Offline">🔴 Offline</option>
                </select>
              </div>

              {/* Event Timeline Content */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">timeline ({
                  assetHistory.filter(evt => evt.itemId === selectedAssetForHistory.id).length
                } logs)</h4>
                
                <div className="relative pl-4 border-l border-slate-800 space-y-4 max-h-[30vh] overflow-y-auto pr-1">
                  {assetHistory.filter(evt => evt.itemId === selectedAssetForHistory.id).length === 0 ? (
                    <div className="text-center py-6 text-slate-500 font-mono text-[10.5px]">
                      No logged history actions registered context. Input custom logs below.
                    </div>
                  ) : (
                    assetHistory
                      .filter(evt => evt.itemId === selectedAssetForHistory.id)
                      .map((evt) => (
                        <div key={evt.id} className="relative text-[11px] font-mono leading-relaxed space-y-0.5">
                          {/* Timeline node sphere */}
                          <div className="absolute left-[-20.5px] top-1.5 h-2.5 w-2.5 rounded-full bg-amml-blue border border-[#0a1524]" />
                          
                          <div className="flex justify-between items-center text-[9px] text-slate-500">
                            <span className="font-extrabold uppercase bg-slate-800 text-slate-300 px-1 py-0.5 rounded text-[8px] truncate max-w-[120px]">
                              👤 {evt.operator}
                            </span>
                            <span>{evt.date} • {evt.time}</span>
                          </div>
                          <h5 className="font-extrabold text-white text-[11.5px] pt-1">{evt.action}</h5>
                          <p className="text-slate-400 text-[11px] leading-relaxed font-sans font-medium">{evt.details}</p>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Timber Add comments comment box form */}
              <div className="border-t border-white/5 pt-4 space-y-1.5">
                <label className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider font-mono">Manual Memo Remark</label>
                <textarea
                  placeholder="Input custom logistics note, serial change, routine work comment..."
                  value={customCommentText}
                  onChange={(e) => setCustomCommentText(e.target.value)}
                  className="w-full bg-amml-surface border border-amml-line rounded-lg p-2.5 text-xs text-white outline-none focus:border-amml-blue h-14 resize-none font-mono placeholder:text-slate-600 focus:ring-0 focus:outline-0"
                />
                <button
                  type="button"
                  onClick={handleAddCustomHistoryEvent}
                  className="w-full bg-[#0064B4] hover:bg-[#00508C] text-white text-[10.5px] font-bold uppercase py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Confirm Record Entry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  })()}

        {/* ========== ORDERS SUB TAB ========== */}
        {activeSubTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-stage-wake">
            {/* Direct Form dispatch */}
            <div className="bg-amml-surface border border-amml-line rounded-xl p-5 h-fit space-y-4">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-amml-line">
                <ShoppingBag className="h-4 w-4 text-amml-orange" />
                Raise Consignment Request
              </h3>

              <form onSubmit={handleCreatePO} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wide">Select Asset</label>
                  <select 
                    value={poItemId}
                    onChange={e => setPoItemId(e.target.value)}
                    required
                    className="w-full bg-amml-surface2 border border-amml-line rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amml-orange cursor-pointer"
                  >
                    <option value="">-- Choose registered asset --</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>📦 {a.sku} - {a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wide">Destination Outpost</label>
                  <select 
                    value={poMarketName}
                    onChange={e => setPoMarketName(e.target.value)}
                    required
                    className="w-full bg-amml-surface2 border border-amml-line rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amml-orange cursor-pointer"
                  >
                    <option value="">-- Choose target Hub --</option>
                    {markets.map(m => (
                      <option key={m.id} value={m.name}>🏪 {m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 font-bold uppercase tracking-wide">Purchase Quantity</label>
                  <input 
                    type="number"
                    min={1}
                    value={poQty}
                    onChange={e => setPoQty(parseInt(e.target.value) || 0)}
                    required
                    className="w-full bg-amml-surface2 border border-amml-line rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amml-orange"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#0064B4] hover:bg-[#00508C] text-white p-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Dispatch Purchase PO
                </button>
              </form>
            </div>

            {/* Order Queue Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-mono font-black text-white uppercase tracking-wider">Purchase Queue Ledger</h3>
                <span className="text-[10px] text-slate-400 font-mono">Total {purchaseOrders.length} active POs</span>
              </div>

              <div className="border border-amml-line rounded-xl overflow-hidden bg-amml-surface2">
                {purchaseOrders.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 font-mono">
                    <span>No purchase orders registered in system queue.</span>
                  </div>
                ) : (
                  <div className="divide-y divide-amml-line">
                    {purchaseOrders.map(order => {
                      const asset = assets.find(a => a.id === order.itemId);
                      const isPending = order.status === 'PENDING';
                      const isApproved = order.status === 'APPROVED';

                      return (
                        <div key={order.id} className="p-4 bg-amml-panel/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white">{order.id}</span>
                              <span className="text-[9px] text-[#DC6400] bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/25">DEST: {order.warehouseId}</span>
                              {order.suggestedByAI && (
                                <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/25 uppercase">Low stock suggestion</span>
                              )}
                            </div>
                            <div className="text-slate-200 font-sans text-xs font-semibold mt-1 uppercase">
                              {asset ? asset.name : 'Unknown Asset Item'}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Quantity: <strong className="text-white">{order.qty} pcs</strong> | Valuation: <strong className="text-emerald-400">₦{order.totalCost.toLocaleString()}</strong>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isPending 
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                : isApproved 
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {order.status}
                            </span>

                            {isPending && session?.level !== 'OFFICER' && (
                              <button 
                                onClick={() => handleApprovePO(order.id)}
                                className="bg-[#0064B4] hover:bg-[#00508C] text-white font-mono font-bold text-[10px] px-3 py-1.5 rounded transition-all cursor-pointer"
                              >
                                Approve
                              </button>
                            )}

                            {isApproved && (
                              <button 
                                onClick={() => handleReceivePO(order.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-[10px] px-3 py-1.5 rounded transition-all cursor-pointer"
                              >
                                Receive
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========== FORECAST SUB TAB ========== */}
        {activeSubTab === 'forecast' && (
          <div className="space-y-4 animate-stage-wake">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3">
              <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-mono font-bold text-[#9ec4f5] uppercase">Heuristic Demands Forecasting</h4>
                <p className="text-slate-300 font-sans text-xs mt-1 leading-relaxed">
                  Analyses current outposts stock layouts against strict logistic reorder thresholds. Calculates forecasted 30-day requirement, expected Lead-Time delays, and flags immediate shortage alerts dynamically.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map(item => {
                const qty = getAssetTotalStock(item.id);
                const isCons = getTagValidation(item.sku).isConsumable;
                const ratio = isCons ? (qty < item.minLevel ? 2.5 : 0.8) : 0.0;
                const predicted30d = Math.ceil(ratio * 30);
                const risk = !isCons ? 'LOW' : (qty === 0 ? 'CRITICAL' : qty < item.minLevel ? 'HIGH' : 'LOW');

                const riskColor = risk === 'CRITICAL' 
                  ? 'bg-red-500/15 text-red-400 border-red-500/25' 
                  : risk === 'HIGH' 
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/25' 
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';

                return (
                  <div key={item.id} className="bg-amml-surface border border-amml-line rounded-xl p-4 flex flex-col justify-between font-mono text-xs">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <strong className="text-white uppercase text-[11px] font-bold block">{item.name}</strong>
                          <span className="text-[10px] text-slate-400 font-serif lowercase italic">{item.sku}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${riskColor}`}>
                          {risk} RISK
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-2 mb-2 text-center text-[10px] border-y border-amml-line font-mono bg-amml-surface2/50 rounded p-1.5">
                        <div className="text-left">
                          <span className="text-[8px] text-slate-450 block uppercase">Expected Daily</span>
                          <span className="font-bold text-slate-100">{isCons ? `${ratio.toFixed(1)} units` : 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-450 block uppercase">30-day forecast</span>
                          <span className="font-bold text-slate-100">{isCons ? `${predicted30d} pcs` : 'N/A (Durable)'}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] text-slate-450 block uppercase">Recommended PO</span>
                          <span className="font-bold text-emerald-400">{(isCons && qty < item.minLevel) ? `+${item.reorderQty}` : 'Optimal'}</span>
                        </div>
                      </div>

                      <p className="p-2 bg-amml-surface2 border border-amml-line rounded text-[10px] text-slate-300 leading-relaxed">
                        {isCons ? (
                          `Item registered at ${qty} total units. Estimated delivery wait times: ${item.leadTimeDays} days. ${qty < item.minLevel ? 'Consignment required to mitigate stock out risk.' : 'Safe buffer levels maintained.'}`
                        ) : (
                          `Durable capital asset registered at ${qty} total units. Standard lead time: ${item.leadTimeDays} days. Threshold tracking and automatic reorder replenishment are disabled.`
                        )}
                      </p>
                    </div>

                    {(isCons && qty < item.minLevel) && (
                      <button 
                        onClick={() => {
                          setActiveSubTab('orders');
                          setPoItemId(item.id);
                          setPoMarketName(markets[1]?.name || '');
                          setPoQty(item.reorderQty);
                        }}
                        className="w-full mt-3 flex items-center justify-center gap-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] uppercase transition-all cursor-pointer"
                      >
                        Auto-fill Consignment PO
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========== SYNC SUB TAB ========== */}
        {activeSubTab === 'sync' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-stage-wake">
            <div className="bg-amml-surface border border-amml-line rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider pb-2 border-b border-amml-line flex items-center gap-1.5">
                <Database className="h-4 w-4 text-emerald-400" />
                Ingestion APIs Endpoints
              </h3>

              <div className="relative rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-[10px] text-emerald-400 leading-relaxed overflow-x-auto select-all">
                <pre id="curlCode">{`curl -X POST "https://api.abujamarkets.gov.ng/v1/sync/assets" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer AMML_LOGISTICS_TOKEN_XYZ" \\
  -d '{"type":"SYNC_SNAPSHOT","snapshots":[]}'`}</pre>
              </div>


              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 rounded-lg flex items-start gap-2 leading-relaxed">
                <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                <span>API Bearer authenticated. Integrates with existing ERP structures without rate limiting overrides.</span>
              </div>

              <button 
                onClick={triggerSyncSim}
                disabled={syncing}
                className="w-full bg-[#0064B4] hover:bg-[#00508C] text-white p-2.5 rounded-lg text-xs font-mono tracking-wider font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Synchronising snapshot...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Simulate ERP Push sync</span>
                  </>
                )}
              </button>
            </div>

            {/* Sync activity logs */}
            <div className="bg-amml-surface border border-amml-line rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider pb-2 border-b border-amml-line">
                ERP Network Stream Log
              </h3>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {syncLogs.map(log => (
                  <div key={log.id} className="p-3.5 bg-amml-surface2 border border-amml-line rounded-lg flex justify-between items-center text-[11px] font-mono hover:border-slate-600 transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white">{log.id}</span>
                        <span className="text-slate-350">{log.action}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 block mt-0.5">Stream Time: {log.time}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1.5 py-0.5 text-[9px] font-bold">
                        SUCCESS
                      </span>
                      <span className="text-[10px] block text-slate-400 mt-1">+{log.count} SKUs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== HR/ADMIN SUPPLIES SUB TAB ========== */}
        {activeSubTab === 'hr_admin' && (
          <div className="space-y-6 animate-stage-wake">
            {/* Header / Intro Card */}
            <div className="p-5 bg-gradient-to-r from-amml-surface to-amml-surface/40 border border-amml-line rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="p-1.5 bg-blue-500/10 text-[#0064B4] rounded-lg border border-blue-500/20">
                    💼
                  </span>
                  AMML HR & Administrative Office Supplies
                </h2>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Ultra-streamlined ledger and rapid disbursement dispatch for core Office Stationery and Laser Jet printer toners.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (window.confirm("Restore entire HR/Admin catalog back to original requisition & quotation lists? Any custom adjustments will be reset.")) {
                      setHrAdminItems(initialHrAdminItems);
                      setRequisitionCart({});
                      showToast("Catalog restored to starting lists successfully.");
                    }
                  }}
                  className="px-3 py-1.5 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-lg text-[10.5px] font-mono uppercase tracking-wider cursor-pointer transition-colors"
                  title="Reset list to default starting quantities"
                >
                  🔄 Reset Defaults
                </button>
                <button
                  onClick={() => setIsAddNewSupplyOpen(true)}
                  className="px-3 py-1.5 bg-[#0064B4] hover:bg-[#00508C] text-white rounded-lg text-[10.5px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_2px_10px_rgba(0,100,180,0.15)]"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add New Item
                </button>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-amml-surface border border-amml-line rounded-xl">
                <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest">Office Stationery</span>
                <span className="block text-xl font-serif font-bold text-sky-450 mt-1">
                  {hrAdminItems.filter(i => i.category === 'Stationery').length} <span className="text-xs font-sans text-slate-500 font-normal">lines</span>
                </span>
              </div>
              <div className="p-4 bg-amml-surface border border-amml-line rounded-xl">
                <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest">Laser Jet Toners</span>
                <span className="block text-xl font-serif font-bold text-indigo-400 mt-1">
                  {hrAdminItems.filter(i => i.category === 'Toner').length} <span className="text-xs font-sans text-slate-500 font-normal">models</span>
                </span>
              </div>
              <div className="p-4 bg-amml-surface border border-amml-line rounded-xl">
                <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest">Low Stock Alert</span>
                <span className="block text-xl font-serif font-bold mt-1 text-amber-500 flex items-center gap-1.5">
                  {hrAdminItems.filter(i => i.qty <= 1).length}
                  {hrAdminItems.filter(i => i.qty <= 1).length > 0 && (
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </span>
              </div>
              <div className="p-4 bg-amml-surface border border-amml-line rounded-xl">
                <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest">Active Cart Lines</span>
                <span className="block text-xl font-serif font-bold text-emerald-400 mt-1">
                  {Object.keys(requisitionCart).length} <span className="text-xs font-sans text-slate-500 font-normal">items</span>
                </span>
              </div>
            </div>

            {/* Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Left Pane: Supply Catalog (2/3 width) */}
              <div className="lg:col-span-2 bg-amml-surface border border-amml-line rounded-2xl p-5 space-y-4">
                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-3 border-b border-amml-line">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search description..."
                      value={hrSearchTerm}
                      onChange={e => setHrSearchTerm(e.target.value)}
                      className="w-full bg-amml-surface2 border border-slate-705 p-1.5 pl-9 rounded text-xs text-white focus:outline-none focus:border-slate-500"
                    />
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <select
                      value={hrCategoryFilter}
                      onChange={e => setHrCategoryFilter(e.target.value as any)}
                      className="flex-1 sm:flex-none bg-amml-surface2 border border-slate-750 p-1.5 rounded text-white text-[11px] font-mono uppercase focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">📦 All Categories</option>
                      <option value="Stationery">📝 Stationery</option>
                      <option value="Toner">🖨️ Toners</option>
                    </select>

                    <select
                      value={hrStockFilter}
                      onChange={e => setHrStockFilter(e.target.value as any)}
                      className="flex-1 sm:flex-none bg-amml-surface2 border border-slate-750 p-1.5 rounded text-white text-[11px] font-mono uppercase focus:outline-none cursor-pointer"
                    >
                      <option value="ALL">📋 All Stock Levels</option>
                      <option value="LOW">⚠️ Low Stock (&le; 1)</option>
                      <option value="IN_STOCK">✅ In Stock (&gt; 1)</option>
                    </select>
                  </div>
                </div>

                {/* Catalog Table */}
                <div className="overflow-x-auto rounded-xl border border-amml-line">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0e1726]/80 text-slate-400 font-mono text-[10px] uppercase tracking-widest border-b border-amml-line">
                      <tr>
                        <th className="p-3 w-10 text-center">S/N</th>
                        <th className="p-3 w-28">Category</th>
                        <th className="p-3">Item Description</th>
                        <th className="p-3 w-40 text-center">Current Stock</th>
                        <th className="p-3 w-24 text-center">Status</th>
                        <th className="p-3 w-28 text-center">Cart Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amml-line">
                      {(() => {
                        const filtered = hrAdminItems.filter(item => {
                          const matchesSearch = item.description.toLowerCase().includes(hrSearchTerm.toLowerCase());
                          const matchesCategory = hrCategoryFilter === 'ALL' || item.category === hrCategoryFilter;
                          const matchesStock = hrStockFilter === 'ALL' || 
                            (hrStockFilter === 'LOW' && item.qty <= 1) || 
                            (hrStockFilter === 'IN_STOCK' && item.qty > 1);
                          return matchesSearch && matchesCategory && matchesStock;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">
                                🚫 No matching office supplies found.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((item, idx) => {
                          const isLow = item.qty <= 1;
                          const isOut = item.qty === 0;
                          const cartQty = requisitionCart[item.id] || 0;

                          return (
                            <tr key={item.id} className="hover:bg-amml-surface2/40 transition-colors">
                              <td className="p-3 text-center font-mono text-slate-500">{idx + 1}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                                  item.category === 'Stationery' 
                                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                }`}>
                                  {item.category}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-white select-all">{item.description}</td>
                              <td className="p-3">
                                <div className="flex items-center justify-center gap-2">
                                  {/* Quick Decrease */}
                                  <button
                                    onClick={() => handleAdjustHrQty(item.id, -0.5)}
                                    className="p-1 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded border border-slate-700 cursor-pointer text-[10px]"
                                    title="Decrease stock by 0.5"
                                  >
                                    -0.5
                                  </button>
                                  <button
                                    onClick={() => handleAdjustHrQty(item.id, -1)}
                                    className="p-1 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded border border-slate-700 cursor-pointer text-[10px]"
                                    title="Decrease stock by 1"
                                  >
                                    -1
                                  </button>
                                  
                                  {/* Quantity Value */}
                                  <span className="font-mono text-sm font-bold text-white min-w-16 text-center bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                    {item.qty} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                                  </span>

                                  {/* Quick Increase */}
                                  <button
                                    onClick={() => handleAdjustHrQty(item.id, 1)}
                                    className="p-1 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded border border-slate-700 cursor-pointer text-[10px]"
                                    title="Increase stock by 1"
                                  >
                                    +1
                                  </button>
                                  <button
                                    onClick={() => handleAdjustHrQty(item.id, 5)}
                                    className="p-1 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded border border-slate-700 cursor-pointer text-[10px]"
                                    title="Increase stock by 5"
                                  >
                                    +5
                                  </button>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold ${
                                  isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-emerald-500'
                                }`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                  {isOut ? 'OUT' : isLow ? 'LOW' : 'OK'}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleAddToCart(item.id)}
                                  disabled={isOut}
                                  className={`w-full py-1 rounded font-mono text-[9px] uppercase font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                                    isOut 
                                      ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed' 
                                      : cartQty > 0
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                        : 'bg-[#004b87]/30 hover:bg-[#004b87]/55 text-sky-400 border border-[#004b87]/50'
                                  }`}
                                >
                                  <ShoppingBag className="h-3 w-3" />
                                  {cartQty > 0 ? `In Slip (${cartQty})` : 'Add to Slip'}
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Pane: Requisition Builder (1/3 width) */}
              <div className="bg-amml-surface border border-amml-line rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider pb-2 border-b border-amml-line flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-emerald-400" />
                  Active Requisition Slip
                </h3>

                {Object.keys(requisitionCart).length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/20 text-slate-500 font-sans space-y-2">
                    <p className="text-xs">No items currently queued.</p>
                    <p className="text-[10px] text-slate-600 leading-normal">
                      Select items from the catalog on the left and assign quantities to compile a procurement requisition.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Selected Items List */}
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {Object.keys(requisitionCart).map(itemId => {
                        const item = hrAdminItems.find(i => i.id === itemId);
                        if (!item) return null;
                        const qtyRequested = requisitionCart[itemId];

                        return (
                          <div key={itemId} className="p-2 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between text-xs font-mono">
                            <div className="truncate pr-2">
                              <span className="text-slate-200 block truncate font-semibold select-all">{item.description}</span>
                              <span className="text-[9px] text-slate-500 block">Category: {item.category}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleRemoveFromCart(itemId)}
                                className="p-0.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 rounded cursor-pointer"
                                title="Reduce quantity"
                              >
                                -
                              </button>
                              <span className="text-white font-bold w-12 text-center text-xs">
                                {qtyRequested} <span className="text-[9px] text-slate-400 font-normal">{item.unit}</span>
                              </span>
                              <button
                                onClick={() => handleAddToCart(itemId)}
                                className="p-0.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 rounded cursor-pointer"
                                title="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Metadata Fields */}
                    <div className="space-y-3 pt-3 border-t border-slate-800">
                      <div>
                        <label className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                          Requesting Unit
                        </label>
                        <select
                          value={requisitionUnit}
                          onChange={e => setRequisitionUnit(e.target.value)}
                          className="w-full bg-amml-surface2 border border-slate-750 p-1.5 rounded text-white font-semibold cursor-pointer text-xs focus:outline-none focus:border-slate-500"
                        >
                          <option value="HR">HR (Human Resources)</option>
                          <option value="AD">AD (Admin)</option>
                          <option value="FI">FI (Finance & Accounting)</option>
                          <option value="AUD">AUD (Audit)</option>
                          <option value="REC">REC (Reconciliation)</option>
                          <option value="REG">REG (Registry)</option>
                          <option value="HOD">HOD (HOD Operations Office)</option>
                          <option value="CSO">CSO (Company Secretary's Office)</option>
                          <option value="IT">IT (Tech Dept)</option>
                          <option value="OE">OE (Operations)</option>
                          <option value="SC">SC (Security)</option>
                          <option value="LG">LG (Logistics)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                          Receiving Officer / Staff Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Onya Nwobodo"
                          value={requisitionOfficer}
                          onChange={e => setRequisitionOfficer(e.target.value)}
                          className="w-full bg-amml-surface2 border border-slate-750 p-1.5 rounded text-xs text-white focus:outline-none focus:border-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                          Purpose / Internal Memo
                        </label>
                        <textarea
                          placeholder="e.g. Q3 general stationery replenishment..."
                          value={requisitionMemo}
                          onChange={e => setRequisitionMemo(e.target.value)}
                          rows={2}
                          className="w-full bg-amml-surface2 border border-slate-750 p-1.5 rounded text-xs text-white focus:outline-none focus:border-slate-500 resize-none font-sans"
                        />
                      </div>
                    </div>

                    {/* Checkout Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Clear all items currently in the requisition slip?")) {
                            setRequisitionCart({});
                          }
                        }}
                        className="py-2.5 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash className="h-3.5 w-3.5" />
                        Clear Slip
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsRequisitionModalOpen(true)}
                        className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(16,185,129,0.15)]"
                      >
                        <Check className="h-4 w-4" />
                        Disburse Stock
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ========== MODAL ADD NEW SUPPLY ITEM ========== */}
            {isAddNewSupplyOpen && (
              <div className="fixed inset-0 bg-[#000000aa] z-50 flex items-center justify-center p-4">
                <div className="bg-amml-panel border border-amml-line rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-stage-wake">
                  {/* Close button */}
                  <button 
                    onClick={() => setIsAddNewSupplyOpen(false)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <h3 className="font-serif text-base font-bold text-white mb-1 uppercase tracking-wider">Register Supplies Item</h3>
                  <p className="text-xs text-slate-400 mb-4 font-mono">
                    Register a new Office Stationery line or Laser Jet Toner to the HR/Admin catalog.
                  </p>

                  <div className="space-y-4 text-xs font-mono">
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Item Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Spiral Note Books"
                        value={newSupplyDesc}
                        onChange={e => setNewSupplyDesc(e.target.value)}
                        className="w-full bg-amml-surface border border-slate-705 p-2 rounded text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Category</label>
                        <select
                          value={newSupplyCategory}
                          onChange={e => setNewSupplyCategory(e.target.value as any)}
                          className="w-full bg-amml-surface border border-slate-705 p-2 rounded text-white cursor-pointer"
                        >
                          <option value="Stationery">Stationery</option>
                          <option value="Toner">Printer Toner</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Unit Type</label>
                        <input
                          type="text"
                          placeholder="e.g. packs, pcs, carton"
                          value={newSupplyUnit}
                          onChange={e => setNewSupplyUnit(e.target.value)}
                          className="w-full bg-amml-surface border border-slate-705 p-2 rounded text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Initial Stock Quantity</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="e.g. 5"
                        value={newSupplyQty}
                        onChange={e => setNewSupplyQty(parseFloat(e.target.value) || 0)}
                        className="w-full bg-amml-surface border border-slate-705 p-2 rounded text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t border-amml-line">
                      <button
                        type="button"
                        onClick={() => setIsAddNewSupplyOpen(false)}
                        className="px-3 py-1.5 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded uppercase tracking-wider text-[10px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddNewSupply}
                        className="px-3 py-1.5 bg-[#0064B4] hover:bg-[#00508C] text-white rounded font-bold uppercase tracking-wider text-[10px]"
                      >
                        Save Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========== MODAL PRINT VOUCHER & QUOTATION ========== */}
            {isRequisitionModalOpen && (
              <div className="fixed inset-0 bg-[#000000aa] z-50 flex items-center justify-center p-4">
                <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative animate-stage-wake max-h-[92vh] overflow-y-auto font-sans">
                  {/* Close button */}
                  <button 
                    onClick={() => setIsRequisitionModalOpen(false)}
                    className="absolute right-4 top-4 text-slate-500 hover:text-slate-800 cursor-pointer print:hidden"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  {/* Print Document container */}
                  <div id="requisition-print-document" className="p-4 bg-white border border-slate-200 rounded-xl space-y-6">
                    {/* Header letterhead */}
                    <div className="text-center pb-4 border-b-2 border-[#0064B4] space-y-1 relative">
                      <div className="font-serif text-lg font-black tracking-wide text-[#0064B4]">
                        ABUJA MARKETS MANAGEMENT LTD (AMML)
                      </div>
                      <div className="font-mono text-[9px] text-slate-500 font-bold tracking-widest uppercase">
                        HR & Administrative Services Directorate
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Corporate Headquarters, Abuja FCT, Nigeria • contact@abujamarkets.com.ng
                      </div>
                      <div className="absolute right-0 top-0 text-right font-mono text-[8px] text-slate-400 print:block">
                        AMML-INTERNAL-VOUCHER
                      </div>
                    </div>

                    {/* Document Title */}
                    <div className="text-center py-1">
                      <h4 className="text-sm font-extrabold tracking-wider text-slate-800 uppercase bg-slate-100 py-1.5 rounded">
                        OFFICIAL SUPPLIES REQUISITION & DISBURSEMENT VOUCHER
                      </h4>
                    </div>

                    {/* Voucher Metadata */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Requested By Unit:</span>
                          <span className="font-bold text-slate-800">{getDeptLabel(requisitionUnit)} ({requisitionUnit})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Receiving Officer:</span>
                          <span className="font-bold text-slate-800">{requisitionOfficer || 'Administrative Officer'}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-right">
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Voucher Reference:</span>
                          <span className="font-mono font-bold text-[#0064B4]">AMML-REQ-2026-{Math.floor(1000 + Math.random() * 9000)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Date Generated:</span>
                          <span className="font-bold text-slate-800">{new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* Purpose / Memo */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-0.5">Purpose / Internal Memo Note:</span>
                      <p className="text-slate-700 font-sans italic">
                        "{requisitionMemo || 'General stationery and replenishment of administrative office supplies to optimize workflow efficiency.'}"
                      </p>
                    </div>

                    {/* Items table */}
                    <div className="space-y-1">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-1">Supplies Allocated Ledger:</span>
                      <table className="w-full text-left text-xs text-slate-800 border-collapse border border-slate-200">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[9px]">
                            <th className="p-2 border border-slate-200 w-10 text-center">S/N</th>
                            <th className="p-2 border border-slate-200">Category</th>
                            <th className="p-2 border border-slate-200">Item Description</th>
                            <th className="p-2 border border-slate-200 w-32 text-center">Quantity Approved</th>
                            <th className="p-2 border border-slate-200 w-24 text-center">Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(requisitionCart).map((id, index) => {
                            const item = hrAdminItems.find(i => i.id === id);
                            if (!item) return null;
                            return (
                              <tr key={id} className="divide-x divide-slate-100">
                                <td className="p-2 border border-slate-200 text-center font-mono text-slate-500">{index + 1}</td>
                                <td className="p-2 border border-slate-200 font-mono text-[10px] text-slate-600 uppercase">{item.category}</td>
                                <td className="p-2 border border-slate-200 font-semibold">{item.description}</td>
                                <td className="p-2 border border-slate-200 text-center font-mono font-bold text-slate-900">{requisitionCart[id]}</td>
                                <td className="p-2 border border-slate-200 text-center font-mono text-slate-600">{item.unit}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Signatures Row */}
                    <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-slate-600">
                      <div>
                        <div className="border-b border-slate-400 h-8" />
                        <span className="block text-[10px] font-mono uppercase text-slate-400 mt-1">Authorized Dispatch Officer Signature</span>
                        <span className="block font-bold text-slate-700 mt-0.5">{session?.name || 'Administrator'}</span>
                      </div>
                      <div>
                        <div className="border-b border-slate-400 h-8" />
                        <span className="block text-[10px] font-mono uppercase text-slate-400 mt-1">Receiving Officer Signature</span>
                        <span className="block font-bold text-slate-700 mt-0.5">{requisitionOfficer || 'Recipient Staff'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Modal Action buttons */}
                  <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100 print:hidden select-none">
                    <button
                      type="button"
                      onClick={() => setIsRequisitionModalOpen(false)}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-mono text-xs uppercase font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Close Preview
                    </button>
                    
                    <button
                      type="button"
                      onClick={handlePrintRequisitionDocument}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs uppercase font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Printer className="h-4 w-4" />
                      Print Voucher
                    </button>

                    <button
                      type="button"
                      onClick={handleDisburseRequisition}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_2px_10px_rgba(16,185,129,0.2)]"
                    >
                      <Check className="h-4 w-4" />
                      Approve & Disburse Stock
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'reorder_checklist' && (
          <div className="space-y-6 animate-stage-wake">
            {/* Header Description Card */}
            <div className="p-5 bg-gradient-to-r from-amml-surface to-amml-surface/40 border border-amml-line rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-serif font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="p-1.5 bg-amber-500/10 text-amml-orange rounded-lg border border-amber-500/20">
                    📋
                  </span>
                  STATIONERY & TONER REORDER CHECKLIST
                </h2>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Pristine inventory monitoring and exportable quote generator matched against AMML requirements.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reset all custom reorder quantities, rates, and selection state to the original quotation defaults?")) {
                      const initial: { [sn: number]: { qty: number; rate: number; selected: boolean } } = {};
                      defaultQuotationItems.forEach(item => {
                        initial[item.sn] = { qty: item.qty, rate: item.rate, selected: true };
                      });
                      setChecklistCustomVals(initial);
                      setExtraReorderItems([]);
                      showToast("Reorder checklist reset to defaults successfully.");
                    }
                  }}
                  className="px-3 py-1.5 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-lg text-[10.5px] font-mono uppercase tracking-wider cursor-pointer transition-colors"
                >
                  🔄 Reset Defaults
                </button>
              </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Side: interactive form / checklists (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 29 Base items list card */}
                <div className="bg-amml-surface border border-amml-line rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-amml-line">
                    <h3 className="text-sm font-bold text-white uppercase font-serif tracking-wide flex items-center gap-1.5">
                      📑 Base Quotation Items (29 Items)
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrintInteractiveLedgerPDF}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0064B4] hover:bg-[#00508C] text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm cursor-pointer border border-blue-500/20"
                        id="btn-print-interactive-ledger-pdf"
                      >
                        <Printer size={12} />
                        Export PDF
                      </button>
                      <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                        Interactive Ledger
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans">
                    Modify <strong>Current Stock</strong> (synced with HR Supply Ledger), <strong>Reorder Qty</strong>, or <strong>Rate (₦)</strong> directly in the fields. Exhausted items with stock &le; 0 are highlighted and auto-selected.
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-amml-line max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left text-xs text-slate-300 font-mono">
                      <thead className="bg-[#0e1726]/80 text-slate-400 font-mono text-[10px] uppercase tracking-widest border-b border-amml-line sticky top-0 z-10">
                        <tr>
                          <th className="p-2.5 text-center w-10">S/N</th>
                          <th className="p-2.5">Item Description</th>
                          <th className="p-2.5 text-center w-24">Current Stock</th>
                          <th className="p-2.5 text-center w-24">Ordered Previously</th>
                          <th className="p-2.5 text-center w-32">Reorder Needed</th>
                          <th className="p-2.5 text-right w-24">Rate (₦)</th>
                          <th className="p-2.5 text-right w-24">Total (₦)</th>
                          <th className="p-2.5 text-center w-12">Inc</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amml-line text-[11px]">
                        {defaultQuotationItems.map(item => {
                          const mappedId = getMappedHrItemIdOfQuotation(item.name);
                          const hrItem = hrAdminItems.find(h => h.id === mappedId);
                          const currentStock = hrItem ? hrItem.qty : 0;
                          
                          // Custom override values - default qty should start as undefined for automatic formula
                          const custom = checklistCustomVals[item.sn] || { qty: undefined, rate: item.rate, selected: true };
                          
                          // Automate: Reorder Needed = Ordered Previously - Current Stock (bounded at 0)
                          const calculatedReorderQty = Math.max(0, item.qty - currentStock);
                          const currentReorderQty = custom.qty !== undefined ? custom.qty : calculatedReorderQty;
                          
                          const currentRate = custom.rate !== undefined ? custom.rate : item.rate;
                          const isSelected = custom.selected !== false;

                          // Auto select and flag if stock is exhausted (Current Stock = 0)
                          const isExhausted = currentStock === 0;

                          const updateVal = (field: 'qty' | 'rate' | 'selected', val: any) => {
                            setChecklistCustomVals(prev => {
                              const existing = prev[item.sn] || { rate: item.rate, selected: true };
                              const updatedItem = { ...existing, [field]: val };
                              if (val === undefined) {
                                delete updatedItem[field];
                              }
                              return {
                                ...prev,
                                [item.sn]: updatedItem
                              };
                            });
                          };

                          // Helper to update current stock level globally
                          const handleStockChange = (newStock: number) => {
                            if (!mappedId) return;
                            const updated = hrAdminItems.map(h => {
                              if (h.id === mappedId) {
                                return { ...h, qty: newStock };
                              }
                              return h;
                            });
                            setHrAdminItems(updated);
                            localStorage.setItem('amml_hr_admin_items', JSON.stringify(updated));
                          };

                          return (
                            <tr key={item.sn} className={`hover:bg-amml-surface2/30 transition-colors ${isExhausted ? 'bg-red-500/5' : ''}`}>
                              <td className="p-2 text-center text-slate-500 font-bold">{item.sn}</td>
                              <td className="p-2 font-sans">
                                <div className="font-semibold text-slate-200">{item.name}</div>
                                <div className="text-[9px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                  <span>Unit: {item.unit}</span>
                                  {isExhausted && (
                                    <span className="text-red-400 font-bold bg-red-400/10 px-1 py-0.2 rounded text-[8px] uppercase tracking-wider animate-pulse">
                                      ⚠️ Exhausted
                                    </span>
                                  )}
                                </div>
                              </td>
                              {/* Current Stock Input */}
                              <td className="p-2 text-center">
                                {mappedId ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <input
                                      type="number"
                                      min={0}
                                      value={currentStock}
                                      onChange={e => handleStockChange(Math.max(0, parseFloat(e.target.value) || 0))}
                                      className={`w-14 bg-amml-surface2 border rounded px-1 py-0.5 text-center text-xs font-bold font-mono focus:outline-none focus:border-amml-orange ${isExhausted ? 'border-red-500/50 text-red-400 font-extrabold animate-pulse' : 'border-slate-700 text-slate-300'}`}
                                    />
                                    <span className="text-[9px] text-slate-500">
                                      {hrItem?.unit === 'cartons' ? 'crt' : hrItem?.unit === 'packs' ? 'pks' : 'pcs'}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-600 italic">—</span>
                                )}
                              </td>
                              {/* Ordered Previously Column */}
                              <td className="p-2 text-center text-slate-400 font-bold font-mono">
                                {item.qty} <span className="text-[9px] text-slate-500 font-normal">{item.unit.toLowerCase()}</span>
                              </td>
                              {/* Reorder Needed Input (Automated + Override) */}
                              <td className="p-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    value={currentReorderQty}
                                    onChange={e => updateVal('qty', Math.max(0, parseInt(e.target.value) || 0))}
                                    className={`w-14 bg-amml-surface2 border rounded px-1 py-0.5 text-center text-xs font-mono font-bold focus:outline-none focus:border-amml-orange ${custom.qty !== undefined ? 'border-amber-500/50 text-amber-400' : 'border-slate-700 text-white'}`}
                                    title={custom.qty !== undefined ? "Manual override active. Click restore icon to go back to auto-formula." : `Formula-calculated: Ordered Previously (${item.qty}) - Current Stock (${currentStock})`}
                                  />
                                  {custom.qty !== undefined ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateVal('qty', undefined);
                                        showToast(`Restored auto-calculation formula for ${item.name}`);
                                      }}
                                      className="p-1 text-amber-500 hover:text-white rounded bg-amber-500/10 hover:bg-amber-500/20 transition-all cursor-pointer"
                                      title="Reset to formula (Ordered Previously - Stock)"
                                    >
                                      🔄
                                    </button>
                                  ) : (
                                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded uppercase font-bold" title="Using live dynamic formula">
                                      Auto
                                    </span>
                                  )}
                                </div>
                              </td>
                              {/* Rate Input */}
                              <td className="p-2 text-right">
                                <div className="flex items-center justify-end gap-0.5">
                                  <span className="text-slate-500 text-[10px]">₦</span>
                                  <input
                                    type="text"
                                    value={currentRate.toLocaleString()}
                                    onChange={e => {
                                      const clean = parseInt(e.target.value.replace(/,/g, '')) || 0;
                                      updateVal('rate', clean);
                                    }}
                                    className="w-16 bg-amml-surface2 border border-slate-700 rounded px-1 py-0.5 text-right text-xs text-slate-300 focus:outline-none focus:border-amml-orange"
                                  />
                                </div>
                              </td>
                              {/* Computed Total */}
                              <td className="p-2 text-right text-white font-bold font-mono">
                                ₦{(currentReorderQty * currentRate).toLocaleString()}
                              </td>
                              {/* Checkbox Include */}
                              <td className="p-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={e => updateVal('selected', e.target.checked)}
                                  className="h-3.5 w-3.5 rounded bg-slate-800 border-slate-700 text-amml-orange focus:ring-amml-orange cursor-pointer"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Unlisted Exhausted Items Section */}
                <div className="bg-amml-surface border border-amml-line rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-amml-line">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase font-serif tracking-wide flex items-center gap-1.5">
                        ⚠️ Exhausted Items Ledger (Not on Quotation List)
                      </h3>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                        These items are currently finished / exhausted (Current Stock &le; 0), but aren't in the default quote.
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const baseQuotationMappedIds = new Set(
                      defaultQuotationItems.map(item => getMappedHrItemIdOfQuotation(item.name)).filter(Boolean)
                    );
                    const exhaustedUnlistedItems = hrAdminItems.filter(item => 
                      item.qty <= 0 && !baseQuotationMappedIds.has(item.id)
                    );

                    if (exhaustedUnlistedItems.length === 0) {
                      return (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                          <p className="text-xs text-emerald-400 font-sans flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" /> All non-quotation inventory items are currently stocked! No unlisted shortages detected.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {exhaustedUnlistedItems.map(item => {
                            const alreadyAdded = extraReorderItems.some(x => x.id === item.id);
                            return (
                              <div key={item.id} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between gap-2 hover:border-red-500/20 transition-all">
                                <div>
                                  <span className="font-sans font-bold text-slate-200 block text-xs capitalize">{item.description}</span>
                                  <span className="text-[10px] text-red-400 font-mono font-bold mt-0.5 block flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                    Exhausted (0 {item.unit} left)
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (alreadyAdded) {
                                      showToast(`${item.description} is already added to the reorder sheet.`);
                                      return;
                                    }
                                    setExtraReorderItems(prev => [
                                      ...prev,
                                      {
                                        id: item.id,
                                        name: item.description.toUpperCase(),
                                        qty: 2,
                                        unit: item.unit.toUpperCase(),
                                        rate: 5000,
                                        selected: true
                                      }
                                    ]);
                                    showToast(`Added ${item.description} to reorder list.`);
                                  }}
                                  disabled={alreadyAdded}
                                  className={`px-2.5 py-1 text-[10px] font-mono uppercase font-bold rounded cursor-pointer transition-all ${alreadyAdded ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-[#0064B4] hover:bg-[#00508C] text-white'}`}
                                >
                                  {alreadyAdded ? 'Added' : '➕ Add to Quote'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Added custom extra items list if any */}
                  {extraReorderItems.length > 0 && (
                    <div className="pt-3 border-t border-dashed border-slate-700 space-y-2">
                      <span className="text-[10px] text-slate-400 block font-mono uppercase font-extrabold tracking-wider">
                        Custom Added Items to Reorder (Total {extraReorderItems.length})
                      </span>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {extraReorderItems.map((item, idx) => {
                          const updateExtraVal = (field: 'qty' | 'rate' | 'name' | 'unit', val: any) => {
                            setExtraReorderItems(prev => prev.map(x => x.id === item.id ? { ...x, [field]: val } : x));
                          };

                          return (
                            <div key={item.id} className="p-2 bg-slate-800/60 border border-slate-700 rounded-lg flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 font-mono">{idx + 30}.</span>
                                <input
                                  type="text"
                                  value={item.name}
                                  onChange={e => updateExtraVal('name', e.target.value.toUpperCase())}
                                  className="bg-transparent text-white font-bold text-xs focus:outline-none focus:border-slate-500 w-40 truncate animate-pulse"
                                />
                              </div>
                              <div className="flex items-center gap-2 font-mono">
                                <div className="flex items-center gap-1">
                                  <span className="text-slate-500 text-[10px]">Qty:</span>
                                  <input
                                    type="number"
                                    value={item.qty}
                                    onChange={e => updateExtraVal('qty', Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-10 bg-amml-surface2 text-center rounded text-white py-0.5 font-bold"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-slate-500 text-[10px]">Rate:</span>
                                  <input
                                    type="number"
                                    value={item.rate}
                                    onChange={e => updateExtraVal('rate', Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-16 bg-amml-surface2 text-right rounded text-white py-0.5 font-bold pr-1"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExtraReorderItems(prev => prev.filter(x => x.id !== item.id));
                                    showToast(`Removed custom item from reorder list.`);
                                  }}
                                  className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10"
                                >
                                  <Trash className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: High Fidelity Print & Exportable Quotation Document Preview (5 cols) */}
              <div className="lg:col-span-5 space-y-4 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-mono uppercase font-bold tracking-wider flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live Quotation Preview
                  </span>
                  <div className="flex gap-1.5 select-none no-print flex-wrap justify-end">
                    <button
                      type="button"
                      onClick={handlePrintToPDF}
                      className="px-3 py-1.5 bg-[#0064B4] hover:bg-[#00508C] text-white font-mono text-[10.5px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print
                    </button>
                    <button
                      type="button"
                      onClick={exportToExcel}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10.5px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Excel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Generate CSV
                        const header = "S/N,ITEM,QUANTITY,RATE,AMOUNT\n";
                        let index = 1;
                        let body = "";
                        defaultQuotationItems.forEach(item => {
                          const mappedId = getMappedHrItemIdOfQuotation(item.name);
                          const hrItem = hrAdminItems.find(h => h.id === mappedId);
                          const currentStock = hrItem ? hrItem.qty : 0;
                          const calculatedReorderQty = Math.max(0, item.qty - currentStock);

                          const custom = checklistCustomVals[item.sn] || { qty: undefined, rate: item.rate, selected: true };
                          if (custom.selected !== false) {
                            const finalQty = custom.qty !== undefined ? custom.qty : calculatedReorderQty;
                            const finalRate = custom.rate !== undefined ? custom.rate : item.rate;
                            body += `${index},"${item.name}",${finalQty} ${item.unit},${finalRate},${finalQty * finalRate}\n`;
                            index++;
                          }
                        });
                        extraReorderItems.forEach(item => {
                          body += `${index},"${item.name}",${item.qty} ${item.unit},${item.rate},${item.qty * item.rate}\n`;
                          index++;
                        });
                        const blob = new Blob([header + body], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `Stationery_Reorder_Quotation_${new Date().toISOString().slice(0,10)}.csv`;
                        a.click();
                        auditLog('INVENTORY', 'Export CSV', 'Exported stationery quotation checklist to CSV');
                        showToast("Quotation checklist CSV exported successfully.");
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[10.5px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-750"
                    >
                      <Download className="h-3.5 w-3.5" />
                      CSV
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveToHistory}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-mono text-[10.5px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                    >
                      <Database className="h-3.5 w-3.5" />
                      Save Log
                    </button>
                  </div>
                </div>

                {/* Meta Configuration Panel */}
                <div className="bg-amml-surface border border-amml-line rounded-2xl p-4 space-y-3 no-print">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                      ⚙️ QUOTATION DOCUMENT METADATA
                    </span>
                    <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Live Settings
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="space-y-1">
                      <label className="text-slate-400 block font-bold text-[9px] uppercase tracking-wide">Quotation Date</label>
                      <input
                        type="date"
                        value={quoteDate}
                        onChange={e => setQuoteDate(e.target.value)}
                        className="w-full bg-amml-surface2 border border-slate-750 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amml-orange"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400 block font-bold text-[9px] uppercase tracking-wide">Quotation Time</label>
                      <input
                        type="time"
                        value={quoteTime}
                        onChange={e => setQuoteTime(e.target.value)}
                        className="w-full bg-amml-surface2 border border-slate-750 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amml-orange"
                      />
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <label className="text-slate-400 block font-bold text-[9px] uppercase tracking-wide">Reference Number (Ref)</label>
                      <input
                        type="text"
                        value={quoteRef}
                        onChange={e => setQuoteRef(e.target.value)}
                        placeholder="e.g. 1P05 - 2034"
                        className="w-full bg-amml-surface2 border border-slate-750 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amml-orange"
                      />
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                      <label className="text-slate-400 block font-bold text-[9px] uppercase tracking-wide">Doc Control Code</label>
                      <input
                        type="text"
                        value={quoteDocCode}
                        onChange={e => setQuoteDocCode(e.target.value)}
                        placeholder="e.g. 3pc6 - 494 x"
                        className="w-full bg-amml-surface2 border border-slate-750 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amml-orange"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-slate-400 block font-bold text-[9px] uppercase tracking-wide">Subject / Subtitle Code</label>
                      <input
                        type="text"
                        value={quoteSubjectCode}
                        onChange={e => setQuoteSubjectCode(e.target.value)}
                        placeholder="e.g. 2ps-534"
                        className="w-full bg-amml-surface2 border border-slate-750 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amml-orange"
                      />
                    </div>
                  </div>
                </div>

                {/* Quotation History Logs Sidebar Panel */}
                <div className="bg-amml-surface border border-amml-line rounded-2xl p-4 space-y-3 no-print select-none">
                  <div 
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    className="flex items-center justify-between cursor-pointer pb-2 border-b border-slate-800 hover:text-amml-orange transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 font-serif">
                      📚 QUOTATION HISTORY LOGS ({quotationHistory.length})
                    </span>
                    <span className="text-xs text-slate-400">
                      {isHistoryOpen ? '▲ Collapse' : '▼ Expand'}
                    </span>
                  </div>
                  
                  {isHistoryOpen && (
                    <div className="space-y-2">
                      {/* Interactive History Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search past logs (by date, ref)..."
                          value={historySearchQuery}
                          onChange={(e) => setHistorySearchQuery(e.target.value)}
                          className="w-full bg-amml-surface2 border border-slate-750 hover:border-slate-650 rounded-lg pl-8 pr-2.5 py-1.5 text-white font-mono text-[11px] focus:outline-none focus:border-amml-orange transition-all"
                        />
                        {historySearchQuery && (
                          <button
                            type="button"
                            onClick={() => setHistorySearchQuery('')}
                            className="absolute right-2.5 top-2 text-slate-400 hover:text-white font-bold text-xs"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1 mt-2">
                        {quotationHistory.length === 0 ? (
                          <p className="text-[10px] text-slate-500 italic py-2 text-center">
                            No previous quotation logs stored. Click "Save Log" above to record active configurations.
                          </p>
                        ) : (() => {
                          const filteredHistory = quotationHistory.filter(entry => {
                            if (!historySearchQuery) return true;
                            const query = historySearchQuery.toLowerCase();
                            const matchesRef = (entry.quoteRef || '').toLowerCase().includes(query);
                            const matchesDate = (entry.quoteDate || '').toLowerCase().includes(query) || (entry.savedAt || '').toLowerCase().includes(query);
                            const matchesSub = (entry.quoteSubjectCode || '').toLowerCase().includes(query);
                            return matchesRef || matchesDate || matchesSub;
                          });

                          if (filteredHistory.length === 0) {
                            return (
                              <p className="text-[10px] text-slate-500 italic py-2 text-center">
                                No historical logs match your query.
                              </p>
                            );
                          }

                          return filteredHistory.map((entry) => {
                            const isActive = entry.id === activeHistoryId;
                            return (
                              <div 
                                key={entry.id} 
                                onClick={() => handleRecallQuotation(entry)}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                                  isActive 
                                    ? 'bg-[#0064B4]/10 border-[#0064B4] text-white shadow-md' 
                                    : 'bg-amml-surface2 border-slate-750 hover:border-slate-600 text-slate-300'
                                }`}
                              >
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-slate-100 truncate">{entry.quoteRef || 'Ref Undefined'}</span>
                                    {isActive && (
                                      <span className="text-[8px] bg-[#0064B4] text-white px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <span>📅 {entry.savedAt || entry.quoteDate}</span>
                                  </div>
                                  <div className="text-[9px] text-slate-500 uppercase tracking-wider">
                                    Subject Code: {entry.quoteSubjectCode || 'N/A'}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono font-bold text-emerald-400 text-xs">
                                    ₦{(entry.totalAmount || 0).toLocaleString()}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteHistoryEntry(entry.id, e)}
                                    className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors"
                                    title="Delete historical log"
                                  >
                                    <Trash className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}
                </div>

                {/* The Paper Sheet Container */}
                <div 
                  id="amml-printable-quotation" 
                  className="bg-white text-slate-900 shadow-2xl rounded-2xl p-6 font-mono text-left relative overflow-hidden border border-slate-200 text-[11px] leading-relaxed max-w-full"
                  style={{ minHeight: '680px' }}
                >
                  <style>{`
                    @media print {
                      body * {
                        visibility: hidden;
                      }
                      #amml-printable-quotation, #amml-printable-quotation * {
                        visibility: visible;
                      }
                      #amml-printable-quotation {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        background: white !important;
                        color: black !important;
                        padding: 0.5in !important;
                        box-shadow: none !important;
                        border: none !important;
                        font-family: monospace !important;
                        font-size: 11px !important;
                      }
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}</style>

                  {/* Top Header AMML Block */}
                  <div className="text-center pb-5 border-b-2 border-slate-800 mb-5 relative">
                    <h1 className="text-xl font-extrabold tracking-tight uppercase text-black font-serif">ABUJA MARKETS MANAGEMENT LTD (AMML)</h1>
                    <p className="text-[11px] font-bold text-slate-800 uppercase">HR & Administrative Services Directorate</p>
                    <h2 className="text-[12px] font-extrabold tracking-widest text-black uppercase mt-0.5">CORPORATE HEADQUARTERS</h2>
                    <p className="text-[10px] text-slate-700">Abuja FCT, Nigeria</p>
                    <p className="text-[10px] font-semibold text-slate-800">Email: contact@abujamarkets.com.ng • Web: abujamarkets.com.ng</p>

                    <div className="absolute top-0 right-0 text-right text-[9px] text-slate-500 font-bold no-print">
                      PRINT PREVIEW SHEET
                    </div>
                  </div>

                  {/* Ref, Serials and Date Row */}
                  <div className="flex justify-between items-start mb-6 text-[10px] border-b border-dashed border-slate-300 pb-4">
                    <div className="space-y-0.5 font-bold text-slate-800">
                      <div>{quoteRef || '1P05 - 2034'}</div>
                      <div>{quoteDocCode || '3pc6 - 494 x'}</div>
                    </div>
                    <div className="text-center font-bold px-3 py-1 border border-black uppercase text-xs bg-slate-50">
                      QUOTATION FOR STATIONERIES
                    </div>
                    <div className="space-y-0.5 text-right font-bold text-slate-800">
                      <div>{formatDateHuman(quoteDate)}{quoteTime ? ` @ ${quoteTime}` : ''}</div>
                      <div>{quoteSubjectCode || '2ps-534'}</div>
                    </div>
                  </div>

                  {/* Table of Items */}
                  <div className="mb-6">
                    <table className="w-full text-left text-[10.5px] border-collapse">
                      <thead>
                        <tr className="border-y-2 border-slate-800 bg-slate-50 text-[10px] uppercase font-bold text-black">
                          <th className="p-1.5 text-center w-8">S/N</th>
                          <th className="p-1.5">ITEM</th>
                          <th className="p-1.5 text-center w-28">QUANTITY</th>
                          <th className="p-1.5 text-right w-24">RATE (₦)</th>
                          <th className="p-1.5 text-right w-24">AMOUNT (₦)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300 text-black">
                        {(() => {
                          let displaySn = 1;
                          const elements: any[] = [];

                          // Add base items
                          defaultQuotationItems.forEach(item => {
                            const mappedId = getMappedHrItemIdOfQuotation(item.name);
                            const hrItem = hrAdminItems.find(h => h.id === mappedId);
                            const currentStock = hrItem ? hrItem.qty : 0;
                            const calculatedReorderQty = Math.max(0, item.qty - currentStock);

                            const custom = checklistCustomVals[item.sn] || { qty: undefined, rate: item.rate, selected: true };
                            if (custom.selected !== false) {
                              const finalQty = custom.qty !== undefined ? custom.qty : calculatedReorderQty;
                              const finalRate = custom.rate !== undefined ? custom.rate : item.rate;
                              const finalAmount = finalQty * finalRate;

                              elements.push(
                                <tr key={`quote-item-${item.sn}`} className="hover:bg-slate-50">
                                  <td className="p-1.5 text-center font-bold text-slate-600">{displaySn}</td>
                                  <td className="p-1.5 font-bold uppercase tracking-tight text-slate-900">{item.name}</td>
                                  <td className="p-1.5 text-center uppercase font-semibold">{finalQty} {item.unit}</td>
                                  <td className="p-1.5 text-right font-semibold">{finalRate.toLocaleString()}</td>
                                  <td className="p-1.5 text-right font-bold text-black">{finalAmount.toLocaleString()}</td>
                                </tr>
                              );
                              displaySn++;
                            }
                          });

                          // Add custom items
                          extraReorderItems.forEach(item => {
                            const finalAmount = item.qty * item.rate;
                            elements.push(
                              <tr key={`quote-extra-${item.id}`} className="hover:bg-slate-50 bg-amber-500/5">
                                <td className="p-1.5 text-center font-bold text-slate-600">{displaySn}</td>
                                <td className="p-1.5 font-bold uppercase tracking-tight text-slate-900">{item.name}</td>
                                <td className="p-1.5 text-center uppercase font-semibold">{item.qty} {item.unit}</td>
                                <td className="p-1.5 text-right font-semibold">{item.rate.toLocaleString()}</td>
                                <td className="p-1.5 text-right font-bold text-black">{finalAmount.toLocaleString()}</td>
                              </tr>
                            );
                            displaySn++;
                          });

                          if (elements.length === 0) {
                            return (
                              <tr>
                                <td colSpan={5} className="p-4 text-center text-slate-400 italic">
                                  No items selected for quotation reorder list.
                                </td>
                              </tr>
                            );
                          }

                          return elements;
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Total Rows */}
                  {(() => {
                    let cumulativeSum = 0;
                    defaultQuotationItems.forEach(item => {
                      const mappedId = getMappedHrItemIdOfQuotation(item.name);
                      const hrItem = hrAdminItems.find(h => h.id === mappedId);
                      const currentStock = hrItem ? hrItem.qty : 0;
                      const calculatedReorderQty = Math.max(0, item.qty - currentStock);

                      const custom = checklistCustomVals[item.sn] || { qty: undefined, rate: item.rate, selected: true };
                      if (custom.selected !== false) {
                        const finalQty = custom.qty !== undefined ? custom.qty : calculatedReorderQty;
                        const finalRate = custom.rate !== undefined ? custom.rate : item.rate;
                        cumulativeSum += finalQty * finalRate;
                      }
                    });
                    extraReorderItems.forEach(item => {
                      cumulativeSum += item.qty * item.rate;
                    });

                    return (
                      <div className="space-y-4 pt-3 border-t-2 border-slate-800">
                        {/* Total NGN */}
                        <div className="flex justify-between items-center text-xs font-extrabold text-black">
                          <span>TOTAL VALUE:</span>
                          <span className="text-sm font-black border-double border-b-4 border-slate-900 pb-0.5">
                            ₦{cumulativeSum.toLocaleString()}.00
                          </span>
                        </div>

                        {/* Amount in Words */}
                        <div className="text-[10px] font-bold text-slate-700 italic border border-slate-200 p-2 bg-slate-50 rounded">
                          <span className="uppercase text-[9px] text-slate-500 font-mono block not-italic mb-0.5">Amount in words:</span>
                          {numberToWords(cumulativeSum)}
                        </div>

                        {/* Footnote details */}
                        <p className="text-[8px] text-slate-500 leading-normal text-justify mt-4">
                          * Goods supplied in first-class merchant condition are subject to standard delivery times. Payments shall be executed in full concordance with AMML Head Office Abuja corporate procurement and logistics bylaws.
                        </p>

                        {/* Signature Block */}
                        <div className="grid grid-cols-2 gap-4 pt-8 mt-6 border-t border-dashed border-slate-300">
                          <div className="text-left space-y-4 col-span-1">
                            <span className="font-bold text-slate-700">Prepared & Checked By:</span>
                            <div className="h-6 border-b border-black w-36" />
                            <div className="text-[8px] uppercase tracking-wider font-bold text-slate-500">
                              Administrative Officer<br />AMML Logistics Desk
                            </div>
                          </div>
                          <div className="text-right space-y-4 flex flex-col items-end col-span-1">
                            <span className="font-bold text-slate-700 mr-20">Authorized Signature:</span>
                            <div className="h-6 border-b border-black w-36 mr-4" />
                            <div className="text-[8px] uppercase tracking-wider font-bold text-slate-500 mr-12 text-right">
                              Managing Director / CEO<br />ABUJA MARKETS MANAGEMENT LIMITED
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ========== MODAL ADD NEW ASSET ========== */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-[#00000095] z-50 flex items-center justify-center p-4">
          <div className="bg-amml-panel border border-amml-line rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-stage-wake max-h-[92vh] overflow-y-auto">
            <button 
              onClick={() => { setAddModalOpen(false); resetAssetForm(); }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-white mb-1 uppercase tracking-wider">Register Company Asset</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">
              Input item metadata records to register logistics asset. Keep tagging simple and automatic.
            </p>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs font-mono">
              {/* AMML Smart Asset Tagging Wizard workspace */}
              <div className="bg-[#0c1a30] border border-amml-blue/45 rounded-xl p-4.5 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-sky-400">
                    <span className="inline-block h-2 w-2 rounded-full bg-sky-400 animate-pulse"></span>
                    AMML Standard SLA Tagging Builder
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">Format: PRE/LOC/DEPT/CAT/SER</span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 text-[10px]">
                  {/* Prefix */}
                  <div>
                    <label className="block text-slate-400 font-extrabold mb-1 uppercase tracking-wide">Prefix</label>
                    <select
                      value={tagPrefix}
                      onChange={e => setTagPrefix(e.target.value.toUpperCase())}
                      className="w-full bg-amml-surface border border-slate-705 p-1.5 rounded text-white font-bold focus:outline-none cursor-pointer text-[10.5px]"
                    >
                      <option value="AMML">AMML</option>
                      <option value="SLA">SLA</option>
                      <option value="FCT">FCT</option>
                    </select>
                  </div>

                  {/* Location code */}
                  <div>
                    <label className="block text-slate-400 font-extrabold mb-1 uppercase tracking-wide" title="Home Office or Market Hub">Loc *</label>
                    <select
                      value={tagLocation}
                      onChange={e => setTagLocation(e.target.value.toUpperCase())}
                      className="w-full bg-amml-surface border border-slate-705 p-1.5 rounded text-white font-bold focus:outline-none cursor-pointer text-[10.5px]"
                    >
                      {ammlLocations.map(loc => (
                        <option key={loc.code} value={loc.code} title={loc.name}>
                          {loc.code} ({loc.name.length > 20 ? loc.name.slice(0, 18) + '...' : loc.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-slate-400 font-extrabold mb-1 uppercase tracking-wide">Dept</label>
                    <select
                      value={tagDept}
                      onChange={e => setTagDept(e.target.value.toUpperCase())}
                      className="w-full bg-amml-surface border border-slate-705 p-1.5 rounded text-white font-bold focus:outline-none cursor-pointer text-[10.5px]"
                    >
                      <option value="HR">HR (Human Res)</option>
                      <option value="AD">AD (Admin)</option>
                      <option value="IT">IT (Tech Dept)</option>
                      <option value="OE">OE (Operations)</option>
                      <option value="FI">FI (Finance & Accounting)</option>
                      <option value="AUD">AUD (Audit)</option>
                      <option value="REC">REC (Reconciliation)</option>
                      <option value="REG">REG (Registry)</option>
                      <option value="HOD">HOD (HOD Operations Office)</option>
                      <option value="CSO">CSO (Company Secretary's Office)</option>
                      <option value="SC">SC (Security)</option>
                      <option value="LG">LG (Logistics)</option>
                    </select>
                  </div>

                  {/* Category Code */}
                  <div>
                    <label className="block text-slate-400 font-extrabold mb-1 uppercase tracking-wide" title="Category type of raw asset or general supply">Cat</label>
                    <select
                      value={tagCategory}
                      onChange={e => {
                        const nextCat = e.target.value.toUpperCase();
                        setTagCategory(nextCat);
                      }}
                      className="w-full bg-amml-surface border border-slate-705 p-1.5 rounded text-white font-bold focus:outline-none cursor-pointer text-[10.5px]"
                    >
                      <option value="FN" title="Furniture & Fittings">FN (Furniture)</option>
                      <option value="EL" title="Electrical Appliance">EL (Electrical)</option>
                      <option value="CM" title="Computing & Hardware">CM (Computers)</option>
                      <option value="OE" title="Office Equipment">OE (Office Eq)</option>
                      <option value="VE" title="Vehicle / Auto">VE (Vehicles)</option>
                      <option value="GS" title="General Supplies / Utility">GS (Gen Supply)</option>
                      <option value="CS" title="Consumables (No Serial needed)">CS (Consumables)</option>
                    </select>
                  </div>

                  {/* Serial # */}
                  <div>
                    <label className="block text-slate-400 font-extrabold mb-1 uppercase tracking-wide">Serial</label>
                    <input
                      type="text"
                      disabled={tagCategory === 'CS'}
                      value={tagCategory === 'CS' ? '' : tagSerial}
                      placeholder={tagCategory === 'CS' ? 'N/A' : 'e.g. 171'}
                      onChange={e => setTagSerial(e.target.value.replace(/[^0-9]/g, ''))}
                      className={`w-full bg-amml-surface border border-slate-705 p-1.5 rounded text-white font-mono text-center focus:outline-none text-[10.5px] ${
                        tagCategory === 'CS' ? 'opacity-40 bg-[#061020] cursor-not-allowed border-dashed' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Generator Live Preview HUD */}
                {(() => {
                  const compiled = tagCategory === 'CS'
                    ? `${tagPrefix}/${tagLocation}/${tagDept}/${tagCategory}`
                    : `${tagPrefix}/${tagLocation}/${tagDept}/${tagCategory}/${tagSerial}`;
                  return (
                    <div className="bg-[#050c18] border border-blue-900/30 rounded-lg p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left select-none">
                      <div>
                        <span className="text-[10px] block text-slate-400 uppercase font-bold tracking-wider mb-0.5">Live Output Code:</span>
                        <strong className="text-sm font-mono text-emerald-450 tracking-wider">
                          {compiled}
                        </strong>
                      </div>
                      
                      {/* Actions applying generators */}
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setNewItemSku(compiled);
                            setNewItemBarcode(compiled.replace(/\//g, ''));
                            showToast(`Applied ${compiled} to registration ledger!`);
                          }}
                          className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1.5 rounded transition-colors whitespace-nowrap cursor-pointer"
                        >
                          Apply To Asset Log
                        </button>
                        <button
                          type="button"
                          disabled={tagCategory === 'CS'}
                          onClick={() => {
                            const rnd = Math.floor(100 + Math.random() * 900);
                            setTagSerial(rnd.toString());
                          }}
                          className="bg-[#0064B4] hover:bg-[#00508C] text-white text-[10px] px-2 py-1.5 rounded font-bold transition-colors whitespace-nowrap cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                          title="Generate random serial code"
                        >
                          ♻ Random Serial
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-400 font-bold">Asset Tag *</label>
                    {newItemSku ? (
                      (() => {
                        const checkVal = getTagValidation(newItemSku);
                        return checkVal.isValid ? (
                          <span className="text-emerald-450 flex items-center gap-1 text-[10px] font-bold animate-pulse" id="tag-valid-badge">
                            <Check className="h-3.5 w-3.5 text-emerald-450 stroke-[3]" /> Correct Format
                          </span>
                        ) : (
                          <span className="text-rose-450 flex items-center gap-1 text-[10px] font-bold" id="tag-invalid-badge" title={checkVal.error}>
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-450 fill-rose-950/20" /> Malformed
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-slate-500 text-[9px] font-normal italic">Format: PRE/LOC/DEPT/CAT/SER</span>
                    )}
                  </div>

                  {/* Real-time explicit malformed warning details */}
                  {newItemSku && !getTagValidation(newItemSku).isValid && (
                    <div className="p-2 mb-2 bg-rose-950/60 border border-rose-800/40 text-[10px] text-rose-350 rounded-lg font-mono leading-relaxed" id="realtime-warning">
                      ⚠️ {getTagValidation(newItemSku).error}
                    </div>
                  )}

                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. AMML/HO/HR/OE/171"
                    value={newItemSku}
                    onChange={e => {
                      const uppercaseVal = e.target.value.toUpperCase();
                      setNewItemSku(uppercaseVal);
                      setNewItemBarcode(uppercaseVal.replace(/\//g, ''));
                    }}
                    className={`w-full bg-amml-surface border rounded-lg px-2.5 py-2 text-white font-mono uppercase text-xs tracking-wider focus:outline-none transition-all duration-205 ${
                      newItemSku 
                        ? (getTagValidation(newItemSku).isValid
                          ? 'border-emerald-500/80 bg-emerald-950/5 focus:border-emerald-400'
                          : 'border-rose-500/80 bg-rose-950/5 focus:border-rose-400')
                        : 'border-amml-line focus:border-amml-orange'
                    }`}
                  />
                  <span className="text-[9px] text-slate-500 mt-1 block">SLA format: PREFIX/LOC/DEPT/CAT/SER (Consumables: PREFIX/LOC/DEPT/CS)</span>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">Barcode / RFID Tag *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. AMMLHOHROE171"
                    value={newItemBarcode}
                    onChange={e => setNewItemBarcode(e.target.value)}
                    className="w-full bg-amml-surface border border-amml-line rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amml-orange"
                  />
                  <span className="text-[9px] text-slate-500 mt-1 block">Unique scan sequence or RF tag number.</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Asset Name & Specifications *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Luminous Solar Inverter Battery 10kVA"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full bg-amml-surface border border-amml-line rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amml-orange font-sans"
                />
              </div>

              {(() => {
                const isConsumable = tagCategory === 'CS' || getTagValidation(newItemSku).isConsumable;
                return (
                  <div className="grid grid-cols-4 gap-2 text-[10px]">
                    {isConsumable ? (
                      <>
                        <div>
                          <label className="block text-slate-450 mb-1 font-bold">Min alert level</label>
                          <input 
                            type="number" 
                            min={0}
                            value={newItemMinLevel}
                            onChange={e => setNewItemMinLevel(parseInt(e.target.value) || 0)}
                            className="w-full bg-amml-surface border border-amml-line rounded-lg p-2 text-white text-center focus:border-amml-orange focus:outline-none"
                          />
                          <span className="text-[8px] text-slate-500 mt-0.5 block text-center">Alert threshold</span>
                        </div>
                        <div>
                          <label className="block text-slate-450 mb-1 font-bold">Reorder Qty</label>
                          <input 
                            type="number" 
                            min={1}
                            value={newItemReorderQty}
                            onChange={e => setNewItemReorderQty(parseInt(e.target.value) || 1)}
                            className="w-full bg-amml-surface border border-amml-line rounded-lg p-2 text-white text-center focus:border-amml-orange focus:outline-none"
                          />
                          <span className="text-[8px] text-slate-500 mt-0.5 block text-center">Replenish size</span>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2 bg-[#091120] border border-slate-800/40 rounded-lg p-2 flex items-center justify-center text-center">
                        <span className="text-[9.5px] text-slate-400 font-sans leading-tight">
                          🛡️ <strong>Non-Perishable Capital Asset:</strong>
                          <span className="block text-[8px] text-slate-450 mt-0.5">Threshold alerts & reorder thresholds are disabled.</span>
                        </span>
                      </div>
                    )}
                    <div>
                      <label className="block text-slate-450 mb-1 font-bold">Lead (days)</label>
                      <input 
                        type="number" 
                        min={1}
                        value={newItemLeadTime}
                        onChange={e => setNewItemLeadTime(parseInt(e.target.value) || 1)}
                        className="w-full bg-amml-surface border border-amml-line rounded-lg p-2 text-white text-center focus:border-amml-orange focus:outline-none"
                      />
                      <span className="text-[8px] text-slate-500 mt-0.5 block text-center">Standard shipment buffer</span>
                    </div>
                    <div>
                      <label className="block text-slate-450 mb-1 font-bold">Unit Cost (₦)</label>
                      <input 
                        type="number" 
                        min={0} 
                        value={newItemUnitCost}
                        onChange={e => setNewItemUnitCost(parseInt(e.target.value) || 0)}
                        className="w-full bg-amml-surface border border-amml-line rounded-lg p-2 text-white text-center font-mono focus:border-amml-orange focus:outline-none"
                      />
                      <span className="text-[8px] text-slate-500 mt-0.5 block text-center">Standard cost</span>
                    </div>
                  </div>
                );
              })()}

              {/* Initial stock allocation layout */}
              <div className="pt-3 border-t border-amml-line">
                <h4 className="font-bold text-white uppercase text-[10px] tracking-wide mb-3 text-slate-300">
                  Initial Deployed Stock allocation Layout
                </h4>
                <div className="grid grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                  {markets.map(m => (
                    <div key={m.id} className="flex items-center justify-between gap-2 p-1.5 bg-amml-surface2 rounded-lg border border-amml-line">
                      <span className="block truncate text-slate-305 max-w-[130px] font-sans font-medium">{m.name}</span>
                      <input 
                        type="number" 
                        min={0}
                        defaultValue={0}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          setNewItemInitialStocks(prev => ({
                            ...prev,
                            [m.name]: val
                          }));
                        }}
                        className="w-16 bg-amml-surface border border-amml-line rounded p-1 text-xs text-center text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {(() => {
                const isConsumable = tagCategory === 'CS' || getTagValidation(newItemSku).isConsumable;
                const totalStock = Object.values(newItemInitialStocks).reduce((sum, q) => sum + q, 0);
                if (!isConsumable && totalStock > 1) {
                  return (
                    <div className="mt-3 p-2.5 bg-[#004b87]/15 border border-[#0064b4]/30 rounded-lg text-[9.5px] text-sky-450 font-sans leading-normal animate-pulse">
                      💡 <strong>Bulk Serialized Mode Active:</strong> Specifying {totalStock} initial units for a durable asset will automatically register <strong>{totalStock} separate assets</strong> with sequential serial numbers (from <strong>{newItemSku}</strong> onwards) with 1 unit in each corresponding market!
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex gap-2 justify-end pt-4 border-t border-amml-line select-none">
                <button 
                  type="button" 
                  onClick={() => { setAddModalOpen(false); resetAssetForm(); }}
                  className="bg-amml-surface border border-amml-line hover:bg-amml-surface3 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-[#DC6400] hover:bg-amml-orange-lt text-white text-xs font-mono font-bold px-5 py-2.5 rounded-lg cursor-pointer shadow-sm transition-colors"
                >
                  Save register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== MODAL ADJUST ASSET STOCKS ========== */}
      {adjustModalOpen && selectedAssetForAdjust && (
        <div className="fixed inset-0 bg-[#00000095] z-50 flex items-center justify-center p-4">
          <div className="bg-amml-panel border border-amml-line rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-stage-wake max-h-[85vh] overflow-y-auto w-full">
            <button 
              onClick={() => { setAdjustModalOpen(false); setSelectedAssetForAdjust(null); }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-white mb-1 uppercase tracking-wider flex items-center gap-1">
              <RefreshCw className="h-4 w-4 text-amml-orange animate-spin-30" /> Adjust Stock Layout
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono font-bold text-amml-orange">
              {selectedAssetForAdjust.sku} — {selectedAssetForAdjust.name}
            </p>

            <div className="space-y-3 font-mono text-xs max-h-[40vh] overflow-y-auto pr-1">
              {markets.map(m => {
                const currentQty = getAssetMarketStock(selectedAssetForAdjust.id, m.name);
                return (
                  <div key={m.id} className="flex items-center justify-between p-2.5 bg-amml-surface2 rounded-lg border border-amml-line hover:border-slate-600 transition-colors">
                    <div className="min-w-0 pr-2">
                      <span className="font-sans font-bold text-slate-100 block text-xs truncate uppercase">{m.name}</span>
                      <span className="block text-[9px] text-slate-450 truncate">Location: {m.location}</span>
                    </div>
                    <input 
                      id={`adj-qty-${m.name}`}
                      type="number"
                      min={0}
                      defaultValue={currentQty}
                      className="w-20 bg-amml-surface border border-amml-line rounded-lg p-1.5 text-xs text-center text-white focus:outline-none focus:border-amml-orange"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-amml-line select-none">
              <button 
                type="button" 
                onClick={() => { setAdjustModalOpen(false); setSelectedAssetForAdjust(null); }}
                className="bg-amml-surface border border-amml-line hover:bg-amml-surface3 text-white font-mono text-[11px] font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveStockAdjustment}
                className="bg-[#0064B4] hover:bg-[#00508C] text-white text-[11px] font-mono font-bold px-5 py-2 rounded-lg cursor-pointer shadow-sm transition-colors"
              >
                Commit Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL AUDIT REPORT PREVIEW ========== */}
      {reportModalOpen && (
        <div className="fixed inset-0 bg-[#000000e0] z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-amml-panel border border-amml-line rounded-2xl w-full max-w-4xl p-8 shadow-2xl relative animate-stage-wake my-8">
            <button 
              onClick={() => setReportModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer no-print"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Printable Report Document wrapper */}
            <div className="text-white font-mono p-4" id="amml-printable-report">
              
              {/* Report Header Logo Section */}
              <div className="border-b-4 border-amml-orange pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-left">
                  <h1 className="font-serif text-2xl font-bold tracking-tight text-white uppercase">Asset Ledger Audit Report</h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Abuja Markets Management Limited (AMML)</p>
                  <p className="text-[9px] text-amml-orange mt-1 font-bold">LEGACY COMPLIANCE LOGISTICS PROTOCOL SHA-256 SECURED</p>
                </div>
                <div className="text-left sm:text-right text-[11px] text-slate-400">
                  <div><strong>Ref:</strong> AMML-AST-RP-{new Date().getFullYear()}-{Math.floor(Math.random() * 9000) + 1000}</div>
                  <div><strong>Date Generated:</strong> {new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  <div><strong>Active Operator:</strong> {session?.name || 'Administrator'} [{session?.level || 'LEVEL-C'}]</div>
                </div>
              </div>

              {/* High Level Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-amml-surface2 border border-amml-line rounded-lg text-left">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider mb-1">Registered SKUs</span>
                  <span className="text-xl font-serif text-white font-extrabold">{assets.length}</span>
                </div>
                <div className="p-4 bg-amml-surface2 border border-amml-line rounded-lg text-left">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider mb-1">Total Monitored Markets</span>
                  <span className="text-xl font-serif text-white font-extrabold">{markets.length}</span>
                </div>
                <div className="p-4 bg-amml-surface2 border border-amml-line rounded-lg text-left">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider mb-1">Cumulative Unit Cost</span>
                  <span className="text-xl font-serif text-amml-orange font-extrabold">
                    ₦{(assets.reduce((acc, a) => acc + a.unitCost, 0) / 1000).toFixed(1)}k
                  </span>
                </div>
                <div className="p-4 bg-amml-surface2 border border-amml-line rounded-lg text-left">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider mb-1">Logistics Total Valuation</span>
                  <span className="text-xl font-serif text-emerald-400 font-extrabold">
                    ₦{(assets.reduce((sum, item) => sum + (item.unitCost * getAssetTotalStock(item.id)), 0) / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>

              {/* Main Ledger Asset List View */}
              <div className="mb-8 text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-2 font-serif">📋 Global Asset Ledger Inventory Allocation</h3>
                <div className="border border-amml-line rounded-xl overflow-hidden">
                  <table className="w-full text-[10px] text-left border-collapse">
                    <thead>
                      <tr className="bg-amml-surface2 border-b border-amml-line text-slate-450 font-bold">
                        <th className="p-2.5">SKU</th>
                        <th className="p-2.5">Asset Name & Tag</th>
                        <th className="p-2.5 text-center">Min Level</th>
                        <th className="p-2.5 text-center">Stock Held</th>
                        <th className="p-2.5 text-right">Unit Value</th>
                        <th className="p-2.5 text-right">Total Valuation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amml-line">
                      {assets.map(item => {
                        const totalStock = getAssetTotalStock(item.id);
                        const isCons = getTagValidation(item.sku).isConsumable;
                        const isAlert = isCons ? (totalStock < item.minLevel) : false;
                        return (
                          <tr key={item.id} className="hover:bg-amml-surface2/40">
                            <td className="p-2.5 font-bold text-white">{item.sku}</td>
                            <td className="p-2.5 font-sans font-medium text-slate-200">{item.name}</td>
                            <td className="p-2.5 text-center text-slate-400">
                              {isCons ? item.minLevel : <span className="text-slate-600">—</span>}
                            </td>
                            <td className={`p-2.5 text-center font-bold font-mono ${isAlert ? 'text-amml-orange animate-pulse' : 'text-emerald-400'}`}>
                              {totalStock} {isAlert && '(Alert-Low)'}
                            </td>
                            <td className="p-2.5 text-right text-slate-400">₦{item.unitCost.toLocaleString()}</td>
                            <td className="p-2.5 text-right text-white font-bold font-mono">₦{(item.unitCost * totalStock).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatures & Approvals Authority details */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-dashed border-slate-700">
                <div className="text-left text-[11px] text-slate-400 space-y-4">
                  <p><strong>Prepared By:</strong></p>
                  <div className="h-8 border-b border-slate-600 w-48" />
                  <p className="mt-2 text-[9px] uppercase tracking-wider font-mono">Logistics & Asset Management Desk<br/>AMML Head Office Abuja</p>
                </div>
                <div className="text-right text-[11px] text-slate-450 space-y-4 flex flex-col items-end">
                  <p className="mr-36 text-slate-400"><strong>Executive Approval Authority:</strong></p>
                  <div className="h-8 border-b border-slate-600 w-48" />
                  <p className="mt-2 text-[9px] uppercase tracking-wider mr-12 text-right font-mono">Ag. Managing Director & Chief Executive Officer<br/>ABUJA MARKETS MANAGEMENT LIMITED</p>
                </div>
              </div>

            </div>

            {/* Bottom Actions Row toolbar */}
            <div className="flex gap-2 justify-end pt-5 mt-5 border-t border-amml-line select-none no-print">
              <button 
                type="button" 
                onClick={() => setReportModalOpen(false)}
                className="bg-amml-surface border border-amml-line hover:bg-amml-surface3 text-white font-mono text-[11px] font-bold px-4 py-2 rounded-lg cursor-pointer transition-all"
              >
                Close Preview
              </button>
              <button 
                onClick={() => {
                  window.print();
                  auditLog('INVENTORY', 'Printed Report Document', 'Printed local system asset ledger report');
                }}
                className="bg-amml-blue hover:bg-amml-blue-dk text-white text-[11px] font-mono font-bold px-5 py-2 rounded-lg cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" /> Print Report Ledger
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default InventoryRouteComponent;
