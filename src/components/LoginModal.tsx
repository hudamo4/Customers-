import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic, triggerWarningHaptic } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, User as UserIcon, Lock, Sparkles, AlertCircle, Loader2, Key, Heart, ArrowLeft, ArrowRight } from 'lucide-react';

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal, login, register } = useApp();
  
  // 'customer' | 'manager'
  const [activePortal, setActivePortal] = useState<'customer' | 'manager'>('customer');
  
  // Customer mode: 'login' | 'signup'
  const [customerMode, setCustomerMode] = useState<'login' | 'signup'>('login');
  
  // Form fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hidden Manager Portal Unlock States
  const [crownClicks, setCrownClicks] = useState(0);
  const [showPasscodePrompt, setShowPasscodePrompt] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);
  const [managerUnlocked, setManagerUnlocked] = useState(false);

  if (!showLoginModal) return null;

  const handleCrownClick = () => {
    triggerLightHaptic();
    const clicks = crownClicks + 1;
    setCrownClicks(clicks);
    if (clicks >= 5) {
      setCrownClicks(0);
      triggerMediumHaptic();
      setShowPasscodePrompt(true);
      setPasscode('');
      setPasscodeError(false);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '9988') {
      triggerSuccessHaptic();
      setManagerUnlocked(true);
      setActivePortal('manager');
      setShowPasscodePrompt(false);
      setPasscode('');
      setPasscodeError(false);
    } else {
      triggerWarningHaptic();
      setPasscodeError(true);
      setPasscode('');
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!username.trim()) {
      triggerWarningHaptic();
      setErrorMsg('يرجى إدخال اسم المستخدم الأنيق 🌸');
      return;
    }
    if (customerMode === 'signup' && !fullName.trim()) {
      triggerWarningHaptic();
      setErrorMsg('يرجى إدخال اسمكِ الكامل لنسعد بخدمتكِ ✨');
      return;
    }
    if (customerMode === 'signup' && !phone.trim()) {
      triggerWarningHaptic();
      setErrorMsg('يرجى إدخال رقم هاتفكِ لتتبع الشحنات 📱');
      return;
    }
    if (!password) {
      triggerWarningHaptic();
      setErrorMsg('يرجى إدخال كلمة المرور السرية الخاص بكِ 🔒');
      return;
    }

    setIsSubmitting(true);
    triggerMediumHaptic();

    if (customerMode === 'login') {
      const res = await login(username, password);
      setIsSubmitting(false);
      if (res.success) {
        triggerSuccessHaptic();
        setShowLoginModal(false);
        resetForm();
      } else {
        triggerWarningHaptic();
        setErrorMsg(res.error || 'خطأ في اسم المستخدم أو كلمة المرور 🌸');
      }
    } else {
      // Signup
      const res = await register(username, phone, fullName, password);
      if (res.success) {
        // Auto-login after registration
        const loginRes = await login(username, password);
        setIsSubmitting(false);
        if (loginRes.success) {
          triggerSuccessHaptic();
          setSuccessMsg('تم إنشاء حسابكِ الراقي بنجاح! مرحباً بكِ في عالم إيرامو 💖');
          setTimeout(() => {
            setShowLoginModal(false);
            resetForm();
          }, 2000);
        } else {
          setCustomerMode('login');
          setIsSubmitting(false);
        }
      } else {
        setIsSubmitting(false);
        triggerWarningHaptic();
        setErrorMsg(res.error || 'فشل إنشاء الحساب، يرجى المحاولة مجدداً ✨');
      }
    }
  };

  const handleManagerDirectLogin = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    triggerMediumHaptic();
    
    // Direct login as manager using the established system credentials via the elegant single tap
    const res = await login('Admin_001', 'admin123');
    setIsSubmitting(false);
    
    if (res.success) {
      triggerSuccessHaptic();
      setShowLoginModal(false);
      resetForm();
    } else {
      triggerWarningHaptic();
      setErrorMsg('عذراً، تعذر الدخول التلقائي للإدارة في الوقت الحالي.');
    }
  };

  const resetForm = () => {
    setUsername('');
    setFullName('');
    setPhone('');
    setPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            triggerLightHaptic();
            setShowLoginModal(false);
          }}
          className="absolute inset-0 bg-pink-950/40 backdrop-blur-md"
        />

        {/* Beautiful Beige/Pink Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 360 }}
          className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-[#fffdfc] p-6 text-right border-2 border-pink-100 shadow-[0_20px_50px_rgba(219,39,119,0.12)]"
          dir="rtl"
        >
          {/* Subtle luxurious glowing background gradients */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-pink-100/50 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-50 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => {
              triggerLightHaptic();
              setShowLoginModal(false);
            }}
            className="absolute top-5 left-5 p-2 rounded-full bg-pink-50/50 hover:bg-pink-100/70 text-pink-700 transition-all border border-pink-100/30 active:scale-90 animate-fade-in"
          >
            <X size={16} />
          </button>

          {/* Passcode input dialog overlay inside the modal */}
          <AnimatePresence>
            {showPasscodePrompt && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex flex-col justify-center items-center p-6 text-center animate-fade-in"
              >
                <div className="bg-pink-50 w-12 h-12 rounded-full flex items-center justify-center text-pink-700 mb-3 animate-bounce">
                  <Lock size={20} />
                </div>
                <h3 className="font-black text-pink-950 text-sm mb-1">التحقق من هوية المديرة 🔐</h3>
                <p className="text-[10px] text-pink-700 font-bold mb-4 max-w-[280px]">
                  يرجى إدخال رمز الأمان السري الخاص بكِ لفتح بوابة المديرة هدوشة بالكامل.
                </p>

                <form onSubmit={handlePasscodeSubmit} className="w-full max-w-[240px] space-y-3">
                  <input
                    type="password"
                    placeholder="رمز الأمان السري"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setPasscodeError(false);
                    }}
                    className={`w-full text-center tracking-widest text-sm font-bold bg-pink-50/30 border ${
                      passcodeError ? 'border-red-400 focus:ring-red-200' : 'border-pink-200 focus:ring-pink-300'
                    } py-2.5 rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-pink-300`}
                    autoFocus
                  />
                  {passcodeError && (
                    <p className="text-[10px] text-red-600 font-bold animate-pulse">
                      ❌ رمز الأمان غير صحيح!
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-gradient-to-r from-pink-600 to-pink-800 text-white font-black text-[11px] rounded-xl active:scale-95 transition-all shadow-md shadow-pink-700/10 cursor-pointer"
                    >
                      تأكيد الرمز
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerLightHaptic();
                        setShowPasscodePrompt(false);
                        setPasscode('');
                        setPasscodeError(false);
                      }}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 font-black text-[11px] rounded-xl active:scale-95 transition-all cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Luxury Brand Header */}
          <div className="flex flex-col items-center text-center mt-3 mb-6">
            <span 
              onClick={handleCrownClick}
              className="text-2xl mb-1 filter drop-shadow cursor-pointer select-none active:scale-125 transition-transform"
              title="بوابة هدى السرية"
            >
              👑
            </span>
            <h2 className="text-xl font-black text-pink-950 tracking-tight">إيرامو ستور الأنيق</h2>
            <p className="text-[11px] text-pink-700/70 font-bold mt-0.5">بوابتكِ الخاصة للأناقة، تتبع الشحنات والفواتير</p>
          </div>

          {/* Primary Portal Switch Tabs (Customer vs Manager) - ONLY VISIBLE IF UNLOCKED */}
          {managerUnlocked && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 p-1 gap-1 rounded-2xl bg-pink-50/40 border border-pink-100/50 mb-6"
            >
              <button
                onClick={() => {
                  triggerLightHaptic();
                  setActivePortal('customer');
                  resetForm();
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activePortal === 'customer'
                    ? 'bg-gradient-to-r from-pink-600 to-pink-800 text-white shadow-md shadow-pink-700/10'
                    : 'text-pink-900/60 hover:text-pink-900 hover:bg-pink-100/30'
                }`}
              >
                <Heart size={13} />
                بوابة الزبونات الأنيقات
              </button>
              <button
                onClick={() => {
                  triggerLightHaptic();
                  setActivePortal('manager');
                  resetForm();
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activePortal === 'manager'
                    ? 'bg-gradient-to-r from-pink-600 to-pink-800 text-white shadow-md shadow-pink-700/10'
                    : 'text-pink-900/60 hover:text-pink-900 hover:bg-pink-100/30'
                }`}
              >
                <Sparkles size={13} />
                بوابة المديرة هدوشة
              </button>
            </motion.div>
          )}

          {/* CUSTOMER PORTAL VIEW */}
          {activePortal === 'customer' && (
            <div>
              {/* Login / Signup Switcher */}
              <div className="flex items-center justify-center gap-6 mb-5 text-sm border-b border-pink-100/30 pb-3">
                <button
                  onClick={() => {
                    triggerLightHaptic();
                    setCustomerMode('login');
                    resetForm();
                  }}
                  className={`relative font-black pb-1.5 transition-all ${
                    customerMode === 'login' ? 'text-pink-800' : 'text-gray-400 hover:text-pink-600'
                  }`}
                >
                  تسجيل الدخول
                  {customerMode === 'login' && (
                    <motion.div layoutId="modeUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => {
                    triggerLightHaptic();
                    setCustomerMode('signup');
                    resetForm();
                  }}
                  className={`relative font-black pb-1.5 transition-all ${
                    customerMode === 'signup' ? 'text-pink-800' : 'text-gray-400 hover:text-pink-600'
                  }`}
                >
                  إنشاء حساب جديد
                  {customerMode === 'signup' && (
                    <motion.div layoutId="modeUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-600 rounded-full" />
                  )}
                </button>
              </div>

              {/* Success / Error Messages */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs mb-4 font-bold"
                >
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs mb-4 font-bold"
                >
                  <Sparkles size={15} className="shrink-0 text-emerald-600 animate-bounce" />
                  <span>{successMsg}</span>
                </motion.div>
              )}

              {/* Customer Input Forms */}
              <form onSubmit={handleCustomerSubmit} className="space-y-3.5">
                {/* Username */}
                <div>
                  <label className="block text-[11px] font-black text-pink-950 mb-1.5 mr-1">
                    اسم المستخدم (بالأحرف الإنجليزية)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="مثال: Huda_001"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-11 pr-9 pl-4 rounded-xl bg-pink-50/20 border-2 border-pink-100/50 hover:border-pink-200 focus:border-pink-500 text-pink-950 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500/30 transition-all text-right placeholder-pink-300 font-bold"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-pink-400 pointer-events-none">
                      <UserIcon size={15} />
                    </div>
                  </div>
                </div>

                {/* Additional fields for Sign-up */}
                {customerMode === 'signup' && (
                  <>
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-black text-pink-950 mb-1.5 mr-1">
                        الاسم الكامل
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="مثال: هدى السلطاني"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full h-11 pr-9 pl-4 rounded-xl bg-pink-50/20 border-2 border-pink-100/50 hover:border-pink-200 focus:border-pink-500 text-pink-950 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500/30 transition-all text-right placeholder-pink-300 font-bold"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-pink-400 pointer-events-none">
                          <Heart size={14} className="fill-current" />
                        </div>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-[11px] font-black text-pink-950 mb-1.5 mr-1">
                        رقم الهاتف المسجل لديكِ
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="مثال: 07801234567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full h-11 pr-9 pl-4 rounded-xl bg-pink-50/20 border-2 border-pink-100/50 hover:border-pink-200 focus:border-pink-500 text-pink-950 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500/30 transition-all text-right placeholder-pink-300 font-bold"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-pink-400 pointer-events-none">
                          <Phone size={15} />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-black text-pink-950 mb-1.5 mr-1">
                    كلمة المرور السرية
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="•••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pr-9 pl-4 rounded-xl bg-pink-50/20 border-2 border-pink-100/50 hover:border-pink-200 focus:border-pink-500 text-pink-950 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500/30 transition-all text-right placeholder-pink-300 font-mono"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-pink-400 pointer-events-none">
                      <Lock size={15} />
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl mt-5 font-black text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-800 hover:from-pink-700 hover:to-pink-900 text-white shadow-md shadow-pink-700/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-white" />
                      جاري التحقق والتجهيز...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      {customerMode === 'login' ? 'تسجيل دخول آمن' : 'إنشاء حساب جديد والدخول مباشرة 💖'}
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* MANAGER PORTAL VIEW (Direct visual tap login - No input fields, elegance first) */}
          {activePortal === 'manager' && (
            <div className="flex flex-col items-center py-6 animate-fade-in">
              {/* Visual profile avatar container */}
              <div className="relative group cursor-pointer mb-6" onClick={handleManagerDirectLogin}>
                {/* Pulse background effects */}
                <div className="absolute inset-0 bg-pink-400/20 rounded-full blur-xl scale-125 group-hover:scale-135 transition-transform animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-400 to-amber-300 rounded-full p-1 animate-spin duration-3000 opacity-50" />
                
                {/* Manager profile avatar image */}
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-[#fffdfc] shadow-lg hover:shadow-pink-400/30 transition-all duration-300 active:scale-95">
                  <img
                    alt="Manager Avatar"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9EaYCDGI3nnclPO4Dfn8I8RZWRNVEKBUb-qxzppoUDSSF0uOYRcTHzQEOvzXtqZyk5bVh4idglS262c_ZUgYdgA-h1OorPVThxh8UXI7GHoH2uDEhbQg2eVlFMYU4isBKM9I_0LSyYdiFMT_ttIH-xYE0KuXOFy-Kz_UIlEMn-XC4L9y1Vol5VvGdb1i51-vz5DCQ3rO23XQP4xhX_1niZMeMM8D-RuEUU1U-r7VqHSMTCi7iILOoNy4WG-WS3v4pxciGg6Rk_QE"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-950/70 via-transparent to-transparent flex items-end justify-center pb-2">
                    <span className="text-[10px] font-black text-white tracking-widest">هدوشة ✨</span>
                  </div>
                </div>

                {/* Crown decoration badge */}
                <div className="absolute -top-3 -right-1 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 shadow flex items-center justify-center text-xs animate-bounce">
                  👑
                </div>
              </div>

              {/* Title & guidance */}
              <div className="text-center max-w-[285px] mb-6 space-y-2">
                <h3 className="font-black text-pink-950 text-sm">أهلاً بكِ مجدداً يا ملكة المتجر 👑</h3>
                <p className="text-[11px] text-pink-700 font-bold leading-relaxed">
                  بوابة التحكم السريعة والآمنة الخاصة بمديرة إيرامو.
                </p>
                <div className="py-2.5 px-4 bg-pink-50/40 rounded-2xl border border-pink-100/50 inline-block">
                  <span className="text-[10px] text-pink-800 font-black animate-pulse">
                    ✨ اضغطي على صورتكِ الراقيـة للدخول الفوري ✨
                  </span>
                </div>
              </div>

              {/* Loading button fallback trigger */}
              <button
                onClick={handleManagerDirectLogin}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 bg-gradient-to-r from-pink-600 to-pink-800 text-white shadow-md shadow-pink-700/10 active:scale-98 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-white" />
                    جاري الدخول بصفة ملكة المتجر...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    تسجيل الدخول كـ مديرة 👑
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
