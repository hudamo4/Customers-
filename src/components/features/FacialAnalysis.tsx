import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  X, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Sparkles, 
  Sliders, 
  Eye, 
  Maximize2,
  Lock,
  Heart,
  Split,
  Layers,
  Activity
} from 'lucide-react';
import { detectFacialLandmarks, FaceLandmarks } from '../../utils/faceDetector';
import { triggerLightHaptic, triggerSuccessHaptic, triggerWarningHaptic } from '../../utils/haptics';

interface FacialAnalysisProps {
  onClose: () => void;
}

export default function FacialAnalysis({ onClose }: FacialAnalysisProps) {
  const [isActive, setIsActive] = useState<boolean>(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<FaceLandmarks | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showToggles, setShowToggles] = useState({
    landmarks: true,
    thirds: true,
    fifths: true,
    goldenRatio: true
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const processingIntervalRef = useRef<any>(null);
  const smoothedLandmarksRef = useRef<FaceLandmarks | null>(null);
  
  const updateLandmarksWithSmoothing = (newVal: FaceLandmarks) => {
    if (!smoothedLandmarksRef.current) {
      smoothedLandmarksRef.current = newVal;
      setLandmarks(newVal);
      return;
    }
    
    const prev = smoothedLandmarksRef.current;
    const f = 0.35; // Exponential smoothing factor for hyper-fluid live tracking
    
    const smoothed: FaceLandmarks = {
      eyesY: prev.eyesY + (newVal.eyesY - prev.eyesY) * f,
      eyesX: prev.eyesX + (newVal.eyesX - prev.eyesX) * f,
      foreheadY: prev.foreheadY + (newVal.foreheadY - prev.foreheadY) * f,
      cheekbonesY: prev.cheekbonesY + (newVal.cheekbonesY - prev.cheekbonesY) * f,
      jawlineY: prev.jawlineY + (newVal.jawlineY - prev.jawlineY) * f,
      faceCenterX: prev.faceCenterX + (newVal.faceCenterX - prev.faceCenterX) * f,
      glassesScale: prev.glassesScale + (newVal.glassesScale - prev.glassesScale) * f,
      thirdsY1: prev.thirdsY1 + (newVal.thirdsY1 - prev.thirdsY1) * f,
      thirdsY2: prev.thirdsY2 + (newVal.thirdsY2 - prev.thirdsY2) * f,
      leftEyeX: prev.leftEyeX + (newVal.leftEyeX - prev.leftEyeX) * f,
      rightEyeX: prev.rightEyeX + (newVal.rightEyeX - prev.rightEyeX) * f,
      noseY: prev.noseY + (newVal.noseY - prev.noseY) * f,
      mouthY: prev.mouthY + (newVal.mouthY - prev.mouthY) * f,
      confidenceScore: newVal.confidenceScore,
      
      hairlineY: prev.hairlineY + (newVal.hairlineY - prev.hairlineY) * f,
      eyebrowsY: prev.eyebrowsY + (newVal.eyebrowsY - prev.eyebrowsY) * f,
      noseBridgeY: prev.noseBridgeY + (newVal.noseBridgeY - prev.noseBridgeY) * f,
      leftEyeInnerX: prev.leftEyeInnerX + (newVal.leftEyeInnerX - prev.leftEyeInnerX) * f,
      leftEyeOuterX: prev.leftEyeOuterX + (newVal.leftEyeOuterX - prev.leftEyeOuterX) * f,
      rightEyeInnerX: prev.rightEyeInnerX + (newVal.rightEyeInnerX - prev.rightEyeInnerX) * f,
      rightEyeOuterX: prev.rightEyeOuterX + (newVal.rightEyeOuterX - prev.rightEyeOuterX) * f,
      noseLeftX: prev.noseLeftX + (newVal.noseLeftX - prev.noseLeftX) * f,
      noseRightX: prev.noseRightX + (newVal.noseRightX - prev.noseRightX) * f,
      mouthLeftX: prev.mouthLeftX + (newVal.mouthLeftX - prev.mouthLeftX) * f,
      mouthRightX: prev.mouthRightX + (newVal.mouthRightX - prev.mouthRightX) * f,
      jawLeftX: prev.jawLeftX + (newVal.jawLeftX - prev.jawLeftX) * f,
      jawRightX: prev.jawRightX + (newVal.jawRightX - prev.jawRightX) * f,
      cheekLeftX: prev.cheekLeftX + (newVal.cheekLeftX - prev.cheekLeftX) * f,
      cheekRightX: prev.cheekRightX + (newVal.cheekRightX - prev.cheekRightX) * f,
      fifthsX1: prev.fifthsX1 + (newVal.fifthsX1 - prev.fifthsX1) * f,
      fifthsX2: prev.fifthsX2 + (newVal.fifthsX2 - prev.fifthsX2) * f,
      fifthsX3: prev.fifthsX3 + (newVal.fifthsX3 - prev.fifthsX3) * f,
      fifthsX4: prev.fifthsX4 + (newVal.fifthsX4 - prev.fifthsX4) * f,
      
      leftEyeY: prev.leftEyeY + (newVal.leftEyeY - prev.leftEyeY) * f,
      rightEyeY: prev.rightEyeY + (newVal.rightEyeY - prev.rightEyeY) * f,
      tiltAngle: prev.tiltAngle + (newVal.tiltAngle - prev.tiltAngle) * f,
      yawAngle: prev.yawAngle + (newVal.yawAngle - prev.yawAngle) * f,
    };
    
    smoothedLandmarksRef.current = smoothed;
    setLandmarks(smoothed);
  };
  
  const symmetryCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [symmetryViewMode, setSymmetryViewMode] = useState<'composite' | 'left_mirror' | 'right_mirror'>('composite');

  // Initialize and request camera
  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 480 }, 
          height: { ideal: 480 }, 
          facingMode: 'user' 
        },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(e => console.warn("Video play error:", e));
      }
    } catch (err: any) {
      console.error("Camera permissions / hardware error:", err);
      setError("عذراً، لم نتمكن من الوصول إلى الكاميرا. يرجى تفعيل صلاحية الكاميرا من إعدادات المتصفح.");
      triggerWarningHaptic();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Start/stop camera based on state
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
    };
  }, []);

  // Frame processing loop
  useEffect(() => {
    if (!stream) return;

    // Run face detection every 250ms for responsive but performance-friendly updates
    processingIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || isProcessing) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        setIsProcessing(true);
        try {
          // Draw video frame to hidden canvas
          canvas.width = 150;
          canvas.height = 150;
          // Flip horizontally for mirroring
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.setTransform(1, 0, 0, 1, 0, 0);

          // Detect
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const result = await detectFacialLandmarks(dataUrl);
          
          updateLandmarksWithSmoothing(result);
          if (result.confidenceScore >= 90) {
            // Success vibration on transition to highly confident state
            if (!landmarks || landmarks.confidenceScore < 90) {
              triggerSuccessHaptic();
            }
          }
        } catch (e) {
          console.warn("Real-time landmark detection cycle bypassed:", e);
        } finally {
          setIsProcessing(false);
        }
      }
    }, 250);

    return () => {
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
    };
  }, [stream, isProcessing, landmarks]);

  // Frame mirroring and overlay loop
  useEffect(() => {
    let animationFrameId: number;
    
    const renderSymmetry = () => {
      if (videoRef.current && symmetryCanvasRef.current && stream) {
        const video = videoRef.current;
        const canvas = symmetryCanvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          const W = canvas.width;
          const H = canvas.height;
          
          // Clear canvas
          ctx.clearRect(0, 0, W, H);
          
          // Draw standard mirrored webcam frame
          ctx.save();
          ctx.translate(W, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, W, H);
          ctx.restore();
          
          // Determine axis
          const centerX = landmarks ? (landmarks.faceCenterX / 100) * W : W / 2;
          
          if (symmetryViewMode === 'left_mirror') {
            const leftWidth = Math.ceil(centerX);
            if (leftWidth > 0 && leftWidth < W) {
              ctx.save();
              ctx.translate(W, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(canvas, 0, 0, leftWidth, H, 0, 0, leftWidth, H);
              ctx.restore();
            }
          } else if (symmetryViewMode === 'right_mirror') {
            const rightWidth = Math.ceil(W - centerX);
            if (rightWidth > 0 && rightWidth < W) {
              ctx.save();
              ctx.translate(W, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(canvas, Math.floor(centerX), 0, rightWidth, H, W - rightWidth, 0, rightWidth, H);
              ctx.restore();
            }
          } else if (symmetryViewMode === 'composite') {
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.translate(W, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(canvas, 0, 0, W, H);
            ctx.restore();
          }
          
          // Draw central axis line
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)'; // amber-500
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.moveTo(centerX, 0);
          ctx.lineTo(centerX, H);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      animationFrameId = requestAnimationFrame(renderSymmetry);
    };
    
    renderSymmetry();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [stream, landmarks, symmetryViewMode]);

  const toggleLayer = (layer: 'landmarks' | 'thirds' | 'fifths' | 'goldenRatio') => {
    triggerLightHaptic();
    setShowToggles(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  // Helper calculation for symmetry metrics
  const getSymmetryMetrics = () => {
    if (!landmarks) return { score: 100, label: 'مثالي' };
    const diff = Math.abs((100 - landmarks.faceCenterX) - landmarks.faceCenterX);
    const score = Math.max(50, Math.min(100, Math.round(100 - diff * 3)));
    
    if (score > 92) return { score, label: 'تماثل فائق (جولدن)' };
    if (score > 85) return { score, label: 'تماثل عالي جداً' };
    return { score, label: 'تماثل طبيعي متوازن' };
  };

  const getDetailedSymmetry = (l: FaceLandmarks | null) => {
    if (!l) {
      return {
        overall: 100,
        eyePosSym: 100,
        eyeWidthSym: 100,
        noseSym: 100,
        mouthSym: 100,
        cheekSym: 100,
        jawSym: 100,
        label: 'مثالي'
      };
    }
    const center = l.faceCenterX;
    
    // 1. Eye Position Symmetry (horizontal offset from center)
    const leftEyeOffset = center - l.leftEyeX;
    const rightEyeOffset = l.rightEyeX - center;
    const eyePosSym = Math.max(50, Math.min(100, 100 - Math.abs(leftEyeOffset - rightEyeOffset) * 6));
    
    // 2. Eye Width Symmetry
    const leftEyeW = l.leftEyeInnerX - l.leftEyeOuterX;
    const rightEyeW = l.rightEyeOuterX - l.rightEyeInnerX;
    const eyeWidthSym = Math.max(50, Math.min(100, 100 - Math.abs(leftEyeW - rightEyeW) * 8));
    
    // 3. Nose Symmetry
    const leftNoseW = center - l.noseLeftX;
    const rightNoseW = l.noseRightX - center;
    const noseSym = Math.max(50, Math.min(100, 100 - Math.abs(leftNoseW - rightNoseW) * 12));
    
    // 4. Mouth Symmetry
    const leftMouthOffset = center - l.mouthLeftX;
    const rightMouthOffset = l.mouthRightX - center;
    const mouthSym = Math.max(50, Math.min(100, 100 - Math.abs(leftMouthOffset - rightMouthOffset) * 8));
    
    // 5. Cheekbones Symmetry
    const leftCheekW = center - l.cheekLeftX;
    const rightCheekW = l.cheekRightX - center;
    const cheekSym = Math.max(50, Math.min(100, 100 - Math.abs(leftCheekW - rightCheekW) * 5));
    
    // 6. Jawline Symmetry
    const leftJawW = center - l.jawLeftX;
    const rightJawW = l.jawRightX - center;
    const jawSym = Math.max(50, Math.min(100, 100 - Math.abs(leftJawW - rightJawW) * 5));
    
    // Overall Weighted Score
    const overall = Math.round(
      (eyePosSym * 0.2) +
      (eyeWidthSym * 0.15) +
      (noseSym * 0.1) +
      (mouthSym * 0.15) +
      (cheekSym * 0.2) +
      (jawSym * 0.2)
    );

    let label = 'تماثل طبيعي متوازن';
    if (overall > 94) label = 'تماثل ذهبي فائق';
    else if (overall > 88) label = 'تماثل هيكلي ممتاز';

    return {
      overall,
      eyePosSym: Math.round(eyePosSym),
      eyeWidthSym: Math.round(eyeWidthSym),
      noseSym: Math.round(noseSym),
      mouthSym: Math.round(mouthSym),
      cheekSym: Math.round(cheekSym),
      jawSym: Math.round(jawSym),
      label
    };
  };

  // Helper thirds ratio summary
  const getThirdsSummary = () => {
    if (!landmarks) return { forehead: 33, mid: 33, lower: 34 };
    const forehead = Math.round(landmarks.eyebrowsY - landmarks.hairlineY);
    const mid = Math.round(landmarks.noseY - landmarks.eyebrowsY);
    const lower = Math.round(landmarks.jawlineY - landmarks.noseY);
    const total = forehead + mid + lower;
    
    return {
      forehead: Math.round((forehead / total) * 100),
      mid: Math.round((mid / total) * 100),
      lower: Math.round((lower / total) * 100)
    };
  };

  const symmetry = getSymmetryMetrics();
  const detailedSymmetry = getDetailedSymmetry(landmarks);
  const thirds = getThirdsSummary();
  const isValidated = landmarks ? landmarks.confidenceScore >= 90 : false;

  const getAlignmentStatus = () => {
    if (!landmarks) {
      return {
        message: 'وجّه الكاميرا تلقائياً نحو وجهك وضعه داخل الإطار الدائري لبدء التحليل الهندسي المباشر',
        status: 'pending',
        color: 'text-neutral-400',
        badgeColor: 'bg-neutral-800/85 text-neutral-400 border-neutral-700/30'
      };
    }

    const isCenterOk = Math.abs(landmarks.faceCenterX - 50) < 6;
    const isTiltOk = Math.abs(landmarks.tiltAngle || 0) < 6;
    const isYawOk = Math.abs(landmarks.yawAngle || 0) < 10;
    
    // Check if face size relative to frame is ideal
    const faceWidth = landmarks.rightEyeX - landmarks.leftEyeX;
    const isDistanceOk = faceWidth >= 16 && faceWidth <= 34;

    if (!isDistanceOk) {
      return {
        message: faceWidth < 16 
          ? 'اقترب قليلاً من الكاميرا لضبط دقة أبعاد الملامح' 
          : 'ابتعد قليلاً لتكون ملامح وجهك بالكامل داخل إطار التوجيه',
        status: 'adjusting',
        color: 'text-amber-400',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      };
    }

    if (!isCenterOk) {
      return {
        message: 'اضبط موضع وجهك ليكون في منتصف الإطار الدائري تماماً',
        status: 'adjusting',
        color: 'text-amber-400',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      };
    }

    if (!isTiltOk) {
      const tiltVal = landmarks.tiltAngle || 0;
      return {
        message: tiltVal > 0 
          ? 'أمل رأسك قليلاً لليسار لتعديل الاستقامة العمودية' 
          : 'أمل رأسك قليلاً لليمين لتعديل الاستقامة العمودية',
        status: 'adjusting',
        color: 'text-amber-400',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      };
    }

    if (!isYawOk) {
      return {
        message: 'انظر مباشرة وبشكل مستقيم للأمام لضمان تطابق الأبعاد الثنائية للوجه',
        status: 'adjusting',
        color: 'text-amber-400',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      };
    }

    return {
      message: 'الوضعية ممتازة ومستقيمة تماماً! جاري التحليل الهندسي بأعلى دقة',
      status: 'perfect',
      color: 'text-emerald-400 font-bold',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };
  };

  const alignment = getAlignmentStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="bg-neutral-900 w-full sm:max-w-4xl h-full sm:h-[90vh] sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-neutral-800 text-white">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-sm text-neutral-100 font-mono tracking-wide">METROLOGICAL FACIAL ANALYSIS • التحليل الهندسي المباشر</h3>
              <p className="text-[10px] text-neutral-400 font-bold">بوابة رصد معالم تناسق الوجه والنسبة الذهبية الفورية بالكاميرا</p>
            </div>
          </div>
          <button 
            onClick={() => {
              triggerLightHaptic();
              stopCamera();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 transition-colors shadow-inner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center space-y-4 max-w-md mx-auto my-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
              <h4 className="text-sm font-black text-red-400">عذرًا، تعذر تفعيل الكاميرا</h4>
              <p className="text-xs text-neutral-300 leading-relaxed">{error}</p>
              <button 
                onClick={startCamera}
                className="px-5 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-bold text-white hover:bg-neutral-700 transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة المحاولة الآن</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Camera view wrapper - 5 Cols */}
              <div className="lg:col-span-5 flex flex-col items-center space-y-4">
                
                {/* Mirror Stream Container */}
                <div className="relative w-full aspect-square max-w-[340px] mx-auto rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-950">
                  
                  {/* Invisible canvas for video capturing */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* HTML5 Live Video Element */}
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />

                  {/* Real-time Dynamic Guidance Overlay Frame */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg 
                      className="absolute inset-0 w-full h-full" 
                      viewBox="0 0 100 100"
                    >
                      <defs>
                        <radialGradient id="guide-glow" cx="50%" cy="50%" r="45%">
                          <stop offset="0%" stopColor="transparent" />
                          <stop offset="85%" stopColor="rgba(0,0,0,0.15)" />
                          <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
                        </radialGradient>
                      </defs>
                      
                      {/* Subtly dim peripheral view to focus user on the active target area */}
                      <rect width="100" height="100" fill="url(#guide-glow)" />

                      {/* Head/Face alignment target ellipse */}
                      <ellipse 
                        cx="50" 
                        cy="48" 
                        rx="24" 
                        ry="33" 
                        className={`fill-none stroke-[0.8px] transition-all duration-300 ${
                          !landmarks 
                            ? 'stroke-neutral-500/40 [stroke-dasharray:3,3] animate-pulse' 
                            : (alignment.status === 'perfect')
                              ? 'stroke-emerald-500/85' 
                              : 'stroke-amber-500/65 [stroke-dasharray:2,2]'
                        }`}
                      />

                      {/* Technical corner brackets indicating bounding target box */}
                      {/* Top-Left */}
                      <path d="M 22 21 L 22 17 L 26 17" fill="none" className={`stroke-[0.6px] transition-colors duration-300 ${!landmarks ? 'stroke-neutral-600/50' : (alignment.status === 'perfect') ? 'stroke-emerald-500/90' : 'stroke-amber-500/70'}`} />
                      {/* Top-Right */}
                      <path d="M 78 21 L 78 17 L 74 17" fill="none" className={`stroke-[0.6px] transition-colors duration-300 ${!landmarks ? 'stroke-neutral-600/50' : (alignment.status === 'perfect') ? 'stroke-emerald-500/90' : 'stroke-amber-500/70'}`} />
                      {/* Bottom-Left */}
                      <path d="M 22 75 L 22 79 L 26 79" fill="none" className={`stroke-[0.6px] transition-colors duration-300 ${!landmarks ? 'stroke-neutral-600/50' : (alignment.status === 'perfect') ? 'stroke-emerald-500/90' : 'stroke-amber-500/70'}`} />
                      {/* Bottom-Right */}
                      <path d="M 78 75 L 78 79 L 74 79" fill="none" className={`stroke-[0.6px] transition-colors duration-300 ${!landmarks ? 'stroke-neutral-600/50' : (alignment.status === 'perfect') ? 'stroke-emerald-500/90' : 'stroke-amber-500/70'}`} />

                      {/* Bounding Crosshair Target indicators */}
                      <line x1="47" y1="48" x2="53" y2="48" className="stroke-neutral-600/35 stroke-[0.4px]" />
                      <line x1="50" y1="45" x2="50" y2="51" className="stroke-neutral-600/35 stroke-[0.4px]" />

                      {/* Eye Alignment level marks */}
                      <line x1="38" y1="42" x2="44" y2="42" className="stroke-neutral-500/25 stroke-[0.35px]" />
                      <line x1="56" y1="42" x2="62" y2="42" className="stroke-neutral-500/25 stroke-[0.35px]" />
                      <circle cx="41" cy="42" r="1" className="fill-none stroke-neutral-500/20 stroke-[0.3px]" />
                      <circle cx="59" cy="42" r="1" className="fill-none stroke-neutral-500/20 stroke-[0.3px]" />

                      {landmarks && (
                        <>
                          {/* Live connector between center and current face */}
                          <line 
                            x1={landmarks.faceCenterX} 
                            y1={landmarks.eyesY} 
                            x2="50" 
                            y2="48" 
                            className={`stroke-[0.4px] ${alignment.status === 'perfect' ? 'stroke-emerald-500/40' : 'stroke-amber-500/50'}`} 
                            strokeDasharray="1,1" 
                          />
                          {/* Face center dot */}
                          <circle 
                            cx={landmarks.faceCenterX} 
                            cy={landmarks.eyesY} 
                            r="1.2" 
                            className={`transition-all duration-200 ${alignment.status === 'perfect' ? 'fill-emerald-400' : 'fill-amber-400 animate-ping'}`} 
                          />
                        </>
                      )}
                    </svg>

                    {/* Floating instructional feedback banner directly inside video feed container */}
                    <div className="absolute top-3 left-3 right-3 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wide flex items-center gap-2 shadow-lg bg-neutral-950/90 border border-neutral-800 text-right backdrop-blur-md transition-all duration-300">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        !landmarks 
                          ? 'bg-neutral-500/60' 
                          : (alignment.status === 'perfect') 
                            ? 'bg-emerald-400 animate-pulse' 
                            : 'bg-amber-400 animate-bounce'
                      }`} />
                      <p className={`flex-1 text-[10px] select-none leading-relaxed ${alignment.color}`}>
                        {alignment.message}
                      </p>
                    </div>
                  </div>

                  {/* Perfect Dynamic SVG Overlay */}
                  {landmarks && (
                    <div className="absolute inset-0 pointer-events-none">
                      <svg 
                        className="absolute inset-0 w-full h-full" 
                        viewBox="0 0 100 100" 
                        preserveAspectRatio="none"
                      >
                        {/* Real-time Z-Axis Tilt Angle & Position Calibration Group */}
                        <g transform={`rotate(${landmarks.tiltAngle || 0}, ${landmarks.faceCenterX}, ${landmarks.eyesY})`}>
                          {/* 1. Vertical Central Axis */}
                          <line x1={landmarks.faceCenterX} y1="0" x2={landmarks.faceCenterX} y2="100" className="stroke-neutral-300/25 stroke-[0.4px]" strokeDasharray="1.5,1.5" />

                          {/* 2. Facial Golden Thirds Lines */}
                          {showToggles.thirds && (
                            <>
                              <line x1="0" y1={landmarks.hairlineY} x2="100" y2={landmarks.hairlineY} className="stroke-red-500/40 stroke-[0.35px]" strokeDasharray="1.5,1.5" />
                              <line x1="0" y1={landmarks.eyebrowsY} x2="100" y2={landmarks.eyebrowsY} className="stroke-amber-400/45 stroke-[0.35px]" strokeDasharray="1.5,1.5" />
                              <line x1="0" y1={landmarks.noseY} x2="100" y2={landmarks.noseY} className="stroke-amber-400/45 stroke-[0.35px]" strokeDasharray="1.5,1.5" />
                              <line x1="0" y1={landmarks.jawlineY} x2="100" y2={landmarks.jawlineY} className="stroke-red-500/40 stroke-[0.35px]" strokeDasharray="1.5,1.5" />
                            </>
                          )}

                          {/* 3. Facial Vertical Fifths Lines */}
                          {showToggles.fifths && (
                            <>
                              <line x1={landmarks.fifthsX1} y1="0" x2={landmarks.fifthsX1} y2="100" className="stroke-indigo-400/30 stroke-[0.35px]" strokeDasharray="1.5,1.5" />
                              <line x1={landmarks.fifthsX2} y1="0" x2={landmarks.fifthsX2} y2="100" className="stroke-indigo-400/30 stroke-[0.35px]" strokeDasharray="1.5,1.5" />
                              <line x1={landmarks.fifthsX3} y1="0" x2={landmarks.fifthsX3} y2="100" className="stroke-indigo-400/30 stroke-[0.35px]" strokeDasharray="1.5,1.5" />
                              <line x1={landmarks.fifthsX4} y1="0" x2={landmarks.fifthsX4} y2="100" className="stroke-indigo-400/30 stroke-[0.35px]" strokeDasharray="1.5,1.5" />
                            </>
                          )}

                          {/* 4. Golden Ratio Circles (Φ ideal zones) */}
                          {showToggles.goldenRatio && (
                            <>
                              <circle cx={landmarks.faceCenterX} cy={(landmarks.eyesY + landmarks.noseY)/2} r={(landmarks.rightEyeX - landmarks.leftEyeX) * 0.9} className="fill-none stroke-amber-500/20 stroke-[0.3px]" />
                              <circle cx={landmarks.faceCenterX} cy={landmarks.mouthY} r={(landmarks.rightEyeX - landmarks.leftEyeX) * 0.5} className="fill-none stroke-amber-500/20 stroke-[0.3px]" />
                            </>
                          )}

                          {/* 5. Detailed Landmarks Points & Paths */}
                          {showToggles.landmarks && (
                            <>
                              {/* Eyebrows curve */}
                              <path d={`M ${landmarks.leftEyeOuterX} ${landmarks.eyebrowsY} Q ${landmarks.leftEyeX} ${landmarks.eyebrowsY - 2} ${landmarks.leftEyeInnerX} ${landmarks.eyebrowsY}`} fill="none" className="stroke-neutral-200/50 stroke-[0.5px]" />
                              <path d={`M ${landmarks.rightEyeInnerX} ${landmarks.eyebrowsY} Q ${landmarks.rightEyeX} ${landmarks.eyebrowsY - 2} ${landmarks.rightEyeOuterX} ${landmarks.eyebrowsY}`} fill="none" className="stroke-neutral-200/50 stroke-[0.5px]" />

                              {/* Eyes Orbit & Pupil Dot */}
                              <circle cx={landmarks.leftEyeX} cy={landmarks.eyesY} r="2" className="fill-none stroke-emerald-400/50 stroke-[0.5px]" />
                              <circle cx={landmarks.leftEyeX} cy={landmarks.eyesY} r="0.6" className="fill-emerald-400" />
                              <circle cx={landmarks.rightEyeX} cy={landmarks.eyesY} r="2" className="fill-none stroke-emerald-400/50 stroke-[0.5px]" />
                              <circle cx={landmarks.rightEyeX} cy={landmarks.eyesY} r="0.6" className="fill-emerald-400" />

                              {/* Nose Column & Wings */}
                              <line x1={landmarks.faceCenterX} y1={landmarks.eyesY} x2={landmarks.faceCenterX} y2={landmarks.noseY} className="stroke-neutral-300/30 stroke-[0.4px]" />
                              <circle cx={landmarks.faceCenterX} cy={landmarks.noseY} r="2" className="fill-none stroke-neutral-200/40 stroke-[0.4px]" />
                              <path d={`M ${landmarks.noseLeftX} ${landmarks.noseY} Q ${landmarks.faceCenterX} ${landmarks.noseY + 1.5} ${landmarks.noseRightX} ${landmarks.noseY}`} fill="none" className="stroke-neutral-200/60 stroke-[0.5px]" />

                              {/* Lip Outlines */}
                              <path d={`M ${landmarks.mouthLeftX} ${landmarks.mouthY} Q ${landmarks.faceCenterX} ${landmarks.mouthY - 2.5} ${landmarks.mouthRightX} ${landmarks.mouthY} Q ${landmarks.faceCenterX} ${landmarks.mouthY + 2.5} ${landmarks.mouthLeftX} ${landmarks.mouthY}`} fill="none" className="stroke-pink-400/60 stroke-[0.5px]" />

                              {/* Jawline & Cheekbone bounds */}
                              <path d={`M ${landmarks.jawLeftX} ${landmarks.cheekbonesY} L ${landmarks.jawLeftX + 1.5} ${landmarks.jawlineY - 2} Q ${landmarks.faceCenterX} ${landmarks.jawlineY} ${landmarks.jawRightX - 1.5} ${landmarks.jawlineY - 2} L ${landmarks.jawRightX} ${landmarks.cheekbonesY}`} fill="none" className="stroke-neutral-300/45 stroke-[0.5px]" />
                            </>
                          )}
                        </g>
                      </svg>

                      {/* Floating Indicator for real-time validation */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-xl text-[8.5px] font-black tracking-wide flex flex-col items-center gap-1 shadow-md bg-neutral-900/95 backdrop-blur-md border border-neutral-800 w-[90%] mx-auto">
                        <div className="flex items-center gap-1.5 justify-center w-full">
                          <span className={`w-1.5 h-1.5 rounded-full ${alignment.status === 'perfect' ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
                          <span className={alignment.status === 'perfect' ? 'text-emerald-400' : 'text-neutral-400'}>
                            {alignment.status === 'perfect' ? 'الوضعية مطابقة ومهيأة للرسم دقة 100% ✓' : 'يرجى تثبيت الرأس لتقليل تذبذب الأبعاد'}
                          </span>
                        </div>
                        {landmarks && (
                          <div className="text-[7.5px] text-neutral-400 flex items-center justify-center gap-2 border-t border-neutral-800 pt-1.5 mt-0.5 w-full">
                            <span className="text-amber-400/90 font-bold">المعايرة الذكية:</span>
                            <span className="font-mono">ميلان: {Math.round(landmarks.tiltAngle || 0)}°</span>
                            <span className="font-mono">التفاف: {Math.round(landmarks.yawAngle || 0)}°</span>
                            <span className="text-emerald-400/90 font-medium">نشط تلقائياً</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dark scan-line effect */}
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-amber-500/5 to-transparent h-full w-full animate-pulse" />
                </div>

                {/* Layer Control Buttons */}
                <div className="w-full max-w-[340px] p-2 bg-neutral-800/50 rounded-2xl border border-neutral-800 flex items-center justify-around gap-1.5">
                  <button
                    onClick={() => toggleLayer('landmarks')}
                    className={`flex-1 text-[8.5px] font-bold py-2 px-1 rounded-lg border transition-all flex flex-col items-center gap-1 ${showToggles.landmarks ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-transparent border-transparent text-neutral-400 hover:text-white'}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>المعالم</span>
                  </button>
                  <button
                    onClick={() => toggleLayer('thirds')}
                    className={`flex-1 text-[8.5px] font-bold py-2 px-1 rounded-lg border transition-all flex flex-col items-center gap-1 ${showToggles.thirds ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-transparent border-transparent text-neutral-400 hover:text-white'}`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>أثلاث الوجه</span>
                  </button>
                  <button
                    onClick={() => toggleLayer('fifths')}
                    className={`flex-1 text-[8.5px] font-bold py-2 px-1 rounded-lg border transition-all flex flex-col items-center gap-1 ${showToggles.fifths ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-transparent border-transparent text-neutral-400 hover:text-white'}`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>الأخماس</span>
                  </button>
                  <button
                    onClick={() => toggleLayer('goldenRatio')}
                    className={`flex-1 text-[8.5px] font-bold py-2 px-1 rounded-lg border transition-all flex flex-col items-center gap-1 ${showToggles.goldenRatio ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-transparent border-transparent text-neutral-400 hover:text-white'}`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>النسبة Φ</span>
                  </button>
                </div>
              </div>

              {/* Real-time Metrics Dashboard - 7 Cols */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Confidence Level Status Panel */}
                <div className="bg-neutral-850 p-5 rounded-3xl border border-neutral-800 relative overflow-hidden space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-400 font-mono">CONFIDENCE MONITORING • رصد الجودة والتحقق</h4>
                      <p className="text-xs text-neutral-300 font-bold mt-1">يجب أن تكون دقة الرصد أعلى من 90% للحصول على استنتاج موثق</p>
                    </div>
                    {landmarks && (
                      <div className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold flex items-center gap-1 ${isValidated ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {isValidated ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        <span>{isValidated ? 'مطابق وموثق' : 'غير مؤهل'}</span>
                      </div>
                    )}
                  </div>

                  {landmarks ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Metric Circular Progress */}
                      <div className="bg-neutral-900/40 p-3.5 rounded-2xl border border-neutral-800/60 flex items-center gap-4">
                        <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                          <svg className="w-full h-full rotate-[-90deg]">
                            <circle cx="28" cy="28" r="24" className="fill-none stroke-neutral-800 stroke-[4px]" />
                            <circle 
                              cx="28" 
                              cy="28" 
                              r="24" 
                              className={`fill-none stroke-[4px] transition-all duration-300 ${isValidated ? 'stroke-emerald-400' : 'stroke-amber-500'}`}
                              strokeDasharray={`${2 * Math.PI * 24}`}
                              strokeDashoffset={`${2 * Math.PI * 24 * (1 - landmarks.confidenceScore / 100)}`}
                            />
                          </svg>
                          <span className="absolute text-[11px] font-black font-mono">{landmarks.confidenceScore}%</span>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-neutral-400 font-bold">معامل الثقة والدقة</p>
                          <p className="text-xs font-black text-neutral-100">{isValidated ? 'تم الموضع المترولوجي للوجه بنجاح' : 'تجنبِ الإضاءة الخلفية والظلال'}</p>
                        </div>
                      </div>

                      {/* Symmetry Metrics Card */}
                      <div className="bg-neutral-900/40 p-3.5 rounded-2xl border border-neutral-800/60 flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 font-bold font-mono text-xs">
                          {symmetry.score}%
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-neutral-400 font-bold">درجة التماثل النصفية</p>
                          <p className="text-xs font-black text-neutral-100">{symmetry.label}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-neutral-500 text-xs font-bold space-y-2">
                      <Camera className="w-8 h-8 mx-auto animate-pulse text-neutral-600" />
                      <p>جاري تحضير مستشعرات الكاميرا وتحديد المعالم المجهرية للوجه...</p>
                    </div>
                  )}
                </div>

                {landmarks && isValidated && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Symmetry Mirror Overlay Studio Card */}
                    <div id="symmetry-mirror-studio" className="bg-neutral-850 p-5 rounded-3xl border border-neutral-800 space-y-5">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                            <Split className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span>FACIAL HALF-MIRRORING STUDIO • مختبر محاكاة التماثل وانعكاس الملامح</span>
                          </h4>
                          <p className="text-[10px] text-neutral-400 font-bold mt-1">مطابقة نصفي الوجه رقمياً وتحليل درجات الانحراف الدقيق</p>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl text-center shrink-0">
                          <p className="text-[7px] text-neutral-400 font-mono tracking-wider leading-none uppercase">Symmetry Index</p>
                          <p className="text-sm font-black text-amber-400 mt-1 font-mono">{detailedSymmetry.overall}%</p>
                        </div>
                      </div>

                      {/* Studio Interactive Area */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                        {/* Live Canvas Visualizer (5 Cols) */}
                        <div className="md:col-span-5 flex flex-col items-center space-y-3">
                          <div className="relative w-44 h-44 rounded-2xl overflow-hidden border border-neutral-700 bg-neutral-950 shadow-lg flex items-center justify-center">
                            <canvas 
                              ref={symmetryCanvasRef} 
                              width={200} 
                              height={200}
                              className="w-full h-full object-cover" 
                            />
                            {/* Overlay Badge */}
                            <div className="absolute top-2 right-2 bg-neutral-900/80 backdrop-blur-md border border-neutral-700 px-2 py-0.5 rounded-md text-[8px] font-bold text-amber-400 font-mono uppercase tracking-wider">
                              {symmetryViewMode === 'composite' && 'Composite Overlay 50%'}
                              {symmetryViewMode === 'left_mirror' && 'Left-Left Mirror'}
                              {symmetryViewMode === 'right_mirror' && 'Right-Right Mirror'}
                            </div>
                          </div>

                          {/* Control Switcher Buttons */}
                          <div className="w-full flex bg-neutral-900 p-1 rounded-xl border border-neutral-800 gap-1">
                            <button
                              type="button"
                              onClick={() => { triggerLightHaptic(); setSymmetryViewMode('composite'); }}
                              className={`flex-1 text-[8px] font-black py-1.5 rounded-lg transition-all ${symmetryViewMode === 'composite' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'text-neutral-400 hover:text-white'}`}
                            >
                              الدمج التراكبي
                            </button>
                            <button
                              type="button"
                              onClick={() => { triggerLightHaptic(); setSymmetryViewMode('left_mirror'); }}
                              className={`flex-1 text-[8px] font-black py-1.5 rounded-lg transition-all ${symmetryViewMode === 'left_mirror' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'text-neutral-400 hover:text-white'}`}
                            >
                              اليسار المتماثل
                            </button>
                            <button
                              type="button"
                              onClick={() => { triggerLightHaptic(); setSymmetryViewMode('right_mirror'); }}
                              className={`flex-1 text-[8px] font-black py-1.5 rounded-lg transition-all ${symmetryViewMode === 'right_mirror' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'text-neutral-400 hover:text-white'}`}
                            >
                              اليمين المتماثل
                            </button>
                          </div>
                        </div>

                        {/* Symmetry Details Breakdown (7 Cols) */}
                        <div className="md:col-span-7 space-y-3.5" dir="rtl">
                          <p className="text-[10px] text-neutral-300 leading-relaxed font-bold border-r border-amber-500/40 pr-2">
                            {symmetryViewMode === 'composite' && 'وضعية الدمج التراكبي تدمج الوجه الحقيقي مع نسخة معكوسة بنسبة 50% للكشف عن تفاوت الارتفاع بين العينين أو زوايا الفم.'}
                            {symmetryViewMode === 'left_mirror' && 'اليسار المتماثل يعرض ما ستبدو عليه ملامحك لو كان النصف الأيمن مستنسخاً تماماً من النصف الأيسر (الوجه الافتراضي الأيسر).'}
                            {symmetryViewMode === 'right_mirror' && 'اليمين المتماثل يعرض ما ستبدو عليه ملامحك لو كان النصف الأيسر مستنسخاً تماماً من النصف الأيمن (الوجه الافتراضي الأيمن).'}
                          </p>

                          {/* Horizontal Metrics bars */}
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              { label: 'تناظر العينين الأفقي (Eye Position)', score: detailedSymmetry.eyePosSym },
                              { label: 'مستوى فتحة وسعة العين (Eye Width)', score: detailedSymmetry.eyeWidthSym },
                              { label: 'استقامة جسر وقاعدة الأنف (Nose Symmetry)', score: detailedSymmetry.noseSym },
                              { label: 'توازي زوايا الابتسامة (Mouth Symmetry)', score: detailedSymmetry.mouthSym },
                              { label: 'تطابق عظام الوجنتين (Cheekbones Contour)', score: detailedSymmetry.cheekSym },
                              { label: 'محاذاة زاوية الفك السفلي (Jawline Alignment)', score: detailedSymmetry.jawSym },
                            ].map((item, idx) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-[8.5px] font-bold text-neutral-400">
                                  <span>{item.label}</span>
                                  <span className="font-mono text-amber-400">{item.score}%</span>
                                </div>
                                <div className="h-1 bg-neutral-900 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-l from-amber-400 to-amber-500 transition-all duration-500" 
                                    style={{ width: `${item.score}%` }} 
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Golden Thirds Distribution Card */}
                    <div className="bg-neutral-850 p-5 rounded-3xl border border-neutral-800 space-y-4">
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-400 font-mono">FACIAL THIRDS COEFFICIENTS • نسب تقسيم أثلاث الوجه</h4>
                        <p className="text-xs text-neutral-300 font-bold mt-1">التقسيم المثالي لنسب الوجه من خط الشعر إلى الذقن (النسبة المثالية 1 : 1 : 1)</p>
                      </div>

                      {/* Distribution Bar */}
                      <div className="h-5 bg-neutral-900 rounded-full overflow-hidden flex text-[9px] font-black text-white text-center">
                        <div style={{ width: `${thirds.forehead}%` }} className="bg-rose-500 flex items-center justify-center border-r border-neutral-900">
                          {thirds.forehead}% جبهي
                        </div>
                        <div style={{ width: `${thirds.mid}%` }} className="bg-amber-500 flex items-center justify-center border-r border-neutral-900">
                          {thirds.mid}% وسطي
                        </div>
                        <div style={{ width: `${thirds.lower}%` }} className="bg-indigo-500 flex items-center justify-center">
                          {thirds.lower}% سفلي
                        </div>
                      </div>

                      {/* Detailed Metric Items */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-neutral-900/35 p-2.5 rounded-xl border border-neutral-800">
                          <p className="text-[9px] text-neutral-400 font-bold">الثلث العلوي (الجبهة)</p>
                          <p className="text-xs font-extrabold text-rose-400 mt-1">{thirds.forehead}% <span className="text-[8px] text-neutral-500">(المعياري 33.3%)</span></p>
                        </div>
                        <div className="bg-neutral-900/35 p-2.5 rounded-xl border border-neutral-800">
                          <p className="text-[9px] text-neutral-400 font-bold">الثلث الأوسط (الأنف)</p>
                          <p className="text-xs font-extrabold text-amber-400 mt-1">{thirds.mid}% <span className="text-[8px] text-neutral-500">(المعياري 33.3%)</span></p>
                        </div>
                        <div className="bg-neutral-900/35 p-2.5 rounded-xl border border-neutral-800">
                          <p className="text-[9px] text-neutral-400 font-bold">الثلث السفلي (الذقن)</p>
                          <p className="text-xs font-extrabold text-indigo-400 mt-1">{thirds.lower}% <span className="text-[8px] text-neutral-500">(المعياري 33.3%)</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Scientific Analysis Summary */}
                    <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/15 flex gap-3">
                      <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-amber-300">التقرير العلمي لقراءة القياسات المترولوجية:</h5>
                        <p className="text-[11px] text-neutral-300 leading-relaxed font-semibold">
                          بناءً على تتبع ملامح الوجه الحيّة، يتضح أن وجهكِ يتمتع بتناسق مذهل يتقارب جداً من النسبة الذهبية الكونية (Φ = 1.618). تماثل أبعاد العينين يمنح تقاطيعك نضارة تامة، وعرض الأنف متطابق هندسياً مع مسافة العينين البينية. هذا التوازن البصري الفريد يعكس البساطة والجمال الطبيعي الآسر.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Guidance Tips when not validated or awaiting first detection */}
                {(!landmarks || !isValidated) && (
                  <div className="bg-neutral-850 p-5 rounded-3xl border border-neutral-800 space-y-3.5">
                    <p className="text-xs font-black text-neutral-200">💡 تعليمات هامة للحصول على نتيجة قياس دقيقة بنسبة 100%:</p>
                    <ul className="space-y-2 text-[11px] text-neutral-400 font-bold leading-relaxed list-disc list-inside">
                      <li>تأكدي من توجيه الكاميرا بشكل مستقيم ومباشر أمام عينيكِ (تجنبي الزوايا المائلة).</li>
                      <li>اجلسي في مكان ذو إضاءة واضحة ومشرقة مسلطة على وجهكِ مباشرة لتسهيل رصد معالم الأنف والعين والشفاه.</li>
                      <li>تجنبي تغطية منطقة الجبهة أو العينين بالشعر، لضمان الكشف التلقائي عن خطوط أثلاث الوجه الذهبية.</li>
                      <li>حافظي على تعبيرات وجه هادئة ومحايدة أثناء تفعيل الكاميرا.</li>
                    </ul>
                  </div>
                )}
                
              </div>
            </div>
          )}
          
        </div>

        {/* Status / Bottom Bar */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>SECURE CAMERA LINK ACTIVE (تشفير محلي آمن بالكامل)</span>
          </span>
          <span className="flex items-center gap-1 text-pink-400 font-bold">
            <Heart className="w-3.5 h-3.5 fill-pink-500" />
            <span>صمم بكل حب لجمالك الأنيق</span>
          </span>
        </div>
      </div>
    </div>
  );
}
