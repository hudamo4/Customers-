import React, { useState, useEffect } from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { triggerLightHaptic, triggerSuccessHaptic, triggerMediumHaptic } from '../utils/haptics';

interface Elegant3DSpinWheelProps {
  onWin: (prizeText: string) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

export default function Elegant3DSpinWheel({ onWin, isSpinning, setIsSpinning }: Elegant3DSpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [lightsBlink, setLightsBlink] = useState(false);

  const PRIZES = [
    { text: 'خصم ١٠K 🎁', color: '#ffb3c1', textColor: '#590d22' },
    { text: '١٥٠ نقطة ⭐️', color: '#ffe5ec', textColor: '#590d22' },
    { text: 'عينة عطر 🌸', color: '#ff85a1', textColor: '#ffffff' },
    { text: 'شحن مجاني ✨', color: '#f7cad0', textColor: '#590d22' },
    { text: 'هدية لطيفة 💖', color: '#f9bec7', textColor: '#590d22' },
    { text: 'خصم ٢٠% 🏷️', color: '#ff7096', textColor: '#ffffff' }
  ];

  // Outer blinking lights effect
  useEffect(() => {
    const timer = setInterval(() => {
      setLightsBlink(prev => !prev);
    }, 350);
    return () => clearInterval(timer);
  }, []);

  const handleSpin = () => {
    if (isSpinning) return;
    
    triggerMediumHaptic();
    setIsSpinning(true);

    const prizeIdx = Math.floor(Math.random() * PRIZES.length);
    const segmentAngle = 360 / PRIZES.length;
    
    // Calculate final rotation angle
    // Minimum 5 full rotations (1800 degrees) plus alignment of target segment with the top pointer (at 0 degrees rotation, slice 0 is at 90 degrees offset)
    // To align slice idx with top, we rotate by: 360 - (idx * segmentAngle + segmentAngle / 2)
    const targetAngle = 360 - (prizeIdx * segmentAngle + segmentAngle / 2);
    const newRotation = rotation + 1800 + targetAngle - (rotation % 360);

    setRotation(newRotation);

    // Dynamic mechanical tick simulator matching the visual friction deceleration curve
    // Web Audio API tick generator
    const playTickSound = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);
        
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch (e) {
        // Web Audio blocked or not supported
      }
    };

    // Celebratory prize win melody fanfare
    const playWinSound = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        
        const playNote = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
          
