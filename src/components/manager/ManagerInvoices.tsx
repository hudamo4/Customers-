import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import IramoWaxSeal from '../IramoWaxSeal';
import { 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle, 
  X, 
  Receipt, 
  Eye, 
  Share2, 
  BellRing, 
  Download,
  AlertTriangle,
  Printer,
  Sparkles,
  ShoppingBag,
  Image as ImageIcon,
  PlusCircle,
  MinusCircle,
  Truck,
  CreditCard,
  User,
  Phone,
  MapPin,
  FileText,
  Copy
} from 'lucide-react';

const RibbonBow = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 60" 
    fill="currentColor" 
    className={className}
  >
    <path d="M 50 30 C 35 12, 18 15, 18 26 C 18 38, 35 34, 50 30" />
    <path d="M 50 30 C 65 12, 82 15, 82 26 C 82 38, 65 34, 50 30" />
    <path d="M 46 31 C 40 42, 30 52, 24 57 C 31 52, 41 43, 46 34" />
    <path d="M 53 31 C 59 42, 69 52, 75 57 C 68 52, 58 43, 53 34" />
    <ellipse cx="50" cy="30" rx="7" ry="6" />
  </svg>
);

const PRESET_PRODUCTS = [
  {
    name: 'أحمر شفاه كريمي مطفأ - هدى بيوتي',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200',
    category: 'مكياج'
  },
  {
    name: 'عطر ديور جادور - أو دو بارفيوم فاخر',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200',
    category: 'عطور'
  },
  {
    name: 'حقيبة يد شانيل كلاسيكية جلد فاخر',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200',
    category: 'حقائب'
  },
  {
    name: 'سيروم حمض الهيالورونيك المرطب - لوريال',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=200',
    category: 'عناية بالبشرة'
  },
  {
    name: 'لوحة ظلال عيون مطفية ولامعة - ريفلوشن',
    price: 20000,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=200',
    category: 'مكياج'
  },
  {
    name: 'فستان تركي طويل مخملي راقي',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=200',
    category: 'ملابس'
  }
];

