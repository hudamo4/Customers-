import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Trash2, 
  Edit3, 
  Users, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Truck, 
  Receipt, 
  Gift, 
  Flame, 
  Megaphone, 
  MessageSquare, 
  Smartphone,
  Eye,
  Plus,
  Search,
  CheckSquare,
  Repeat,
  Heart
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { NotificationDetail } from '../../types';

interface UserSelectOption {
  uid: string;
  name: string;
  avatar: string;
  membership: string;
  phone: string;
}

const FALLBACK_USERS: UserSelectOption[] = [
  { uid: 'cust_1', name: 'سارة علي', phone: '+964 770 123 4567', membership: 'عضوية ذهبية', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkcpfVr8wniE5xCJAVxvkfRTdM-wo2pS6ZLjoAAR8vvxhwdnFL_Eqz5ppKytfnF7tKteyNH8pNfeNHZCgOHilx_vf0RxGy9L_S1vjDTGPdqubALD1vGc66vwxZXgSgt1yjkmDYXxxaHZmIDRUn57ZI0ZUxyl4KpI5swshHIq08yVvysKdGUmfiWi8xjMtaKkXbeXfdMkKmmX937lW0KpGk_r79A2ELYxV-Q1DrbFFkLoQag5QtCJVrQX91Bn4yhdHsry4A3P_FUng' },
  { uid: 'cust_2', name: 'أمنة العراق', phone: '+964 780 445 1290', membership: 'عضوية ذهبية', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9EaYCDGI3nnclPO4Dfn8I8RZWRNVEKBUb-qxzppoUDSSF0uOYRcTHzQEOvzXtqZyk5bVh4idglS262c_ZUgYdgA-h1OorPVThxh8UXI7GHoH2uDEhbQg2eVlFMYU4isBKM9I_0LSyYdiFMT_ttIH-xYE0KuXOFy-Kz_UIlEMn-XC4L9y1Vol5VvGdb1i51-vz5DCQ3rO23XQP4xhX_1niZMeMM8D-RuEUU1U-r7VqHSMTCi7iILOoNy4WG-WS3v4pxciGg6Rk_QE' },
  { uid: 'cust_3', name: 'هدى السلطاني', phone: '+964 750 992 1124', membership: 'عضوية بلاتينية', avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLs7xYMw1dlJILjhZ2VzHUgTES3bYmOtS532eeDn9JpDom3Gp-MaPoVhT_e495zabXi9PhvxGhgg_DGSwGWwf9dmXp5ZUWaJm0RCNd8GbCsm6Pfsr0iJJMO0aAxy5MOcRhILsJttChJdkmTm_mZbX5E5mSnfAvK48H_feUdzK0meAC_w_y8FpVIQyOMw7BefhhUleQ-yNPc9mOamo6Uhxfvs0PQtY8Tp68F3pQbyGpw3MPMMO_Rkhd2fSw' },
  { uid: 'cust_4', name: 'زهراء محمد', phone: '+964 771 883 1102', membership: 'عضوية فضية', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkcpfVr8wniE5xCJAVxvkfRTdM-wo2pS6ZLjoAAR8vvxhwdnFL_Eqz5ppKytfnF7tKteyNH8pNfeNHZCgOHilx_vf0RxGy9L_S1vjDTGPdqubALD1vGc66vwxZXgSgt1yjkmDYXxxaHZmIDRUn57ZI0ZUxyl4KpI5swshHIq08yVvysKdGUmfiWi8xjMtaKkXbeXfdMkKmmX937lW0KpGk_r79A2ELYxV-Q1DrbFFkLoQag5QtCJVrQX91Bn4yhdHsry4A3P_FUng' }
];

const PRESET_IMAGES = [
  { label: 'حقيبة شانيل كلاسيكية 👜', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=400' },
  { label: 'عطور ديور الفاخرة 💄', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400' },
  { label: 'شحن ومستودعات ✈️', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400' },
  { label: 'هدية ذهبية متلألئة ✨', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400' },
  { label: 'عالم ديزني الساحر 🏰', url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=80&w=400' }
];

export default function ManagerNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<UserSelectOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Form State
  const [formTitle, setFormTitle] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formType, setFormType] = useState<'shipment' | 'invoice' | 'loyalty' | 'promotion' | 'announcement' | 'support'>('promotion');
  const [deliveryMethod, setDeliveryMethod] = useState<'in-app' | 'push' | 'both'>('both');
  const [targetType, setTargetType] = useState<'all' | 'vip' | 'single' | 'multiple'>('all');
  
  // Targeting selection
  const [selectedSingleUserId, setSelectedSingleUserId] = useState<string>('');
  const [selectedMultipleUserIds, setSelectedMultipleUserIds] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  
  // Custom image / Presets
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>('');
  
  // Action Button Link
  const [actionLabel, setActionLabel] = useState<string>('');
  const [actionTab, setActionTab] = useState<'tracking' | 'invoices' | 'profile' | 'dashboard'>('dashboard');

  // Scheduling State
  const [schedulingType, setSchedulingType] = useState<'now' | 'later'>('now');
  const [scheduledDateTime, setScheduledDateTime] = useState<string>('');
  const [repeatInterval, setRepeatInterval] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  // Edit Mode state
  const [editingNotifId, setEditingNotifId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Fetch real users and notifications
  useEffect(() => {
    // 1. Fetch Users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const list: UserSelectOption[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        list.push({
          uid: doc.id,
          name: data.name || 'زبونة مجهولة',
          phone: data.phone || '',
          membership: data.membership || 'عضوية فضية',
          avatar: data.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9EaYCDGI3nnclPO4Dfn8I8RZWRNVEKBUb-qxzppoUDSSF0uOYRcTHzQEOvzXtqZyk5bVh4idglS262c_ZUgYdgA-h1OorPVThxh8UXI7GHoH2uDEhbQg2eVlFMYU4isBKM9I_0LSyYdiFMT_ttIH-xYE0KuXOFy-Kz_UIlEMn-XC4L9y1Vol5VvGdb1i51-vz5DCQ3rO23XQP4xhX_1niZMeMM8D-RuEUU1U-r7VqHSMTCi7iILOoNy4WG-WS3v4pxciGg6Rk_QE'
        });
      });
      
      // Merge with fallback mock list to ensure there are always users to test targeting
      const merged = [...list];
      FALLBACK_USERS.forEach(fb => {
        if (!merged.some(u => u.uid === fb.uid)) {
          merged.push(fb);
        }
      });
      setUsers(merged);
    }, (err) => {
      console.warn("Could not load users collection:", err);
      setUsers(FALLBACK_USERS);
    });

    // 2. Fetch Notifications
    const unsubscribeNotifications = onSnapshot(collection(db, 'notifications'), (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Sort: Scheduled or Sent, descending by creation or ID
      list.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      setNotifications(list);
      setLoading(false);
    }, (err) => {
      console.warn("Could not load notifications collection:", err);
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeNotifications();
    };
  }, []);

  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormType('promotion');
    setDeliveryMethod('both');
    setTargetType('all');
    setSelectedSingleUserId('');
    setSelectedMultipleUserIds([]);
    setCustomImageUrl('');
    setSelectedPresetImage('');
    setActionLabel('');
    setActionTab('dashboard');
    setSchedulingType('now');
    setScheduledDateTime('');
    setRepeatInterval('none');
    setEditingNotifId(null);
  };

  const getTargetLabel = (notif: any) => {
    if (notif.targetLabel) return notif.targetLabel;
    if (notif.userId === 'all') return 'جميع الزبائن 👥';
    if (notif.userId === 'vip') return 'الزبونات المميزات VIP ⭐';
    
    const targetUser = users.find(u => u.uid === notif.userId);
    return targetUser ? `${targetUser.name} 👤` : 'زبونة محددة 👤';
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'shipment':
        return <Truck className="w-4 h-4 text-pink-700" />;
      case 'invoice':
        return <Receipt className="w-4 h-4 text-rose-700" />;
      case 'loyalty':
        return <Gift className="w-4 h-4 text-yellow-600" />;
      case 'promotion':
        return <Flame className="w-4 h-4 text-pink-600 animate-pulse" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-emerald-600" />;
      case 'support':
        return <MessageSquare className="w-4 h-4 text-sky-600" />;
      default:
        return <Bell className="w-4 h-4 text-pink-700" />;
    }
  };

  const getTypeArabic = (type: string) => {
    switch (type) {
      case 'shipment': return 'شحنة لبلورية';
      case 'invoice': return 'فاتورة ملكية';
      case 'loyalty': return 'ولاء وهدايا';
      case 'promotion': return 'عرض متألق';
      case 'announcement': return 'إعلان عام';
      case 'support': return 'مساعدة هدوشة';
      default: return 'تنبيه';
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formTitle.trim()) {
      setErrorMsg('الرجاء كتابة عنوان التنبيه الياقوتي ✨');
      return;
    }
    if (!formContent.trim()) {
      setErrorMsg('الرجاء كتابة محتوى التنبيه الأنيق 📜');
      return;
    }

    // Determine target users list
    let targetUserIds: string[] = [];
    let label = 'الجميع';

    if (targetType === 'all') {
      targetUserIds = users.map(u => u.uid);
      label = 'جميع الزبائن 👥';
    } else if (targetType === 'vip') {
      targetUserIds = users.filter(u => u.membership.includes('ذهب') || u.membership.includes('بلاتين')).map(u => u.uid);
      label = 'الزبونات المميزات VIP ⭐';
    } else if (targetType === 'single') {
      if (!selectedSingleUserId) {
        setErrorMsg('الرجاء اختيار زبونة لتلقي هذا التنبيه 👤');
        return;
      }
      targetUserIds = [selectedSingleUserId];
      const targetUser = users.find(u => u.uid === selectedSingleUserId);
      label = targetUser ? `${targetUser.name} 👤` : 'زبونة واحدة';
    } else if (targetType === 'multiple') {
      if (selectedMultipleUserIds.length === 0) {
        setErrorMsg('الرجاء تحديد زبونة واحدة على الأقل من القائمة 👥');
        return;
      }
      targetUserIds = selectedMultipleUserIds;
      label = `مجموعة من ${selectedMultipleUserIds.length} زبونات 👥`;
    }

    const finalImage = customImageUrl.trim() || selectedPresetImage || '';
    const finalAction = actionLabel.trim() ? actionLabel : '';

    try {
      if (editingNotifId) {
        // Edit existing notification - we'll update the document directly.
        const originalNotif = notifications.find(n => n.id === editingNotifId);
        if (originalNotif) {
          const docRef = doc(db, 'notifications', editingNotifId);
          await updateDoc(docRef, {
            title: formTitle,
            content: formContent,
            type: formType,
            deliveryMethod,
            image: finalImage,
            icon: formType === 'shipment' ? 'Truck' : formType === 'invoice' ? 'Receipt' : formType === 'loyalty' ? 'Gift' : 'Bell',
            action: finalAction,
            scheduledTime: schedulingType === 'later' ? scheduledDateTime : '',
            repeatInterval: repeatInterval,
            status: schedulingType === 'later' ? 'scheduled' : 'sent',
            updatedAt: serverTimestamp()
          });
          setSuccessMsg('✨ تم تحديث التنبيه الياقوتي بنجاح!');
        }
      } else {
        // Create new notifications
        // For scheduled, we save a template or one item. If "now", we dispatch to each targeted user for instant delivery!
        const timestamp = serverTimestamp();
        
        if (schedulingType === 'later') {
          // If scheduled for later, save a single scheduled entry targeting the audience so we can display it in list
          await addDoc(collection(db, 'notifications'), {
            userId: targetType === 'all' ? 'all' : targetType === 'vip' ? 'vip' : targetUserIds[0] || 'all',
            notificationId: `notif_${Date.now()}`,
            type: formType,
            title: formTitle,
            content: formContent,
            time: 'مجدول ⏳',
            image: finalImage,
            icon: formType === 'shipment' ? 'Truck' : formType === 'invoice' ? 'Receipt' : formType === 'loyalty' ? 'Gift' : 'Bell',
            action: finalAction,
            read: false,
            deliveryMethod,
            scheduledTime: scheduledDateTime,
            repeatInterval,
            status: 'scheduled',
            targetLabel: label,
            createdAt: timestamp
          });
        } else {
          // Dispatch to each individual user instantly! This ensures instant synchronization with all devices.
          for (const uid of targetUserIds) {
            await addDoc(collection(db, 'notifications'), {
              userId: uid,
              notificationId: `notif_${Date.now()}`,
              type: formType,
              title: formTitle,
              content: formContent,
              time: 'الآن',
              image: finalImage,
              icon: formType === 'shipment' ? 'Truck' : formType === 'invoice' ? 'Receipt' : formType === 'loyalty' ? 'Gift' : 'Bell',
              action: finalAction,
              read: false,
              deliveryMethod,
              status: 'sent',
              targetLabel: label,
              createdAt: timestamp
            });
          }
        }
        setSuccessMsg(schedulingType === 'later' ? '⏳ تم جدولة التنبيه الفاخر بنجاح!' : '🚀 تم إرسال التنبيه اللحظي فوراً إلى جميع الأجهزة!');
      }

      resetForm();
      // Scroll to list
      document.getElementById('manager-notifications-list')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`عذراً، فشل تخزين التنبيه في السحابة: ${err.message}`);
    }
  };

  const handleEditClick = (notif: any) => {
    setEditingNotifId(notif.id);
    setFormTitle(notif.title);
    setFormContent(notif.content);
    setFormType(notif.type);
    setDeliveryMethod(notif.deliveryMethod || 'both');
    
    // Attempt targeting reconstruction
    if (notif.userId === 'all') {
      setTargetType('all');
    } else if (notif.userId === 'vip') {
      setTargetType('vip');
    } else {
      setTargetType('single');
      setSelectedSingleUserId(notif.userId);
    }

    setCustomImageUrl(notif.image || '');
    setActionLabel(notif.action || '');
    
    if (notif.scheduledTime) {
      setSchedulingType('later');
      setScheduledDateTime(notif.scheduledTime);
    } else {
      setSchedulingType('now');
    }
    setRepeatInterval(notif.repeatInterval || 'none');

    // Scroll up to form
    document.getElementById('manager-notifications-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('هل أنتِ متأكدة من حذف هذا التنبيه الملكي؟ 🗑️')) {
      try {
        await deleteDoc(doc(db, 'notifications', id));
        setSuccessMsg('🗑️ تم إزالة التنبيه بنجاح من قاعدة البيانات.');
      } catch (err: any) {
        setErrorMsg(`فشل الحذف: ${err.message}`);
      }
    }
  };

  const triggerScheduledNow = async (notif: any) => {
    try {
      // Fetch targets
      let targetUserIds: string[] = [];
      if (notif.userId === 'all') {
        targetUserIds = users.map(u => u.uid);
      } else if (notif.userId === 'vip') {
        targetUserIds = users.filter(u => u.membership.includes('ذهب') || u.membership.includes('بلاتين')).map(u => u.uid);
      } else {
        targetUserIds = [notif.userId];
      }

      // Dispatch real now
      const timestamp = serverTimestamp();
      for (const uid of targetUserIds) {
        await addDoc(collection(db, 'notifications'), {
          userId: uid,
          notificationId: `notif_${Date.now()}`,
          type: notif.type,
          title: `🚀 [عاجل] ${notif.title}`,
          content: notif.content,
          time: 'الآن',
          image: notif.image || '',
          icon: notif.icon || 'Bell',
          action: notif.action || '',
          read: false,
          deliveryMethod: notif.deliveryMethod || 'both',
          status: 'sent',
          targetLabel: notif.targetLabel || 'زبونة مخصصة',
          createdAt: timestamp
        });
      }

      // Update the scheduled entry status to "sent" or delete it
      await updateDoc(doc(db, 'notifications', notif.id), {
        status: 'sent',
        time: 'تم الإرسال فورا 🚀'
      });

      setSuccessMsg('🚀 تم تفعيل وإرسال التنبيه المجدول فوراً!');
    } catch (err: any) {
      setErrorMsg(`فشل الإرسال: ${err.message}`);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    u.phone.includes(userSearchQuery)
  );

  return (
    <div className="space-y-8 pb-12 animate-fade-in" id="manager-notifications">
      
      {/* Premium Magical Cover Banner */}
      <div className="relative w-full aspect-[16/7] rounded-[2rem] overflow-hidden border border-pink-100 shadow-lg group">
        <img
          alt="Magical Banner"
          className="w-full h-full object-cover filter brightness-[0.9]"
          src="https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=80&w=800"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pink-950/90 via-pink-900/45 to-transparent p-6 flex flex-col justify-end text-right" dir="rtl">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
            <span className="text-pink-300 font-bold text-[10px] uppercase tracking-wider">Luminous Heritage Engine</span>
          </div>
          <h2 className="text-base md:text-lg font-black text-white leading-tight">
            مركز الإشعارات والتنبيهات السحابية الموحد
          </h2>
          <p className="text-[10px] text-pink-100/80 mt-1 font-bold">
            صممي وأرسلي رسائل جذابة ومكافآت وتنبيهات الشحن التي تظهر فوراً وتتحول لتنبيهات دفع حية! ✨
          </p>
        </div>
      </div>

      {/* Success / Error Banners */}
      {successMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-right" dir="rtl">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-black text-emerald-800">{successMsg}</p>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-right" dir="rtl">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs font-black text-rose-800">{errorMsg}</p>
        </div>
      )}

      {/* Quick Statistics Bento Grid */}
      <div className="grid grid-cols-3 gap-3" dir="rtl">
        <div className="bg-white/80 backdrop-blur-md border border-pink-100 p-4 rounded-[1.5rem] text-center shadow-sm relative overflow-hidden">
          <p className="text-[8px] text-gray-400 font-bold uppercase">إجمالي المرسلة</p>
          <p className="text-base font-black text-pink-700 mt-1">
            {notifications.filter(n => n.status !== 'scheduled').length} <span className="text-[10px] font-bold text-gray-400">تنبيه</span>
          </p>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-pink-100/30 rounded-full flex items-center justify-center">
            <Send className="w-3.5 h-3.5 text-pink-300" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-pink-100 p-4 rounded-[1.5rem] text-center shadow-sm relative overflow-hidden">
          <p className="text-[8px] text-gray-400 font-bold uppercase">جدولة مفعّلة ⏳</p>
          <p className="text-base font-black text-amber-600 mt-1">
            {notifications.filter(n => n.status === 'scheduled').length} <span className="text-[10px] font-bold text-gray-400">تنبيه</span>
          </p>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-pink-100 p-4 rounded-[1.5rem] text-center shadow-sm relative overflow-hidden">
          <p className="text-[8px] text-gray-400 font-bold uppercase">قنوات التوزيع 📲</p>
          <p className="text-xs font-black text-pink-900 mt-2">
            داخلي + Push
          </p>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-rose-50 rounded-full flex items-center justify-center">
            <Smartphone className="w-3.5 h-3.5 text-rose-300" />
          </div>
        </div>
      </div>

      {/* Main Designer Form Card */}
      <div className="bg-white/95 backdrop-blur-xl border border-pink-100 p-6 rounded-[2.5rem] shadow-md space-y-6 text-right relative overflow-hidden" id="manager-notifications-form" dir="rtl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600"></div>
        
        <div className="flex justify-between items-center">
          <h3 className="font-black text-sm text-pink-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-600 animate-spin" />
            {editingNotifId ? 'تعديل التنبيه الياقوتي الحالي 🪄' : 'إنشاء وتصميم تنبيه فاخر جديد ✨'}
          </h3>
          {editingNotifId && (
            <button 
              onClick={resetForm}
              className="text-[10px] bg-pink-100 hover:bg-pink-200 text-pink-800 font-bold px-3 py-1 rounded-full cursor-pointer"
            >
              إلغاء التعديل ❌
            </button>
          )}
        </div>

        <form onSubmit={handleSendNotification} className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 block">عنوان التنبيه الياقوتي (العربي والإنكليزي):</label>
            <input 
              type="text"
              placeholder="مثال: 🎉 عروض نهاية الأسبوع الياقوتية!"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full bg-pink-50/20 border border-pink-100 text-xs px-4 py-3 rounded-2xl text-right text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-400 font-bold shadow-sm"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 block">محتوى وتفاصيل الرسالة الملكية 📜:</label>
            <textarea 
              rows={3}
              placeholder="اكتبي تفاصيل العرض الفاخر أو هدايا الولاء التي ستسعد قلب جميلتنا..."
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              className="w-full bg-pink-50/20 border border-pink-100 text-xs px-4 py-3 rounded-2xl text-right text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-400 font-semibold shadow-sm leading-relaxed"
            />
          </div>

          {/* Notification Type & Delivery Method in Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 block">تصنيف ونوع التنبيه:</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full bg-white border border-pink-100 text-xs px-4 py-2.5 rounded-2xl text-right text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-400 font-bold shadow-sm"
              >
                <option value="promotion">✨ عرض ترويجي (Promotion)</option>
                <option value="shipment">🚚 شحنة لبلورية (Shipment)</option>
                <option value="invoice">💳 فاتورة ملكية (Invoice)</option>
                <option value="loyalty">🎁 ولاء وهدايا (Loyalty)</option>
                <option value="announcement">📢 إعلان عام (Announcement)</option>
                <option value="support">💬 مساعدة هدوشة (Support)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 block">طريقة التسليم وقناة البث:</label>
              <select
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value as any)}
                className="w-full bg-white border border-pink-100 text-xs px-4 py-2.5 rounded-2xl text-right text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-400 font-bold shadow-sm"
              >
                <option value="both">📲 كلاهما (داخلي + Push)</option>
                <option value="in-app">🔔 إشعار داخلي في الموقع فقط</option>
                <option value="push">💬 تنبيه دفع فوري (Push Alert)</option>
              </select>
            </div>
          </div>

          {/* Target Audience selection */}
          <div className="space-y-2 border-t border-pink-50/80 pt-4">
            <label className="text-[10px] font-black text-pink-800 block">الفئة المستهدفة بالتنبيه (الجمهور):</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'all', label: 'الجميع 👥' },
                { id: 'vip', label: 'VIP ذهبي/بلاتيني ⭐' },
                { id: 'single', label: 'زبونة مخصصة 👤' },
                { id: 'multiple', label: 'مجموعة زبونات 🔀' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTargetType(opt.id as any)}
                  className={`py-2 rounded-xl text-[10px] font-black transition-all border cursor-pointer text-center ${
                    targetType === opt.id 
                      ? 'bg-gradient-to-r from-pink-700 to-pink-500 text-white shadow shadow-pink-500/20 border-pink-500' 
                      : 'bg-white border-pink-50 text-gray-500 hover:bg-pink-50/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Targeted User list depending on type */}
            {targetType === 'single' && (
              <div className="bg-pink-50/20 p-4 rounded-2xl border border-pink-100/50 space-y-3">
                <p className="text-[9px] font-black text-gray-400">ابحثي واختاري الزبونة الملكة لتلقي الإشعار:</p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحثي بالاسم أو رقم الهاتف..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full bg-white border border-pink-100 text-[10px] px-3 py-2 pr-8 rounded-xl text-right focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {filteredUsers.map(u => (
                    <div 
                      key={u.uid}
                      onClick={() => setSelectedSingleUserId(u.uid)}
                      className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                        selectedSingleUserId === u.uid 
                          ? 'bg-pink-100/60 border-pink-300 ring-1 ring-pink-300' 
                          : 'bg-white hover:bg-pink-50/20 border-pink-100/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-pink-100">
                          <img src={u.avatar} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-black text-gray-800">{u.name}</span>
                      </div>
                      <span className="text-[8px] bg-pink-50 text-pink-800 px-2 py-0.5 rounded-lg font-black">{u.membership}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {targetType === 'multiple' && (
              <div className="bg-pink-50/20 p-4 rounded-2xl border border-pink-100/50 space-y-3">
                <p className="text-[9px] font-black text-gray-400">حددي الزبونات اللواتي ترغبين بإرسال الإشعار لهن:</p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحثي بالاسم أو رقم الهاتف..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full bg-white border border-pink-100 text-[10px] px-3 py-2 pr-8 rounded-xl text-right focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {filteredUsers.map(u => {
                    const isChecked = selectedMultipleUserIds.includes(u.uid);
                    return (
                      <div 
                        key={u.uid}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedMultipleUserIds(prev => prev.filter(id => id !== u.uid));
                          } else {
                            setSelectedMultipleUserIds(prev => [...prev, u.uid]);
                          }
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-pink-100/60 border-pink-300' 
                            : 'bg-white hover:bg-pink-50/20 border-pink-100/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckSquare className={`w-4 h-4 transition-all ${isChecked ? 'text-pink-700 fill-pink-100' : 'text-gray-300'}`} />
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-pink-100">
                            <img src={u.avatar} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[10px] font-black text-gray-800">{u.name}</span>
                        </div>
                        <span className="text-[8px] bg-pink-50 text-pink-800 px-2 py-0.5 rounded-lg font-black">{u.membership}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Visual enhancements / Cover Image */}
          <div className="space-y-3 border-t border-pink-50/80 pt-4">
            <label className="text-[10px] font-black text-gray-400 block">صورة الغلاف الفاخرة للتنبيه (اختياري 🎨):</label>
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_IMAGES.map(img => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => {
                    setSelectedPresetImage(img.url);
                    setCustomImageUrl('');
                  }}
                  className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedPresetImage === img.url ? 'border-pink-600 scale-95 ring-2 ring-pink-100' : 'border-transparent opacity-85 hover:opacity-100'
                  }`}
                  title={img.label}
                >
                  <img src={img.url} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[7px] text-white py-0.5 text-center truncate px-0.5">{img.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="أو الصقي رابط صورة مخصص هنا..."
                value={customImageUrl}
                onChange={(e) => {
                  setCustomImageUrl(e.target.value);
                  setSelectedPresetImage('');
                }}
                className="flex-1 bg-pink-50/20 border border-pink-100 text-[10px] px-3 py-2.5 rounded-xl text-right text-gray-700"
              />
              {(customImageUrl || selectedPresetImage) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomImageUrl('');
                    setSelectedPresetImage('');
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-[9px] px-3 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  حذف الصورة
                </button>
              )}
            </div>
          </div>

          {/* Action Link Button */}
          <div className="grid grid-cols-2 gap-4 border-t border-pink-50/80 pt-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 block">نص زر الإجراء (مثال: تتبع شحنتك 🚚):</label>
              <input 
                type="text"
                placeholder="اكتبي نص الزر التفاعلي..."
                value={actionLabel}
                onChange={(e) => setActionLabel(e.target.value)}
                className="w-full bg-pink-50/20 border border-pink-100 text-xs px-4 py-2.5 rounded-2xl text-right text-gray-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 block">الوجهة أو التبويب المستهدف:</label>
              <select
                value={actionTab}
                onChange={(e) => setActionTab(e.target.value as any)}
                className="w-full bg-white border border-pink-100 text-xs px-4 py-2.5 rounded-2xl text-right text-gray-700 font-bold"
              >
                <option value="dashboard">الرئيسية 🏠</option>
                <option value="tracking">تتبع الشحنات 🚚</option>
                <option value="invoices">الفواتير والمالية 💳</option>
                <option value="profile">الحساب الشخصي 👤</option>
              </select>
            </div>
          </div>

          {/* Scheduling Controls */}
          <div className="space-y-3 border-t border-pink-50/80 pt-4 bg-pink-50/10 p-4 rounded-3xl border border-pink-100/20">
            <label className="text-[10px] font-black text-pink-800 block">توقيت البث وجدولة الإرسال ⏳:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-700">
                <input 
                  type="radio" 
                  name="scheduling" 
                  checked={schedulingType === 'now'}
                  onChange={() => setSchedulingType('now')}
                  className="accent-pink-600"
                />
                <span>إرسال فوري الآن (Instant) 🚀</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-gray-700">
                <input 
                  type="radio" 
                  name="scheduling" 
                  checked={schedulingType === 'later'}
                  onChange={() => setSchedulingType('later')}
                  className="accent-pink-600"
                />
                <span>جدولة في وقت لاحق (Schedule) ⏳</span>
              </label>
            </div>

            {schedulingType === 'later' && (
              <div className="grid grid-cols-2 gap-4 pt-2 animate-fade-in">
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold">تاريخ ووقت البث المجدول:</span>
                  <input 
                    type="datetime-local"
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    className="w-full bg-white border border-pink-100 text-xs px-4 py-2 rounded-xl text-center text-gray-700"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 font-bold">تكرار الإرسال الدوري:</span>
                  <select
                    value={repeatInterval}
                    onChange={(e) => setRepeatInterval(e.target.value as any)}
                    className="w-full bg-white border border-pink-100 text-xs px-4 py-2.5 rounded-xl text-right text-gray-700 font-bold"
                  >
                    <option value="none">بدون تكرار (مرة واحدة)</option>
                    <option value="daily">تكرار يومي (Daily)</option>
                    <option value="weekly">تكرار أسبوعي (Weekly)</option>
                    <option value="monthly">تكرار شهري (Monthly)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-700 to-rose-600 hover:from-pink-800 hover:to-rose-700 text-white font-black text-xs py-3.5 rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {editingNotifId ? (
              <>
                <Edit3 className="w-4 h-4" />
                <span>تحديث وحفظ التغييرات الياقوتية 🪄</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 rotate-180" />
                <span>إرسال وبث التنبيه اللحظي الآن ✨</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Sent & Scheduled Notifications List */}
      <div className="bg-white/95 backdrop-blur-xl border border-pink-100 p-6 rounded-[2.5rem] shadow-sm space-y-6 text-right" id="manager-notifications-list" dir="rtl">
        <div className="flex justify-between items-center border-b border-pink-50 pb-4">
          <div>
            <h3 className="font-black text-sm text-pink-900">سجل التنبيهات والبث السحابي 📡</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">مراقبة وتعديل وحذف التنبيهات المباشرة والمجدولة.</p>
          </div>
          <span className="text-[9px] bg-pink-50 text-pink-700 px-3 py-1 rounded-full font-black">
            {notifications.length} إشعار مسجل
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 space-y-2">
            <span className="material-symbols-outlined text-4xl animate-spin text-pink-700">sync</span>
            <p className="text-xs">جاري جلب سجل التنبيهات من السحابة...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-400 space-y-2 border-2 border-dashed border-pink-50 rounded-3xl">
            <Bell className="w-8 h-8 text-pink-200 mx-auto" />
            <p className="text-xs font-bold text-gray-400">لا يوجد أي تنبيهات في قاعدة البيانات حالياً.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => {
              const isScheduled = notif.status === 'scheduled';
              return (
                <div 
                  key={notif.id}
                  className={`p-4 rounded-[1.8rem] border transition-all ${
                    isScheduled 
                      ? 'bg-amber-50/40 border-amber-200/60 shadow-sm' 
                      : 'bg-white border-pink-50 hover:border-pink-200 shadow-sm'
                  } flex flex-col gap-3 relative overflow-hidden`}
                >
                  <div className="flex gap-3">
                    {/* Visual Thumb */}
                    {notif.image ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-pink-100/50 shadow-sm shrink-0">
                        <img src={notif.image} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-pink-50/50 flex items-center justify-center shrink-0 border border-pink-100/20">
                        {getIconForType(notif.type)}
                      </div>
                    )}

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-pink-700 bg-pink-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          {getIconForType(notif.type)}
                          <span>{getTypeArabic(notif.type)}</span>
                        </span>
                        
                        {isScheduled ? (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg font-black flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>مجدول: {notif.scheduledTime}</span>
                          </span>
                        ) : (
                          <span className="text-[9px] text-gray-400 font-bold">{notif.time || 'الآن'}</span>
                        )}
                      </div>

                      <h4 className="font-black text-gray-800 text-xs mt-1.5">{notif.title}</h4>
                      <p className="text-[11px] text-gray-500 font-semibold mt-1 leading-relaxed">{notif.content}</p>
                    </div>
                  </div>

                  {/* Metadata and action buttons */}
                  <div className="flex justify-between items-center pt-2.5 border-t border-pink-50/50 text-[10px]">
                    <div className="flex gap-2 items-center">
                      <span className="text-[9px] text-gray-400 font-bold">المستهدف:</span>
                      <span className="text-gray-700 font-black bg-gray-50 px-2 py-0.5 rounded-md">{getTargetLabel(notif)}</span>
                    </div>

                    <div className="flex gap-1.5">
                      {isScheduled && (
                        <button
                          onClick={() => triggerScheduledNow(notif)}
                          className="px-2.5 py-1 rounded-lg bg-pink-700 hover:bg-pink-800 text-white font-black text-[9px] cursor-pointer shadow-sm active:scale-95 transition-all flex items-center gap-1"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>إرسال الآن 🚀</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleEditClick(notif)}
                        className="p-1 px-2.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-800 font-bold cursor-pointer flex items-center gap-1"
                        title="تعديل"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => handleDeleteClick(notif.id)}
                        className="p-1 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                        title="حذف التنبيه"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