          gain.gain.setValueAtTime(0.12, ctx.currentTime + start);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration - 0.02);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + start);
          osc.stop(ctx.currentTime + start + duration);
        };

        // Cheerful arpeggio melody
        playNote(523.25, 0, 0.15);     // C5
        playNote(659.25, 0.12, 0.15);  // E5
        playNote(783.99, 0.24, 0.15);  // G5
        playNote(1046.50, 0.36, 0.4);  // C6
      } catch (e) {
        // Web Audio blocked or not supported
      }
    };

    let currentDelay = 45;
    let elapsed = 0;
    
    const runTicks = () => {
      if (elapsed >= 4100) return; // Stop right before full deceleration stop
      
      playTickSound();
      triggerLightHaptic();
      
      elapsed += currentDelay;
      // Exponential friction formula to match ease-out cubic-bezier deceleration
      currentDelay = 45 + Math.pow(elapsed / 4500, 2.5) * 600;
      
      setTimeout(runTicks, currentDelay);
    };
    
    setTimeout(runTicks, currentDelay);

    setTimeout(() => {
      setIsSpinning(false);
      triggerSuccessHaptic();
      playWinSound();
      onWin(PRIZES[prizeIdx].text);
    }, 4500); // 4.5s spin duration
  };

  // Generate SVG segments
  const size = 250;
  const radius = 110;
  const cx = size / 2;
  const cy = size / 2;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="flex flex-col items-center justify-center my-4 space-y-4">
      
      {/* Dynamic 3D Wheel Stage */}
      <div className="relative w-[270px] h-[270px] flex items-center justify-center select-none">
        
        {/* Backing heavy ambient 3D shadow */}
        <div className="absolute inset-2 bg-pink-900/15 rounded-full blur-xl translate-y-6 pointer-events-none z-0" />

        {/* Golden outer rim border structure (3D bezel) */}
        <div className="absolute inset-0 rounded-full border-[10px] border-amber-400 bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-600 shadow-[0_16px_32px_rgba(219,39,119,0.25),_inset_0_4px_12px_rgba(255,255,255,0.7),_inset_0_-4px_12px_rgba(0,0,0,0.25)] z-10 pointer-events-none">
          {/* LED blinker lights embedded inside golden rim */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x = 125 + 117 * Math.cos(angle);
            const y = 125 + 117 * Math.sin(angle);
            const isActive = i % 2 === 0 ? lightsBlink : !lightsBlink;
            return (
              <span 
                key={i}
                style={{ left: `${x}px`, top: `${y}px` }}
                className={`absolute w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md transition-all duration-300 ${
                  isActive 
                    ? 'bg-yellow-100 shadow-yellow-200 scale-125' 
                    : 'bg-yellow-600 shadow-inner scale-90'
                }`}
              />
            );
          })}
        </div>

        {/* 3D Glass / Glossy Overlay covering the wheel */}
        <div className="absolute inset-[10px] rounded-full bg-radial-gradient from-transparent via-transparent to-black/10 z-20 pointer-events-none" />

        {/* Golden Pointer Arrow at top of wheel pointing down */}
        <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-8 h-8 z-30 pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)] flex items-center justify-center">
          {/* Gold triangular selector */}
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 relative">
            <div className="absolute top-[-23px] left-[-7px] w-3.5 h-3.5 bg-amber-200 rounded-full border border-amber-500 animate-pulse shadow-sm" />
          </div>
        </div>

        {/* Rotating Wheel Core */}
        <div 
          style={{ 
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 4.5s cubic-bezier(0.15, 0.85, 0.25, 1)' : 'none'
          }}
          className="w-[230px] h-[230px] rounded-full shadow-inner overflow-hidden relative z-0"
        >
          <svg viewBox="0 0 250 250" className="w-full h-full">
            {/* SVG slices and text labels */}
            {PRIZES.map((prize, idx) => {
              const startPercent = idx / PRIZES.length;
              const endPercent = (idx + 1) / PRIZES.length;
              
              const [startX, startY] = getCoordinatesForPercent(startPercent);
              const [endX, endY] = getCoordinatesForPercent(endPercent);

              const x1 = cx + radius * startX;
              const y1 = cy + radius * startY;
              const x2 = cx + radius * endX;
              const y2 = cy + radius * endY;

              const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
              const angle = (idx * 60) + 30; // Center angle of segment

              return (
                <g key={idx}>
                  {/* Slice Segment Path */}
                  <path 
                    d={pathData} 
                    fill={prize.color} 
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  {/* Text Label Rotated towards Center */}
                  <g transform={`rotate(${angle} ${cx} ${cy})`}>
                    <text 
                      x={cx + 50} 
                      y={cy + 4} 
                      textAnchor="middle" 
                      fill={prize.textColor} 
                      fontSize="9" 
                      fontWeight="900"
                      transform={`rotate(180 ${cx + 50} ${cy})`}
                    >
                      {prize.text}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Inner concentric details */}
            <circle cx={cx} cy={cy} r={radius - 12} fill="transparent" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
          </svg>
        </div>

        {/* Central 3D Static Hub with "دوري" Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-300 hover:from-amber-500 hover:via-yellow-300 hover:to-amber-400 disabled:from-gray-300 disabled:to-gray-400 text-amber-950 font-black rounded-full border-[3px] border-white/80 shadow-[0_4px_10px_rgba(0,0,0,0.35),_inset_0_2px_4px_rgba(255,255,255,0.6)] flex flex-col items-center justify-center z-30 transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 mb-0.5 text-amber-950 ${isSpinning ? 'animate-spin' : 'animate-bounce'}`} />
          <span className="text-[10px] tracking-tighter leading-none">دوري ✨</span>
        </button>

      </div>

    </div>
  );
}
