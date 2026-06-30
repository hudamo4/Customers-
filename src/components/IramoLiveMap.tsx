import React, { useEffect, useRef, useState } from 'react';
import { Navigation, Plane, Anchor, Gauge, Compass, CloudSun, RefreshCw, Zap, RotateCw, Globe, Map } from 'lucide-react';

interface IramoLiveMapProps {
  origin: string;
  status: string;
  destinationCity: string;
  trackingNumber: string;
  transitType?: 'air' | 'sea';
  transitSpeed?: number;
  transitAltitude?: number;
  simulatedProgress?: number;
}

const ORIGIN_COORDS: Record<string, [number, number]> = {
  turkey: [41.0082, 28.9784],
  istanbul: [41.0082, 28.9784],
  china: [23.1291, 113.2644],
  guangzhou: [23.1291, 113.2644],
  shenzhen: [22.5431, 114.0579],
  uae: [25.2048, 55.2708],
  dubai: [25.2048, 55.2708],
  kuwait: [29.3759, 47.9774],
};

const IRAQ_CITY_COORDS: Record<string, [number, number]> = {
  'بغداد': [33.3152, 44.3661],
  'بابل': [32.4854, 44.4239],
  'البصرة': [30.5081, 47.7835],
  'نينوى': [36.3489, 43.1577],
  'أربيل': [36.1912, 44.0091],
  'النجف': [32.0259, 44.3463],
  'كربلاء': [32.6160, 44.0249],
  'ذي قار': [31.0581, 46.2573],
  'الأنبار': [33.4217, 43.3032],
  'السليمانية': [35.5613, 45.4373],
  'ديالى': [33.7423, 44.6468],
  'كركوك': [35.4681, 44.3922],
  'ميسان': [31.8415, 47.1431],
  'المثنى': [31.3323, 45.2794],
  'صلاح الدين': [34.6030, 43.6841],
  'واسط': [32.5021, 45.8177],
  'دهوك': [36.8617, 42.9961],
};

function getArabicOrigin(originStr: string): string {
  const normalized = originStr.toLowerCase().trim();
  if (normalized.includes('turkey') || normalized.includes('istanbul') || normalized.includes('تركيا') || normalized.includes('إسطنبول') || normalized.includes('اسطنبول')) {
    return 'تركيا 🇹🇷';
  }
  if (normalized.includes('china') || normalized.includes('guangzhou') || normalized.includes('shenzhen') || normalized.includes('الصين') || normalized.includes('غوانزو') || normalized.includes('شينزين')) {
    return 'الصين 🇨🇳';
  }
  if (normalized.includes('uae') || normalized.includes('dubai') || normalized.includes('امارات') || normalized.includes('الإمارات') || normalized.includes('دبي')) {
    return 'الإمارات 🇦🇪';
  }
  if (normalized.includes('kuwait') || normalized.includes('الكويت')) {
    return 'الكويت 🇰🇼';
  }
  return originStr;
}

