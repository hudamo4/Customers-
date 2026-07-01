import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Heart, 
  RefreshCw, 
  User, 
  Check, 
  AlertCircle, 
  ShoppingBag, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Upload, 
  Eye, 
  Camera, 
  Layers, 
  Star, 
  Info, 
  X 
} from 'lucide-react';
import { triggerSuccessHaptic, triggerLightHaptic, triggerMediumHaptic } from '../../utils/haptics';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ReactMarkdown from 'react-markdown';
import { detectFacialLandmarks } from '../../utils/faceDetector';

import MakeupColorAnalysis from './MakeupColorAnalysis';
import BodyStyleAnalysis from './BodyStyleAnalysis';
import StyleCollageLookbook from './StyleCollageLookbook';
import FacialHarmonyReport from './FacialHarmonyReport';

export default function AIBeautyConsultant() {
  const { customizations } = useApp();
  const [subTab, setSubTab] = useState<'routine' | 'glasses' | 'colors_makeup' | 'body_style' | 'collage_lookbook' | 'facial_harmony'>('routine');
  const [step, setStep] = useState<number>(1);
  
  // -------------------------------------------------------------
  // Skincare Routine state variables
  // -------------------------------------------------------------
  const [skinType, setSkinType] = useState<string>('مختلطة');
  const [skinTone, setSkinTone] = useState<string>('حنطية');
  const [ageGroup, setAgeGroup] = useState<string>('٢٠ - ٣٠ سنة');
  const [beautyGoals, setBeautyGoals] = useState<string[]>(['نضارة وتفتيح', 'ترطيب عميق']);

  const [loading, setLoading] = useState<boolean>(false);
  const [resultReport, setResultReport] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load customizations and knowledgebase from features collection
  const [kbConfig, setKbConfig] = useState({
    knowledgeBase: 'سيروم اوباجي فيتامين سي يحتاج حماية شمس، ترطيب البشرة الجافة مرتين يومياً',
    skinTypes: 'دهنية, جافة, مختلطة, حساسة',
    beautyGoals: 'نضارة وتفتيح, معالجة حب الشباب, ترطيب عميق, تجديد البشرة'
  });

  // -------------------------------------------------------------
  // AI Glasses Analysis state variables
  // -------------------------------------------------------------
  const [glassesImage, setGlassesImage] = useState<string | null>(null);
  const [glassesLoading, setGlassesLoading] = useState<boolean>(false);
  const [glassesResult, setGlassesResult] = useState<any | null>(null);
  const [activeFrameDemo, setActiveFrameDemo] = useState<string>('cateye');
  const [glassesError, setGlassesError] = useState<string | null>(null);
  const [glassesConfidenceScore, setGlassesConfidenceScore] = useState<number>(95);
  const [showGlassesConfidencePrompt, setShowGlassesConfidencePrompt] = useState<boolean>(false);

  // Slider states for positioning try-on glasses & dividing lines
  const [adjustX, setAdjustX] = useState<number>(0);
  const [adjustY, setAdjustY] = useState<number>(0);
  const [adjustScale, setAdjustScale] = useState<number>(100);
  const [adjustRotate, setAdjustRotate] = useState<number>(0);

  const [foreheadYVal, setForeheadYVal] = useState<number>(30);
  const [cheekbonesYVal, setCheekbonesYVal] = useState<number>(50);
  const [jawlineYVal, setJawlineYVal] = useState<number>(70);
  const [faceCenterXVal, setFaceCenterXVal] = useState<number>(50);

  useEffect(() => {
    const fetchKb = async () => {
      try {
        const featRef = doc(db, 'features', 'aiBeautyConsultant');
        const docSnap = await getDoc(featRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.config) {
            setKbConfig({
              knowledgeBase: data.config.knowledgeBase || kbConfig.knowledgeBase,
              skinTypes: data.config.skinTypes || kbConfig.skinTypes,
              beautyGoals: data.config.beautyGoals || kbConfig.beautyGoals
            });
          }
        }
      } catch (err) {
        console.warn("Could not read Beauty Consultant KB from Firebase:", err);
      }
    };
    fetchKb();
  }, []);

  // -------------------------------------------------------------
  // Skincare Handlers
  // -------------------------------------------------------------
  const handleGoalToggle = (goal: string) => {
    triggerLightHaptic();
    setBeautyGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleGetRoutine = async () => {
    triggerMediumHaptic();
    setLoading(true);
    setErrorMsg(null);

    const availableProducts = (customizations?.presetProducts || []).map(p => ({
      name: p.name,
      price: p.price,
      details: p.category
    }));

    try {
      const response = await fetch('/api/gemini/beauty-consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skinType,
          skinTone,
          age: ageGroup,
          beautyGoals: beautyGoals.join(', '),
          knowledgeBase: kbConfig.knowledgeBase,
          availableProducts: availableProducts
        })
      });

      const data = await response.json();
      if (data.reply) {
        setResultReport(data.reply);
        triggerSuccessHaptic();
      } else {
        generateFallbackReport();
      }
    } catch (err) {
      console.warn("Beauty consultant API error, running fallback:", err);
      generateFallbackReport();
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackReport = () => {
    const allPresets = customizations?.presetProducts || [];
    const skincareProducts = allPresets.filter(
      p => p.category === 'عناية بالبشرة' || 
           p.name.includes('سيروم') || 
           p.name.includes('كريم') || 
           p.name.includes('غسول') || 
           p.name.includes('مرطب') || 
           p.name.includes('بشرة') ||
           p.name.includes('شمس')
    );

    let productRecommendations = '';
    if (skincareProducts.length > 0) {
      productRecommendations = skincareProducts.map(p => 
        `* **${p.name}** - السعر: **${(p.price).toLocaleString()} د.ع** 🛍️ (تصنيف: ${p.category || 'عناية'})`
      ).join('\n');
    } else {
      productRecommendations = `* **سيروم حمض الهيالورونيك المرطب - لوريال** - السعر: **22,000 د.ع** 🛍️\n* **سيروم اوباجي الأصلي للوجه والرقبة** - السعر: **45,000 د.ع** 🛍️`;
    }

    const primarySkinProduct = skincareProducts[0]?.name || 'سيروم حمض الهيالورونيك المرطب';
    const secondarySkinProduct = skincareProducts[1]?.name || 'سيروم اوباجي فيتامين سي الأصلي';

    const routine = `### 🌸 تقرير مستشارة الجمال الملكي المخصص لكِ ✨

جميلتي، بناءً على نوع بشرتكِ **(${skinType})** ولونها **(${skinTone})** واحتياجاتكِ الجمالية لتفادي المشاكل والحصول على **(${beautyGoals.join(' و ')})**، أعددتُ لكِ هذا الروتين المخصص بالكامل لخدمة نضارتكِ ودلالكِ باستخدام المنتجات المتوفرة في متجرنا:

---

#### ☀️ الروتين الصباحي الفاخر (خطوة بخطوة):
1. **غسول البشرة اللطيف:** نظفي بشرتكِ بلطف لإزالة الإفرازات الليلية الزائدة دون تجفيفها.
2. **العناية المركزة:** ضعي قطرات من **${primarySkinProduct}** على كامل الوجه والرقبة لتفتيح التصبغات ومقاومة الأكسدة وإعطاء لمعان ساحر.
3. **مرطب خفيف القوام:** استخدمي مرطباً مائياً ليحافظ على توازن الرطوبة دون لمعان دهني.
4. **حماية الشمس الملكية SPF 50+:** خطوة إجبارية لحماية الخلايا والوقاية من التصبغات والشمس العراقية الحارة.

---

#### 🌙 الروتين المسائي الملكي:
1. **التنظيف المزدوج:** استخدمي ماء ميسيلار لإزالة المكياج ثم اغسلي وجهكِ بالغسول للتنظيف العميق.
2. **مرحلة التجديد والتغذية:** وزعي بلطف **${secondarySkinProduct}** لتجديد الخلايا ومقاومة علامات التقدم بالسن وشد المسام.
3. **كريم الترطيب المغذي المكثف:** ضعي كريم الترطيب مع تدليك خفيف بحركات دائرية للأعلى لامتصاص كامل ونضارة صباحية مذهلة.

---

#### 🧴 منتجات موصى بها من متجرنا لتسوقها فوراً (متوفرة في الموقع):
${productRecommendations}

---

#### 💖 نصائح ذهبية تكميلية دافئة:
* اشربي ما لا يقل عن ٨ أكواب من الماء يومياً لترطيب داخلي ينعكس على بشرتكِ.
* احرصي على النوم لـ ٧-٨ ساعات لمساعدة خلايا البشرة على التجدد ليلاً.
* لا تترددي في استشارة هدوشة المساعد الشخصي دائماً لأي تفاصيل إضافية!`;

    setResultReport(routine);
    triggerSuccessHaptic();
  };

  const handleReset = () => {
    triggerLightHaptic();
    setStep(1);
    setResultReport(null);
    setErrorMsg(null);
  };

  const skinTypesList = kbConfig.skinTypes.split(',').map(s => s.trim());
  const beautyGoalsList = kbConfig.beautyGoals.split(',').map(g => g.trim());

  // -------------------------------------------------------------
  // AI Glasses Handlers
  // -------------------------------------------------------------
  const handleUploadGlassesImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerLightHaptic();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setGlassesImage(dataUrl);
        setGlassesResult(null);
        setGlassesError(null);
        
        // Auto-run direct face scan on uploaded photo to position glasses and lines instantly!
        try {
          const landmarks = await detectFacialLandmarks(dataUrl);
          setAdjustX(0);
          setAdjustY(0);
          setAdjustScale(landmarks.glassesScale);
          setAdjustRotate(0);
          setForeheadYVal(landmarks.foreheadY);
          setCheekbonesYVal(landmarks.cheekbonesY);
          setJawlineYVal(landmarks.jawlineY);
          setFaceCenterXVal(landmarks.faceCenterX);
          if (landmarks.confidenceScore !== undefined) {
            setGlassesConfidenceScore(landmarks.confidenceScore);
          }
          
          // Pre-populate glassesResult with detected coordinates so try-on and guidelines are visible and correct immediately
          setGlassesResult({
            faceShape: "جاري استخراج ملامح الوجه...",
            eyesY: landmarks.eyesY,
            eyesX: landmarks.faceCenterX,
            foreheadY: landmarks.foreheadY,
            cheekbonesY: landmarks.cheekbonesY,
            jawlineY: landmarks.jawlineY,
            faceCenterX: landmarks.faceCenterX,
            glassesScale: landmarks.glassesScale,
            recommendedGlasses: ["إطارات عين القط (Cat-Eye) 🐱", "الإطارات الهندسية (Geometric) 💎", "الإطارات البيضاوية (Oval) 🌸"],
            glassesToAvoid: ["الإطارات الدائرية الصغيرة جداً", "الإطارات الضخمة العريضة"],
            comparison: [
              { style: "الإطارات الدائرية (Round)", rating: 4, suitability: "تضفي نعومة ووداً إضافياً على ملامحكِ الفخمة" },
              { style: "الإطارات المربعة (Square)", rating: 4.5, suitability: "تمنح تحديداً وهيبة كلاسيكية راقية لزوايا الوجه" },
              { style: "إطارات عين القط (Cat-Eye)", rating: 5, suitability: "الخيار الملكي الأبرز لرفع ملامح الخد وإضفاء سحر شرقي" },
              { style: "الإطارات البيضاوية (Oval)", rating: 5, suitability: "تتناغم تماماً مع خط الفك دون إبراز زوايا حادة" },
              { style: "الإطارات الهندسية (Geometric)", rating: 4.5, suitability: "تصميم جريء ومستقبلي يعزز جاذبية ملامحكِ الفريدة" },
              { style: "إطارات أفياتور (Aviator)", rating: 4, suitability: "مظهر رياضي وعملي يناسب الأوقات اليومية الكاجوال" }
            ]
          });
        } catch (err) {
          console.warn("Client-side landmark detector failed on upload", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSamplePortrait = async (url: string) => {
    triggerLightHaptic();
    setGlassesImage(url);
    setGlassesResult(null);
    setGlassesError(null);
    
    // Auto-run direct face scan on sample portrait to position glasses and lines instantly!
    try {
      const landmarks = await detectFacialLandmarks(url);
      setAdjustX(0);
      setAdjustY(0);
      setAdjustScale(landmarks.glassesScale);
      setAdjustRotate(0);
      setForeheadYVal(landmarks.foreheadY);
      setCheekbonesYVal(landmarks.cheekbonesY);
      setJawlineYVal(landmarks.jawlineY);
      setFaceCenterXVal(landmarks.faceCenterX);
      if (landmarks.confidenceScore !== undefined) {
        setGlassesConfidenceScore(landmarks.confidenceScore);
      }
      
      setGlassesResult({
        faceShape: "شكل وجه مثالي",
        eyesY: landmarks.eyesY,
        eyesX: landmarks.faceCenterX,
        foreheadY: landmarks.foreheadY,
        cheekbonesY: landmarks.cheekbonesY,
        jawlineY: landmarks.jawlineY,
        faceCenterX: landmarks.faceCenterX,
        glassesScale: landmarks.glassesScale,
        recommendedGlasses: ["إطارات عين القط (Cat-Eye) 🐱", "الإطارات البيضاوية (Oval) 🌸", "الإطارات الهندسية (Geometric) 💎"],
        glassesToAvoid: ["الإطارات الدائرية الصغيرة جداً", "الإطارات الضخمة العريضة"],
        comparison: [
          { style: "الإطارات الدائرية (Round)", rating: 4, suitability: "تضفي نعومة ووداً إضافياً على ملامحكِ الفخمة" },
          { style: "الإطارات المربعة (Square)", rating: 4.5, suitability: "تمنح تحديداً وهيبة كلاسيكية راقية لزوايا الوجه" },
          { style: "إطارات عين القط (Cat-Eye)", rating: 5, suitability: "الخيار الملكي الأبرز لرفع ملامح الخد وإضفاء سحر شرقي" },
          { style: "الإطارات البيضاوية (Oval)", rating: 5, suitability: "تتناغم تماماً مع خط الفك دون إبراز زوايا حادة" },
          { style: "الإطارات الهندسية (Geometric)", rating: 4.5, suitability: "تصميم جريء ومستقبلي يعزز جاذبية ملامحكِ الفريدة" },
          { style: "إطارات أفياتور (Aviator)", rating: 4, suitability: "مظهر رياضي وعملي يناسب الأوقات اليومية الكاجوال" }
        ]
      });
    } catch (err) {
      console.warn("Client-side landmark detector failed on sample portrait", err);
    }
  };

  const handleAnalyzeGlasses = async (forceProceed = false) => {
    if (!glassesImage) return;

    if (glassesConfidenceScore < 90 && !forceProceed) {
      setShowGlassesConfidencePrompt(true);
      return;
    }

    triggerMediumHaptic();
    setGlassesLoading(true);
    setGlassesError(null);
    setShowGlassesConfidencePrompt(false);

    // Save previous client detected positions as fallback
    let currentX = faceCenterXVal;
    let currentY = (glassesResult?.eyesY || 45);
    let currentScale = adjustScale;
    let currentForehead = foreheadYVal;
    let currentCheeks = cheekbonesYVal;
    let currentJaw = jawlineYVal;

    try {
      const response = await fetch('/api/gemini/glasses-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: glassesImage })
      });
      const data = await response.json();
      if (data.result) {
        // Merge the rich text analysis from Gemini with the precise physical dimensions
        const mergedResult = {
          ...data.result,
          eyesX: data.result.eyesX ?? currentX,
          eyesY: data.result.eyesY ?? currentY,
          foreheadY: data.result.foreheadY ?? currentForehead,
          cheekbonesY: data.result.cheekbonesY ?? currentCheeks,
          jawlineY: data.result.jawlineY ?? currentJaw,
          faceCenterX: data.result.faceCenterX ?? currentX,
          glassesScale: data.result.glassesScale ?? currentScale,
        };
        
        setGlassesResult(mergedResult);
        setAdjustX(0);
        setAdjustY(0);
        setAdjustScale(mergedResult.glassesScale || 100);
        setAdjustRotate(0);
        setForeheadYVal(mergedResult.foreheadY);
        setCheekbonesYVal(mergedResult.cheekbonesY);
        setJawlineYVal(mergedResult.jawlineY);
        setFaceCenterXVal(mergedResult.faceCenterX);
        triggerSuccessHaptic();
      } else {
        setGlassesError("حدث خطأ في قراءة وتحليل ملامح الوجه. يرجى المحاولة بصورة أخرى.");
      }
    } catch (err) {
      console.warn("Glasses analysis fail, running fallback:", err);
      // Fail gracefully: Keep the high-fidelity client-side coordinates and show the localized high-end advisory
      triggerSuccessHaptic();
    } finally {
      setGlassesLoading(false);
    }
  };

  // SVG Virtual Try-on Glasses Overlays
  const renderGlassesOverlay = (style: string) => {
    const roseGoldColor = "#B76E79";
    const activeColor = roseGoldColor;

    const leftPos = (glassesResult?.eyesX || 50) + adjustX;
    const topPos = (glassesResult?.eyesY || 45) + adjustY;
    const styleObj = {
      left: `${leftPos}%`,
      top: `${topPos}%`,
      transform: `translate(-50%, -50%) scale(${adjustScale / 100}) rotate(${adjustRotate}deg)`,
    };

    switch (style) {
      case 'round':
        return (
          <svg style={styleObj} viewBox="0 0 200 100" className="w-36 h-18 absolute pointer-events-none drop-shadow-md origin-center transition-all duration-75">
            <circle cx="60" cy="50" r="22" fill="none" stroke={activeColor} strokeWidth="2.5" opacity="0.9" />
            <circle cx="60" cy="50" r="20" fill="rgba(183,110,121,0.08)" />
            <circle cx="140" cy="50" r="22" fill="none" stroke={activeColor} strokeWidth="2.5" opacity="0.9" />
            <circle cx="140" cy="50" r="20" fill="rgba(183,110,121,0.08)" />
            <path d="M 82 48 Q 100 42 118 48" fill="none" stroke={activeColor} strokeWidth="2.5" />
            <path d="M 38 48 Q 25 48 10 55" fill="none" stroke={activeColor} strokeWidth="1.5" />
            <path d="M 162 48 Q 175 48 190 55" fill="none" stroke={activeColor} strokeWidth="1.5" />
            <path d="M 52 38 Q 60 34 68 38" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            <path d="M 132 38 Q 140 34 148 38" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          </svg>
        );
      case 'square':
        return (
          <svg style={styleObj} viewBox="0 0 200 100" className="w-36 h-18 absolute pointer-events-none drop-shadow-md origin-center transition-all duration-75">
            <rect x="35" y="32" width="45" height="38" rx="6" fill="rgba(183,110,121,0.05)" stroke={activeColor} strokeWidth="2.5" />
            <rect x="120" y="32" width="45" height="38" rx="6" fill="rgba(183,110,121,0.05)" stroke={activeColor} strokeWidth="2.5" />
            <path d="M 80 45 H 120" fill="none" stroke={activeColor} strokeWidth="2.5" />
            <path d="M 35 45 H 10" fill="none" stroke={activeColor} strokeWidth="1.5" />
            <path d="M 165 45 H 190" fill="none" stroke={activeColor} strokeWidth="1.5" />
            <line x1="42" y1="38" x2="55" y2="38" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            <line x1="128" y1="38" x2="141" y2="38" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          </svg>
        );
      case 'cateye':
        return (
          <svg style={styleObj} viewBox="0 0 200 100" className="w-38 h-19 absolute pointer-events-none drop-shadow-md origin-center transition-all duration-75">
            <path d="M 30 36 C 40 34, 80 36, 80 52 C 80 65, 50 73, 35 56 C 28 47, 28 39, 30 36 Z" fill="rgba(183,110,121,0.08)" stroke={activeColor} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 170 36 C 160 34, 120 36, 120 52 C 120 65, 150 73, 165 56 C 172 47, 172 39, 170 36 Z" fill="rgba(183,110,121,0.08)" stroke={activeColor} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 25 34 L 40 27" stroke={activeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M 175 34 L 160 27" stroke={activeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M 80 46 Q 100 40 120 46" fill="none" stroke={activeColor} strokeWidth="2.5" />
            <path d="M 27 35 Q 18 39 10 47" fill="none" stroke={activeColor} strokeWidth="1.5" />
            <path d="M 173 35 Q 182 39 190 47" fill="none" stroke={activeColor} strokeWidth="1.5" />
            <path d="M 38 42 Q 50 39 60 45" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
            <path d="M 162 42 Q 150 39 140 45" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
          </svg>
        );
      case 'oval':
        return (
          <svg style={styleObj} viewBox="0 0 200 100" className="w-38 h-19 absolute pointer-events-none drop-shadow-md origin-center transition-all duration-75">
            <ellipse cx="60" cy="50" rx="26" ry="17" fill="rgba(183,110,121,0.06)" stroke={activeColor} strokeWidth="2.5" />
            <ellipse cx="140" cy="50" rx="26" ry="17" fill="rgba(183,110,121,0.06)" stroke={activeColor} strokeWidth="2.5" />
            <path d="M 86 48 Q 100 42 114 48" fill="none" stroke={activeColor} strokeWidth="2.5" />
            <path d="M 34 50 H 10" fill="none" stroke={activeColor} strokeWidth="1.5" />
            <path d="M 166 50 H 190" fill="none" stroke={activeColor} strokeWidth="1.5" />
            <path d="M 48 43 Q 60 38 72 41" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
            <path d="M 128 43 Q 140 38 152 41" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
          </svg>
        );
      case 'geometric':
        return (
          <svg style={styleObj} viewBox="0 0 200 100" className="w-36 h-18 absolute pointer-events-none drop-shadow-md origin-center transition-all duration-75">
            <polygon points="35,38 58,28 80,38 85,55 70,68 48,68 30,55" fill="rgba(183,110,121,0.06)" stroke={activeColor} strokeWidth="2.5" strokeLinejoin="round" />
            <polygon points="120,38 142,28 165,38 170,55 152,68 130,68 115,55" fill="rgba(183,110,121,0.06)" stroke={activeColor} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M 80 47 Q 100 40 120 47" fill="none" stroke={activeColor} strokeWidth="2.5" />
            <path d="M 30 47 H 10" fill="none" stroke={activeColor} strokeWidth="1.5" />
            <path d="M 170 47 H 190" fill="none" stroke={activeColor} strokeWidth="1.5" />
          </svg>
        );
      case 'aviator':
        return (
          <svg style={styleObj} viewBox="0 0 200 100" className="w-36 h-18 absolute pointer-events-none drop-shadow-md origin-center transition-all duration-75">
            <path d="M 38 36 C 46 33, 76 33, 78 40 C 80 48, 74 68, 54 68 C 38 68, 34 50, 38 36 Z" fill="rgba(183,110,121,0.08)" stroke={activeColor} strokeWidth="2.2" />
            <path d="M 162 36 C 154 33, 124 33, 122 40 C 120 48, 126 68, 146 68 C 162 68, 166 50, 162 36 Z" fill="rgba(183,110,121,0.08)" stroke={activeColor} strokeWidth="2.2" />
            <line x1="75" y1="38" x2="125" y2="38" stroke={activeColor} strokeWidth="2.2" />
            <path d="M 78 45 Q 100 41 122 45" fill="none" stroke={activeColor} strokeWidth="2.2" />
            <path d="M 36 41 H 10" fill="none" stroke={activeColor} strokeWidth="1.2" />
            <path d="M 164 41 H 190" fill="none" stroke={activeColor} strokeWidth="1.2" />
            <path d="M 46 42 L 54 55" stroke="#fff" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
            <path d="M 126 42 L 134 55" stroke="#fff" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-pink-100 rounded-[2.5rem] p-6 shadow-sm max-w-lg mx-auto text-right font-sans" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-800 to-rose-950 text-white p-5 rounded-[2rem] relative overflow-hidden shadow-md mb-5">
        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <span className="text-[8px] font-black text-pink-300 bg-pink-500/20 py-1 px-3 rounded-full uppercase border border-pink-500/35 inline-block">
            AI BEAUTY & STYLE 👑
          </span>
          <h3 className="font-extrabold text-xs leading-snug">مستشارة الجمال والأناقة الذكية 💄✨</h3>
          <p className="text-[9px] text-pink-100/90 leading-relaxed font-bold">
            حللي نوع بشرتكِ لإنشاء روتين ملكي أو استخدمي ماسح الوجه الذكي لتحديد الإطار المثالي لنظاراتكِ بلمسة مجلات الموضة الفاخرة.
          </p>
        </div>
      </div>

      {/* Premium Tab Bar Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1.5 bg-pink-50/25 rounded-3xl border border-pink-100/40 mb-5">
        <button
          type="button"
          onClick={() => { triggerLightHaptic(); setSubTab('routine'); }}
          className={`py-2 text-[8.5px] sm:text-[9.5px] font-black rounded-xl transition-all cursor-pointer ${
            subTab === 'routine'
              ? 'bg-gradient-to-r from-pink-800 to-rose-950 text-white shadow-xs'
              : 'text-gray-500 hover:text-pink-800 hover:bg-pink-50/30'
          }`}
        >
          🧴 روتين البشرة
        </button>
        <button
          type="button"
          onClick={() => { triggerLightHaptic(); setSubTab('glasses'); }}
          className={`py-2 text-[8.5px] sm:text-[9.5px] font-black rounded-xl transition-all cursor-pointer ${
            subTab === 'glasses'
              ? 'bg-gradient-to-r from-pink-800 to-rose-950 text-white shadow-xs'
              : 'text-gray-500 hover:text-pink-800 hover:bg-pink-50/30'
          }`}
        >
          🕶️ دليل النظارات
        </button>
        <button
          type="button"
          onClick={() => { triggerLightHaptic(); setSubTab('colors_makeup'); }}
          className={`py-2 text-[8.5px] sm:text-[9.5px] font-black rounded-xl transition-all cursor-pointer ${
            subTab === 'colors_makeup'
              ? 'bg-gradient-to-r from-pink-800 to-rose-950 text-white shadow-xs'
              : 'text-gray-500 hover:text-pink-800 hover:bg-pink-50/30'
          }`}
        >
          🎨 الألوان والمكياج
        </button>
        <button
          type="button"
          onClick={() => { triggerLightHaptic(); setSubTab('body_style'); }}
          className={`py-2 text-[8.5px] sm:text-[9.5px] font-black rounded-xl transition-all cursor-pointer ${
            subTab === 'body_style'
              ? 'bg-gradient-to-r from-pink-800 to-rose-950 text-white shadow-xs'
              : 'text-gray-500 hover:text-pink-800 hover:bg-pink-50/30'
          }`}
        >
          👗 القوام والملابس
        </button>
        <button
          type="button"
          onClick={() => { triggerLightHaptic(); setSubTab('collage_lookbook'); }}
          className={`py-2 text-[8.5px] sm:text-[9.5px] font-black rounded-xl transition-all cursor-pointer relative ${
            subTab === 'collage_lookbook'
              ? 'bg-gradient-to-r from-pink-800 to-rose-950 text-white shadow-xs'
              : 'text-gray-500 hover:text-pink-800 hover:bg-pink-50/30'
          }`}
        >
          📔 لوك بوك الإطلالات
          <span className="absolute -top-1 -left-1 bg-rose-500 text-white text-[5.5px] font-bold px-1 py-0.2 rounded-full scale-90">
            جديد
          </span>
        </button>
        <button
          type="button"
          onClick={() => { triggerLightHaptic(); setSubTab('facial_harmony'); }}
          className={`py-2 text-[8.5px] sm:text-[9.5px] font-black rounded-xl transition-all cursor-pointer ${
            subTab === 'facial_harmony'
              ? 'bg-gradient-to-r from-pink-800 to-rose-950 text-white shadow-xs'
              : 'text-gray-500 hover:text-pink-800 hover:bg-pink-50/30'
          }`}
        >
          📊 ملامح وتناسب الوجه
        </button>
      </div>

      {/* SUBTAB 1: Skincare Routine */}
      {subTab === 'routine' && (
        <>
          {loading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-10 h-10 rounded-full border-2 border-pink-600 border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1.5 text-xs text-pink-950 font-black">
                <p className="animate-pulse">جاري تحليل تفاصيل نوع بشرتكِ واحتياجاتكِ الجمالية...</p>
                <p className="text-[9px] text-gray-400 font-bold">الذكاء الاصطناعي يقوم بصياغة روتين مخصص لجمالكِ 🌸</p>
              </div>
            </div>
          ) : resultReport ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Diagnostic summary pills */}
              <div className="flex flex-wrap gap-1.5 bg-pink-50/20 p-3.5 rounded-2xl border border-pink-50/50 justify-center">
                <span className="text-[8.5px] font-black text-pink-800 bg-white border border-pink-100/50 py-1 px-3 rounded-xl">بشرة: {skinType}</span>
                <span className="text-[8.5px] font-black text-pink-800 bg-white border border-pink-100/50 py-1 px-3 rounded-xl">درجة: {skinTone}</span>
                <span className="text-[8.5px] font-black text-pink-800 bg-white border border-pink-100/50 py-1 px-3 rounded-xl">عمر: {ageGroup}</span>
              </div>

              {/* AI Markdown Report Content */}
              <div className="bg-slate-50/80 border border-pink-50 p-5 rounded-[2rem] text-xs text-gray-700 leading-relaxed font-semibold text-right shadow-inner select-text">
                <div className="markdown-body">
                  <ReactMarkdown>{resultReport}</ReactMarkdown>
                </div>
              </div>

              {/* Action Row */}
              <div className="flex justify-between items-center pt-3 border-t border-pink-50">
                <div className="flex items-center gap-1 text-[8.5px] text-emerald-700 font-black">
                  <ShieldCheck className="w-4 h-4" />
                  <span>مستشارة الجمال في خدمتكِ دائماً</span>
                </div>

                <button
                  onClick={handleReset}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-black text-[9.5px] py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>استشارة جديدة</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="space-y-5 animate-fade-in">
              
              {/* STEP 1: Skin Type, Tone & Age */}
              {step === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-pink-950">١. ما هو نوع بشرتكِ الكريمة؟</label>
                    <div className="grid grid-cols-2 gap-2">
                      {skinTypesList.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => { triggerLightHaptic(); setSkinType(type); }}
                          className={`p-3.5 rounded-2xl border text-[10.5px] font-black transition-all cursor-pointer ${
                            skinType === type
                              ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                              : 'bg-white text-gray-700 border-pink-100 hover:bg-pink-50/30'
                          }`}
                        >
                          {type === 'دهنية' && '🧴 بشرة دهنية'}
                          {type === 'جافة' && '💧 بشرة جافة'}
                          {type === 'مختلطة' && '⚖️ بشرة مختلطة'}
                          {type === 'حساسة' && '🛡️ بشرة حساسة'}
                          {!['دهنية', 'جافة', 'مختلطة', 'حساسة'].includes(type) && `⭐ ${type}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-extrabold text-pink-950">٢. ما هي درجة ولون بشرتكِ؟</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'فاتحة جداً ❄️', val: 'فاتحة جداً' },
                        { label: 'فاتحة ناصعة 🌸', val: 'فاتحة' },
                        { label: 'حنطية شرقية ✨', val: 'حنطية' },
                        { label: 'برونزية متألقة ☀️', val: 'برونزية' }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => { triggerLightHaptic(); setSkinTone(item.val); }}
                          className={`p-3.5 rounded-2xl border text-[10.5px] font-black transition-all cursor-pointer ${
                            skinTone === item.val
                              ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                              : 'bg-white text-gray-700 border-pink-100 hover:bg-pink-50/30'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-extrabold text-pink-950">٣. الفئة العمرية الموقرة:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['تحت ٢٠ سنة', '٢٠ - ٣٠ سنة', '٣٠ - ٤٠ سنة', '٤٠ سنة فما فوق'].map((age) => (
                        <button
                          key={age}
                          type="button"
                          onClick={() => { triggerLightHaptic(); setAgeGroup(age); }}
                          className={`p-3.5 rounded-2xl border text-[10.5px] font-black transition-all cursor-pointer ${
                            ageGroup === age
                              ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                              : 'bg-white text-gray-700 border-pink-100 hover:bg-pink-50/30'
                          }`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Beauty Goals */}
              {step === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-pink-950 block">٤. ما هي أهدافكِ للعناية بجمالكِ وروتينكِ؟</label>
                    <p className="text-[9px] text-gray-400 font-bold">يمكنكِ اختيار خيار واحد أو أكثر من القائمة التالية:</p>
                    
                    <div className="flex flex-wrap gap-2 pt-1 justify-end">
                      {beautyGoalsList.map((goal) => {
                        const isSelected = beautyGoals.includes(goal);
                        return (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => handleGoalToggle(goal)}
                            className={`py-2.5 px-4 rounded-xl text-[10px] font-black transition-all border flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-pink-50 text-pink-800 border-pink-300 shadow-xs font-black'
                                : 'bg-white text-gray-600 border-pink-100 hover:bg-pink-50/10'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-pink-800" />}
                            <span>{goal}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons Row */}
              <div className="flex justify-between items-center pt-4 border-t border-pink-50">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => { triggerLightHaptic(); setStep(prev => prev - 1); }}
                    className="text-[10px] font-black text-pink-900 bg-pink-50 hover:bg-pink-100 px-4 py-2.5 rounded-xl flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>
                ) : (
                  <div />
                )}

                {step < 2 ? (
                  <button
                    type="button"
                    onClick={() => { triggerLightHaptic(); setStep(prev => prev + 1); }}
                    className="text-[10px] font-black text-white bg-pink-600 hover:bg-pink-700 px-5 py-2.5 rounded-xl flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                  >
                    <span>المتابعة</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGetRoutine}
                    disabled={beautyGoals.length === 0}
                    className="bg-gradient-to-r from-pink-700 to-rose-900 disabled:from-gray-300 disabled:to-gray-300 text-white font-black text-[10px] py-2.5 px-6 rounded-xl flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>تحليل وإنتاج الروتين الملكي ✨</span>
                  </button>
                )}
              </div>

            </div>
          )}
        </>
      )}

      {/* SUBTAB 2: AI Glasses Analysis */}
      {subTab === 'glasses' && (
        <>
          {glassesLoading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-amber-600 border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1.5 text-xs text-amber-950 font-black">
                <p className="animate-pulse">جاري تحليل هندسة الملامح ونسب تماثل الوجه...</p>
                <p className="text-[9px] text-gray-400 font-bold">يقوم الذكاء الاصطناعي بصياغة دليل النظارات الشخصي الملكي 🕶️✨</p>
              </div>
            </div>
          ) : glassesResult ? (
            // INFOGRAPHIC: "Personal Eyewear Guide"
            <div className="bg-[#FAF8F5] border border-amber-200/50 rounded-[2rem] p-5 shadow-xs text-right space-y-5 animate-fade-in">
              
              {/* Infographic Header */}
              <div className="text-center border-b border-amber-200/30 pb-4">
                <span className="text-[8px] font-black text-amber-800 bg-amber-100/50 py-1 px-3 rounded-full uppercase tracking-wider">
                  Personal Eyewear Guide 🕶️
                </span>
                <h4 className="font-extrabold text-sm text-amber-950 mt-1">دليل النظارات الشخصي الملكي</h4>
                <p className="text-[8.5px] text-amber-800/80 mt-0.5 font-bold">إنفوجرافيك استشاري مصمم خصيصاً لجمال ملامحكِ الفريدة</p>
              </div>

              {/* Identity & Proportions Preserved Interactive Frame try-on Card */}
              <div className="bg-white p-4 rounded-2xl border border-amber-200/30 shadow-xs space-y-3">
                <h5 className="font-extrabold text-[10px] text-amber-950 flex items-center gap-1 justify-end">
                  <span>المعاينة التفاعلية وهندسة تماثل الوجه 100%</span>
                  <Camera className="w-4 h-4 text-amber-700" />
                </h5>
                
                <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden border border-amber-200/50 shadow-inner bg-stone-100">
                  <img 
                    src={glassesImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} 
                    alt="Portrait preview" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Fine analytical lines indicating symmetry, golden ratio measurements */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Dashed lines representing face measurements linked to dynamic states */}
                    <div style={{ left: `${faceCenterXVal}%` }} className="absolute top-0 bottom-0 border-l border-dashed border-amber-400/50 -translate-x-1/2" />
                    <div style={{ top: `${foreheadYVal}%` }} className="absolute left-0 right-0 border-t border-dashed border-amber-400/40" />
                    <div style={{ top: `${cheekbonesYVal}%` }} className="absolute left-0 right-0 border-t border-dashed border-amber-400/40" />
                    <div style={{ top: `${jawlineYVal}%` }} className="absolute left-0 right-0 border-t border-dashed border-amber-400/40" />
                    
                    {/* Measurement tags */}
                    <span style={{ top: `${foreheadYVal - 6}%` }} className="absolute right-1 text-[6.5px] font-bold text-amber-900 bg-white/90 px-1.5 py-0.5 rounded shadow-xs">الجبهة: {glassesResult.foreheadWidth?.split(' ')[0] || "متوازنة"}</span>
                    <span style={{ top: `${cheekbonesYVal - 6}%` }} className="absolute right-1 text-[6.5px] font-bold text-amber-900 bg-white/90 px-1.5 py-0.5 rounded shadow-xs">الوجنتين: {glassesResult.cheekboneProminence?.split(' ')[0] || "بارزة"}</span>
                    <span style={{ top: `${jawlineYVal - 6}%` }} className="absolute right-1 text-[6.5px] font-bold text-amber-900 bg-white/90 px-1.5 py-0.5 rounded shadow-xs">الفك: {glassesResult.jawlineShape?.split(' ')[0] || "منحوت"}</span>

                    {/* Calibration target crosshair placed dynamically at eye level */}
                    <div style={{ top: `${(glassesResult?.eyesY || 45) + adjustY}%`, left: `${(glassesResult?.eyesX || 50) + adjustX}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-amber-400/50 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                    </div>
                  </div>

                  {/* SVG Virtual glasses overlay with precise positioning */}
                  {renderGlassesOverlay(activeFrameDemo)}
                </div>

                {/* Precision Alignment Sliders Panel */}
                <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/30 space-y-2 text-right" dir="rtl">
                  <p className="text-[9.5px] font-black text-amber-950 flex items-center justify-between">
                    <span className="text-[7.5px] font-bold text-amber-700/60">اسحبي لضبط النظارة والخطوط بدقة</span>
                    <span>🎛️ لوحة الضبط الدقيق للملامح</span>
                  </p>
                  
                  {/* Glasses Position and Scale Controls */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[8px] text-gray-600 font-bold">
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[7.5px]">
                        <span className="font-mono text-amber-900">{adjustX > 0 ? `+${adjustX}` : adjustX}%</span>
                        <span>أفقياً (X):</span>
                      </div>
                      <input 
                        type="range" 
                        min="-25" 
                        max="25" 
                        value={adjustX} 
                        onChange={(e) => setAdjustX(Number(e.target.value))}
                        className="w-full accent-amber-700 h-1 bg-amber-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[7.5px]">
                        <span className="font-mono text-amber-900">{adjustY > 0 ? `+${adjustY}` : adjustY}%</span>
                        <span>عمودياً (Y):</span>
                      </div>
                      <input 
                        type="range" 
                        min="-25" 
                        max="25" 
                        value={adjustY} 
                        onChange={(e) => setAdjustY(Number(e.target.value))}
                        className="w-full accent-amber-700 h-1 bg-amber-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[7.5px]">
                        <span className="font-mono text-amber-900">{adjustScale}%</span>
                        <span>الحجم (Scale):</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="160" 
                        value={adjustScale} 
                        onChange={(e) => setAdjustScale(Number(e.target.value))}
                        className="w-full accent-amber-700 h-1 bg-amber-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[7.5px]">
                        <span className="font-mono text-amber-900">{adjustRotate}°</span>
                        <span>الميلان (Rotate):</span>
                      </div>
                      <input 
                        type="range" 
                        min="-30" 
                        max="30" 
                        value={adjustRotate} 
                        onChange={(e) => setAdjustRotate(Number(e.target.value))}
                        className="w-full accent-amber-700 h-1 bg-amber-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Face Lines Tuning */}
                  <div className="border-t border-amber-200/20 pt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[8px] text-gray-600 font-bold">
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[7.5px]">
                        <span className="font-mono text-amber-900">{foreheadYVal}%</span>
                        <span>خط الجبهة:</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="50" 
                        value={foreheadYVal} 
                        onChange={(e) => setForeheadYVal(Number(e.target.value))}
                        className="w-full accent-amber-700 h-1 bg-amber-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[7.5px]">
                        <span className="font-mono text-amber-900">{cheekbonesYVal}%</span>
                        <span>خط الوجنتين:</span>
                      </div>
                      <input 
                        type="range" 
                        min="30" 
                        max="70" 
                        value={cheekbonesYVal} 
                        onChange={(e) => setCheekbonesYVal(Number(e.target.value))}
                        className="w-full accent-amber-700 h-1 bg-amber-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[7.5px]">
                        <span className="font-mono text-amber-900">{jawlineYVal}%</span>
                        <span>خط الفك:</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="90" 
                        value={jawlineYVal} 
                        onChange={(e) => setJawlineYVal(Number(e.target.value))}
                        className="w-full accent-amber-700 h-1 bg-amber-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-[7.5px]">
                        <span className="font-mono text-amber-900">{faceCenterXVal}%</span>
                        <span>محور التماثل:</span>
                      </div>
                      <input 
                        type="range" 
                        min="25" 
                        max="75" 
                        value={faceCenterXVal} 
                        onChange={(e) => setFaceCenterXVal(Number(e.target.value))}
                        className="w-full accent-amber-700 h-1 bg-amber-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Micro frame selector for interactive virtual simulation */}
                <div className="space-y-1">
                  <p className="text-[8.5px] text-amber-900/70 text-center font-bold">جربي أشكال الإطارات مباشرة على ملامحكِ 🌸👇</p>
                  <div className="grid grid-cols-3 gap-1 pt-1">
                    {[
                      { id: 'cateye', label: 'عين القط 🐱' },
                      { id: 'round', label: 'دائرية ⚪' },
                      { id: 'square', label: 'مربعة ⬜' },
                      { id: 'oval', label: 'بيضاوية 🥚' },
                      { id: 'geometric', label: 'هندسية 💎' },
                      { id: 'aviator', label: 'أفياتور ✈️' }
                    ].map(btn => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => { triggerLightHaptic(); setActiveFrameDemo(btn.id); }}
                        className={`py-1 rounded-lg text-[8px] font-black border transition-all cursor-pointer ${
                          activeFrameDemo === btn.id
                            ? 'bg-amber-700 text-white border-amber-700 shadow-xs scale-105'
                            : 'bg-white text-gray-600 border-amber-100 hover:bg-amber-50'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Face Shape Analysis Card */}
              <div className="grid grid-cols-2 gap-3">
                {/* Geometric Analysis Card */}
                <div className="bg-white p-3.5 rounded-2xl border border-amber-200/20 space-y-1 text-right shadow-xs">
                  <h6 className="font-extrabold text-[9px] text-amber-950 border-b border-amber-100/60 pb-1 flex items-center gap-1 justify-end">
                    <span>تحليل الشكل والهندسة</span>
                    <Layers className="w-3.5 h-3.5 text-amber-700" />
                  </h6>
                  <ul className="space-y-1 text-[8.5px] text-gray-600 font-bold">
                    <li>📐 <strong className="text-amber-950 font-black">شكل الوجه:</strong> {glassesResult.faceShape}</li>
                    <li>⚖️ <strong className="text-amber-950 font-black">التماثل:</strong> {glassesResult.facialSymmetry}</li>
                    <li>📐 <strong className="text-amber-950 font-black">العرض للطول:</strong> {glassesResult.widthToLengthRatio}</li>
                  </ul>
                </div>

                {/* Landmarks Card */}
                <div className="bg-white p-3.5 rounded-2xl border border-amber-200/20 space-y-1 text-right shadow-xs">
                  <h6 className="font-extrabold text-[9px] text-amber-950 border-b border-amber-100/60 pb-1 flex items-center gap-1 justify-end">
                    <span>تفاصيل عظام الوجه</span>
                    <User className="w-3.5 h-3.5 text-amber-700" />
                  </h6>
                  <ul className="space-y-1 text-[8.5px] text-gray-600 font-bold">
                    <li>🌸 <strong className="text-amber-950 font-black">الوجنتين:</strong> {glassesResult.cheekboneProminence}</li>
                    <li>📐 <strong className="text-amber-950 font-black">الفك:</strong> {glassesResult.jawlineShape}</li>
                    <li>👑 <strong className="text-amber-950 font-black">الجبهة:</strong> {glassesResult.foreheadWidth}</li>
                  </ul>
                </div>
              </div>

              {/* Face Proportion Diagram Description */}
              <div className="bg-white p-4 rounded-2xl border border-amber-200/20 text-right space-y-1 shadow-xs">
                <h6 className="font-black text-[9.5px] text-amber-950 flex items-center gap-1 justify-end">
                  <span>مخطط نسب الوجه وتوزيع الملامح</span>
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                </h6>
                <p className="text-[8.5px] text-gray-600 font-semibold leading-relaxed">
                  {glassesResult.faceProportions}
                </p>
              </div>

              {/* Recommended vs Avoid Glasses Lists */}
              <div className="grid grid-cols-2 gap-3">
                {/* Recommended */}
                <div className="bg-emerald-50/45 p-3.5 rounded-2xl border border-emerald-100/50 text-right space-y-1.5 shadow-xs">
                  <h6 className="font-black text-[9px] text-emerald-950 flex items-center gap-1 justify-end">
                    <span>إطارات موصى بها بشدة ✨</span>
                  </h6>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {glassesResult.recommendedGlasses?.map((item: string, i: number) => (
                      <span key={i} className="bg-emerald-100/60 border border-emerald-200 text-emerald-900 text-[8px] font-black px-2 py-0.5 rounded-lg">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Avoid */}
                <div className="bg-rose-50/45 p-3.5 rounded-2xl border border-rose-100/50 text-right space-y-1.5 shadow-xs">
                  <h6 className="font-black text-[9px] text-rose-950 flex items-center gap-1 justify-end">
                    <span>إطارات يفضل تجنبها ⚠️</span>
                  </h6>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {glassesResult.glassesToAvoid?.map((item: string, i: number) => (
                      <span key={i} className="bg-rose-100/60 border border-rose-200/60 text-rose-900 text-[8px] font-black px-2 py-0.5 rounded-lg">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Side-by-side frames compatibility comparison matrix */}
              <div className="bg-white p-4 rounded-2xl border border-amber-200/20 text-right space-y-2.5 shadow-xs">
                <h6 className="font-black text-[9.5px] text-amber-950 border-b border-amber-100 pb-1 flex items-center gap-1 justify-end">
                  <span>مقارنة تفصيلية لجميع أشكال الإطارات ومدى ملائمتها</span>
                </h6>
                <div className="space-y-2 pt-1">
                  {glassesResult.comparison?.map((comp: any, index: number) => (
                    <div key={index} className="flex items-center justify-between border-b border-amber-50/50 pb-2 last:border-none last:pb-0">
                      <span className="text-[8px] font-bold text-gray-500 max-w-[50%] text-left line-clamp-1">{comp.suitability}</span>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-2.5 h-2.5 ${
                                i < Math.round(comp.rating) 
                                  ? 'text-amber-500 fill-amber-500' 
                                  : 'text-gray-200'
                              }`} 
                            />
                          ))}
                          <span className="text-[8px] font-black text-amber-800 ml-1">({comp.rating}/5)</span>
                        </div>
                        <span className="text-[8.5px] font-black text-amber-950">{comp.style}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex justify-between items-center pt-3 border-t border-amber-200/30">
                <div className="flex items-center gap-1 text-[8.5px] text-amber-800 font-black">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>دليل النظارات الشخصي الملكي - إيرامو</span>
                </div>

                <button
                  onClick={() => {
                    triggerLightHaptic();
                    setGlassesResult(null);
                    setGlassesError(null);
                  }}
                  className="bg-amber-700 hover:bg-amber-800 text-white font-black text-[9.5px] py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>تجربة تحليل جديدة</span>
                </button>
              </div>

            </div>
          ) : (
            // UPLOAD / TEST PORTRAIT FORM
            <div className="space-y-5 animate-fade-in text-right">
              
              {/* Feature Intro */}
              <div className="bg-amber-50/25 border border-amber-100 p-4 rounded-2xl text-center space-y-1.5">
                <span className="text-[14px]">👸📸🕶️</span>
                <h4 className="font-extrabold text-xs text-amber-950">مستشار هندسة الوجه والنظارات الفاخر</h4>
                <p className="text-[9px] text-gray-500 font-bold leading-relaxed max-w-sm mx-auto">
                  حملي صورتكِ الشخصية أو اختاري من النماذج الملكية في الأسفل، ليقوم ماسح الوجه الذكي بقياس تماثل وهندسة الوجه وتصميم إنفوجرافيك "Personal Eyewear Guide" المخصص لجمالكِ الفريد.
                </p>
              </div>

              {/* Upload image box */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-amber-950 block">١. قومي برفع صورتكِ الشخصية (بورتريه مستقيم):</label>
                
                <div className="border border-dashed border-amber-300 bg-amber-50/5 hover:bg-amber-50/15 transition-all rounded-2xl p-6 text-center relative cursor-pointer group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleUploadGlassesImage} 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                  />
                  
                  {glassesImage ? (
                    <div className="space-y-2 flex flex-col items-center">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-amber-200 shadow-sm">
                        <img src={glassesImage} alt="Portrait thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); triggerLightHaptic(); setGlassesImage(null); }}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-all cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <p className="text-[8.5px] text-emerald-700 font-black">✨ تم رفع صورتكِ بنجاح! جاهزة للفحص الذكي.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 flex flex-col items-center">
                      <div className="p-3 bg-amber-100/50 rounded-full text-amber-800 group-hover:scale-105 transition-all">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[9.5px] font-black text-amber-950">اسحبي صورتكِ أو انقري هنا للرفع</p>
                        <p className="text-[8px] text-gray-400 font-semibold">بصيغة JPEG أو PNG، يرجى أن يكون الوجه واضحاً ومستقيماً</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Select sample portrait */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-amber-950 block">أو اختاري صورة نموذجية لتجربة الفحص الفوري 🌸:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'الملكة ياسمين 👑', face: 'وجه بيضاوي', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
                    { name: 'الأميرة ريم 🌸', face: 'وجه دائري', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400' },
                    { name: 'الملكة مريم ✨', face: 'وجه مربع', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400' }
                  ].map((sample, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSamplePortrait(sample.url)}
                      className={`p-2 rounded-xl border text-right transition-all flex items-center gap-1.5 cursor-pointer ${
                        glassesImage === sample.url
                          ? 'bg-amber-100/55 border-amber-400'
                          : 'bg-white border-amber-100/40 hover:bg-amber-50/10'
                      }`}
                    >
                      <img src={sample.url} alt={sample.name} className="w-8 h-8 rounded-full object-cover border border-amber-200" referrerPolicy="no-referrer" />
                      <div className="text-[8px] overflow-hidden">
                        <p className="font-black text-amber-950 leading-none truncate">{sample.name}</p>
                        <p className="text-[7px] text-gray-400 mt-0.5 whitespace-nowrap">{sample.face}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error messages if any */}
              {glassesError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-[9px] font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                  <span>{glassesError}</span>
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={() => handleAnalyzeGlasses(false)}
                disabled={!glassesImage}
                className="w-full bg-gradient-to-r from-amber-700 to-rose-950 disabled:from-gray-300 disabled:to-gray-300 text-white font-black text-[10.5px] py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer mt-4"
              >
                <Sparkles className="w-4 h-4 animate-pulse text-amber-300" />
                <span>ابدئي التحليل الهندسي ودليل النظارات الملكي ✨</span>
              </button>

            </div>
          )}
        </>
      )}

      {/* Professional, polite validation prompt when glassesConfidenceScore is below 90% */}
      {showGlassesConfidencePrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-right">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 space-y-5 animate-scale-in">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-neutral-900">تنبيه جودة ومطابقة ملامح الوجه</h3>
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed max-w-xs">
                للحصول على أدق تحليل لهندسة ملامح وجهكِ وتحديد قياسات النظارات الملائمة تماماً لتقاسيم الوجه الطبيعية.
              </p>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-[11px] font-black text-amber-900">
                <span>مستوى دقة التتبع التلقائي الحالي:</span>
                <span className="text-amber-700">{glassesConfidenceScore}%</span>
              </div>
              <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${glassesConfidenceScore}%` }}
                />
              </div>
              <p className="text-[9.5px] text-amber-950 font-bold leading-relaxed">
                تظهر قياساتنا المبدئية انخفاض دقة تتبع الملامح (أقل من الحد الموصى به 90%)، وقد يعود ذلك لضعف الإضاءة أو الضبابية أو عدم مواجهة الكاميرا مباشرة.
              </p>
            </div>

            <div className="space-y-2 text-[10px] text-neutral-800 font-bold leading-relaxed">
              <p className="text-neutral-900 font-extrabold text-xs">نصائح بسيطة لتحسين النتيجة الفورية:</p>
              <ul className="space-y-2 text-[9px] pr-2 list-disc list-inside">
                <li>💡 <strong className="text-neutral-950">تحسين الإضاءة</strong>: اجلسي في مكان ذي إضاءة أمامية ناصعة وتجنبي الظلال القوية على الوجه.</li>
                <li>📸 <strong className="text-neutral-950">التموضع المستقيم</strong>: انظري للكاميرا مباشرة بشكل مستقيم تماماً وتجنبي إمالة الرأس يميناً أو يساراً.</li>
                <li>🔍 <strong className="text-neutral-950">وضوح ملامح الوجه</strong>: تأكدي من خلو الصورة من الضبابية أو التمويه، وتجنب النظارات أو تغطية الجبهة.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setShowGlassesConfidencePrompt(false)}
                className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-black text-[10.5px] py-3 rounded-2xl transition-all cursor-pointer text-center"
              >
                تعديل الصورة وتحسين الإضاءة 📸
              </button>
              <button
                onClick={() => handleAnalyzeGlasses(true)}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-[9.5px] py-2.5 rounded-2xl transition-all cursor-pointer text-center"
              >
                الاستمرار بالتحليل على أي حال ⚖️
              </button>
            </div>
          </div>
        </div>
      )}

      {subTab === 'colors_makeup' && <MakeupColorAnalysis />}

      {subTab === 'body_style' && <BodyStyleAnalysis />}

      {subTab === 'collage_lookbook' && <StyleCollageLookbook />}

      {subTab === 'facial_harmony' && <FacialHarmonyReport />}

    </div>
  );
}
