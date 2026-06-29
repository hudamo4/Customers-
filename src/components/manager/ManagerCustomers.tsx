import React, { useState } from 'react';
import { DEFAULT_AVATAR } from '../../utils/avatar';
import { 
  Users, 
  Search, 
  Sparkles, 
  Plus, 
  Star, 
  CheckCircle, 
  Award,
  Smartphone,
  MapPin,
  Calendar
} from 'lucide-react';

interface MockCustomer {
  id: string;
  name: string;
  phone: string;
  city: string;
  points: number;
  class: 'ذهبي' | 'فضي' | 'بلاتيني';
  avatar: string;
  joinDate: string;
}

export default function ManagerCustomers() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Custom mock customers list mapping Iraq names
  const [customers, setCustomers] = useState<MockCustomer[]>([
    {
      id: 'cust_1',
      name: 'سارة علي',
      phone: '+964 770 123 4567',
      city: 'بغداد، بابل',
      points: 2450,
      class: 'ذهبي',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkcpfVr8wniE5xCJAVxvkfRTdM-wo2pS6ZLjoAAR8vvxhwdnFL_Eqz5ppKytfnF7tKteyNH8pNfeNHZCgOHilx_vf0RxGy9L_S1vjDTGPdqubALD1vGc66vwxZXgSgt1yjkmDYXxxaHZmIDRUn57ZI0ZUxyl4KpI5swshHIq08yVvysKdGUmfiWi8xjMtaKkXbeXfdMkKmmX937lW0KpGk_r79A2ELYxV-Q1DrbFFkLoQag5QtCJVrQX91Bn4yhdHsry4A3P_FUng',
      joinDate: '2023-05-12'
    },
    {
      id: 'cust_2',
      name: 'أمنة العراق',
      phone: '+964 780 445 1290',
      city: 'بغداد، الكرادة',
      points: 1250,
      class: 'ذهبي',
      avatar: DEFAULT_AVATAR,
      joinDate: '2023-01-20'
    },
    {
      id: 'cust_3',
      name: 'هدى السلطاني',
      phone: '+964 750 992 1124',
      city: 'الحلة، بابل',
      points: 5400,
      class: 'بلاتيني',
      avatar: 'https://lh3.googleusercontent.com/aida/AP1WRLs7xYMw1dlJILjhZ2VzHUgTES3bYmOtS532eeDn9JpDom3Gp-MaPoVhT_e495zabXi9PhvxGhgg_DGSwGWwf9dmXp5ZUWaJm0RCNd8GbCsm6Pfsr0iJJMO0aAxy5MOcRhILsJttChJdkmTm_mZbX5E5mSnfAvK48H_feUdzK0meAC_w_y8FpVIQyOMw7BefhhUleQ-yNPc9mOamo6Uhxfvs0PQtY8Tp68F3pQbyGpw3MPMMO_Rkhd2fSw',
      joinDate: '2022-10-15'
    },
    {
      id: 'cust_4',
      name: 'زهراء محمد',
      phone: '+964 771 883 1102',
      city: 'أربيل، كوردستان',
      points: 850,
      class: 'فضي',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkcpfVr8wniE5xCJAVxvkfRTdM-wo2pS6ZLjoAAR8vvxhwdnFL_Eqz5ppKytfnF7tKteyNH8pNfeNHZCgOHilx_vf0RxGy9L_S1vjDTGPdqubALD1vGc66vwxZXgSgt1yjkmDYXxxaHZmIDRUn57ZI0ZUxyl4KpI5swshHIq08yVvysKdGUmfiWi8xjMtaKkXbeXfdMkKmmX937lW0KpGk_r79A2ELYxV-Q1DrbFFkLoQag5QtCJVrQX91Bn4yhdHsry4A3P_FUng',
      joinDate: '2023-08-05'
    }
  ]);

  const filtered = customers.filter(cust => 
    cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cust.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cust.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="manager-customers">
      
      {/* Featured Quote / Mascot Greeting */}
      <div className="bg-white/70 backdrop-blur-xl border border-pink-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4 text-right" dir="rtl">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-100 shrink-0">
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw0xKB-4XQGiCPqXbuGq8APMBdzW2M0L-ExpE11qomM_33WX4Zfa3VKeZt7ycefguOAsfq87QiTcQbNirpa65C1u6ZJkyPh5qSy5w8rFw-2f_VaP7vmXjslvUqo6qScQKbqMV8z3VK0_MD6CCR-T3efRZC_JorCRcBTiQJsHmEM4Wx30fA5botntSpYRXLuerNRHWaMjjQHXiUw467xTvDBl30QGA1v31JBe6wz7_7HyWWC3e3yu2oxKrfFZkb_DakDSTcVGfoBdo"
          />
        </div>
        <div>
          <h3 className="font-black text-sm text-pink-900">نصيحة هدوشة في معاملة العملاء 💖</h3>
          <p className="text-[11px] text-gray-500 leading-relaxed mt-1 font-bold">
            "أهلاً هدى! تذكري دائماً أن معاملة الزبونة كملكة وتقديم أرقى درجات الاهتمام بخصوصية شحنتها وأناقتها هي السر الأول لولاء عميلاتنا لـ IRAMO STORE."
          </p>
        </div>
      </div>

      {/* Quick Stats Bento */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-pink-50 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">إجمالي الزبائن</p>
          <p className="text-lg font-black text-pink-700 mt-1">{customers.length}</p>
        </div>
        <div className="bg-white border border-pink-50 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">النشطات هذا الشهر</p>
          <p className="text-lg font-black text-pink-700 mt-1">4</p>
        </div>
        <div className="bg-white border border-pink-50 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">متوسط الولاء</p>
          <p className="text-lg font-black text-emerald-600 mt-1">4.9 ★</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input 
          type="text"
          placeholder="البحث عن العميلات بالاسم، الهاتف، المحافظة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-pink-100 text-xs px-4 py-3 pr-10 rounded-2xl text-right text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-300 font-bold shadow-sm"
          dir="rtl"
        />
        <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
      </div>

      {/* Customer Cards List */}
      <div className="space-y-4">
        {filtered.map(cust => (
          <div 
            key={cust.id}
            className="bg-white border border-pink-100 p-5 rounded-3xl shadow-sm text-right space-y-4"
            dir="rtl"
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-50 shadow-sm shrink-0">
                  <img src={cust.avatar} alt={cust.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-black text-gray-800 text-sm flex items-center gap-1">
                    {cust.name}
                    <CheckCircle className="w-3.5 h-3.5 text-pink-700" />
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 mt-0.5">
                    <Smartphone className="w-3 h-3" />
                    <span>{cust.phone}</span>
                  </p>
                </div>
              </div>

              {/* Class display */}
              <span className={`text-[9px] px-2.5 py-1 rounded-full font-black flex items-center gap-1 ${
                cust.class === 'بلاتيني'
                  ? 'bg-neutral-900 text-pink-300 border border-neutral-800'
                  : cust.class === 'ذهبي'
                    ? 'bg-amber-50 text-amber-800 border border-amber-100'
                    : 'bg-gray-100 text-gray-600'
              }`}>
                <Award className="w-3 h-3" />
                <span>عضوية {cust.class}</span>
              </span>
            </div>

            {/* Loyalty points stats info */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-pink-50/50">
              <div>
                <span className="text-[9px] text-gray-400 block font-bold">نقاط الولاء المجمعة:</span>
                <span className="text-pink-700 font-black">{cust.points.toLocaleString()} نقطة</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 block font-bold">الموقع المعتمد للتسليم:</span>
                <span className="text-gray-800 font-black flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-pink-600" />
                  {cust.city}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex gap-2">
              <a 
                href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 text-center bg-emerald-50 hover:bg-emerald-100 text-emerald-800 py-2.5 rounded-xl text-[10px] font-black transition-all cursor-pointer"
              >
                تواصل عبر الواتساب 💬
              </a>
              <button 
                onClick={() => alert(`🔍 سجل العميل المالي والطرود لـ ${cust.name} آمن ومحفوظ بنجاح!`)}
                className="flex-1 bg-pink-50/50 hover:bg-pink-100/50 text-pink-800 py-2.5 rounded-xl text-[10px] font-black transition-all cursor-pointer"
              >
                عرض سجل الشحنات
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
