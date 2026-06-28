import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, X, Send, Sparkles, AlertCircle, ShoppingBag, Gift, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export default function HadooshaAssistant() {
  const { shipments, invoices, profile, customizations } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'مرحباً جميلتي! ✨ أنا "هدوشة"، مساعدتكِ الذكية والأنيقة لخدمات الشحن والتسوق الفاخر Luminous Heritage 🌸. كيف يمكنني تدليلكِ ومساعدتكِ اليوم في تتبع طرودكِ أو حساب الشحن؟ 💕'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAttention, setShowAttention] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  // Hide attention badge after some time
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAttention(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend
    };

    setChatHistory(prev => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      // Call server endpoint
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory.filter(m => m.id !== 'welcome').map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await response.json();
      if (data.reply) {
        setChatHistory(prev => [...prev, {
          id: `ai_${Date.now()}`,
          role: 'model',
          content: data.reply
        }]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.warn("Gemini API server call failed, using high-fidelity local fallback:", err);
      // Smart Context-Aware Local Fallback
      const normalizedText = textToSend.toLowerCase();
      let reply = '';

      if (normalizedText.includes('تتبع') || normalizedText.includes('شحنتي') || normalizedText.includes('شحنه') || normalizedText.includes('وين الطرد')) {
        if (shipments.length > 0) {
          const s = shipments[0];
          reply = `عزيزتي الكريمة، شحنتكِ الأنيقة ذات الرقم **(${s.trackingNumber})** قادمة من **(${s.origin})** وحالتها الحالية هي: **[${s.status}]** ✨.\nوهي تتواجد حالياً في: *${s.currentLocation}*.\nالمتوقع أن تصل إليكِ بدلال في غضون أيام قليلة وتحديداً حوالي **(${s.estimatedDelivery})** إن شاء الله! 🌸💖`;
        } else {
          reply = `جميلتي، لا توجد لديكِ أي شحنات نشطة مسجلة حالياً في حسابكِ 🌸. ولكن يمكنكِ دائماً الطلب والشحن معنا من الصين أو الإمارات أو تركيا وسنقوم بفرزها وتتبعها لكِ فوراً! 💕`;
        }
      } else if (normalizedText.includes('سعر') || normalizedText.includes('تكلفة') || normalizedText.includes('حساب') || normalizedText.includes('سعر الشحن') || normalizedText.includes('كم يكلف')) {
        reply = `تدللي حبيبتي! أسعار الشحن لدينا هي الأفضل والأكثر شفافية في العراق:\n\n` +
                `✈️ **شحن Shein الكويت السريع:** 5,000 د.ع لكل كغم فقط!\n` +
                `✈️ **شحن دبي والإمارات:** 12,000 د.ع لكل كغم.\n` +
                `✈️ **شحن تركيا وتريندول:** 11,000 د.ع لكل كغم.\n` +
                `🇨🇳 **شحن الصين (AliExpress/Temu/Taobao):** تتراوح بين 12,500 إلى 16,500 د.ع لكل كغم.\n\n` +
                `🚚 **سعر التوصيل لباب بيتكِ:**\n` +
                `- بغداد: 5,000 د.ع\n` +
                `- بابل: 3,000 د.ع\n` +
                `- باقي المحافظات: 5,000 د.ع\n\n` +
                `✨ **ملاحظة فاخرة:** جميع الرسوم الجمركية مجانية بالكامل ومشمولة بالسعر! لا توجد أي أجور مخفية أخرى لباب البيت 🌸🥰.`;
      } else if (normalizedText.includes('أسرع') || normalizedText.includes('سريع') || normalizedText.includes('أفضل طريقة')) {
        reply = `أسرع مسار شحن لدينا حالياً هو **الشحن الجوي السريع من دبي أو الكويت** ✈️.\nيستغرق من **7 إلى 10 أيام** فقط من مغادرة الطرد مستودعنا الإقليمي ليصل إلى باب بيتكِ في العراق بكل دلال وأناقة! 🌸✨`;
      } else if (normalizedText.includes('جمارك') || normalizedText.includes('ضريبة') || normalizedText.includes('كمرك')) {
        reply = `اطمئني تماماً يا جميلتي! 🌸 منصتنا الفاخرة Luminous Heritage تعفيكِ تماماً من تعقيدات الجمارك. الرسوم الجمركية لدينا **مجانية 100% ومشمولة بالكامل** مع سعر الشحن الأساسي للوزن الحقيقي، والتسليم مباشرة لباب بيتكِ بدون أي دينار إضافي! 🥰✨`;
      } else if (normalizedText.includes('نقاط') || normalizedText.includes('ولاء') || normalizedText.includes('هدية') || normalizedText.includes('هدوشة') || normalizedText.includes('بطوط')) {
        reply = `يا أهلاً بكِ في عالم الولاء والهدايا الأنيقة من هدوشة وبطوط! 🎁💖\nحسابكِ الحالي يحتوي على **(${profile?.points || 0} نقطة ولاء)**.\nيمكنكِ تجميع النقاط عبر دفع الفواتير (150 نقطة لكل فاتورة مسددة!) أو عبر تسجيل الدخول اليومي ودعوة صديقاتكِ، ثم استبدالها بخصومات وهدايا كشميرية فاخرة أو رصيد في محفظتكِ! 🥰🌸`;
      } else if (normalizedText.includes('هلو') || normalizedText.includes('مرحبا') || normalizedText.includes('سلام') || normalizedText.includes('هلوات') || normalizedText.includes('اهلين') || normalizedText.includes('شلونج') || normalizedText.includes('شلونك') || normalizedText.includes('مساء') || normalizedText.includes('صباح')) {
        reply = `أهلاً وسهلاً يا روحي وجميلتي! 🌸✨ أنا هدوشة المساعدة الأنيقة وسعيدة جداً بتواصلكِ معي اليوم 💕. أنا هنا بجانبكِ لأجيب عن كل ما يدور في بالكِ بخصوص طلباتكِ وشحناتكِ المتميزة. كيف يمكنني تدليلكِ ومساعدتكِ اليوم؟ 🥰💖`;
      } else if (normalizedText.includes('دفع') || normalizedText.includes('زين كاش') || normalizedText.includes('كاش') || normalizedText.includes('تسديد') || normalizedText.includes('فلوس') || normalizedText.includes('رصيد') || normalizedText.includes('محفظة') || normalizedText.includes('محفظه')) {
        reply = `حبيبتي بخصوص استفساركِ عن الدفع أو شحن الرصيد 💳✨:\n\nنوفر لكِ في إيرامو ستور أسهل الطرق وأكثرها أماناً:\n- **زين كاش (Zain Cash):** يمكنكِ الدفع مباشرة أو التحويل لمحفظتنا المعتمدة الرقم (7144102758).\n- **الماستر كارد والفيزا كارد:** لتسديد فواتيركِ بلمسة واحدة.\n\nبعد التحويل، يرجى رفع صورة الوصل من صفحة الفواتير ليتم تأكيدها فوراً بختم APPROVED الوردي الأنيق! 🌸🥰`;
      } else if (normalizedText.includes('تواصل') || normalizedText.includes('واتساب') || normalizedText.includes('رقم') || normalizedText.includes('انستغرام') || normalizedText.includes('انستا') || normalizedText.includes('دعم') || normalizedText.includes('تلفون') || normalizedText.includes('اتصال')) {
        reply = `تدللي جميلتي! 📞✨ يمكنكِ التواصل مباشرة مع فريق الدعم الفني وخدمة العملاء لإيرامو ستور عبر الواتساب على الرقم:\n**+964 780 123 4567**\n\nأو الضغط على زر التواصل المباشر في لوحة التحكم وسيقوم الفريق بمساعدتكِ فوراً بكل حب ودلال! 🌸💕`;
      } else if (normalizedText.includes('توصيل') || normalizedText.includes('محافظة') || normalizedText.includes('عنوان') || normalizedText.includes('موقع') || normalizedText.includes('مستودع') || normalizedText.includes('مكان')) {
        reply = `يسعدني إجابتكِ يا غالية! 🚚✨\n\n- مستودعاتنا الإقليمية تقع في: دبي (الإمارات)، الكويت، والصين.\n- نقوم بالتوصيل لكافة مناطق ومحافظات العراق الحبيبة لباب بيتكِ.\n- تكلفة التوصيل الداخلي:\n  * بغداد: 5,000 د.ع\n  * بابل: 3,000 د.ع\n  * باقي المحافظات: 5,000 د.ع\n\nتأكدي أن طردكِ سيصل بأمان وبأعلى مستويات العناية والأناقة! 🥰🌸`;
      } else {
        reply = `حبيبتي وروحي، بخصوص سؤالكِ الكريم واستفساركِ الأنيق حول "${textToSend}":\n\nيسعدني جداً أن أؤكد لكِ أننا في إيرامو ستور نوفر لكِ الدعم والخدمات الكاملة لتلبية هذا الطلب وتسهيل تجربة تسوقكِ وشحنكِ من كافة المتاجر العالمية (شي إن، تمو، ألي إكسبريس، الماركات التركية وغيرها) مع فرز وتغليف فاخر مجاناً! 🎁✨\n\nهل ترغبين في تتبع شحنة حالية، أم تودين حساب سعر الشحن لوزن معين، أم تبحثين عن مساعدة بخصوص الدفع والفواتير؟ أنا هنا دائماً لخدمتكِ وتدليلكِ وتلبية رغباتكِ! 🥰🌸💕`;
      }

      setChatHistory(prev => [...prev, {
        id: `ai_${Date.now()}`,
        role: 'model',
        content: reply
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 left-4 z-40" dir="rtl">
      {/* Floating Trigger Button */}
      <div className="relative">
        <AnimatePresence>
          {showAttention && !isOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              onClick={() => setIsOpen(true)}
              className="absolute bottom-16 right-0 bg-gradient-to-r from-pink-700 to-rose-600 text-white text-[10px] font-black py-1.5 px-3.5 rounded-2xl whitespace-nowrap shadow-md cursor-pointer flex items-center gap-1.5 border border-white/20 select-none"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-200 animate-spin-slow" />
              <span>مرحباً جميلتي! هدوشة هنا لمساعدتكِ 💖</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowAttention(false);
          }}
          className={`w-14 h-14 rounded-full bg-gradient-to-tr from-pink-700 via-rose-600 to-pink-500 text-white flex items-center justify-center shadow-lg hover:shadow-pink-500/20 active:scale-95 transition-all duration-300 border-2 border-white/40 cursor-pointer ${isOpen ? 'rotate-90' : ''}`}
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 animate-bounce-slow" />}
        </button>
      </div>

      {/* Chat Drawer/Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed inset-x-4 bottom-24 md:absolute md:left-0 md:bottom-16 md:w-[360px] md:inset-x-auto bg-white/85 backdrop-blur-2xl rounded-3xl border border-pink-100/40 shadow-2xl overflow-hidden flex flex-col max-h-[70vh] z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-700 via-rose-600 to-pink-500 p-4 text-white flex items-center justify-between border-b border-pink-100/10">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-full bg-white/20 border border-white/20 overflow-hidden flex items-center justify-center">
                  <img
                    alt="Hadoosha AI"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDozyQcrL4Yfp5wLXW9Y-K0AeiCtSO2G3lZVMIyffDaIoEBlb_otr_uLGq-Drr0G6N0FS5d6-u6YBfHWJzesjiFbJdWnD15Ct9IDSO08EczvwkYAWgQgEP3d-v91GCN7bOyvBP_FftRv6BChSeEzC7BDbSMtH3DXgL1bbvle6xHA957rBT170X9F2Itu0sPNmwKRqwqkDVOI_Pw-dG5myf2pu5mCFrs-IUMx_XlMi2OYl5IjfQgqquSxEAaElda7W5e1ZN5LhTYUFQ"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white"></span>
                </div>
                <div>
                  <h3 className="font-black text-xs">هدوشة المساعدة الذكية 💖</h3>
                  <p className="text-[9px] text-pink-200 font-bold">متصلة وجاهزة لخدمتكِ الآن</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fffaf9]/40 min-h-[250px] max-h-[380px]">
              {chatHistory.map((msg) => {
                const isModel = msg.role === 'model';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isModel ? 'justify-start' : 'justify-end'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-bold leading-relaxed shadow-sm ${
                        isModel
                          ? 'bg-white text-gray-800 border border-pink-100/30 rounded-tr-none'
                          : 'bg-gradient-to-l from-pink-700 to-rose-600 text-white rounded-tl-none'
                      }`}
                      style={{ whiteSpace: 'pre-line' }}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white/95 rounded-2xl p-3 border border-pink-100/30 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-700 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-700 animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-700 animate-bounce delay-200"></span>
                    <span className="text-[10px] text-pink-700 font-black">جاري التفكير بأناقة...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Helper Chips */}
            <div className="p-2 border-t border-pink-100/20 bg-white/70 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none select-none">
              <button
                onClick={() => handleSendMessage('أين شحنتي الآن وما هو رقم تتبعها؟')}
                className="bg-pink-50 hover:bg-pink-100 text-pink-800 text-[10px] font-black px-3 py-1.5 rounded-full border border-pink-100/50 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-pink-600" />
                <span>شحناتي 📦</span>
              </button>
              <button
                onClick={() => handleSendMessage('كم أسعار شحن المتاجر وتوصيل المحافظات؟')}
                className="bg-pink-50 hover:bg-pink-100 text-pink-800 text-[10px] font-black px-3 py-1.5 rounded-full border border-pink-100/50 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                <span>حساب شحن 🧮</span>
              </button>
              <button
                onClick={() => handleSendMessage('ما هي الرسوم الجمركية وهل توجد تكاليف خفية؟')}
                className="bg-pink-50 hover:bg-pink-100 text-pink-800 text-[10px] font-black px-3 py-1.5 rounded-full border border-pink-100/50 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <Compass className="w-3.5 h-3.5 text-pink-600" />
                <span>الجمارك مجانية؟ 🏷️</span>
              </button>
              <button
                onClick={() => handleSendMessage('كيف يعمل نظام هدايا ومكافآت الولاء؟')}
                className="bg-pink-50 hover:bg-pink-100 text-pink-800 text-[10px] font-black px-3 py-1.5 rounded-full border border-pink-100/50 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <Gift className="w-3.5 h-3.5 text-pink-600" />
                <span>الهدايا والولاء 🎁</span>
              </button>
            </div>

            {/* Input form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(message);
              }}
              className="p-3 border-t border-pink-100/20 bg-white/90 flex gap-2 items-center"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اسألي هدوشة عن طرودكِ أو أسعار الشحن..."
                className="flex-1 bg-pink-50/50 border border-pink-100/40 rounded-2xl px-4 py-2 text-xs font-bold outline-none focus:border-pink-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-700 to-rose-600 text-white flex items-center justify-center shrink-0 disabled:opacity-50 active:scale-95 transition-transform cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