export default function ManagerInvoices() {
  const { invoices, addInvoice, deleteInvoice, clearAllInvoices, customizations } = useApp();
  
  const presetProductsToUse = customizations?.presetProducts && customizations.presetProducts.length > 0
    ? customizations.presetProducts
    : PRESET_PRODUCTS;

  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const handleClearAllInvoices = async () => {
    if (confirm('⚠️ تحذير خطير: هل أنتِ متأكدة فعلاً من رغبتكِ في مسح كافة الفواتير من التطبيق وقاعدة البيانات بشكل نهائي ودون رجعة؟')) {
      if (confirm('تأكيد أخير: لن تتمكني من استعادة أي فاتورة بعد المسح. هل تريدين الاستمرار؟')) {
        try {
          await clearAllInvoices();
          alert('تم مسح كافة الفواتير بنجاح 🌸');
        } catch (err) {
          console.error("Failed to clear all invoices:", err);
          alert('حدث خطأ أثناء مسح الفواتير.');
        }
      }
    }
  };
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  // Create state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('local_user');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerCity, setCustomerCity] = useState<string>('بغداد');
  const [newStore, setNewStore] = useState<string>('Trendyol');
  const [newOrderId, setNewOrderId] = useState<string>('');
  const [newStatus, setNewStatus] = useState<'Paid' | 'Pending'>('Pending');
  const [shippingCost, setShippingCost] = useState<number>(5000);
  const [items, setItems] = useState<{ name: string; quantity: string; price: number; image: string }[]>([
    { name: '', quantity: '١ قطعة', price: 0, image: '' }
  ]);
  const [showPresetGalleryForItemIndex, setShowPresetGalleryForItemIndex] = useState<number | null>(null);

  // Print voucher preview states
  const [selectedInvoiceForPrinting, setSelectedInvoiceForPrinting] = useState<Invoice | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);

  // Reminded state (visual feedback only)
  const [remindedIds, setRemindedIds] = useState<string[]>([]);

  // Delete invoice target
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Lock body scroll when modals are active
  useEffect(() => {
    if (showAddModal || deleteTargetId || selectedInvoiceForPrinting) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddModal, deleteTargetId, selectedInvoiceForPrinting]);

  useEffect(() => {
    if (showAddModal) {
      const prefilled = (window as any).prefilledCustomerForAction;
      if (prefilled) {
        setCustomerName(prefilled.name || '');
        setCustomerPhone(prefilled.phone || '');
        setCustomerCity(prefilled.city || 'بغداد');
        setSelectedUserId(prefilled.uid || 'local_user');
        delete (window as any).prefilledCustomerForAction;
      } else {
        setSelectedUserId('local_user');
      }
      if (!newOrderId) {
        setNewOrderId('TR-' + Math.floor(100000 + Math.random() * 900000));
      }
    }
  }, [showAddModal]);

  // Sum calculations
  const itemsSum = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const invoiceTotalSum = itemsSum + shippingCost;

  // Filter list
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (inv.customerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'Paid') return matchesSearch && inv.status === 'Paid';
    if (selectedFilter === 'Pending') return matchesSearch && inv.status === 'Pending';
    return matchesSearch;
  });

  const handleAutoFill = () => {
    setCustomerName('هدى العبيدي');
    setCustomerPhone('07712345678');
    setCustomerCity('بغداد');
    setNewStore('Trendyol Beauty');
    setNewOrderId('TR-' + Math.floor(100000 + Math.random() * 900000));
    setNewStatus('Pending');
    setShippingCost(5000);
    setItems([
      {
        name: 'عطر ديور جادور - أو دو بارفيوم فاخر',
        price: 45000,
        quantity: '١ قطعة',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200'
      },
      {
        name: 'أحمر شفاه كريمي مطفأ - هدى بيوتي',
        price: 15000,
        quantity: '١ قطعة',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200'
      },
      {
        name: 'لوحة ظلال عيون مطفية ولامعة - ريفلوشن',
        price: 20000,
        quantity: '١ قطعة',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=200'
      }
    ]);
  };

  const handleAddItemRow = () => {
    setItems([...items, { name: '', quantity: '١ قطعة', price: 0, image: '' }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    } else {
      setItems([{ name: '', quantity: '١ قطعة', price: 0, image: '' }]);
    }
  };

  const handleUpdateItemValue = (index: number, key: 'name' | 'quantity' | 'price' | 'image', value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    setItems(updated);
  };

  const handleSelectPreset = (index: number, preset: any) => {
    const updated = [...items];
    updated[index] = {
      name: preset.name,
      price: preset.price,
      quantity: '١ قطعة',
      image: preset.image || ''
    };
    setItems(updated);
    setShowPresetGalleryForItemIndex(null);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const generatedInvId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvObj: Invoice = {
      id: `local_inv_${Date.now()}`,
      userId: selectedUserId,
      invoiceId: generatedInvId,
      store: newStore,
      order_id: newOrderId,
      date: new Date().toISOString().split('T')[0],
      amount: invoiceTotalSum.toLocaleString() + ' د.ع',
      status: newStatus,
      shippingStatus: newStatus === 'Paid' ? 'تم تأكيد الدفع وجاري المعالجة' : 'بانتظار تسديد الرسوم المترتبة',
      itemsList: items.map(item => ({
        name: item.name || 'منتج أنيق',
        quantity: item.quantity || '١ قطعة',
        price: item.price.toLocaleString() + ' د.ع',
        image: item.image || undefined
      })),
      customerName: customerName || 'الزبونة الكريمة',
      customerPhone: customerPhone || '07700000000',
      customerCity: customerCity || 'بغداد',
      shippingCost: shippingCost.toLocaleString() + ' د.ع',
      itemsTotal: itemsSum.toLocaleString() + ' د.ع'
    };

    await addInvoice(newInvObj);
    setShowAddModal(false);
    
    // Auto-select for instant printing!
    setSelectedInvoiceForPrinting(newInvObj);

    // Reset states
    setCustomerName('');
    setCustomerPhone('');
    setCustomerCity('بغداد');
    setNewStore('Trendyol');
    setNewOrderId('');
    setNewStatus('Pending');
    setItems([{ name: '', quantity: '١ قطعة', price: 0, image: '' }]);
  };

  const handleDeleteInvoice = async (id: string) => {
    await deleteInvoice(id);
    setDeleteTargetId(null);
  };

  const handleSendReminder = (invoiceId: string) => {
    if (!remindedIds.includes(invoiceId)) {
      setRemindedIds([...remindedIds, invoiceId]);
      alert('🔔 تم إرسال إشعار تذكير بالدفع لهاتف العميل بنجاح!');
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('7144102758');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="manager-invoices">
      
      {/* Filtering and Adding Panel */}
      <div className="bg-white/95 backdrop-blur-xl border border-pink-100 p-5 rounded-3xl shadow-sm space-y-4">
        <div className="flex justify-between items-center" dir="rtl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-pink-700" />
            </div>
            <h3 className="font-black text-sm text-gray-800">إدارة الفواتير والتحصيل</h3>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleClearAllInvoices}
              className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3.5 py-2 rounded-xl text-[10px] font-black hover:bg-red-100 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>مسح كل الفواتير 🗑️</span>
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-pink-700 to-rose-600 text-white px-4 py-2.5 rounded-2xl text-[11px] font-black hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-md shadow-pink-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إنشاء فاتورة جديدة 🛍️</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input 
            type="text"
            placeholder="البحث برقم الفاتورة، المتجر، الطلب، أو اسم العميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-3 pr-10 rounded-2xl text-right text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-300 transition-all font-bold shadow-inner"
            dir="rtl"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filters bar */}
        <div className="flex gap-2 justify-end" dir="rtl">
          <button 
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
              selectedFilter === 'all' 
                ? 'bg-pink-700 text-white shadow-sm' 
                : 'bg-gray-50 text-gray-400 hover:text-gray-600'
            }`}
          >
            الكل ({invoices.length})
          </button>
          <button 
            onClick={() => setSelectedFilter('Paid')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
              selectedFilter === 'Paid' 
                ? 'bg-pink-700 text-white shadow-sm' 
                : 'bg-gray-50 text-gray-400 hover:text-gray-600'
            }`}
          >
            مدفوعة ({invoices.filter(i => i.status === 'Paid').length})
          </button>
          <button 
            onClick={() => setSelectedFilter('Pending')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
              selectedFilter === 'Pending' 
                ? 'bg-pink-700 text-white shadow-sm' 
                : 'bg-gray-50 text-gray-400 hover:text-gray-600'
            }`}
          >
            قيد الانتظار ({invoices.filter(i => i.status === 'Pending').length})
          </button>
        </div>
      </div>

      {/* Invoice Cards List */}
      <div className="space-y-4">
        {filteredInvoices.map((inv) => (
          <div 
            key={inv.id}
            className="bg-white border border-pink-100 p-5 rounded-3xl shadow-sm space-y-4 hover:border-pink-300 transition-all text-right"
            dir="rtl"
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-black text-xs">
                  {inv.store[0]}
                </div>
                <div>
                  <h4 className="font-black text-gray-800 text-sm">{inv.store} Store</h4>
                  <p className="text-[10px] text-gray-400 font-bold">#{inv.invoiceId} • {inv.date}</p>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`text-[10px] border px-2.5 py-1 rounded-full font-black ${
                inv.status === 'Paid'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-100 animate-pulse'
              }`}>
                {inv.status === 'Paid' ? 'مدفوعة' : 'قيد الانتظار'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-y border-pink-50/50">
              <div>
                <span className="text-[10px] text-gray-400 block font-bold">العميل</span>
                <span className="text-xs font-black text-pink-950">{inv.customerName || 'زبونة مجهولة'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block font-bold">المبلغ الكلي</span>
                <span className="text-sm font-black text-pink-700">{inv.amount}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block font-bold">الرمز</span>
                <span className="text-xs font-mono font-bold text-gray-600">{inv.order_id}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedInvoiceForPrinting(inv)}
                className="flex-1 bg-pink-700 hover:bg-pink-800 text-white py-2.5 rounded-2xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>عرض وطباعة الوصل 🖨️</span>
              </button>

              {inv.status === 'Pending' && (
                <button 
                  onClick={() => handleSendReminder(inv.id || '')}
                  disabled={remindedIds.includes(inv.id || '')}
                  className={`px-4 py-2.5 rounded-2xl text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    remindedIds.includes(inv.id || '')
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-amber-50 text-amber-800 border border-amber-100 hover:bg-amber-100'
                  }`}
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>{remindedIds.includes(inv.id || '') ? 'تم التذكير' : 'تذكير'}</span>
                </button>
              )}

              <button 
                onClick={() => setDeleteTargetId(inv.id || null)}
                className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl flex items-center justify-center transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-pink-50">
            <p className="text-xs text-gray-400 font-bold">لا توجد فواتير تطابق خيارات التصفية.</p>
          </div>
        )}
      </div>

      {/* Add Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddModal(false)}>
          <div 
            className="fixed z-[99999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-full max-w-lg rounded-[36px] p-6 shadow-2xl space-y-4 text-right border border-pink-100 max-h-[90vh] overflow-y-auto scrollbar-thin" 
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-pink-50">
              <div className="flex items-center gap-2">
                <div className="bg-pink-100 p-1.5 rounded-xl text-pink-700">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="font-black text-gray-800 text-sm">إنشاء فاتورة تفاعلية جديدة للزبونة</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Smart Auto-Fill Button */}
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100/50 p-3.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-right">
                <Sparkles className="w-4 h-4 text-pink-600 shrink-0" />
                <div>
                  <span className="text-[11px] font-black text-pink-900 block">التعبئة التلقائية الذكية 🔮</span>
                  <span className="text-[9px] text-gray-400 block font-bold">اضغطي لتعبئة الفاتورة ببيانات ومستحضرات تجميل للتجربة الفورية!</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAutoFill}
                className="bg-white hover:bg-pink-100 text-pink-700 font-black text-[10px] px-3 py-1.5 rounded-xl border border-pink-200 transition-all cursor-pointer shadow-sm"
              >
                تعبئة البيانات تلقائياً ⚡
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              {/* Section: Customer info */}
              <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100 space-y-3">
                <h4 className="text-[11px] font-black text-pink-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>معلومات الزبونة والشحن</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">اسم الزبونة</label>
                    <input 
                      type="text"
                      required
                      placeholder="مثال: آية الموسوي"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-pink-300 text-xs px-3 py-2 rounded-xl font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">رقم الهاتف</label>
                    <input 
                      type="text"
                      required
                      placeholder="0770XXXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-pink-300 text-xs px-3 py-2 rounded-xl font-mono text-right focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">المحافظة</label>
                    <select
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-pink-300 text-xs px-3 py-2 rounded-xl font-bold focus:outline-none"
                    >
                      {(customizations?.iraqRates || []).length > 0 ? (
                        customizations.iraqRates?.map((item, idx) => (
                          <option key={idx} value={item.province}>{item.province}</option>
                        ))
                      ) : (
                        <>
                          <option value="بغداد">بغداد</option>
                          <option value="البصرة">البصرة</option>
                          <option value="نينوى">نينوى</option>
                          <option value="أربيل">أربيل</option>
                          <option value="بابل">بابل</option>
                          <option value="كربلاء">كربلاء</option>
                          <option value="النجف">النجف</option>
                          <option value="ذي قار">ذي قار</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section: General Invoice Details */}
              <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100 space-y-3">
                <h4 className="text-[11px] font-black text-pink-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>تفاصيل الفاتورة والمصدر</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">المتجر أو المصدر</label>
                    <input 
                      type="text"
                      required
                      placeholder="مثال: Shein, Trendyol"
                      value={newStore}
                      onChange={(e) => setNewStore(e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-pink-300 text-xs px-3 py-2 rounded-xl font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">رمز الطلب</label>
                    <input 
                      type="text"
                      required
                      placeholder="مثال: TR-99231"
                      value={newOrderId}
                      onChange={(e) => setNewOrderId(e.target.value)}
                      className="w-full bg-white border border-gray-200 focus:border-pink-300 text-xs px-3 py-2 rounded-xl font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">أجور شحن العراق</label>
                    <input 
                      type="number"
                      required
                      placeholder="5000"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-gray-200 focus:border-pink-300 text-xs px-3 py-2 rounded-xl font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Dynamic Products Creator */}
              <div className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100 space-y-3">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center gap-1 text-pink-700 hover:text-pink-800 text-[10px] font-black"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>إضافة منتج آخر للطلب</span>
                  </button>
                  <h4 className="text-[11px] font-black text-pink-700 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>المنتجات المرفقة بالفاتورة</span>
                  </h4>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {items.map((item, index) => (
                    <div key={index} className="bg-white border border-gray-100 p-3 rounded-2xl relative space-y-2">
                      <div className="absolute top-2.5 left-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(index)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                          title="حذف هذا المنتج"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        {/* Name */}
                        <div className="sm:col-span-5">
                          <label className="block text-[9px] font-bold text-gray-400 mb-0.5">اسم المنتج</label>
                          <input 
                            type="text"
                            required
                            placeholder="مثال: فستان تركي كاجوال"
                            value={item.name}
                            onChange={(e) => handleUpdateItemValue(index, 'name', e.target.value)}
                            className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-2.5 py-1.5 rounded-lg font-bold focus:outline-none"
                          />
                        </div>

                        {/* Price */}
                        <div className="sm:col-span-3">
                          <label className="block text-[9px] font-bold text-gray-400 mb-0.5">السعر (د.ع)</label>
                          <input 
                            type="number"
                            required
                            placeholder="15000"
                            value={item.price || ''}
                            onChange={(e) => handleUpdateItemValue(index, 'price', Number(e.target.value) || 0)}
                            className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-2.5 py-1.5 rounded-lg font-bold focus:outline-none"
                          />
                        </div>

                        {/* Quantity */}
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-bold text-gray-400 mb-0.5">الكمية</label>
                          <input 
                            type="text"
                            required
                            placeholder="١ قطعة"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemValue(index, 'quantity', e.target.value)}
                            className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-2.5 py-1.5 rounded-lg font-bold focus:outline-none text-center"
                          />
                        </div>

                        {/* Image URL / presets */}
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] font-bold text-gray-400 mb-0.5">صورة المنتج</label>
                          <button
                            type="button"
                            onClick={() => setShowPresetGalleryForItemIndex(showPresetGalleryForItemIndex === index ? null : index)}
                            className="w-full bg-pink-50 hover:bg-pink-100 text-pink-700 text-[9px] font-black py-1.5 rounded-lg flex items-center justify-center gap-1 border border-pink-100 cursor-pointer"
                          >
                            {item.image ? (
                              <>
                                <img src={item.image} alt="product" className="w-4 h-4 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                                <span className="truncate">تم الإرفاق</span>
                              </>
                            ) : (
                              <>
                                <ImageIcon className="w-3.5 h-3.5 text-pink-500" />
                                <span>إرفاق 📸</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Floating Preset Gallery Selector */}
                      {showPresetGalleryForItemIndex === index && (
                        <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-2.5 mt-2 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-pink-800">اختاري منتجاً من المعرض الجاهز للإرفاق الفوري:</span>
                            <button
                              type="button"
                              onClick={() => setShowPresetGalleryForItemIndex(null)}
                              className="text-pink-900 font-bold text-[8px]"
                            >
                              إغلاق المعرض ✕
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-1.5">
                            {presetProductsToUse.map((preset, pIdx) => (
                              <button
                                key={preset.name + '_' + pIdx}
                                type="button"
                                onClick={() => handleSelectPreset(index, preset)}
                                className="bg-white hover:border-pink-300 p-1.5 rounded-lg border border-gray-100 flex items-center gap-1.5 text-right transition-all cursor-pointer"
                              >
                                <img src={preset.image} alt={preset.name} className="w-7 h-7 rounded object-cover shrink-0" referrerPolicy="no-referrer" />
                                <div className="min-w-0 flex-1">
                                  <span className="text-[8px] font-black text-gray-700 block truncate leading-tight">{preset.name}</span>
                                  <span className="text-[7.5px] text-pink-600 block font-bold leading-none">{(preset.price).toLocaleString()} د.ع</span>
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* Custom URL Input Fallback */}
                          <div className="pt-1">
                            <label className="block text-[8px] font-bold text-gray-500 mb-0.5">أو الصقي رابط صورة مخصص (URL):</label>
                            <input 
                              type="text"
                              placeholder="https://..."
                              value={item.image}
                              onChange={(e) => handleUpdateItemValue(index, 'image', e.target.value)}
                              className="w-full bg-white border border-gray-200 text-[9px] px-2 py-1 rounded font-mono focus:outline-none focus:border-pink-300"
                            />
                          </div>

                          {/* Custom File Upload Option */}
                          <div className="pt-1 border-t border-dashed border-pink-100/50 mt-1.5">
                            <label className="block text-[8px] font-bold text-gray-500 mb-0.5">أو ارفعي صورة مخصصة من جهازكِ مباشرة:</label>
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    handleUpdateItemValue(index, 'image', 'جاري الرفع... ⏳');
                                    const { uploadFileToStorage } = await import('../../lib/firebase');
                                    const url = await uploadFileToStorage(file, `invoices/${Date.now()}`);
                                    handleUpdateItemValue(index, 'image', url);
                                  } catch (err) {
                                    console.error("Custom image upload failed:", err);
                                    handleUpdateItemValue(index, 'image', '');
                                  }
                                }
                              }}
                              className="block w-full text-[8px] text-gray-500 file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[7.5px] file:font-semibold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200 cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Total */}
              <div className="bg-pink-950 text-white p-4 rounded-3xl space-y-3 border-2 border-pink-200/20">
                <div className="flex justify-between items-center text-xs">
                  <div className="text-right">
                    <span className="text-[10px] text-pink-200 block font-bold">المجموع الفرعي للمنتجات:</span>
                    <span className="font-extrabold text-pink-100">{itemsSum.toLocaleString()} د.ع</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-pink-200 block font-bold">أجور الشحن:</span>
                    <span className="font-extrabold text-pink-100">+{shippingCost.toLocaleString()} د.ع</span>
                  </div>
                  <div className="text-right border-r border-pink-800/60 pr-3">
                    <span className="text-[10px] text-pink-300 block font-black">المبلغ الكلي المستحق:</span>
                    <span className="font-black text-sm text-yellow-300">{invoiceTotalSum.toLocaleString()} د.ع</span>
                  </div>
                </div>

                <div className="border-t border-pink-900 pt-2 flex justify-between items-center">
                  <span className="text-[10px] text-pink-200 font-bold">حالة السداد الأولية للطلب:</span>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setNewStatus('Pending')}
                      className={`py-1 px-3 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                        newStatus === 'Pending'
                          ? 'bg-amber-100 text-amber-900 font-black ring-2 ring-amber-400'
                          : 'bg-pink-900/40 text-pink-200'
                      }`}
                    >
                      بانتظار الدفع
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewStatus('Paid')}
                      className={`py-1 px-3 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                        newStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-900 font-black ring-2 ring-emerald-400'
                          : 'bg-pink-900/40 text-pink-200'
                      }`}
                    >
                      تم الدفع مسبقاً
                    </button>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-pink-700 to-rose-600 hover:from-pink-800 hover:to-rose-700 text-white font-black text-xs py-3.5 rounded-2xl active:scale-95 transition-all cursor-pointer shadow-lg shadow-pink-500/10 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>إصدار وحفظ الفاتورة ثم الطباعة الفورية 🖨️</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Traditional Iraqi printable carbon-copy voucher modal */}
      {selectedInvoiceForPrinting && (() => {
        const inv = selectedInvoiceForPrinting;
        const dateParts = inv.date.split('-');
        const yyyy = dateParts[0] || '----';
        const mm = dateParts[1] || '--';
        const dd = dateParts[2] || '--';
        const shipping = inv.shippingCost ? parseInt(inv.shippingCost.replace(/[^\d]/g, ''), 10) : 5000;
        const total = inv.amount ? parseInt(inv.amount.replace(/[^\d]/g, ''), 10) : 0;
        const itemsTotal = inv.itemsTotal || (total - shipping).toLocaleString() + ' د.ع';

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex flex-col items-center justify-start md:justify-center p-4 py-8 md:py-12 overflow-y-auto animate-fade-in" dir="rtl">
            
            {/* Action controls for the voucher */}
            <div className="w-full max-w-[480px] flex items-center justify-between mb-3 no-print bg-white/95 backdrop-blur p-3 rounded-2xl shadow-xl border border-pink-100">
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-pink-700 text-white rounded-xl text-xs font-black shadow-md hover:bg-pink-800 transition-all active:scale-95 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الوصل لتقديمه للزبونة 🖨️</span>
                </button>
                <button
                  onClick={handleCopyAccount}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 cursor-pointer ${
                    copiedAccount 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedAccount ? 'نسخ الحساب! ✅' : 'نسخ حساب التحويل'}</span>
                </button>
              </div>
              <button
                onClick={() => setSelectedInvoiceForPrinting(null)}
                className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-all active:scale-90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Print style injection */}
            <style>{`
              @media print {
                /* Hide everything in the app except the printable element */
                body * {
                  visibility: hidden !important;
                }
                #printable-voucher-manager, #printable-voucher-manager * {
                  visibility: visible !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                #printable-voucher-manager {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  right: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  border: none !important;
                  box-shadow: none !important;
                  margin: 0 !important;
                  padding: 10px !important;
                  background-color: white !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            {/* The actual Voucher sheet */}
            <div 
              id="printable-voucher-manager" 
              className="relative max-w-[480px] w-full bg-white border-[8px] border-[#FADADD] rounded-[40px] shadow-2xl p-6 overflow-hidden text-[#5A4A4A] select-none"
              style={{ fontFamily: 'Tajawal, sans-serif' }}
            >
              {/* Inner thin border */}
              <div className="absolute inset-2 border-2 border-[#FADADD] rounded-[32px] pointer-events-none z-0"></div>

              {/* Watermarks */}
              <img 
                alt="Mascot Watermark" 
                className="absolute opacity-[0.06] pointer-events-none z-0 top-[22%] left-6 w-20 object-contain h-20"
                src="https://lh3.googleusercontent.com/aida/AP1WRLs7xYMw1dlJILjhZ2VzHUgTES3bYmOtS532eeDn9JpDom3Gp-MaPoVhT_e495zabXi9PhvxGhgg_DGSwGWwf9dmXp5ZUWaJm0RCNd8GbCsm6Pfsr0iJJMO0aAxy5MOcRhILsJttChJdkmTm_mZbX5E5mSnfAvK48H_feUdzK0meAC_w_y8FpVIQyOMw7BefhhUleQ-yNPc9mOamo6Uhxfvs0PQtY8Tp68F3pQbyGpw3MPMMO_Rkhd2fSw"
                referrerPolicy="no-referrer"
              />
              <img 
                alt="Mascot Watermark" 
                className="absolute opacity-[0.06] pointer-events-none z-0 bottom-[22%] right-6 w-20 object-contain h-20"
                src="https://lh3.googleusercontent.com/aida/AP1WRLs7xYMw1dlJILjhZ2VzHUgTES3bYmOtS532eeDn9JpDom3Gp-MaPoVhT_e495zabXi9PhvxGhgg_DGSwGWwf9dmXp5ZUWaJm0RCNd8GbCsm6Pfsr0iJJMO0aAxy5MOcRhILsJttChJdkmTm_mZbX5E5mSnfAvK48H_feUdzK0meAC_w_y8FpVIQyOMw7BefhhUleQ-yNPc9mOamo6Uhxfvs0PQtY8Tp68F3pQbyGpw3MPMMO_Rkhd2fSw"
                referrerPolicy="no-referrer"
              />

              {/* Main content wrapper */}
              <div className="relative z-10 space-y-5">
                <header className="text-center pt-2">
                  <div className="text-center">
                    <RibbonBow className="w-16 h-10 text-[#EAA8AC] mx-auto mb-1" />
                    <div className="text-2xl font-serif text-[#C58C8C] font-bold tracking-[0.2em] select-none text-center">IRAMO</div>
                    <div className="text-[9px] font-sans tracking-[0.3em] text-[#C58C8C] font-bold select-none text-center mt-0.5">STORE</div>
                    <div className="text-[#EAA8AC] text-xs my-1">❤</div>
                  </div>
                  <h1 className="text-xl font-black text-[#C58C8C] mt-2 font-serif italic">وصل تسليم واستلام طلبية</h1>
                  
                  {/* Date */}
                  <div className="mt-2.5 flex justify-center items-center gap-2">
                    <div className="bg-[#FADADD] p-1.5 rounded-lg text-[#C58C8C]">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-[#5A4A4A]">التاريخ:</span>
                    <div className="flex gap-1.5 items-center font-mono text-xs">
                      <span className="border-b-2 border-dotted border-[#C58C8C] w-10 text-center pb-0.5">{dd}</span>
                      <span className="text-[#C58C8C]">/</span>
                      <span className="border-b-2 border-dotted border-[#C58C8C] w-10 text-center pb-0.5">{mm}</span>
                      <span className="text-[#C58C8C]">/</span>
                      <span className="border-b-2 border-dotted border-[#C58C8C] w-14 text-center pb-0.5">{yyyy}</span>
                    </div>
                  </div>
                </header>

                {/* Customer Info Box */}
                <section className="bg-[#FFF9F9] border border-[#F4D7D7] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center">
                    <div className="bg-white p-1 rounded-full border border-[#FADADD] ml-2">
                      <User className="h-3.5 w-3.5 text-[#C58C8C]" />
                    </div>
                    <span className="font-bold text-xs min-w-[70px] text-gray-700">اسم العميل:</span>
                    <span className="font-extrabold text-xs px-2 text-pink-900">{inv.customerName || 'الزبونة الكريمة'}</span>
                    <div className="flex-grow border-b-2 border-dotted border-[#C58C8C] h-3"></div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-white p-1 rounded-full border border-[#FADADD] ml-2">
                      <Phone className="h-3.5 w-3.5 text-[#C58C8C]" />
                    </div>
                    <span className="font-bold text-xs min-w-[70px] text-gray-700">رقم الهاتف:</span>
                    <span className="font-extrabold text-xs px-2 font-mono text-pink-900">{inv.customerPhone || '07700000000'}</span>
                    <div className="flex-grow border-b-2 border-dotted border-[#C58C8C] h-3"></div>
                  </div>

                  <div className="flex items-center">
                    <div className="bg-white p-1 rounded-full border border-[#FADADD] ml-2">
                      <MapPin className="h-3.5 w-3.5 text-[#C58C8C]" />
                    </div>
                    <span className="font-bold text-xs min-w-[70px] text-gray-700">المحافظة:</span>
                    <span className="font-extrabold text-xs px-2 text-pink-900">{inv.customerCity || 'بغداد'}</span>
                    <div className="flex-grow border-b-2 border-dotted border-[#C58C8C] h-3"></div>
                  </div>
                </section>

                {/* Items and Financial details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Items Box */}
                  <section className="bg-white border-2 border-[#FADADD] rounded-2xl p-4 relative pt-6">
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FADADD] px-3 py-1 rounded-full border border-white flex items-center justify-center gap-1 shadow-sm text-xs text-[#C58C8C]">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span className="font-extrabold text-[10px]">تفاصيل الطلب</span>
                    </div>

                    <div className="space-y-4 pt-2">
                      {inv.itemsList && inv.itemsList.length > 0 ? (
                        inv.itemsList.map((item, index) => (
                          <div key={index} className="relative border border-[#FADADD] p-2.5 rounded-xl bg-[#FFF9F9]/40 text-right flex gap-3 items-center justify-between">
                            <span className="absolute -right-2.5 -top-2.5 bg-[#C58C8C] text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold">
                              {index + 1}
                            </span>
                            <div className="flex-grow min-w-0 pr-1">
                              <div className="text-[10px] font-black text-pink-950 truncate max-w-[130px] text-right">
                                {item.name}
                              </div>
                              <div className="flex justify-between items-center text-[8px] font-bold text-[#C58C8C] mt-1 pt-1 border-t border-dotted border-[#FADADD]">
                                <span>الكمية: {item.quantity}</span>
                                <span>السعر: {item.price}</span>
                              </div>
                            </div>
                            {item.image && (
                              <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#FADADD] bg-white shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="relative border border-[#FADADD] p-2.5 rounded-xl bg-[#FFF9F9]/40 text-right">
                          <span className="absolute -right-2.5 -top-2.5 bg-[#C58C8C] text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold">1</span>
                          <div className="text-[11px] font-extrabold text-pink-950 truncate max-w-[150px] text-right">
                            طلب منتجات من متجر {inv.store}
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-bold text-[#C58C8C] mt-1.5 pt-1.5 border-t border-dotted border-[#FADADD]">
                            <span>الكمية: ١ طرد</span>
                            <span>السعر: {itemsTotal}</span>
                          </div>
                        </div>
                      )}

                      {/* Carbon copy empty padding rows */}
                      {Array.from({ length: Math.max(0, 3 - (inv.itemsList?.length || 1)) }).map((_, i) => {
                        const rowNum = (inv.itemsList?.length || 1) + i + 1;
                        return (
                          <div key={`empty-${i}`} className="relative border border-[#FADADD]/30 p-2.5 rounded-xl opacity-40 text-right">
                            <span className="absolute -right-2.5 -top-2.5 bg-[#C58C8C]/50 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold">
                              {rowNum}
                            </span>
                            <div className="text-[11px] font-bold text-gray-300">...................................</div>
                            <div className="flex justify-between items-center text-[9px] font-bold text-[#C58C8C]/30 mt-1.5">
                              <span>الكمية: ..........</span>
                              <span>السعر: .......... د.ع</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Summary and Seal Box */}
                  <section className="bg-[#FFF9F9] border border-[#F4D7D7] rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#C58C8C]" />
                          <span>مجموع المنتجات:</span>
                        </div>
                        <span className="font-extrabold text-gray-700">{itemsTotal}</span>
                      </div>

                      <div className="flex justify-between items-center border-t border-[#F4D7D7]/60 pt-2">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <Truck className="w-3.5 h-3.5 text-[#C58C8C]" />
                          <span>أجور الشحن:</span>
                        </div>
                        <span className="font-extrabold text-gray-700">{inv.shippingCost || '5,000 د.ع'}</span>
                      </div>

                      <div className="flex justify-between items-center border-t border-[#F4D7D7]/60 pt-2">
                        <div className="flex items-center gap-1.5 text-gray-500">
                          <CreditCard className="w-3.5 h-3.5 text-[#C58C8C]" />
                          <span>تفاصيل وحالة الدفع:</span>
                        </div>
                        <span className={`font-black text-[9px] px-1.5 py-0.5 rounded ${
                          inv.status === 'Paid' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {inv.status === 'Paid' ? 'تم الدفع (MasterCard)' : 'بانتظار الدفع (Zain Cash)'}
                        </span>
                      </div>
                    </div>

                    {/* Styled Grand Total Box */}
                    <div className="bg-[#C58C8C] text-white p-3 rounded-xl text-center space-y-0.5 shadow-md">
                      <span className="text-[9px] font-bold text-pink-100 block uppercase tracking-wider">المجموع الصافي المستحق الدفع</span>
                      <span className="text-base font-black text-white block">{inv.amount}</span>
                    </div>
                  </section>
                </div>

                {/* Iraqi Stamp Seal & Signatures */}
                <footer className="pt-3 border-t border-dashed border-[#FADADD] flex justify-between items-end relative min-h-[140px]">
                  <div className="text-right pb-4">
                    <span className="text-[10px] text-gray-400 block font-bold">توقيع المستلم:</span>
                    <div className="w-24 border-b border-[#C58C8C] h-6 border-dotted"></div>
                  </div>
                  
                  {/* Styled column: Stamp on top, signature below */}
                  <div className="flex flex-col items-center gap-2 select-none relative text-center pb-2">
                    <span className="text-[10px] text-gray-400 block font-bold">إدارة IRAMO:</span>
                    
                    {/* Pink Post Seal Stamp (Clean and inline!) */}
                    <div className="w-20 h-20 rounded-full border-4 border-double border-pink-700/40 flex flex-col items-center justify-center rotate-[8deg] opacity-90 scale-95 select-none pointer-events-none bg-pink-50/10">
                      <span className="text-[7px] font-black text-pink-700 leading-none">مكتب إيرامو للشحن</span>
                      <span className="text-[5.5px] text-pink-600 font-bold leading-none mt-0.5">تأكيد التدقيق المالي</span>
                      <span className="text-[8px] text-pink-700 font-extrabold leading-none mt-0.5">✓ APPROVED</span>
                      <span className="text-[6px] text-pink-600/60 leading-none mt-0.5">2026 BAGHDAD</span>
                    </div>

                    {/* Signature block directly below the stamp */}
                    <div className="relative pt-1 flex flex-col items-center px-4">
                      <span className="font-signature-ar text-[11px] font-bold text-[#7D5558] tracking-wide block leading-none select-none relative z-10">
                        المحللة هدى محمد
                      </span>
                      <span className="font-signature text-base text-pink-700/90 block leading-none mt-1 select-none font-medium relative z-10">
                        AN.Huda Mohammed
                      </span>
                      <svg className="w-24 h-2 text-pink-600/30 mt-1" viewBox="0 0 100 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 5 C 20 8, 50 1, 98 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M15 7 C 40 9, 70 5, 90 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </footer>
              </div>
            </div>

            {/* Print trigger helper alert info */}
            <p className="text-[10px] text-pink-200 mt-4 font-bold no-print text-center leading-relaxed max-w-xs">
              💡 اضغطي على زر الطباعة لفتح نافذة الطابعة وحفظ الفاتورة كملف PDF لإرسالها للعميلة عبر الواتساب!
            </p>
          </div>
        );
      })()}

      {/* Delete Invoice Confirmation Alert */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteTargetId(null)}>
          <div 
            className="fixed z-[99999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl text-center space-y-4 border border-red-50 max-h-[90vh] overflow-y-auto" 
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-gray-800 text-sm">حذف الفاتورة نهائياً؟</h4>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed font-bold">
                تأكيد حذف الفاتورة سيزيلها بالكامل من ملفات الإدارة والعميلة.
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleDeleteInvoice(deleteTargetId)}
                className="flex-1 bg-red-600 text-white text-xs font-black py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                نعم، احذف
              </button>
              <button 
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 bg-gray-100 text-gray-500 text-xs font-black py-2.5 rounded-xl active:scale-95 transition-all cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