export default function IramoLiveMap({ 
  origin, 
  status, 
  destinationCity, 
  trackingNumber,
  transitType: initialTransitType,
  transitSpeed: initialTransitSpeed,
  transitAltitude: initialTransitAltitude,
  simulatedProgress: initialProgress
}: IramoLiveMapProps) {
  
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletInstance = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d'); // Default to beautiful 3D cockpit
  const arabicOrigin = getArabicOrigin(origin);

  // Determine transit defaults based on shipment properties
  const isSeaRoute = initialTransitType === 'sea' || status.includes('بحر') || status.includes('سفينة') || origin.toLowerCase().includes('sea');
  const actualTransitType = isSeaRoute ? 'sea' : 'air';

  // 3D Simulation Realtime State
  const [progress, setProgress] = useState<number>(initialProgress !== undefined ? initialProgress : 35);
  const [speed, setSpeed] = useState<number>(initialTransitSpeed || (actualTransitType === 'sea' ? 32 : 860));
  const [altitude, setAltitude] = useState<number>(initialTransitAltitude || (actualTransitType === 'sea' ? 0 : 10400));
  const [heading, setHeading] = useState<number>(285);
  const [cameraAngle, setCameraAngle] = useState<number>(-25); // Rotation angle of the grid
  const [weather, setWeather] = useState<string>('مستقر وصافي ☀️');

  // continuous dynamic telemetry effect (makes gauges fluctuate realistically)
  useEffect(() => {
    const timer = setInterval(() => {
      setSpeed(prev => {
        const delta = (Math.random() - 0.5) * 4;
        const base = initialTransitSpeed || (actualTransitType === 'sea' ? 32 : 860);
        const next = prev + delta;
        return Math.max(base * 0.9, Math.min(base * 1.1, next));
      });

      if (actualTransitType === 'air') {
        setAltitude(prev => {
          const delta = (Math.random() - 0.5) * 15;
          const base = initialTransitAltitude || 10400;
          const next = prev + delta;
          return Math.max(base * 0.95, Math.min(base * 1.05, next));
        });
      }

      setHeading(prev => {
        const delta = (Math.random() - 0.5) * 2;
        return (prev + delta + 360) % 360;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [initialTransitSpeed, initialTransitAltitude, actualTransitType]);

  // Keep progress in sync with prop if changed
  useEffect(() => {
    if (initialProgress !== undefined) {
      setProgress(initialProgress);
    }
  }, [initialProgress]);

  // Load Leaflet CDN Assets dynamically for 2D mode
  useEffect(() => {
    if (viewMode !== '2d') return;
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [viewMode]);

  // Initialize and update Leaflet Map in 2D mode
  useEffect(() => {
    if (viewMode !== '2d' || !leafletLoaded || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Resolve Coordinates
    const normalizedOrigin = origin.toLowerCase();
    let originCoord: [number, number] = [41.0082, 28.9784]; // Default Istanbul
    
    for (const key of Object.keys(ORIGIN_COORDS)) {
      if (normalizedOrigin.includes(key)) {
        originCoord = ORIGIN_COORDS[key];
        break;
      }
    }

    const transitCoord: [number, number] = [33.2625, 44.2341]; // Baghdad International Airport
    const destCoord: [number, number] = IRAQ_CITY_COORDS[destinationCity] || [33.3152, 44.3661];

    if (leafletInstance.current) {
      leafletInstance.current.remove();
      leafletInstance.current = null;
    }

    const map = L.map(mapRef.current, {
      center: [33.3152, 44.3661],
      zoom: 4,
      zoomControl: true,
      attributionControl: false
    });

    leafletInstance.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(map);

    const createCustomDivIcon = (bgColor: string, iconHtml: string) => {
      return L.divIcon({
        html: `
          <div class="w-10 h-10 rounded-full ${bgColor} border-2 border-white flex items-center justify-center shadow-lg animate-fade-in text-base transform -translate-x-1/2 -translate-y-1/2">
            ${iconHtml}
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
    };

    const originMarker = L.marker(originCoord, { icon: createCustomDivIcon('bg-pink-700 text-white', '📦') }).addTo(map)
      .bindPopup(`<div class="text-right font-black text-xs text-pink-900" dir="rtl">نقطة الانطلاق: ${arabicOrigin} 🌐</div>`);

    const transitMarker = L.marker(transitCoord, { icon: createCustomDivIcon('bg-amber-500 text-white', actualTransitType === 'sea' ? '🚢' : '✈️') }).addTo(map)
      .bindPopup(`<div class="text-right font-black text-xs text-amber-900" dir="rtl">المحطة الجارية: مطار بغداد الدولي 🇮🇶</div>`);

    const destMarker = L.marker(destCoord, { icon: createCustomDivIcon('bg-rose-600 text-white', '🏠') }).addTo(map)
      .bindPopup(`<div class="text-right font-black text-xs text-rose-900" dir="rtl">وجهة التوصيل: ${destinationCity} 💖</div>`);

    const routeCoordinates = [originCoord, transitCoord, destCoord];
    
    L.polyline(routeCoordinates, {
      color: '#fbcfe8',
      weight: 6,
      opacity: 0.5
    }).addTo(map);

    L.polyline(routeCoordinates, {
      color: '#db2777',
      weight: 3.5,
      dashArray: '8, 8',
      opacity: 0.95
    }).addTo(map);

    // Glowing GPS pulse
    const isCompleted = status.includes('تسليم') || status.includes('استلام') || status.includes('تم التسليم') || status.includes('وصلت للزبون');
    if (!isCompleted) {
      // Calculate current approximate marker based on progress ratio
      const ratio = progress / 100;
      let currentLat = originCoord[0] + (destCoord[0] - originCoord[0]) * ratio;
      let currentLng = originCoord[1] + (destCoord[1] - originCoord[1]) * ratio;
      
      const pulsingIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
            <span class="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-pink-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-pink-600 border border-white flex items-center justify-center text-[8px] text-white font-black">${actualTransitType === 'sea' ? '🚢' : '✈️'}</span>
          </div>
        `,
        className: 'pulsing-gps-dot',
        iconSize: [24, 24]
      });
      L.marker([currentLat, currentLng], { icon: pulsingIcon }).addTo(map);
    }

    const group = new L.featureGroup([originMarker, transitMarker, destMarker]);
    map.fitBounds(group.getBounds().pad(0.2));

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [viewMode, leafletLoaded, origin, status, destinationCity, progress, actualTransitType]);

  const handleSpeedBoost = () => {
    setProgress(prev => (prev >= 100 ? 0 : Math.min(100, prev + 15)));
  };

  const handleResetJourney = () => {
    setProgress(0);
  };

  const rotateCamera = () => {
    setCameraAngle(prev => (prev === -25 ? -15 : prev === -15 ? -35 : -25));
  };

  return (
    <div className="relative rounded-[32px] overflow-hidden border border-pink-100 bg-white/40 shadow-xl flex flex-col w-full min-h-[380px]" dir="rtl">
      {/* View Mode Switcher Header */}
      <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50/50 p-3 flex justify-between items-center border-b border-pink-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
          <span className="text-[11px] font-black text-pink-900">الملاحة والخرائط الذكية لـ IRAMO ✨</span>
        </div>
        
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === '3d' 
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md' 
                : 'bg-white hover:bg-pink-50 text-gray-600 border border-pink-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>محاكاة شحن ثلاثية الأبعاد (3D)</span>
          </button>
          
          <button
            onClick={() => setViewMode('2d')}
            className={`px-3.5 py-1.5 rounded-full text-[10px] font-black transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === '2d' 
                ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md' 
                : 'bg-white hover:bg-pink-50 text-gray-600 border border-pink-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>خريطة جي بي إس (2D)</span>
          </button>
        </div>
      </div>

      {/* Main Map/3D Stage Container */}
      <div className="relative flex-1 min-h-[300px] bg-slate-950 flex flex-col justify-end overflow-hidden">
        
        {/* 2D Leaflet View */}
        {viewMode === '2d' && (
          <div className="absolute inset-0 z-10 w-full h-full">
            {!leafletLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20 space-y-3">
                <div className="w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] text-pink-700 font-bold">جاري تشغيل محرك الأقمار الصناعية...</span>
              </div>
            )}
            <div ref={mapRef} className="h-full w-full" style={{ minHeight: '100%' }} />
          </div>
        )}

        {/* 3D Immersive Simulation View */}
        {viewMode === '3d' && (
          <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            
            {/* Ambient Grid overlay & Starry particles */}
            <div className="absolute inset-0 pointer-events-none opacity-25">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(219,39,119,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(219,39,119,0.15)_1px,transparent_1px)] bg-[size:20px_20px]" />
              {/* Twinkling stars */}
              <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-white rounded-full animate-ping" />
              <div className="absolute top-1/3 left-2/3 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
              <div className="absolute top-10 left-10 w-1 h-1 bg-rose-300 rounded-full animate-ping" />
            </div>

            {/* Simulated 3D Flight/Sailing Scene */}
            <div className="relative flex-1 w-full flex items-center justify-center">
              
              {/* Perspective 3D Box Container */}
              <div 
                className="w-full max-w-[450px] h-[160px] relative transition-transform duration-700 ease-out"
                style={{ 
                  perspective: '800px',
                }}
              >
                {/* Angled Ground/Ocean Plane */}
                <div 
                  className="w-full h-full border border-pink-500/20 rounded-3xl bg-slate-900/40 relative flex items-center justify-center shadow-2xl transition-all duration-700"
                  style={{
                    transform: `rotateX(60deg) rotateZ(${cameraAngle}deg) translateZ(-10px)`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Grid Lines */}
                  <div className="absolute inset-4 border border-pink-500/10 rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(219,39,119,0.1)_0%,transparent_80%)]" />

                  {/* Flight/Shipping Path Line (glowing) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ transform: 'translateZ(1px)' }}>
                    <path
                      d="M 50,80 Q 200,-40 350,80"
                      fill="none"
                      stroke="url(#pathGrad)"
                      strokeWidth="3.5"
                      strokeDasharray="6 4"
                      className="animate-[dash_10s_linear_infinite]"
                    />
                    <defs>
                      <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#f43f5e" stopOpacity="1" />
                        <stop offset="100%" stopColor="#db2777" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* 3D Checkpoint - Origin Guangzhou/China */}
                  <div 
                    className="absolute left-[40px] top-[70px] flex flex-col items-center"
                    style={{ transform: 'rotateX(-60deg) translateZ(10px)', transformStyle: 'preserve-3d' }}
                  >
                    <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-[10px] text-white shadow-lg border border-white font-bold">🇨🇳</div>
                    <span className="text-[8px] font-black text-pink-300 mt-1 whitespace-nowrap bg-slate-950/80 px-1.5 py-0.5 rounded border border-pink-500/20">{arabicOrigin}</span>
                    <div className="w-[1px] h-4 bg-pink-500/40" />
                  </div>

                  {/* 3D Checkpoint - Destination Baghdad */}
                  <div 
                    className="absolute right-[40px] top-[70px] flex flex-col items-center"
                    style={{ transform: 'rotateX(-60deg) translateZ(10px)', transformStyle: 'preserve-3d' }}
                  >
                    <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white shadow-lg border border-white font-bold">🇮🇶</div>
                    <span className="text-[8px] font-black text-rose-300 mt-1 whitespace-nowrap bg-slate-950/80 px-1.5 py-0.5 rounded border border-rose-500/20">بغداد</span>
                    <div className="w-[1px] h-4 bg-rose-500/40" />
                  </div>

                  {/* Animated Vessel Model (Plane or Ship) */}
                  {(() => {
                    // Approximate path calculation based on quadratic Bezier formula:
                    // B(t) = (1-t)^2 * P0 + 2(1-t)*t * P1 + t^2 * P2
                    const t = progress / 100;
                    const p0 = { x: 50, y: 80 };
                    const p1 = { x: 200, y: -40 };
                    const p2 = { x: 350, y: 80 };

                    const posX = (1-t)*(1-t)*p0.x + 2*(1-t)*t*p1.x + t*t*p2.x;
                    const posY = (1-t)*(1-t)*p0.y + 2*(1-t)*t*p1.y + t*t*p2.y;

                    // Compute tangent angle for rotating the model facing forward
                    const dx = 2*(1-t)*(p1.x - p0.x) + 2*t*(p2.x - p1.x);
                    const dy = 2*(1-t)*(p1.y - p0.y) + 2*t*(p2.y - p1.y);
                    const angleRad = Math.atan2(dy, dx);
                    const angleDeg = (angleRad * 180) / Math.PI;

                    return (
                      <div 
                        className="absolute flex flex-col items-center"
                        style={{
                          left: `${posX}px`,
                          top: `${posY}px`,
                          transform: `rotateX(-60deg) rotateY(${angleDeg}deg) translateZ(28px)`,
                          transformStyle: 'preserve-3d',
                          transition: 'left 0.4s ease-out, top 0.4s ease-out'
                        }}
                      >
                        {/* Pulse effect under vehicle */}
                        <span className="absolute -bottom-2 w-8 h-8 rounded-full bg-pink-500/40 blur-sm animate-ping pointer-events-none" />
                        
                        {/* Glowing 3D Vessel Body */}
                        <div className="relative bg-gradient-to-r from-pink-600 to-rose-500 text-white p-2.5 rounded-full shadow-2xl border-2 border-white flex items-center justify-center animate-bounce">
                          {actualTransitType === 'sea' ? (
                            <Anchor className="w-5 h-5 text-white" />
                          ) : (
                            <Plane className="w-5 h-5 text-white transform rotate-45" />
                          )}
                          
                          {/* Cabin glowing led light */}
                          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-white animate-pulse" />
                        </div>

                        {/* Alt Label */}
                        <div className="absolute -top-7 bg-slate-900/90 text-[8px] font-bold text-pink-300 border border-pink-500/30 px-1.5 py-0.5 rounded whitespace-nowrap shadow-md">
                          {actualTransitType === 'sea' ? '🚢 سفينة شحن' : `✈️ ارتفاع: ${(altitude / 1000).toFixed(1)}Kم`}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3D Floating Clouds */}
                  <div 
                    className="absolute left-[80px] top-[10px] opacity-40 animate-[cloud_18s_linear_infinite]"
                    style={{ transform: 'rotateX(-60deg) translateZ(45px)' }}
                  >
                    <div className="w-10 h-4 bg-white/80 rounded-full blur-[2px]" />
                  </div>
                  <div 
                    className="absolute right-[100px] top-[90px] opacity-30 animate-[cloud_25s_linear_infinite]"
                    style={{ transform: 'rotateX(-60deg) translateZ(60px)' }}
                  >
                    <div className="w-12 h-5 bg-white/70 rounded-full blur-[3px]" />
                  </div>

                </div>
              </div>

            </div>

            {/* Integrated Cockpit Glassmorphic Control & Telemetry Panel */}
            <div className="bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 space-y-3 shadow-2xl">
              
              {/* Telemetry Grid */}
              <div className="grid grid-cols-4 gap-2.5">
                
                {/* Speed Gauge */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center flex flex-col justify-between">
                  <div className="flex items-center justify-center gap-1 text-pink-400">
                    <Gauge className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-black">السرعة</span>
                  </div>
                  <div className="py-1">
                    <span className="text-[13px] font-black text-white">{Math.round(speed)}</span>
                    <span className="text-[8px] text-gray-400 block">{actualTransitType === 'sea' ? 'عقدة/س' : 'كم/س'}</span>
                  </div>
                </div>

                {/* Altitude / Wave Gauge */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center flex flex-col justify-between">
                  <div className="flex items-center justify-center gap-1 text-rose-400">
                    <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                    <span className="text-[8px] font-black">الارتفاع</span>
                  </div>
                  <div className="py-1">
                    <span className="text-[13px] font-black text-white">
                      {actualTransitType === 'sea' ? '1.2م' : `${Math.round(altitude)}م`}
                    </span>
                    <span className="text-[8px] text-gray-400 block">
                      {actualTransitType === 'sea' ? 'أمواج' : 'متر'}
                    </span>
                  </div>
                </div>

                {/* Progress Circle/Progress */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center flex flex-col justify-between">
                  <div className="flex items-center justify-center gap-1 text-emerald-400">
                    <Navigation className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-black">إنجاز المسار</span>
                  </div>
                  <div className="py-1">
                    <span className="text-[13px] font-black text-emerald-400">{Math.round(progress)}%</span>
                    <span className="text-[8px] text-gray-400 block">اكتمال الرحلة</span>
                  </div>
                </div>

                {/* Weather Gauge */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center flex flex-col justify-between">
                  <div className="flex items-center justify-center gap-1 text-amber-400">
                    <CloudSun className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-black">حالة الجو</span>
                  </div>
                  <div className="py-1">
                    <span className="text-[10px] font-black text-white leading-tight">ممتاز ☀️</span>
                    <span className="text-[8px] text-gray-400 block">بدون مطبات</span>
                  </div>
                </div>

              </div>

              {/* Progress Slider / Flight Path Progress bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[9px] text-gray-400 font-bold px-1">
                  <span>المغادرة: {arabicOrigin}</span>
                  <span className="text-pink-400 font-black">رمز التتبع: {trackingNumber}</span>
                  <span>الوصول: {destinationCity}</span>
                </div>
                <div className="relative w-full h-2.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute top-0 right-0 h-full bg-gradient-to-l from-pink-500 via-rose-500 to-pink-600 rounded-full transition-all duration-500 shadow-lg flex items-center justify-end"
                    style={{ width: `${progress}%` }}
                  >
                    <span className="w-2 h-2 rounded-full bg-white mr-0.5 animate-ping" />
                  </div>
                </div>
              </div>

              {/* Telemetry Autopilot System Logs */}
              <div className="bg-black/40 rounded-xl p-2.5 border border-white/5 flex justify-between items-center text-right font-mono" dir="rtl">
                <div className="space-y-0.5">
                  <span className="text-[8px] text-pink-400 block font-black">نظام الطيار التلقائي (Iramo Autopilot Platform):</span>
                  <p className="text-[9px] text-gray-300 font-bold">
                    {progress === 100 
                      ? '✓ تم تسليم الطرد ووصل إلى الوجهة النهائية بسلام!' 
                      : progress >= 80 
                      ? '📍 الشحنة في بغداد وجاري فرزها للتسليم المحلي للمندوب' 
                      : progress >= 40 
                      ? '✈️ الشحنة في الترانزيت الجوي فوق الأجواء الدولية متجهة للعراق' 
                      : '📦 تم تأكيد استلام الشحنة وجاري فرزها للتصدير الدولي'}
                  </p>
                </div>
                
                {/* Simulated cockpit flight computer buttons for the customer! */}
                <div className="flex gap-1">
                  <button 
                    onClick={rotateCamera} 
                    title="تغيير زاوية الكاميرا ثلاثية الأبعاد"
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all cursor-pointer border border-white/10"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={handleSpeedBoost} 
                    title="تسريع الطرد محاكاة"
                    className="p-1.5 bg-pink-900/40 hover:bg-pink-900/60 text-pink-300 rounded-lg transition-all cursor-pointer border border-pink-500/20"
                  >
                    <Zap className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={handleResetJourney} 
                    title="إعادة تشغيل المحاكاة"
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all cursor-pointer border border-white/10"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* General Map Legend and Detail Panel */}
      <div className="bg-pink-50/20 px-4 py-3 border-t border-pink-100/50 flex justify-between items-center text-[10px] text-gray-500" dir="rtl">
        <div>
          <span className="font-bold text-gray-700">حالة الشحنة المعلنة: </span>
          <span className="bg-pink-100 text-pink-800 font-black px-2 py-0.5 rounded-full text-[9px]">{status}</span>
        </div>
        <div className="text-left font-mono">
          <span className="text-gray-400 font-bold">إحداثيات المسار: </span>
          <span className="text-pink-700 font-extrabold">{progress >= 70 ? '33.3152° N, 44.3661° E' : '23.1291° N, 113.2644° E'}</span>
        </div>
      </div>
    </div>
  );
}
