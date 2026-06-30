import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { DEFAULT_AVATAR } from '../../utils/avatar';
import { 
  Users, 
  Search, 
  Plus, 
  Star, 
  CheckCircle, 
  Award,
  Smartphone,
  MapPin,
  Trash2,
  FileText,
  Truck,
  Bell,
  Edit3,
  UserX,
  UserCheck,
  Download,
  X,
  Calendar,
  DollarSign,
  Package,
  ExternalLink
} from 'lucide-react';

interface ManagerCustomersProps {
  setActiveTab?: (tab: any) => void;
}

export default function ManagerCustomers({ setActiveTab }: ManagerCustomersProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal control states
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [viewingOrdersCustomer, setViewingOrdersCustomer] = useState<any | null>(null);
  const [sendingNotificationCustomer, setSendingNotificationCustomer] = useState<any | null>(null);

  // Customer orders state (fetched on demand)
  const [customerShipments, setCustomerShipments] = useState<any[]>([]);
  const [customerInvoices, setCustomerInvoices] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);

  // Edit Customer Form Fields
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('بغداد');
  const [editLoyaltyPoints, setEditLoyaltyPoints] = useState<number>(0);
  const [editTotalOrders, setEditTotalOrders] = useState<number>(0);
  const [editTotalSpent, setEditTotalSpent] = useState<number>(0);

  // Quick Notification Form Fields
  const [notifTitle, setNotifTitle] = useState('');
  const [notifContent, setNotifContent] = useState('');
  const [notifType, setNotifType] = useState('loyalty');

  // Real-time listener for real customers from the "customers" Firestore collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'customers'), (snap) => {
      const list: any[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id, // document ID is username
          username: docSnap.id,
          ...data
        });
      });
      setCustomers(list);
      setLoading(false);
    }, (err) => {
      console.error("Failed to stream customers collection:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch shipments & invoices for the selected customer when "View Orders" modal is opened
  useEffect(() => {
    if (!viewingOrdersCustomer) return;

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const uid = viewingOrdersCustomer.uid;
        if (!uid) {
          setCustomerShipments([]);
          setCustomerInvoices([]);
          setLoadingOrders(false);
          return;
        }

        // Fetch Shipments for this user
        const shipmentsSnap = await getDocs(
          query(collection(db, 'shipments'), where('userId', '==', uid))
        );
        const shipmentsList: any[] = [];
        shipmentsSnap.forEach((d) => {
          shipmentsList.push({ id: d.id, ...d.data() });
        });

        // Fetch Invoices for this user
        const invoicesSnap = await getDocs(
          query(collection(db, 'invoices'), where('userId', '==', uid))
        );
        const invoicesList: any[] = [];
        invoicesSnap.forEach((d) => {
          invoicesList.push({ id: d.id, ...d.data() });
        });

        setCustomerShipments(shipmentsList);
        setCustomerInvoices(invoicesList);
      } catch (err) {
        console.error("Error fetching customer orders: ", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [viewingOrdersCustomer]);

  // Handle Account Suspension / Activation Toggle
  const handleToggleSuspension = async (cust: any) => {
    const newStatus = cust.accountStatus === 'suspended' ? 'active' : 'suspended';
    const confirmMessage = newStatus === 'suspended' 
      ? `⚠️ هل أنتِ متأكدة من تعليق حساب الزبونة "${cust.fullName}"؟ لن تتمكن من تسجيل الدخول للتطبيق.`
      : `🌸 هل ترغبين في إعادة تفعيل حساب الزبونة "${cust.fullName}"؟`;

    if (confirm(confirmMessage)) {
      try {
        // Update customers/{customerId}
        await updateDoc(doc(db, 'customers', cust.username), {
          accountStatus: newStatus
        });

        // Sync with users/{uid}
        if (cust.uid) {
          await updateDoc(doc(db, 'users', cust.uid), {
            accountStatus: newStatus
          }).catch(() => null);
        }

        alert(newStatus === 'suspended' ? 'تم تعليق الحساب بنجاح 🔒' : 'تم تفعيل الحساب بنجاح 🌸');
      } catch (err) {
        console.error("Failed to toggle suspension:", err);
        alert('فشلت العملية، يرجى المحاولة لاحقاً.');
      }
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (cust: any) => {
    setEditingCustomer(cust);
    setEditFullName(cust.fullName || '');
    setEditPhone(cust.phone || '');
    setEditCity(cust.city || 'بغداد');
    setEditLoyaltyPoints(cust.loyaltyPoints || 0);
    setEditTotalOrders(cust.totalOrders || 0);
    setEditTotalSpent(cust.totalSpent || 0);
  };

  // Save Customer Changes
  const handleSaveCustomerChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      const updatedFields = {
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
        city: editCity.trim(),
        loyaltyPoints: Number(editLoyaltyPoints),
        totalOrders: Number(editTotalOrders),
        totalSpent: Number(editTotalSpent)
      };

      // Update in customers collection
      await updateDoc(doc(db, 'customers', editingCustomer.username), updatedFields);

      // Keep users/{uid} collection synchronized
      if (editingCustomer.uid) {
        await updateDoc(doc(db, 'users', editingCustomer.uid), {
          name: editFullName.trim(),
          phone: editPhone.trim(),
          city: editCity.trim(),
          points: Number(editLoyaltyPoints)
        }).catch(() => null);
      }

      alert('تم تحديث بيانات الزبونة بنجاح ✨');
      setEditingCustomer(null);
    } catch (err) {
      console.error("Error saving customer data:", err);
      alert('فشل حفظ التعديلات.');
    }
  };

  // Handle Send Notification Submit
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendingNotificationCustomer) return;

    if (!notifTitle.trim() || !notifContent.trim()) {
      alert('يرجى كتابة عنوان وتفاصيل التنبيه 🌸');
      return;
    }

    try {
      const targetUid = sendingNotificationCustomer.uid;
      if (!targetUid) {
        alert('هذا الحساب لا يحتوي على معرّف UID نشط لربط التنبيه.');
        return;
      }

      await addDoc(collection(db, 'notifications'), {
        userId: targetUid,
        notificationId: `custom_alert_${Date.now()}`,
        title: notifTitle.trim(),
        content: notifContent.trim(),
        type: notifType,
        time: 'الآن',
        read: false,
        icon: notifType === 'loyalty' ? 'Star' : notifType === 'offer' ? 'Sparkles' : 'Bell',
        createdAt: serverTimestamp()
      });

      alert('تم إرسال التنبيه الفوري بنجاح إلى حساب الزبونة 💖');
      setSendingNotificationCustomer(null);
      setNotifTitle('');
      setNotifContent('');
    } catch (err) {
      console.error("Error sending notification:", err);
      alert('فشل إرسال التنبيه.');
    }
  };

  // Handle Account Deletion
  const handleDeleteCustomer = async (cust: any) => {
    if (confirm(`⚠️ تحذير شديد: هل أنتِ متأكدة من حذف حساب الزبونة "${cust.fullName}" بشكل نهائي؟ سيفقد العميل إمكانية الوصول وستُحذف بياناته تماماً من لوحة التحكم.`)) {
      try {
        // Delete customers/{customerId}
        await deleteDoc(doc(db, 'customers', cust.username));

        // Delete users/{uid}
        if (cust.uid) {
          await deleteDoc(doc(db, 'users', cust.uid)).catch(() => null);
        }

        alert('تم حذف حساب الزبونة نهائياً بنجاح 🌸');
      } catch (err) {
        console.error("Error deleting customer account:", err);
        alert('فشل حذف حساب الزبونة.');
      }
    }
  };

  // Helper to trigger actions with prefilled customer data
  const triggerPrefilledAction = (cust: any, tab: 'invoices' | 'shipments' | 'notifications') => {
    (window as any).prefilledCustomerForAction = {
      name: cust.fullName,
      phone: cust.phone,
      city: cust.city,
      uid: cust.uid,
      customerId: cust.username
    };
    if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  // Export Registered Customers List as CSV
  const handleExportCSV = () => {
    if (customers.length === 0) {
      alert('قاعدة البيانات فارغة حالياً للتصدير ✨');
      return;
    }

    // Prepare CSV headers & rows
    const headers = [
      'اسم المستخدم',
      'الاسم الكامل',
      'رقم الهاتف',
      'المحافظة والمدينة',
      'نقاط الولاء',
      'إجمالي الطلبات',
      'إجمالي المشتريات',
      'حالة الحساب',
      'تاريخ التسجيل',
      'آخر ظهور',
      'رقم الحساب UID'
    ];

    const rows = customers.map(cust => [
      `"${cust.username || ''}"`,
      `"${cust.fullName || ''}"`,
      `"${cust.phone || ''}"`,
      `"${cust.city || ''}"`,
      cust.loyaltyPoints || 0,
      cust.totalOrders || 0,
      cust.totalSpent || 0,
      cust.accountStatus === 'suspended' ? 'معلق' : 'نشط',
      `"${cust.registrationDate || ''}"`,
      `"${cust.lastLogin || ''}"`,
      `"${cust.uid || ''}"`
    ]);

    // Build CSV content
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    // Download logic
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `iramo_customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter customers based on search query
  const filtered = customers.filter(cust => 
    (cust.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cust.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cust.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cust.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="manager-customers">
      
      {/* Featured Header Card */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 border border-pink-400 rounded-3xl p-6 text-white text-right shadow-md relative overflow-hidden" dir="rtl">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full font-black uppercase tracking-wider">لوحة تحكم المشتركات الحقيقيات 👑</span>
            <h3 className="font-black text-lg mt-2">إدارة قاعدة بيانات زبونات إيرامو</h3>
            <p className="text-[11px] text-white/90 leading-relaxed mt-1.5 font-bold">
              مرحباً هدى! من هنا يمكنكِ إدارة حسابات الزبونات الحقيقية، تعديل نقاط الولاء والمشتريات، تعليق الحسابات غير الملتزمة، مراجعة فواتير وشحنات كل زبونة، وتصدير كامل البيانات.
            </p>
          </div>
          <button 
            onClick={handleExportCSV}
            className="bg-white text-pink-700 hover:bg-pink-50 font-black text-[10px] px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير البيانات</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Bento */}
      <div className="grid grid-cols-4 gap-2.5">
        <div className="bg-white border border-pink-100 p-3.5 rounded-2xl text-center shadow-xs">
          <p className="text-[8px] text-gray-400 font-bold uppercase">إجمالي المشتركات</p>
          <p className="text-base font-black text-pink-700 mt-0.5">{loading ? '...' : customers.length}</p>
        </div>
        <div className="bg-white border border-pink-100 p-3.5 rounded-2xl text-center shadow-xs">
          <p className="text-[8px] text-gray-400 font-bold uppercase">الحسابات النشطة</p>
          <p className="text-base font-black text-emerald-600 mt-0.5">
            {loading ? '...' : customers.filter(c => c.accountStatus !== 'suspended').length}
          </p>
        </div>
        <div className="bg-white border border-pink-100 p-3.5 rounded-2xl text-center shadow-xs">
          <p className="text-[8px] text-gray-400 font-bold uppercase">الحسابات المعلقة</p>
          <p className="text-base font-black text-amber-600 mt-0.5">
            {loading ? '...' : customers.filter(c => c.accountStatus === 'suspended').length}
          </p>
        </div>
        <div className="bg-white border border-pink-100 p-3.5 rounded-2xl text-center shadow-xs">
          <p className="text-[8px] text-gray-400 font-bold uppercase">إجمالي نقاط الولاء</p>
          <p className="text-base font-black text-purple-600 mt-0.5">
            {loading ? '...' : customers.reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input 
          type="text"
          placeholder="البحث بالاسم، برقم الهاتف، باسم المستخدم، أو المحافظة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-pink-100 text-xs px-4 py-3 pr-10 rounded-2xl text-right text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-300 font-bold shadow-sm"
          dir="rtl"
        />
        <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-10 text-pink-600 font-black text-xs animate-pulse">
          جاري تحميل قاعدة بيانات الزبونات الحقيقيات... ✨
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-white border border-dashed border-pink-100 rounded-3xl p-6">
          <Users className="w-10 h-10 text-pink-200 mx-auto mb-2" />
          <p className="text-xs text-gray-400 font-bold">لا يوجد زبونات مسجلات يطابقن معايير البحث 🌸</p>
        </div>
      )}

      {/* Customer Cards List */}
      <div className="space-y-4">
        {filtered.map(cust => (
          <div 
            key={cust.id}
            className={`bg-white border p-5 rounded-3xl shadow-sm text-right space-y-4 relative overflow-hidden group transition-all duration-300 hover:shadow-md ${
              cust.accountStatus === 'suspended' ? 'border-amber-200 bg-amber-50/10' : 'border-pink-50 hover:border-pink-200'
            }`}
            dir="rtl"
          >
            {/* Corner Badge for suspended account */}
            {cust.accountStatus === 'suspended' && (
              <div className="absolute top-0 left-0 bg-amber-500 text-white text-[8px] font-black px-2.5 py-1 rounded-br-2xl flex items-center gap-1">
                <UserX className="w-2.5 h-2.5" />
                <span>حساب معلق</span>
              </div>
            )}

            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-100 shadow-xs shrink-0 bg-pink-50">
                  <img 
                    referrerPolicy="no-referrer" 
                    src={cust.profileImage || DEFAULT_AVATAR} 
                    alt={cust.fullName} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h4 className="font-black text-gray-800 text-sm flex items-center gap-1.5 flex-wrap">
                    {cust.fullName}
                    <span className="text-[9px] font-mono text-pink-600 font-black bg-pink-50 px-2 py-0.5 rounded-md">@{cust.username}</span>
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 mt-1">
                    <Smartphone className="w-3 h-3 text-pink-600" />
                    <span>{cust.phone}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Edit, Suspend, Delete */}
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => handleOpenEdit(cust)}
                  className="w-7 h-7 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 flex items-center justify-center transition-all cursor-pointer"
                  title="تعديل بيانات العميل"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleToggleSuspension(cust)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    cust.accountStatus === 'suspended' 
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600' 
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-600'
                  }`}
                  title={cust.accountStatus === 'suspended' ? 'إلغاء التعليق وتفعيل الحساب' : 'تعليق الحساب مؤقتاً'}
                >
                  {cust.accountStatus === 'suspended' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={() => handleDeleteCustomer(cust)}
                  className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-all cursor-pointer"
                  title="حذف الحساب نهائياً"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Custom Loyalty and Financial stats bento line */}
            <div className="grid grid-cols-3 gap-3 text-xs pt-3.5 border-t border-dashed border-gray-100">
              <div>
                <span className="text-[9px] text-gray-400 block font-bold">نقاط الولاء المجمعة:</span>
                <span className="text-pink-700 font-black flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                  <span>{(cust.loyaltyPoints || 0).toLocaleString()} نقطة</span>
                </span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 block font-bold">إجمالي المشتريات:</span>
                <span className="text-emerald-700 font-black block mt-0.5">
                  {(cust.totalSpent || 0).toLocaleString()} د.ع
                </span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 block font-bold">الموقع والتسليم:</span>
                <span className="text-gray-800 font-bold flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 text-pink-500 shrink-0" />
                  <span className="truncate">{cust.city}</span>
                </span>
              </div>
            </div>

            {/* System logs info */}
            <div className="grid grid-cols-2 gap-2 text-[9px] text-gray-400 font-bold bg-gray-50/70 p-2.5 rounded-xl border border-gray-100/30">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                التسجيل: {cust.registrationDate ? new Date(cust.registrationDate).toLocaleDateString('ar-IQ') : 'غير متوفر'}
              </span>
              <span className="text-left">
                آخر ظهور: {cust.lastLogin ? new Date(cust.lastLogin).toLocaleDateString('ar-IQ') + ' - ' + new Date(cust.lastLogin).toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'}) : 'لم يسجل دخول بعد'}
              </span>
            </div>

            {/* Action pipelines pipeline buttons */}
            <div className="grid grid-cols-5 gap-1.5 pt-3 border-t border-pink-50/40">
              <button 
                onClick={() => setViewingOrdersCustomer(cust)}
                className="col-span-1.5 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 py-1.5 rounded-xl transition-all cursor-pointer font-bold text-[10px]"
              >
                <Package className="w-3.5 h-3.5 text-gray-600" />
                <span>عرض الفواتير والشحنات</span>
              </button>

              <button 
                onClick={() => setSendingNotificationCustomer(cust)}
                className="flex flex-col items-center justify-center bg-pink-50/70 hover:bg-pink-100/70 text-pink-900 py-1.5 rounded-xl transition-all cursor-pointer border border-pink-100/50"
              >
                <Bell className="w-3.5 h-3.5 text-pink-700 mb-0.5" />
                <span className="text-[7.5px] font-black">تنبيه فوري</span>
              </button>

              <button 
                onClick={() => triggerPrefilledAction(cust, 'invoices')}
                className="flex flex-col items-center justify-center bg-pink-50/30 hover:bg-pink-100/30 text-pink-900 py-1.5 rounded-xl transition-all cursor-pointer border border-pink-100/20"
              >
                <FileText className="w-3.5 h-3.5 text-pink-700 mb-0.5" />
                <span className="text-[7.5px] font-black">فاتورة</span>
              </button>

              <button 
                onClick={() => triggerPrefilledAction(cust, 'shipments')}
                className="flex flex-col items-center justify-center bg-rose-50/50 hover:bg-rose-100/50 text-rose-900 py-1.5 rounded-xl transition-all cursor-pointer border border-rose-100/30"
              >
                <Truck className="w-3.5 h-3.5 text-rose-700 mb-0.5" />
                <span className="text-[7.5px] font-black">شحنة</span>
              </button>

              <a 
                href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex flex-col items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-950 py-1.5 rounded-xl transition-all cursor-pointer border border-emerald-100/50"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
                <span className="text-[7.5px] font-black">واتساب</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: Edit Customer Details */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-right" dir="rtl">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-pink-50 animate-fade-in space-y-4">
            <button 
              onClick={() => setEditingCustomer(null)}
              className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 flex items-center justify-center absolute left-4 top-4 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-sm text-pink-900 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4" />
              تعديل بيانات الزبونة: @{editingCustomer.username}
            </h3>

            <form onSubmit={handleSaveCustomerChanges} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">الاسم الكامل</label>
                <input 
                  type="text" 
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-300 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">رقم الهاتف</label>
                  <input 
                    type="text" 
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-300 font-mono font-bold text-left"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">الموقع / المحافظة</label>
                  <input 
                    type="text" 
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-300 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">نقاط الولاء</label>
                  <input 
                    type="number" 
                    value={editLoyaltyPoints}
                    onChange={(e) => setEditLoyaltyPoints(Number(e.target.value))}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-300 font-black text-center"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">عدد الطلبات</label>
                  <input 
                    type="number" 
                    value={editTotalOrders}
                    onChange={(e) => setEditTotalOrders(Number(e.target.value))}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-300 font-black text-center"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">إجمالي المشتريات (د.ع)</label>
                  <input 
                    type="number" 
                    value={editTotalSpent}
                    onChange={(e) => setEditTotalSpent(Number(e.target.value))}
                    className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-300 font-black text-center"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit"
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  حفظ التعديلات
                </button>
                <button 
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Customer Orders (Invoices and Shipments) */}
      {viewingOrdersCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-right" dir="rtl">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative border border-pink-50 animate-fade-in space-y-4 max-h-[85vh] flex flex-col">
            <button 
              onClick={() => setViewingOrdersCustomer(null)}
              className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 flex items-center justify-center absolute left-4 top-4 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="shrink-0">
              <h3 className="font-black text-sm text-pink-900 flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                سجل شحنات وفواتير الزبونة: {viewingOrdersCustomer.fullName}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold mt-1">المعرف: @{viewingOrdersCustomer.username} | الرمز: {viewingOrdersCustomer.uid}</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-6 text-right my-2">
              
              {loadingOrders ? (
                <div className="text-center py-10 text-pink-600 font-black text-xs animate-pulse">
                  جاري جلب الفواتير والشحنات من قاعدة البيانات... 📦
                </div>
              ) : (
                <>
                  {/* Shipments Section */}
                  <div className="space-y-2.5">
                    <h4 className="font-black text-xs text-pink-950 border-b border-pink-100 pb-1.5 flex justify-between">
                      <span>الشحنات المربوطة ({customerShipments.length})</span>
                      <span className="text-[10px] text-pink-500 font-bold">تتبع غوانزو - بغداد</span>
                    </h4>
                    {customerShipments.length === 0 ? (
                      <p className="text-[10px] text-gray-400 font-bold text-center py-4 bg-gray-50 rounded-2xl">لا يوجد أي شحنات مضافة لهذه الزبونة.</p>
                    ) : (
                      <div className="space-y-2">
                        {customerShipments.map(ship => (
                          <div key={ship.id} className="bg-pink-50/20 border border-pink-100/50 p-3 rounded-2xl text-[11px] space-y-1">
                            <div className="flex justify-between font-black">
                              <span className="text-pink-950 font-mono">{ship.trackingNumber}</span>
                              <span className="text-pink-700">{ship.status}</span>
                            </div>
                            <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                              <span>القطع: {ship.items} | الوزن: {ship.weight}</span>
                              <span>الوصول: {ship.expectedArrivalDate || ship.estimatedDelivery}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Invoices Section */}
                  <div className="space-y-2.5">
                    <h4 className="font-black text-xs text-pink-950 border-b border-pink-100 pb-1.5 flex justify-between">
                      <span>الفواتير والمالية ({customerInvoices.length})</span>
                      <span className="text-[10px] text-emerald-600 font-bold">الحساب المالي للطلبات</span>
                    </h4>
                    {customerInvoices.length === 0 ? (
                      <p className="text-[10px] text-gray-400 font-bold text-center py-4 bg-gray-50 rounded-2xl">لا يوجد أي فواتير مسجلة لهذه الزبونة.</p>
                    ) : (
                      <div className="space-y-2">
                        {customerInvoices.map(inv => (
                          <div key={inv.id} className="bg-emerald-50/20 border border-emerald-100/30 p-3 rounded-2xl text-[11px] space-y-1">
                            <div className="flex justify-between font-black">
                              <span className="text-emerald-950">فاتورة {inv.invoiceId}</span>
                              <span className={inv.status === 'Paid' ? 'text-emerald-600' : 'text-amber-500'}>
                                {inv.status === 'Paid' ? 'تم الدفع ✅' : 'قيد الانتظار ⏳'}
                              </span>
                            </div>
                            <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                              <span>المتجر: {inv.store} | طلب: {inv.order_id}</span>
                              <span className="font-black text-emerald-800">المبلغ: {Number(inv.amount).toLocaleString()} د.ع</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>

            <div className="shrink-0 pt-2 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setViewingOrdersCustomer(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-2.5 px-5 rounded-xl transition-all cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Send Quick Notification */}
      {sendingNotificationCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-right" dir="rtl">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-pink-50 animate-fade-in space-y-4">
            <button 
              onClick={() => setSendingNotificationCustomer(null)}
              className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 flex items-center justify-center absolute left-4 top-4 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-sm text-pink-900 flex items-center gap-1.5">
              <Bell className="w-4 h-4" />
              إرسال تنبيه مخصص إلى {sendingNotificationCustomer.fullName}
            </h3>

            <form onSubmit={handleSendNotification} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">نوع التنبيه</label>
                <select 
                  value={notifType}
                  onChange={(e) => setNotifType(e.target.value)}
                  className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-300 font-bold"
                >
                  <option value="loyalty">مكافأة أو نقاط ولاء ⭐</option>
                  <option value="offer">عرض مخصص وحصري ✨</option>
                  <option value="announcement">تحديث أو إعلان عام 📢</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">عنوان التنبيه</label>
                <input 
                  type="text" 
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="مثال: مبروك! حصلتِ على 500 نقطة هدية 🎁"
                  className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">مضمون وتفاصيل الرسالة</label>
                <textarea 
                  value={notifContent}
                  onChange={(e) => setNotifContent(e.target.value)}
                  placeholder="اكتبي تفاصيل الرسالة بأسلوب لبق وأنيق يجذب الزبونة..."
                  rows={3}
                  className="w-full bg-gray-50 border-0 focus:bg-white text-xs px-4 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-pink-300 font-bold"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit"
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-black text-xs py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  إرسال الآن 🚀
                </button>
                <button 
                  type="button"
                  onClick={() => setSendingNotificationCustomer(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
