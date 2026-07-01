import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import Elegant3DSpinWheel from '../Elegant3DSpinWheel';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Sparkles, Gift, Clock, CheckCircle, Copy, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { triggerSuccessHaptic, triggerLightHaptic } from '../../utils/haptics';

export default function DailyRewardWheel() {
  const { user, profile, addNotification } = useApp();
  const [hasSpunToday, setHasSpunToday] = useState<boolean>(false);
  const [todayPrize, setTodayPrize] = useState<string | null>(null);
  const [todayCoupon, setTodayCoupon] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Get local date YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const checkDailyStatus = async () => {
      const todayStr = getTodayString();

      if (user) {
        // Authenticated path
        const docId = `${user.uid}_${todayStr}`;
        const rewardRef = doc(db, 'daily_rewards', docId);
        try {
          const docSnap = await getDoc(rewardRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setHasSpunToday(true);
            setTodayPrize(data.prize);
            setTodayCoupon(data.couponCode || null);
          } else {
            setHasSpunToday(false);
          }
        } catch (err) {
          console.error("Error reading daily rewards:", err);
          // Fallback to local storage if firestore fails
          const savedDate = localStorage.getItem(`iramo_spin_date_${user.uid}`);
          if (savedDate === todayStr) {
            setHasSpunToday(true);
            setTodayPrize(localStorage.getItem(`iramo_spin_prize_${user.uid}`) || "هدية لطيفة 💖");
            setTodayCoupon(localStorage.getItem(`iramo_spin_coupon_${user.uid}`) || null);
          }
        }
      } else {
        // Guest/Local path
        const savedDate = localStorage.getItem('iramo_guest_spin_date');
        if (savedDate === todayStr) {
          setHasSpunToday(true);
          setTodayPrize(localStorage.getItem('iramo_guest_spin_prize') || "هدية لطيفة 💖");
          setTodayCoupon(localStorage.getItem('iramo_guest_spin_coupon') || null);
        } else {
          setHasSpunToday(false);
        }
      }
      setLoading(false);
    };

    checkDailyStatus();
  }, [user]);

  const generateCouponCode = (prizeText: string) => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    if (prizeText.includes('خصم')) return `IRAMO-DISC-${randomHex}`;
    if (prizeText.includes('شحن')) return `IRAMO-SHIP-${randomHex}`;
    return `IRAMO-GIFT-${randomHex}`;
  };

  const handleWin = async (prizeText: string) => {
    const todayStr = getTodayString();
    let couponCode = generateCouponCode(prizeText);
    if (prizeText.includes('نقطة')) {
      couponCode = "تمت إضافة النقاط لمحفظتكِ تلقائياً ✨";
    }

    setTodayPrize(prizeText);
    setTodayCoupon(couponCode);
    setHasSpunToday(true);

    // Parse won points
    let pointsWon = 0;
    if (prizeText.includes('١٥٠')) pointsWon = 150;
    else if (prizeText.includes('نقطة')) pointsWon = 100;

    if (user) {
      const docId = `${user.uid}_${todayStr}`;
      try {
        // 1. Save reward record in Firestore
        await setDoc(doc(db, 'daily_rewards', docId), {
          userId: user.uid,
          date: todayStr,
          prize: prizeText,
          couponCode: couponCode,
          timestamp: serverTimestamp()
        });

        // 2. If won points, update user points
        if (pointsWon > 0) {
          const userRef = doc(db, 'users', user.uid);
          const currentPoints = profile?.points || 0;
          await updateDoc(userRef, {
            points: currentPoints + pointsWon
          });
        }

        // 3. Add system notification
        await addNotification({
          notificationId: 'loyalty_spin_' + Date.now(),
          type: 'loyalty',
          title: '🎡 مكافأة عجلة الحظ اليومية',
          content: `مبروك! لقد فزتِ بـ (${prizeText}) من عجلة الهدايا الملكية اليوم. كود الهدية: ${couponCode}`,
          time: 'الآن',
          icon: 'Sparkles',
          read: false
        });

      } catch (err) {
        console.error("Error saving spin reward:", err);
        // Fallback local storage write
        localStorage.setItem(`iramo_spin_date_${user.uid}`, todayStr);
        localStorage.setItem(`iramo_spin_prize_${user.uid}`, prizeText);
        localStorage.setItem(`iramo_spin_coupon_${user.uid}`, couponCode);
      }
    } else {
      // Guest local storage write
      localStorage.setItem('iramo_guest_spin_date', todayStr);
      localStorage.setItem('iramo_guest_spin_prize', prizeText);
      localStorage.setItem('iramo_guest_spin_coupon', couponCode);
    }

    triggerSuccessHaptic();
  };

  const handleCopy = () => {
    if (!todayCoupon) return;
    navigator.clipboard.writeText(todayCoupon);
    setCopied(true);
    triggerLightHaptic();
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-xs text-pink-600 font-bold space-y-2">
        <div className="w-8 h-8 rounded-full border-2 border-pink-600 border-t-transparent animate-spin mx-auto" />
        <p>جاري تحميل العجلة الملكية...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-pink-100 rounded-[2.5rem] p-6 shadow-sm max-w-md mx-auto text-center space-y-6 text-right font-sans" dir="rtl">
      
      {/* Title */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex p-3 bg-pink-50 rounded-full text-pink-700 animate-bounce">
          <Gift className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-black text-pink-950">عجلة الهدايا والمكافآت اليومية 🎡✨</h3>
        <p className="text-[10px] text-gray-400 font-bold max-w-xs mx-auto">
          أديري العجلة الذهبية مرة واحدة كل ٢٤ ساعة لتفوزي بنقاط ولاء ملكية، كوبونات خصم، أو هدايا وعينات عطور فاخرة.
        </p>
      </div>

      {!hasSpunToday ? (
        <div className="space-y-4">
          {/* Spin Wheel */}
          <Elegant3DSpinWheel 
            onWin={handleWin}
            isSpinning={isSpinning}
            setIsSpinning={setIsSpinning}
          />
          
          <div className="bg-pink-50/30 border border-pink-50 p-3 rounded-2xl text-[9.5px] text-pink-950 font-bold leading-relaxed text-center">
            {isSpinning 
              ? '✨ جاري تدوير العجلة... ترقبي هديتكِ الساحرة! 🌟'
              : '🌟 اضغطي على زر الدوران في وسط العجلة لتجربة حظكِ الملكي اليوم!'
            }
          </div>
        </div>
      ) : (
        <div className="space-y-5 py-4 animate-fade-in">
          
          {/* Already Spun / Prize Card */}
          <div className="bg-gradient-to-br from-pink-50 to-amber-50/40 border border-pink-100/60 rounded-[2rem] p-6 text-center space-y-4 shadow-inner relative overflow-hidden">
            <div className="absolute -top-6 -left-6 w-16 h-16 bg-pink-400/10 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-amber-400/10 rounded-full blur-xl" />
            
            <div className="space-y-1">
              <span className="text-[8.5px] font-black text-amber-700 bg-amber-100 py-0.5 px-3 rounded-full uppercase border border-amber-200/50 inline-block">
                هديتكِ اليومية جاهزة 👑
              </span>
              <p className="text-[10px] text-gray-500 font-bold">لقد ربحتِ اليوم الجائزة التالية:</p>
            </div>

            <div className="text-2xl font-black text-pink-950 scale-105 transition-all animate-pulse py-2">
              {todayPrize}
            </div>

            {todayCoupon && (
              <div className="space-y-2 pt-2 border-t border-pink-100/50">
                {!todayPrize?.includes('نقطة') ? (
                  <>
                    <p className="text-[9px] text-gray-400 font-bold">استخدمي كود الخصم التالي عند إتمام فواتيركِ:</p>
                    <div className="flex items-center gap-1.5 bg-white border border-pink-100 rounded-xl p-2 max-w-xs mx-auto shadow-xs">
                      <span className="flex-1 text-[10.5px] font-black font-mono text-pink-950 text-center tracking-wider selection:bg-pink-100">
                        {todayCoupon}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="bg-pink-50 hover:bg-pink-100 text-pink-700 p-1.5 rounded-lg transition-all active:scale-90 cursor-pointer shrink-0"
                        title="نسخ الكود"
                      >
                        {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-[9.5px] text-emerald-700 font-black flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>تمت إضافة النقاط لحسابكِ تلقائياً لتستمتعي بعضويتكِ الملكية!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-amber-700 font-black">
            <Clock className="w-4 h-4 animate-spin-slow" />
            <span>العجلة مقفلة الآن. يرجى العودة غداً للمزيد من الهدايا والدلال 💖</span>
          </div>

          {!user && (
            <div className="bg-amber-50/60 border border-amber-100/70 rounded-2xl p-3 text-right flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[9.5px] text-amber-900 leading-normal font-semibold">
                ملاحظة: لقد قمتِ بالدوران كزائرة. يرجى <strong>إنشاء حساب أو تسجيل الدخول</strong> لضمان حفظ نقاطكِ وكوبوناتكِ بشكل دائم في محفظتكِ السحابية.
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
