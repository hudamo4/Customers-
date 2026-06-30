import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, ArrowRight, Delete, RotateCcw } from 'lucide-react';
import { triggerLightHaptic, triggerSuccessHaptic, triggerWarningHaptic } from '../../utils/haptics';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLockScreenProps {
  onUnlock: () => void;
  onCancel: () => void;
}

export default function AdminLockScreen({ onUnlock, onCancel }: AdminLockScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  const correctPins = ['9988', 'huda44', 'huda2026'];

  const handleKeyPress = (num: string) => {
    if (pin.length >= 6) return;
    triggerLightHaptic();
    setError(false);
    const nextPin = pin + num;
    setPin(nextPin);

    // Auto check if it matches any PINs (only for 4 digit PIN like 9988, or full check)
    if (nextPin === '9988') {
      triggerSuccess();
    }
  };

  const handleBackspace = () => {
    triggerLightHaptic();
    setError(false);
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    triggerLightHaptic();
    setError(false);
    setPin('');
  };

  const triggerSuccess = () => {
    triggerSuccessHaptic();
    setIsUnlocked(true);
    setTimeout(() => {
      onUnlock();
    }, 800);
  };

  const handleVerify = () => {
    if (correctPins.includes(pin)) {
      triggerSuccess();
    } else {
      triggerWarningHaptic();
      setError(true);
      setPin('');
      // Shake animation effect triggered by error state
    }
  };

  return (
    <div className="absolute inset-0 z-[999] bg-gradient-to-b from-slate-950 via-neutral-900 to-slate-950 flex flex-col justify-between p-6 text-white text-right font-sans" dir="rtl">
      
      {/* Decorative Blur Background Lights */}
      <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Cancel Button */}
      <div className="flex justify-between items-center w-full z-10">
        <button 
          onClick={() => {
            triggerLightHaptic();
            onCancel();
          }}
          className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-pink-400 transition-all bg-white/5 px-3.5 py-1.5 rounded-full border border-white/5 cursor-pointer active:scale-95"
        >
          <span>الرجوع للزبائن</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] bg-red-950/50 border border-red-500/20 text-red-400 px-3 py-1 rounded-full font-black flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
          <span>منطقة إدارية مشفرة</span>
        </span>
      </div>

      {/* Security Status Indicator */}
      <div className="flex flex-col items-center justify-center space-y-4 my-auto z-10 text-center">
        {/* Animated Lock Sphere */}
        <motion.div 
          animate={error ? { x: [-6, 6, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl relative border-2 ${
            isUnlocked 
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-emerald-500/10' 
              : error 
              ? 'bg-rose-500/20 border-rose-400 text-rose-400 shadow-rose-500/10' 
              : 'bg-pink-500/10 border-pink-500/30 text-pink-400'
          }`}
        >
          {isUnlocked ? (
            <Unlock className="w-8 h-8 animate-bounce" />
          ) : (
            <Lock className="w-8 h-8" />
          )}

          {/* Glowing pulse ring */}
          {!isUnlocked && (
            <span className="absolute inset-0 rounded-full border border-pink-500/20 animate-ping opacity-60" />
          )}
        </motion.div>

        <div className="space-y-1">
          <h3 className="font-black text-base text-gray-100">بوابة الإدارة لمديرة إيرامو 👑</h3>
          <p className="text-[10px] text-gray-400 font-bold max-w-xs leading-relaxed">
            الوصول مقيد ومحمي بالكامل. يرجى إدخال رمز المرور السري الخاص بكِ للمتابعة للوحة القيادة.
          </p>
        </div>

        {/* Masked Password Entry Input */}
        <div className="w-full max-w-[260px] relative py-2" dir="ltr">
          <input 
            type="password"
            value={pin}
            onChange={(e) => {
              setError(false);
              const val = e.target.value.toLowerCase();
              setPin(val);
              // Auto check for quick numeric pin 9988
              if (val === '9988') {
                triggerSuccess();
              }
            }}
            placeholder="ادخلي الرمز السري 🔒"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-center text-sm font-bold tracking-widest text-pink-400 placeholder-gray-600 focus:outline-none focus:border-pink-500 transition-all font-mono"
            autoFocus
          />
        </div>

        {/* PIN Circles Display - mask representation of length */}
        <div className="flex gap-3 py-2 justify-center items-center" dir="ltr">
          {pin.split('').map((_, idx) => (
            <div 
              key={idx}
              className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 scale-110 shadow-md shadow-pink-500/30 animate-scale-up"
            />
          ))}
          {pin.length === 0 && (
            <span className="text-[10px] text-gray-500 font-bold">بانتظار الرمز...</span>
          )}
        </div>

        {error && (
          <p className="text-[10px] text-rose-400 font-black animate-pulse bg-rose-950/40 border border-rose-500/25 px-4 py-1.5 rounded-xl">
            ⚠️ الرمز السري غير صحيح! يرجى المحاولة مرة أخرى.
          </p>
        )}
      </div>

      {/* Touch Number Pad Grid */}
      <div className="space-y-3 z-10 mb-2">
        <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 flex items-center justify-center font-black text-lg transition-all active:scale-90 cursor-pointer mx-auto"
            >
              {num}
            </button>
          ))}
          
          {/* Clear Key */}
          <button
            onClick={handleClear}
            className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 flex items-center justify-center text-xs font-black text-gray-400 transition-all active:scale-90 cursor-pointer mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Zero Key */}
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 flex items-center justify-center font-black text-lg transition-all active:scale-90 cursor-pointer mx-auto"
          >
            0
          </button>

          {/* Backspace Key */}
          <button
            onClick={handleBackspace}
            className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 flex items-center justify-center text-gray-400 transition-all active:scale-90 cursor-pointer mx-auto"
          >
            <Delete className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Action Verify Button for longer password pins like huda44 */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleVerify}
            className={`w-full max-w-[260px] py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              pin.length > 0 
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-lg active:scale-95' 
                : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
            }`}
            disabled={pin.length === 0}
          >
            <span>تأكيد الرمز والدخول 🔒</span>
          </button>
        </div>
      </div>

    </div>
  );
}
