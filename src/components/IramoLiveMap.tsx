import React, { useEffect, useRef, useState } from 'react';

interface IramoLiveMapProps {
  origin: string;
  status: string;
  destinationCity: string;
  trackingNumber: string;
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

export default function IramoLiveMap({ origin, status, destinationCity, trackingNumber }: IramoLiveMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletInstance = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Load Leaflet CDN Assets dynamically
  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => setLeafletLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Clean up if component unmounts before loading
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // Initialize and update Map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
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
    const destCoord: [number, number] = IRAQ_CITY_COORDS[destinationCity] || [33.3152, 44.3661]; // Destination City / Baghdad

    // Destroy previous map instance
    if (leafletInstance.current) {
      leafletInstance.current.remove();
      leafletInstance.current = null;
    }

    // Initialize Leaflet Map
    const map = L.map(mapRef.current, {
      center: [33.3152, 44.3661], // Center near Baghdad
      zoom: 4,
      zoomControl: true,
      attributionControl: false
    });

    leafletInstance.current = map;

    // Elegant Light-Themed Base Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(map);

    // Build Custom Icons
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

    const originIcon = createCustomDivIcon('bg-pink-700 text-white', '📦');
    const transitIcon = createCustomDivIcon('bg-amber-500 text-white', '✈️');
    const destinationIcon = createCustomDivIcon('bg-rose-600 text-white', '🏠');

    // Add Markers
    const originMarker = L.marker(originCoord, { icon: originIcon }).addTo(map)
      .bindPopup(`<div class="text-right font-black text-xs text-pink-900" dir="rtl">نقطة الانطلاق: ${origin} 🌐</div>`);

    const transitMarker = L.marker(transitCoord, { icon: transitIcon }).addTo(map)
      .bindPopup(`<div class="text-right font-black text-xs text-amber-900" dir="rtl">محطة الترانزيت الرئيسي: مطار بغداد الدولي ✈️</div>`);

    const destMarker = L.marker(destCoord, { icon: destinationIcon }).addTo(map)
      .bindPopup(`<div class="text-right font-black text-xs text-rose-900" dir="rtl">وجهة التوصيل: ${destinationCity} 💖</div>`);

    // Draw Routes & Lines
    const routeCoordinates = [originCoord, transitCoord, destCoord];
    
    // Polyline shadow
    L.polyline(routeCoordinates, {
      color: '#fbcfe8',
      weight: 6,
      opacity: 0.5
    }).addTo(map);

    // Dynamic Polyline based on shipment status progress
    const isCompleted = status.includes('تسليم') || status.includes('استلام') || status.includes('تم التسليم') || status.includes('وصلت للزبون');
    const isTransit = status.includes('مطار') || status.includes('جمارك') || status.includes('بغداد') || status.includes('طريق') || status.includes('توصيل');

    L.polyline(routeCoordinates, {
      color: '#db2777', // Iraamo signature pink color
      weight: 3.5,
      dashArray: '8, 8',
      opacity: 0.95
    }).addTo(map);

    // Add current location glowing ripple dot if not completed
    if (!isCompleted) {
      const currentLoc = isTransit ? transitCoord : originCoord;
      const pulsingIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
            <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-pink-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-600 border border-white"></span>
          </div>
        `,
        className: 'pulsing-gps-dot',
        iconSize: [20, 20]
      });
      L.marker(currentLoc, { icon: pulsingIcon }).addTo(map);
    }

    // Zoom and Fit all markers
    const group = new L.featureGroup([originMarker, transitMarker, destMarker]);
    map.fitBounds(group.getBounds().pad(0.15));

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [leafletLoaded, origin, status, destinationCity, trackingNumber]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-pink-100/40 bg-pink-50/5 h-[280px] w-full shadow-inner">
      {!leafletLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20 space-y-3">
          <div className="w-8 h-8 border-4 border-pink-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] text-pink-700 font-bold">جاري تحميل خريطة تتبع الشحنة الجغرافية...</span>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" style={{ minHeight: '100%' }} />
      
      {/* Dynamic Overlay Info Panel */}
      <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-pink-100/50 p-2.5 rounded-xl z-[999] shadow-md flex justify-between items-center flex-row-reverse" dir="rtl">
        <div className="text-right">
          <span className="text-[9px] font-black text-pink-700 block">تتبع جي بي إس (GPS) 🛰️</span>
          <span className="text-[10px] font-bold text-gray-700 leading-normal">
            المسار التقريبي: {origin.split(' ')[0]} ➔ بغداد ➔ {destinationCity}
          </span>
        </div>
        <span className="text-[9px] bg-pink-100 text-pink-800 px-2 py-0.5 rounded-md font-black">
          {status}
        </span>
      </div>
    </div>
  );
}
