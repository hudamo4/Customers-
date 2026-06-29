import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ArrowLeft, ShieldCheck, Compass, LogIn, ChevronLeft } from 'lucide-react';
import IramoWaxSeal from './IramoWaxSeal';
import { triggerSuccessHaptic, triggerLightHaptic, triggerMediumHaptic } from '../utils/haptics';
import { useApp } from '../context/AppContext';

interface IntroSplashScreenProps {
  onDismiss: () => void;
  onLoginTrigger: () => void;
  isLoggedIn: boolean;
}

export default function IntroSplashScreen({ onDismiss, onLoginTrigger, isLoggedIn }: IntroSplashScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const { customizations } = useApp();

  const onboardingSlides = customizations?.onboardingSlides || [
    {
      title: "أرقى الماركات العالمية بين يديكِ 🌸",
      subtitle: "تسوقي بمتعة تامة من أشهر المتاجر العالمية مثل Shein, Zara, Sephora, Dior وبضمان الأصالة الكاملة 100%.",
      bgImage: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "شحن وتوصيل فائق العناية والسرعة 🚚",
      subtitle: "نجمع شحناتكِ في مستودعاتنا بتركيا وأمريكا ونوصلها بعناية فائقة وتتبع ذكي مباشر حتى باب منزلكِ بالكرادة والمحافظات.",
      bgImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "محفظة رقمية ونقاط ولاء ذهبية 🎟️",
      subtitle: "ادفعي فواتيركِ بضغطة زر عبر محفظتكِ الرقمية واجمعي النقاط الذهبية لتستبدليها بهدايا وتخفيضات شحن حصرية.",
      bgImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=800"
    }
  ];

  const getSlideIcon = (index: number) => {
    if (index === 0) return <Sparkles className="w-8 h-8 text-pink-600 animate-pulse" />;
    if (index === 1) return <Compass className="w-8 h-8 text-pink-600 animate-spin-slow" />;
    return <ShieldCheck className="w-8 h-8 text-pink-600" />;
  };

  const handleNext = () => {
    triggerLightHaptic();
    if (currentSlide < onboardingSlides.length - 1) {
      setSlideDirection('next');
      setCurrentSlide(prev => prev + 1);
    } else {
      handleEnter();
    }
  };

  const handlePrev = () => {
    triggerLightHaptic();
    if (currentSlide > 0) {
      setSlideDirection('prev');
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleEnter = () => {
    triggerSuccessHaptic();
    sessionStorage.setItem('iramo_intro_dismissed', 'true');
    onDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[99999] bg-gradient-to-tr from-[#fff4f3] via-[#fffbf9] to-[#fffefd] flex flex-col justify-between overflow-hidden"
      dir="rtl"
    >
      {/* Decorative Brand Floating Circles and Ornaments */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-pink-200/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-5%] left-[-10%] w-[60%] h-[40%] bg-amber-200/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top Bar with Brand and Quick Skip Option */}
      <div className="pt-6 px-6 flex items-center justify-between z-10 w-full max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping"></span>
          <span className="text-[9px] font-black tracking-widest text-pink-700 bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-full uppercase">
            IRAMO PRESTIGE
          </span>
        </div>
        
        <button
          onClick={handleEnter}
          className="flex items-center gap-1 text-[10.5px] font-black text-gray-400 hover:text-pink-700 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-neutral-100 transition-all cursor-pointer select-none active:scale-95"
        >
          <span>تخطي</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Luxury Interactive Seal & Showcase Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-5 relative max-w-md mx-auto w-full z-10">
        
        {/* Animated Slide Showcase Card */}
        <div className="w-full bg-white/85 backdrop-blur-md border border-pink-100/60 rounded-[2.5rem] p-5 shadow-xl relative overflow-hidden flex flex-col items-center text-center space-y-4">
          
          {/* Custom Slide Image Preview Container */}
          <div className="w-full h-44 rounded-3xl overflow-hidden border border-pink-50/50 relative shadow-inner">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentSlide}
                src={onboardingSlides[currentSlide].bgImage} 
                alt="Luxury Banner" 
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-pink-950/50 via-transparent to-transparent" />
            
            {/* Elegant Top Badge overlay */}
            <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-black text-white flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-pink-400"></span>
              <span>مضمون ومكفول 100% ✨</span>
            </div>
          </div>



          {/* Icon Badge */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/10 to-amber-500/5 flex items-center justify-center text-pink-700 shadow-inner">
            {getSlideIcon(currentSlide)}
          </div>

          {/* Text Content with Transition */}
          <div className="space-y-2 px-1 min-h-[90px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-1.5"
              >
                <h3 className="text-sm font-black text-pink-950 tracking-tight leading-snug">
                  {onboardingSlides[currentSlide].title}
                </h3>
                <p className="text-[11px] text-gray-500 font-bold leading-relaxed px-1">
                  {onboardingSlides[currentSlide].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots Indicator with Glowing Accents */}
          <div className="flex gap-1.5 pt-1">
            {onboardingSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  triggerLightHaptic();
                  setSlideDirection(idx > currentSlide ? 'next' : 'prev');
                  setCurrentSlide(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide 
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 w-6 shadow-sm shadow-pink-500/30' 
                    : 'bg-pink-100 hover:bg-pink-200 w-1.5'
                }`}
                title={`الانتقال للشريحة ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Swipe Hint */}
        <p className="text-[9.5px] text-pink-400 font-bold mt-4 animate-pulse">
          تصفحي المزايا الحصرية أو اضغطي دخول لبدء تجربة تسوق فريدة
        </p>
      </div>

      {/* Footer Navigation and CTA Controls */}
      <div className="pb-10 px-6 space-y-4 z-10 w-full max-w-md mx-auto">
        <div className="flex items-center gap-3">
          {currentSlide > 0 ? (
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-2xl border border-pink-100/70 bg-white/90 backdrop-blur-xs text-pink-700 flex items-center justify-center hover:bg-pink-50 transition-all active:scale-95 cursor-pointer"
              title="السابق"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-12 h-12" />
          )}

          <button
            onClick={handleNext}
            className="flex-1 h-12 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700 hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-md shadow-pink-500/15 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>{currentSlide === onboardingSlides.length - 1 ? 'ابدئي رحلة التسوق الفاخرة 🛍️' : 'متابعة المزايا 🌸'}</span>
            {currentSlide < onboardingSlides.length - 1 && <ArrowLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Secondary Login Option for users who want to login instantly */}
        {!isLoggedIn && (
          <div className="flex justify-center items-center gap-1.5 text-xs border-t border-pink-100/50 pt-3">
            <span className="text-gray-400 font-bold text-[10.5px]">لديكِ حساب بالفعل؟</span>
            <button
              onClick={() => {
                triggerMediumHaptic();
                onLoginTrigger();
                handleEnter();
              }}
              className="text-pink-700 hover:text-pink-800 font-extrabold text-[10.5px] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>تسجيل دخول مباشر</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
