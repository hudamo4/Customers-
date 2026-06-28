import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic, triggerWarningHaptic } from '../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';
import { X, Phone, User as UserIcon, Lock, Sparkles, AlertCircle, Loader2, Key } from 'lucide-react';

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal, login } = useApp();
  const [loginMethod, setLoginMethod] = useState<'username' | 'phone'>('username');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showLoginModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim()) {
      triggerWarningHaptic();
      setErrorMsg(loginMethod === 'username' ? 'يرجى إدخال اسم المستخدم 🌸' : 'يرجى إدخال رقم الهاتف 🌸');
      return;
    }
    if (!password) {
      triggerWarningHaptic();
      setErrorMsg('يرجى إدخال كلمة المرور 💖');
      return;
    }

    setIsSubmitting(true);
    triggerMediumHaptic();

    const res = await login(identifier, password);
    setIsSubmitting(false);

    if (res.success) {
      triggerSuccessHaptic();
      setShowLoginModal(false);
      setIdentifier('');
      setPassword('');
    } else {
      triggerWarningHaptic();
      setErrorMsg(res.error || 'فشل تسجيل الدخول، يرجى التحقق من البيانات.');
    }
  };

  const handleQuickFill = (type: 'customer' | 'admin') => {
    triggerLightHaptic();
    if (type === 'customer') {
      setLoginMethod('username');
      setIdentifier('Huda_001');
      setPassword('123456');
    } else {
      setLoginMethod('username');
      setIdentifier('Admin_001');
      setPassword('admin123');
    }
    setErrorMsg(null);
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
          className="absolute inset-0 bg-black/65 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-slate-900/90 p-6 text-right text-white border border-amber-500/20 shadow-[0_0_50px_rgba(212,163,89,0.15)] backdrop-blur-xl"
          dir="rtl"
        >
          {/* Sparkly corner accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => {
              triggerLightHaptic();
              setShowLoginModal(false);
            }}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* Icon & Title */}
          <div className="flex flex-col items-center text-center mt-4 mb-6">
            <div className="relative mb-3 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-rose-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-slate-950">
              <Key size={26} className="animate-pulse" />
              <div className="absolute -top-1 -right-1 text-amber-300">
                <Sparkles size={16} />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-rose-200 to-amber-200 bg-clip-text text-transparent">
              بوابة عملاء إيرامو
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-[280px]">
              سجلي الدخول للوصول الآمن لشحناتكِ، فواتيركِ ومحفظتكِ الرقمية
            </p>
          </div>

          {/* Method selector tab */}
          <div className="grid grid-cols-2 p-1 gap-1 rounded-xl bg-slate-950/60 border border-white/5 mb-5">
            <button
              onClick={() => {
                triggerLightHaptic();
                setLoginMethod('username');
                setIdentifier('');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                loginMethod === 'username'
                  ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <UserIcon size={16} />
              اسم المستخدم
            </button>
            <button
              onClick={() => {
                triggerLightHaptic();
                setLoginMethod('phone');
                setIdentifier('');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                loginMethod === 'phone'
                  ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Phone size={16} />
              رقم الهاتف
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs"
              >
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 mr-1">
                {loginMethod === 'username' ? 'اسم المستخدم الخاص بكِ' : 'رقم الهاتف المسجل لدينا'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={loginMethod === 'username' ? 'مثال: Huda_001' : 'مثال: 07801234567'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full h-12 pr-10 pl-4 rounded-xl bg-slate-950/40 border border-white/10 hover:border-amber-500/30 focus:border-amber-500 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all text-right placeholder-slate-600 font-mono"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 pointer-events-none">
                  {loginMethod === 'username' ? <UserIcon size={18} /> : <Phone size={18} />}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 mr-1">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pr-10 pl-4 rounded-xl bg-slate-950/40 border border-white/10 hover:border-amber-500/30 focus:border-amber-500 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all text-right placeholder-slate-600 font-mono"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 pointer-events-none">
                  <Lock size={18} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl mt-6 font-semibold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-rose-400 hover:from-amber-600 hover:to-rose-500 text-slate-950 shadow-[0_4px_15px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  تسجيل الدخول الآمن
                </>
              )}
            </button>
          </form>

          {/* Quick filler container */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">
              بوابة الدخول السريع للاستعراض والتجربة
            </h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('customer')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-950/80 border border-white/5 hover:border-amber-500/30 text-xs flex flex-col items-center gap-0.5 transition-all text-center"
              >
                <span className="font-semibold text-amber-200">حساب الزبونة هدى</span>
                <span className="text-[10px] text-slate-500 font-mono">1-Click Auto-Fill</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-950/80 border border-white/5 hover:border-amber-500/30 text-xs flex flex-col items-center gap-0.5 transition-all text-center"
              >
                <span className="font-semibold text-rose-300">حساب مديرة المتجر</span>
                <span className="text-[10px] text-slate-500 font-mono">1-Click Auto-Fill</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
