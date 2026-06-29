import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Download, CheckCircle, Clock, ShoppingBag, Eye, Search, Sparkles, Check, Truck, FileDown, CreditCard, Lock, ShieldCheck, X, Printer, Copy, Receipt, Star, Share2 } from 'lucide-react';
import IramoWaxSeal from './IramoWaxSeal';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Invoice } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

interface InvoiceRatingFormProps {
  invoiceId: string;
}

function InvoiceRatingForm({ invoiceId }: InvoiceRatingFormProps) {
  const { rateInvoice } = useApp();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      await rateInvoice(invoiceId, rating, comment);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-1">
      <div className="flex items-center gap-1.5 justify-end">
        <span className="text-[10px] text-gray-500 font-bold ml-1">انقري لتقييم النجوم:</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <Star
                className={`w-5 h-5 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-200'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {rating > 0 && (
        <div className="flex gap-2 items-center animate-fade-in">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="اكتبي ملاحظاتكِ هنا (اختياري)..."
            className="flex-1 bg-white border border-pink-100 rounded-xl px-3 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-pink-400"
            dir="rtl"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-pink-700 hover:bg-pink-800 disabled:bg-gray-300 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer shrink-0"
          >
            {isSubmitting ? 'جاري الحفظ...' : 'إرسال'}
          </button>
        </div>
      )}
    </form>
  );
}


function parsePercentOrFloat(val: string): number {
  if (val.endsWith('%')) {
    return parseFloat(val) / 100;
  }
  return parseFloat(val);
}

function oklchToRgb(l: number, c: number, h: number, a: number = 1): string {
  const hRad = (h * Math.PI) / 180;
  const a_ = c * Math.cos(hRad);
  const b_ = c * Math.sin(hRad);

  return oklabToRgb(l, a_, b_, a);
}

function oklabToRgb(l: number, a_: number, b_: number, alpha: number = 1): string {
  const l_ = l + 0.3963377774 * a_ + 0.2158037573 * b_;
  const m_ = l - 0.1055613458 * a_ - 0.0638541728 * b_;
  const s_ = l - 0.0894841775 * a_ - 1.291485548 * b_;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const rL = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gL = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bL = -0.0041960863 * l3 - 0.703418614 * m3 + 1.707614701 * s3;

  const f = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);

  const r = Math.max(0, Math.min(255, Math.round(f(rL) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(f(gL) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(f(bL) * 255)));

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function parseOklchString(str: string): { l: number; c: number; h: number; a: number } | null {
  const cleaned = str.replace(/oklch\((.*)\)/i, '$1').trim();
  const parts = cleaned.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;

  const l = parsePercentOrFloat(parts[0]);
  const c = parsePercentOrFloat(parts[1]);
  let h = parseFloat(parts[2]);
  if (parts[2].endsWith('deg')) {
    h = parseFloat(parts[2]);
  } else if (parts[2].endsWith('rad')) {
    h = (parseFloat(parts[2]) * 180) / Math.PI;
  } else if (parts[2].endsWith('turn')) {
    h = parseFloat(parts[2]) * 360;
  }

  let a = 1;
  if (parts.length >= 4) {
    a = parsePercentOrFloat(parts[3]);
  }

  return { l, c, h, a };
}

function parseOklabString(str: string): { l: number; a: number; b: number; alpha: number } | null {
  const cleaned = str.replace(/oklab\((.*)\)/i, '$1').trim();
  const parts = cleaned.split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;

  const l = parsePercentOrFloat(parts[0]);
  const a = parsePercentOrFloat(parts[1]);
  const b = parsePercentOrFloat(parts[2]);

  let alpha = 1;
  if (parts.length >= 4) {
    alpha = parsePercentOrFloat(parts[3]);
  }

  return { l, a, b, alpha };
}

function replaceOklchInString(str: string): string {
  if (typeof str !== 'string' || !str.includes('oklch')) return str;
  
  return str.replace(/oklch\([^)]+\)/g, (match) => {
    try {
      const parsed = parseOklchString(match);
      if (parsed) {
        return oklchToRgb(parsed.l, parsed.c, parsed.h, parsed.a);
      }
    } catch (e) {
      console.warn('Failed to parse oklch color:', match, e);
    }
    return 'rgba(0, 0, 0, 0)';
  });
}

function replaceOklabInString(str: string): string {
  if (typeof str !== 'string' || !str.includes('oklab')) return str;
  
  return str.replace(/oklab\([^)]+\)/g, (match) => {
    try {
      const parsed = parseOklabString(match);
      if (parsed) {
        return oklabToRgb(parsed.l, parsed.a, parsed.b, parsed.alpha);
      }
    } catch (e) {
      console.warn('Failed to parse oklab color:', match, e);
    }
    return 'rgba(0, 0, 0, 0)';
  });
}

function replaceModernColors(str: string): string {
  if (typeof str !== 'string') return str;
  let result = str;
  if (result.includes('oklch')) {
    result = replaceOklchInString(result);
  }
  if (result.includes('oklab')) {
    result = replaceOklabInString(result);
  }
  return result;
}

function cleanClonedDocColors(clonedDoc: Document, clonedElement: HTMLElement) {
  // 1. Replace oklch/oklab in all <style> tags
  try {
    const styles = clonedDoc.querySelectorAll('style');
    styles.forEach((style) => {
      if (style.textContent) {
        style.textContent = replaceModernColors(style.textContent);
      }
    });
  } catch (e) {
    console.warn('Error replacing styles in <style> tags:', e);
  }

  // 2. Process stylesheets
  try {
    for (let i = 0; i < clonedDoc.styleSheets.length; i++) {
      const sheet = clonedDoc.styleSheets[i];
      try {
        const rules = sheet.cssRules || sheet.rules;
        if (!rules) continue;
        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j] as CSSStyleRule;
          if (rule.style && rule.style.cssText) {
            if (rule.style.cssText.includes('oklch') || rule.style.cssText.includes('oklab')) {
              rule.style.cssText = replaceModernColors(rule.style.cssText);
            }
          }
        }
      } catch (e) {
        // Can fail due to cross-origin sheets, safe to ignore
      }
    }
  } catch (e) {
    console.warn('Error replacing colors in styleSheets:', e);
  }

  // 3. Process inline style attributes and computed styles for all elements
  try {
    const allElements = clonedElement.querySelectorAll('*');
    const elements = [clonedElement, ...Array.from(allElements)];
    
    elements.forEach((el: any) => {
      if (!el.style) return;
      
      // Clean inline style attribute directly first
      const styleAttr = el.getAttribute('style');
      if (styleAttr) {
        el.setAttribute('style', replaceModernColors(styleAttr));
      }

      // Convert computed styles to safe inline styles so getComputedStyle reads safe values
      try {
        const computed = (clonedDoc.defaultView || window).getComputedStyle(el);
        const colorProps = [
          'color', 'backgroundColor', 'borderColor', 
          'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 
          'fill', 'stroke', 'backgroundImage', 'boxShadow', 'textShadow', 'outlineColor'
        ];
        
        colorProps.forEach((prop) => {
          const val = computed[prop as any];
          if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
            // Override with standard rgb/rgba/hex
            const cleanedVal = replaceModernColors(val);
            el.style[prop] = cleanedVal;
          }
        });
      } catch (e) {
        // Safe to ignore
      }
    });
  } catch (e) {
    console.warn('Error converting elements style properties:', e);
  }
}

const CornerLeaves = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 120 120" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M 15 15 C 35 25, 60 55, 65 95 C 66 105, 60 115, 55 120" />
    <path d="M 28 24 C 20 16, 12 18, 16 28 C 20 34, 28 30, 28 24 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M 26 21 C 32 15, 42 18, 38 28 C 34 34, 26 30, 26 21 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M 40 42 C 32 34, 24 36, 28 46 C 32 52, 40 48, 40 42 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M 38 38 C 45 32, 55 35, 51 45 C 47 51, 38 48, 38 38 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M 52 64 C 45 56, 38 58, 42 68 C 46 74, 52 70, 52 64 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M 50 60 C 57 54, 67 57, 63 67 C 59 73, 50 70, 50 60 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M 60 88 C 54 80, 48 82, 52 92 C 56 98, 60 94, 60 88 Z" fill="currentColor" fillOpacity="0.15" />
    <path d="M 59 84 C 66 78, 76 81, 72 91 C 68 97, 59 94, 59 84 Z" fill="currentColor" fillOpacity="0.15" />
  </svg>
);

const RibbonBow = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 60" 
    fill="currentColor" 
    className={className}
  >
    <path d="M 50 30 C 35 12, 18 15, 18 26 C 18 38, 35 34, 50 30" />
    <path d="M 50 30 C 65 12, 82 15, 82 26 C 82 38, 65 34, 50 30" />
    <path d="M 46 31 C 40 42, 30 52, 24 57 C 31 52, 41 43, 46 34" />
    <path d="M 53 31 C 59 42, 69 52, 75 57 C 68 52, 58 43, 53 34" />
    <ellipse cx="50" cy="30" rx="7" ry="6" />
  </svg>
);

const TitleBranch = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 60 30" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.2" 
    strokeLinecap="round" 
    className={className}
  >
    <path d="M 5 25 C 20 20, 40 15, 55 15" />
    <path d="M 20 22 C 16 16, 12 20, 18 22 Z" fill="currentColor" fillOpacity="0.2" />
    <path d="M 35 18 C 30 12, 26 16, 32 18 Z" fill="currentColor" fillOpacity="0.2" />
    <path d="M 48 16 C 44 10, 40 14, 46 16 Z" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

const ClipboardCheck = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 120" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="25" y="25" width="50" height="75" rx="8" ry="8" strokeWidth="1.8" />
    <path d="M 40 25 L 40 20 C 40 17, 43 15, 47 15 L 53 15 C 57 15, 60 17, 60 20 L 60 25 Z" fill="currentColor" fillOpacity="0.1" />
    <line x1="35" y1="45" x2="65" y2="45" strokeWidth="1.5" strokeDasharray="1 3" />
    <line x1="35" y1="60" x2="65" y2="60" strokeWidth="1.5" strokeDasharray="1 3" />
    <line x1="35" y1="75" x2="55" y2="75" strokeWidth="1.5" strokeDasharray="1 3" />
    <circle cx="68" cy="90" r="12" fill="currentColor" fillOpacity="0.1" strokeWidth="1.8" />
    <path d="M 63 90 L 67 94 L 74 86" strokeWidth="1.8" />
  </svg>
);

const BankIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="15" y1="85" x2="85" y2="85" strokeWidth="2.5" />
    <line x1="20" y1="78" x2="80" y2="78" strokeWidth="2" />
    <polygon points="50,15 15,40 85,40" fill="currentColor" fillOpacity="0.1" strokeWidth="2" />
    <rect x="27" y="40" width="8" height="38" rx="2" fill="currentColor" fillOpacity="0.15" />
    <rect x="46" y="40" width="8" height="38" rx="2" fill="currentColor" fillOpacity="0.15" />
    <rect x="65" y="40" width="8" height="38" rx="2" fill="currentColor" fillOpacity="0.15" />
  </svg>
);

export default function InvoiceView() {
  const { profile, invoices, payInvoice, shipments, customizations, updateCustomizations, appMode } = useApp();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [exportingAll, setExportingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Paid' | 'Pending'>('All');

  // Manager image edit states
  const isManager = appMode === 'manager';
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState(customizations?.invoiceHadooshaImageUrl || '');

  // Elegant Voucher States
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);
  const [selectedInvoiceForVoucher, setSelectedInvoiceForVoucher] = useState<Invoice | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [printImmediately, setPrintImmediately] = useState<boolean>(false);

  // Auto-print effect when triggered from the direct button
  React.useEffect(() => {
    if (showVoucherModal && printImmediately) {
      const timer = setTimeout(() => {
        window.print();
        setPrintImmediately(false);
      }, 600); // 600ms gives plenty of time for modal rendering & animations
      return () => clearTimeout(timer);
    }
  }, [showVoucherModal, printImmediately]);

  // Mastercard Payment States
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [cardNumber, setCardNumber] = useState<string>(() => {
    return profile?.savedCardNumber || '5412 7500 1234 5678';
  });
  const [cardHolder, setCardHolder] = useState<string>(() => {
    return profile?.savedCardHolder || profile?.name || 'Huda Al-Sultani';
  });
  const [expiry, setExpiry] = useState<string>(() => {
    return profile?.savedCardExpiry || '12/28';
  });

  React.useEffect(() => {
    if (profile) {
      if (profile.savedCardNumber) setCardNumber(profile.savedCardNumber);
      if (profile.savedCardHolder) setCardHolder(profile.savedCardHolder);
      if (profile.savedCardExpiry) setExpiry(profile.savedCardExpiry);
    }
  }, [profile]);
  const [cvv, setCvv] = useState<string>('345');
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [paySuccess, setPaySuccess] = useState<boolean>(false);
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);

  const handleCopyCard = () => {
    navigator.clipboard.writeText(customizations?.bankInfo?.superkey || '5412 7500 1234 5678');
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCvv(value);
  };

  const handleSimulatedPay = async () => {
    if (!selectedInvoice) return;
    setIsPaying(true);
    
    // Simulate transaction delay
    setTimeout(async () => {
      await payInvoice(selectedInvoice.invoiceId);
      setIsPaying(false);
      setPaySuccess(true);
    }, 2500);
  };

  const getShippingStatusStyle = (status?: string) => {
    if (!status) return { text: 'قيد المعالجة', color: 'bg-gray-50 text-gray-500 border-gray-100' };
    
    if (status.includes('مطار') || status.includes('بغداد')) {
      return {
        text: status,
        color: 'bg-teal-50 text-teal-700 border-teal-100/60'
      };
    }
    if (status.includes('المستودع') || status.includes('المعالجة')) {
      return {
        text: status,
        color: 'bg-amber-50 text-amber-700 border-amber-100/60'
      };
    }
    if (status.includes('التوصيل') || status.includes('شركة')) {
      return {
        text: status,
        color: 'bg-indigo-50 text-indigo-700 border-indigo-100/60'
      };
    }
    if (status.includes('التسليم') || status.includes('للزبون')) {
      return {
        text: status,
        color: 'bg-emerald-50 text-emerald-700 border-emerald-100/60'
      };
    }
    
    return {
      text: status,
      color: 'bg-pink-50 text-pink-700 border-pink-100/60'
    };
  };

  const handleDownload = (invoice: Invoice) => {
    setDownloadingId(invoice.invoiceId);
    
    setTimeout(async () => {
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = function(el, pseudoElt) {
        const styles = originalGetComputedStyle(el, pseudoElt);
        return new Proxy(styles, {
          get(target: any, prop: string | symbol) {
            if (prop === 'getPropertyValue') {
              return function(propertyName: string) {
                const val = target.getPropertyValue(propertyName);
                return replaceModernColors(val);
              };
            }
            const val = Reflect.get(target, prop);
            if (typeof val === 'function') {
              return val.bind(target);
            }
            if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
              return replaceModernColors(val);
            }
            return val;
          }
        }) as any;
      };

      try {
        const element = document.getElementById(`hidden-voucher-${invoice.invoiceId}`);
        if (!element) {
          throw new Error('Voucher element not found');
        }
        
        const canvas = await html2canvas(element, {
          scale: 2.5, // High resolution
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc, clonedElement) => {
            cleanClonedDocColors(clonedDoc, clonedElement);
          }
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        const imgWidth = 148; // A5 width in mm
        const pageHeight = 210; // A5 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a5'
        });
        
        const yOffset = imgHeight < pageHeight ? (pageHeight - imgHeight) / 2 : 0;
        
        pdf.addImage(imgData, 'JPEG', 0, yOffset, imgWidth, imgHeight);
        pdf.save(`Hadoosha_Invoice_${invoice.invoiceId}.pdf`);
      } catch (err) {
        console.error('Error generating PDF:', err);
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
        setDownloadingId(null);
      }
    }, 450);
  };

  const exportAllInvoices = () => {
    setExportingAll(true);
    
    setTimeout(async () => {
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = function(el, pseudoElt) {
        const styles = originalGetComputedStyle(el, pseudoElt);
        return new Proxy(styles, {
          get(target: any, prop: string | symbol) {
            if (prop === 'getPropertyValue') {
              return function(propertyName: string) {
                const val = target.getPropertyValue(propertyName);
                return replaceModernColors(val);
              };
            }
            const val = Reflect.get(target, prop);
            if (typeof val === 'function') {
              return val.bind(target);
            }
            if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
              return replaceModernColors(val);
            }
            return val;
          }
        }) as any;
      };

      try {
        const element = document.getElementById('hidden-statement-container');
        if (!element) {
          throw new Error('Statement element not found');
        }
        
        const canvas = await html2canvas(element, {
          scale: 2.5, // High resolution
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc, clonedElement) => {
            cleanClonedDocColors(clonedDoc, clonedElement);
          }
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Hadoosha_Statement_${profile?.name || 'Local'}.pdf`);
      } catch (err) {
        console.error('Error exporting statement:', err);
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
        setExportingAll(false);
      }
    }, 450);
  };

  // Helper to parse currency string (e.g. "125,000 د.ع") to number
  const parseAmount = (amtStr: string): number => {
    const cleaned = amtStr.replace(/[^\d]/g, ''); // Keep only digits
    return cleaned ? parseInt(cleaned, 10) : 0;
  };

  const getInvoiceBreakdown = (invoice: Invoice) => {
    if (invoice.itemsTotal && invoice.shippingCost) {
      return {
        total: invoice.amount,
        shipping: invoice.shippingCost,
        itemsTotal: invoice.itemsTotal
      };
    }
    const total = parseAmount(invoice.amount);
    const shipping = 5000; // standard shipping for Iraq
    const itemsTotal = Math.max(0, total - shipping);
    return {
      total: total.toLocaleString() + ' د.ع',
      shipping: shipping.toLocaleString() + ' د.ع',
      itemsTotal: itemsTotal.toLocaleString() + ' د.ع'
    };
  };

  const getInvoiceProducts = (invoice: Invoice) => {
    // If the invoice already has itemsList stored, return that directly!
    if (invoice.itemsList && invoice.itemsList.length > 0) {
      return invoice.itemsList;
    }

    // Look for matching shipment by order_id, tracking number, or store origin
    const match = (shipments || []).find(s => 
      s.trackingNumber === invoice.order_id || 
      (invoice.order_id || '').toLowerCase().includes((s.trackingNumber || '').toLowerCase()) ||
      (s.origin || '').toLowerCase().includes((invoice.store || '').toLowerCase()) ||
      (invoice.store || '').toLowerCase().includes((s.origin || '').toLowerCase())
    );

    if (match && match.items) {
      // If we have items text like "3 قطع" or comma-separated item names
      const itemParts = match.items.split(/[،,]+/).map(i => i.trim()).filter(Boolean);
      if (itemParts.length > 0) {
        const totalAmount = parseAmount(invoice.amount);
        const shipping = 5000;
        const netAmount = Math.max(0, totalAmount - shipping);
        
        return itemParts.map((name, index) => {
          // Distribute price proportionally
          const itemPrice = Math.round(netAmount / itemParts.length);
          return {
            name: name.includes('قطع') ? `${invoice.store} - منتج أنيق ${index + 1}` : name,
            quantity: '١ قطعة',
            price: itemPrice.toLocaleString() + ' د.ع'
          };
        });
      }
    }

    // Default dynamic products based on store if no shipment is found
    const totalAmount = parseAmount(invoice.amount);
    const shipping = 5000;
    const netAmount = Math.max(0, totalAmount - shipping);
    const store = invoice.store.toLowerCase();

    if (store.includes('shein') || store.includes('شين')) {
      return [
        { name: 'فستان مخملي كاجوال نسائي ربيعي', quantity: '١ قطعة', price: Math.round(netAmount * 0.6).toLocaleString() + ' د.ع' },
        { name: 'طقم حقيبة يد عصرية فاخرة', quantity: '١ قطعة', price: Math.round(netAmount * 0.4).toLocaleString() + ' د.ع' }
      ];
    } else if (store.includes('trendyol') || store.includes('تريندول')) {
      return [
        { name: 'معطف تركي شتوي كشمير طويل', quantity: '١ قطعة', price: Math.round(netAmount * 0.75).toLocaleString() + ' د.ع' },
        { name: 'وشاح صوف أنيق ملون دافئ', quantity: '١ قطعة', price: Math.round(netAmount * 0.25).toLocaleString() + ' د.ع' }
      ];
    } else if (store.includes('aliexpress') || store.includes('علي')) {
      return [
        { name: 'ساعة يد ذكية شاشة AMOLED مقاومة للماء', quantity: '١ قطعة', price: Math.round(netAmount * 0.8).toLocaleString() + ' د.ع' },
        { name: 'سوار حماية رياضي سيليكون إضافي', quantity: '١ قطعة', price: Math.round(netAmount * 0.2).toLocaleString() + ' د.ع' }
      ];
    } else if (store.includes('amazon') || store.includes('أمازون')) {
      return [
        { name: 'سماعات رأس لاسلكية إلغاء الضجيج Pro', quantity: '١ قطعة', price: Math.round(netAmount * 0.85).toLocaleString() + ' د.ع' },
        { name: 'حافظة شحن ذكية وحقيبة واقية', quantity: '١ قطعة', price: Math.round(netAmount * 0.15).toLocaleString() + ' د.ع' }
      ];
    } else {
      // Fallback for custom or other stores
      return [
        { name: `مجموعة منتجات تسوق من متجر ${invoice.store}`, quantity: '١ طرد', price: netAmount.toLocaleString() + ' د.ع' }
      ];
    }
  };

  const renderVoucherSheet = (invoice: Invoice, containerId: string) => {
    const breakdown = getInvoiceBreakdown(invoice);
    const dateParts = invoice.date.split('-');
    const yyyy = dateParts[0] || '----';
    const mm = dateParts[1] || '--';
    const dd = dateParts[2] || '--';
    const products = getInvoiceProducts(invoice);

    return (
      <div 
        id={containerId} 
        className="relative max-w-[480px] w-full bg-[#FFF5F6] border-[8px] border-[#FCE2E3] rounded-[40px] shadow-2xl p-6 overflow-hidden text-[#7D5558] select-none"
        style={{ fontFamily: 'Tajawal, sans-serif' }}
        dir="rtl"
      >
        {/* Inner thin border */}
        <div className="absolute inset-2 border border-[#E5B6B9]/40 rounded-[32px] pointer-events-none z-0"></div>

        {/* Corner Leaves decorative branches */}
        <CornerLeaves className="absolute top-2 left-2 w-20 h-20 text-[#EAA8AC] opacity-40 pointer-events-none z-0" />
        <CornerLeaves className="absolute top-2 right-2 w-20 h-20 text-[#EAA8AC] opacity-40 pointer-events-none z-0 scale-x-[-1]" />
        <CornerLeaves className="absolute bottom-2 left-2 w-20 h-20 text-[#EAA8AC] opacity-40 pointer-events-none z-0 scale-y-[-1]" />
        <CornerLeaves className="absolute bottom-2 right-2 w-20 h-20 text-[#EAA8AC] opacity-40 pointer-events-none z-0 scale-x-[-1] scale-y-[-1]" />

        {/* Main voucher content wrapper with z-index */}
        <div className="relative z-10 space-y-5">
          {/* Header section */}
          <header className="text-center pt-2">
            <RibbonBow className="w-16 h-10 text-[#EAA8AC] mx-auto mb-1" />
            <div className="text-3xl font-serif text-[#7D5558] font-bold tracking-[0.2em] select-none text-center">IRAMO</div>
            <div className="text-[10px] font-sans tracking-[0.3em] text-[#7D5558] font-bold select-none text-center mt-0.5">STORE</div>
            <div className="text-[#EAA8AC] text-xs my-1">❤</div>
            <h1 className="text-3xl font-extrabold text-[#7D5558] text-center mt-2">فاتورة الطلب</h1>
            
            {/* Date representation matching the design */}
            <div className="mt-3 flex justify-center items-center gap-2">
              <div className="bg-[#FCE2E3] p-1.5 rounded-full text-[#C58C8C] shrink-0">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span className="text-xs font-bold text-[#7D5558]">التاريخ:</span>
              <div className="flex gap-1 items-center font-mono text-xs text-pink-950">
                <span className="border-b-2 border-dotted border-[#E5B6B9] w-10 text-center pb-0.5">{dd}</span>
                <span className="text-[#C58C8C]">/</span>
                <span className="border-b-2 border-dotted border-[#E5B6B9] w-10 text-center pb-0.5">{mm}</span>
                <span className="text-[#C58C8C]">/</span>
                <span className="border-b-2 border-dotted border-[#E5B6B9] w-14 text-center pb-0.5">{yyyy}</span>
              </div>
            </div>
          </header>

          {/* Customer Info Box */}
          <section className="bg-[#FFFDFD] border border-[#FCDDDE] rounded-3xl p-5 space-y-3.5 shadow-sm">
            {/* Name Row */}
            <div className="flex items-center gap-2">
              <div className="bg-[#FCE2E3] p-1.5 rounded-full text-[#C58C8C] shrink-0">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span className="font-bold text-xs min-w-[70px] text-[#7D5558]">اسم العميل:</span>
              <div className="flex-grow border-b-2 border-dotted border-[#E5B6B9] relative h-5">
                <span className="absolute left-1 -top-1 px-3 bg-[#FFFDFD] font-black text-xs text-pink-900">
                  {invoice.customerName || profile?.name || 'الزبونة الكريمة'}
                </span>
              </div>
            </div>

            {/* Phone Row */}
            <div className="flex items-center gap-2">
              <div className="bg-[#FCE2E3] p-1.5 rounded-full text-[#C58C8C] shrink-0">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span className="font-bold text-xs min-w-[70px] text-[#7D5558]">رقم الهاتف:</span>
              <div className="flex-grow border-b-2 border-dotted border-[#E5B6B9] relative h-5">
                <span className="absolute left-1 -top-1 px-3 bg-[#FFFDFD] font-black text-xs font-mono text-pink-900">
                  {invoice.customerPhone || profile?.phone || '07800000000'}
                </span>
              </div>
            </div>

            {/* Province Row */}
            <div className="flex items-center gap-2">
              <div className="bg-[#FCE2E3] p-1.5 rounded-full text-[#C58C8C] shrink-0">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span className="font-bold text-xs min-w-[70px] text-[#7D5558]">المحافظة:</span>
              <div className="flex-grow border-b-2 border-dotted border-[#E5B6B9] relative h-5">
                <span className="absolute left-1 -top-1 px-3 bg-[#FFFDFD] font-black text-xs text-pink-900">
                  {invoice.customerCity || profile?.city || 'بغداد'}
                </span>
              </div>
            </div>
          </section>

          {/* Grid for order rows and summary side by side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column: Order Items Box */}
            <section className="bg-[#FFFDFD] border border-[#FCDDDE] rounded-3xl p-4 relative pt-6 flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1">
                <TitleBranch className="w-5 h-2.5 text-[#EAA8AC] scale-x-[-1]" />
                <div className="bg-[#FCE2E3] p-1 rounded-full text-[#C58C8C] shrink-0">
                  <ShoppingBag className="w-3 h-3" />
                </div>
                <span className="font-black text-[10px] text-[#7D5558]">تفاصيل الطلب</span>
                <TitleBranch className="w-5 h-2.5 text-[#EAA8AC]" />
              </div>

              <div className="space-y-4 pt-1 flex-grow">
                {products.map((prod, index) => (
                  <div key={index} className="relative border border-[#FCDDDE] p-2 rounded-2xl bg-[#FFF9F9]/40 text-right">
                    <span className="absolute -right-2 -top-2 bg-[#EAA8AC] text-white w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-bold shadow-sm">
                      {index + 1}
                    </span>
                    <div className="text-[10px] font-black text-pink-950 truncate max-w-[130px] pr-1.5 text-right">
                      {prod.name}
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-bold text-[#C58C8C] mt-1 pt-1 border-t border-dotted border-[#FCDDDE]">
                      <span>الكمية: {prod.quantity}</span>
                      <span>السعر: {prod.price}</span>
                    </div>
                  </div>
                ))}

                {/* Padding helper rows for traditional look */}
                {Array.from({ length: Math.max(0, 3 - products.length) }).map((_, i) => {
                  const rowNum = products.length + i + 1;
                  return (
                    <div key={`empty-${i}`} className="relative border border-[#FCDDDE]/40 p-2 rounded-2xl opacity-40 text-right">
                      <span className="absolute -right-2 -top-2 bg-[#EAA8AC]/50 text-white w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-bold">
                        {rowNum}
                      </span>
                      <div className="text-[10px] font-bold text-gray-300">
                        ...................................
                      </div>
                      <div className="flex justify-between items-center text-[8px] font-bold text-[#C58C8C]/30 mt-1">
                        <span>الكمية: ..........</span>
                        <span>السعر: .......... د.ع</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Right Column: Financial Summary Box */}
            <section className="bg-[#FFFDFD] border border-[#FCDDDE] rounded-3xl p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-3 text-[11px]">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <div className="bg-[#FCE2E3] p-1 rounded-full text-[#C58C8C] shrink-0">
                    <ShoppingBag className="w-3 h-3" />
                  </div>
                  <div className="flex-grow flex items-center justify-between px-1">
                    <span className="font-extrabold text-pink-950">{breakdown.itemsTotal}</span>
                    <span className="font-bold text-[10px] text-[#7D5558]">مجموع المنتجات:</span>
                  </div>
                </div>

                {/* Shipping */}
                <div className="flex justify-between items-center border-t border-[#FCDDDE]/50 pt-2.5">
                  <div className="bg-[#FCE2E3] p-1 rounded-full text-[#C58C8C] shrink-0">
                    <Truck className="w-3 h-3" />
                  </div>
                  <div className="flex-grow flex items-center justify-between px-1">
                    <span className="font-extrabold text-pink-950">{breakdown.shipping}</span>
                    <span className="font-bold text-[10px] text-[#7D5558]">أجور الشحن:</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex justify-between items-center border-t border-[#FCDDDE]/50 pt-2.5">
                  <div className="bg-[#FCE2E3] p-1 rounded-full text-[#C58C8C] shrink-0">
                    <CreditCard className="w-3 h-3" />
                  </div>
                  <div className="flex-grow flex items-center justify-between px-1">
                    <span className="font-extrabold text-pink-700 text-[9px]">MasterCard</span>
                    <span className="font-bold text-[10px] text-[#7D5558]">طريقة الدفع:</span>
                  </div>
                </div>
              </div>

              {/* Total Box */}
              <div className="bg-[#FCE2E3] rounded-2xl p-2.5 border border-white shadow-inner flex items-center justify-between gap-1 mt-auto">
                <div className="bg-white p-1 rounded-full text-[#C58C8C] shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="flex-grow flex items-center justify-between px-1 text-[#7D5558]">
                  <div className="flex items-center gap-0.5 text-pink-900 font-black text-sm">
                    <span>{invoice.amount.replace('د.ع', '').trim()}</span>
                    <span className="text-[9px]">د.ع</span>
                  </div>
                  <span className="font-black text-[10px]">المبلغ الكلي:</span>
                </div>
              </div>
            </section>
          </div>

          {/* Transfer Info Section */}
          <section className="bg-[#FFFDFD] border border-[#FCDDDE] rounded-3xl p-4 text-center relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <TitleBranch className="w-8 h-4 text-[#EAA8AC] scale-x-[-1]" />
              <div className="bg-[#FCE2E3] p-1.5 rounded-full text-[#C58C8C] shrink-0">
                <BankIcon className="w-4 h-4" />
              </div>
              <span className="font-black text-xs text-[#7D5558]">معلومات التحويل</span>
              <TitleBranch className="w-8 h-4 text-[#EAA8AC]" />
            </div>
            <p className="text-[9px] text-[#7D5558]/70 font-bold mb-1">رقم بطاقة Master Card:</p>
            <div className="text-sm font-mono font-black text-pink-800 tracking-wider bg-white py-2 rounded-xl border border-[#FCDDDE] shadow-inner inline-block px-6">
              {customizations?.bankInfo?.superkey || '5412 7500 1234 5678'}
            </div>
          </section>

          {/* Note Section */}
          <section className="bg-[#FFFDFD] border border-[#FCDDDE] rounded-3xl p-4 flex gap-3 relative shadow-sm select-none">
            <div className="flex-grow text-right space-y-1 text-[#7D5558]">
              <div className="flex items-center gap-1 mb-1.5 justify-start">
                <TitleBranch className="w-5 h-2.5 text-[#EAA8AC] scale-x-[-1]" />
                <h2 className="font-black text-xs text-[#7D5558]">ملاحظة</h2>
                <TitleBranch className="w-5 h-2.5 text-[#EAA8AC]" />
              </div>
              <ul className="text-[9px] space-y-1 list-none pr-0 font-bold text-gray-500 text-right">
                <li className="flex items-center gap-1.5 justify-start">
                  <span className="text-pink-400 text-xs">•</span>
                  <span>يرجى إرسال صورة التحويل بعد إتمام الدفع.</span>
                </li>
                <li className="flex items-center gap-1.5 justify-start">
                  <span className="text-pink-400 text-xs">•</span>
                  <span>يبدأ تجهيز الطلب بعد تأكيد استلام المبلغ.</span>
                </li>
                <li className="flex items-center gap-1.5 justify-start">
                  <span className="text-pink-400 text-xs">•</span>
                  <span>مدة الشحن تعتمد على نوع الطلب وطريقة الشحن المختارة.</span>
                </li>
              </ul>
            </div>
            <div className="shrink-0 flex items-center justify-center">
              <ClipboardCheck className="w-12 h-12 text-[#EAA8AC] opacity-80" />
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center pt-2 pb-1 relative z-10 space-y-3">
            <div className="flex flex-col items-center justify-center border-t border-dashed border-[#FCDDDE] pt-3 mt-1 select-none">
              <span className="text-[10px] text-[#7D5558]/80 font-black block mb-1">إدارة IRAMO:</span>
              
              {/* Pink Post Seal Stamp (Clean and inline!) */}
              <div className="w-20 h-20 rounded-full border-4 border-double border-pink-700/40 flex flex-col items-center justify-center rotate-[8deg] opacity-90 scale-95 select-none pointer-events-none bg-pink-50/10">
                <span className="text-[7px] font-black text-pink-700 leading-none">مكتب إيرامو للشحن</span>
                <span className="text-[5.5px] text-pink-600 font-bold leading-none mt-0.5">تأكيد التدقيق المالي</span>
                <span className="text-[8px] text-pink-700 font-extrabold leading-none mt-0.5">✓ APPROVED</span>
                <span className="text-[6px] text-pink-600/60 leading-none mt-0.5">2026 BAGHDAD</span>
              </div>

              {/* Signature block directly below the stamp */}
              <div className="relative pt-1 flex flex-col items-center px-4">
                <span className="font-signature-ar text-[11px] font-bold text-[#7D5558] tracking-wide block leading-none select-none relative z-10">
                  المحللة هدى محمد
                </span>
                <span className="font-signature text-base text-pink-700/90 block leading-none mt-1 select-none font-medium relative z-10">
                  AN.Huda Mohammed
                </span>
                <svg className="w-24 h-2 text-pink-600/30 mt-1" viewBox="0 0 100 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 5 C 20 8, 50 1, 98 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M15 7 C 40 9, 70 5, 90 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            <div className="pt-1">
              <p className="text-[#7D5558] text-[9px] font-bold">شكراً لثقتكم بـ</p>
              <p className="text-base font-bold tracking-[0.15em] text-[#7D5558] font-serif mt-0.5">IRAMO STORE</p>
              <RibbonBow className="w-16 h-8 text-[#EAA8AC] mx-auto mt-1" />
            </div>
          </footer>
        </div>
      </div>
    );
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('7144102758');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const handleShareInvoice = async (invoice: Invoice) => {
    const text = `🧾 وصل فاتورة من هادوشة للشحن الدولي
رقم الفاتورة: ${invoice.invoiceId}
المتجر: ${invoice.store}
المبلغ الإجمالي: ${invoice.amount}
الحالة: ${invoice.status === 'Paid' ? 'تم التسديد بنجاح ✅' : 'قيد الانتظار ⏳'}
تاريخ الفاتورة: ${invoice.date}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `فاتورة حدوشة ${invoice.invoiceId}`,
          text: text,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  const getMonthlyStats = () => {
    const monthsMap: Record<string, number> = {};
    const arabicMonths: Record<string, string> = {
      '01': 'كانون الثاني',
      '02': 'شباط',
      '03': 'آذار',
      '04': 'نيسان',
      '05': 'أيار',
      '06': 'حزيران',
      '07': 'تموز',
      '08': 'آب',
      '09': 'أيلول',
      '10': 'تشرين الأول',
      '11': 'تشرين الثاني',
      '12': 'كانون الأول'
    };

    invoices.forEach((inv) => {
      if (inv.status === 'Paid') {
        const parts = inv.date.split('-');
        if (parts.length >= 2) {
          const year = parts[0];
          const monthNum = parts[1];
          const monthName = arabicMonths[monthNum] || monthNum;
          const label = `${monthName} ${year}`;
          const val = parseAmount(inv.amount);
          monthsMap[label] = (monthsMap[label] || 0) + val;
        }
      }
    });

    return Object.entries(monthsMap).map(([month, total]) => ({
      month,
      total,
      displayTotal: `${total.toLocaleString()} د.ع`
    }));
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.order_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'All' || inv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="invoice-view">
      {/* Welcoming Character Header */}
      <div className="bg-white/95 border border-pink-100 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex-1 space-y-1">
          <h2 className="text-xl font-bold text-pink-700">أهلاً بكِ، {profile?.name || 'يا أنيقة'}!</h2>
          <p className="text-gray-500 text-xs leading-relaxed">
            هنا تجدين سجلاً كاملاً وحقيقياً لمشترياتكِ وحالة الفواتير والمدفوعات الخاصة بكِ.
            <span className="block text-pink-600 font-extrabold text-[10px] mt-1 bg-pink-50 rounded-md px-2 py-0.5 inline-block">
              ✨ انقري على الصورة أو الزر المتوهج باليسار لتغيير هذه الصورة الترحيبية واختيار شخصيتكِ المفضلة!
            </span>
          </p>
        </div>
        <div className="relative w-24 h-24 shrink-0 group">
          <div className="absolute inset-0 bg-pink-100/30 rounded-full blur-2xl"></div>
          <img
            alt="Hadoosha"
            className="w-full h-full object-contain relative z-10 drop-shadow rounded-full cursor-pointer hover:scale-105 transition-transform duration-300"
            src={customizations?.invoiceHadooshaImageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDozyQcrL4Yfp5wLXW9Y-K0AeiCtSO2G3lZVMIyffDaIoEBlb_otr_uLGq-Drr0G6N0FS5d6-u6YBfHWJzesjiFbJdWnD15Ct9IDSO08EczvwkYAWgQgEP3d-v91GCN7bOyvBP_FftRv6BChSeEzC7BDbSMtH3DXgL1bbvle6xHA957rBT170X9F2Itu0sPNmwKRqwqkDVOI_Pw-dG5myf2pu5mCFrs-IUMx_XlMi2OYl5IjfQgqquSxEAaElda7W5e1ZN5LhTYUFQ"}
            referrerPolicy="no-referrer"
            onClick={() => {
              setNewImageUrl(customizations?.invoiceHadooshaImageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDozyQcrL4Yfp5wLXW9Y-K0AeiCtSO2G3lZVMIyffDaIoEBlb_otr_uLGq-Drr0G6N0FS5d6-u6YBfHWJzesjiFbJdWnD15Ct9IDSO08EczvwkYAWgQgEP3d-v91GCN7bOyvBP_FftRv6BChSeEzC7BDbSMtH3DXgL1bbvle6xHA957rBT170X9F2Itu0sPNmwKRqwqkDVOI_Pw-dG5myf2pu5mCFrs-IUMx_XlMi2OYl5IjfQgqquSxEAaElda7W5e1ZN5LhTYUFQ");
              setIsEditingImage(true);
            }}
          />
          <button
            onClick={() => {
              setNewImageUrl(customizations?.invoiceHadooshaImageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDozyQcrL4Yfp5wLXW9Y-K0AeiCtSO2G3lZVMIyffDaIoEBlb_otr_uLGq-Drr0G6N0FS5d6-u6YBfHWJzesjiFbJdWnD15Ct9IDSO08EczvwkYAWgQgEP3d-v91GCN7bOyvBP_FftRv6BChSeEzC7BDbSMtH3DXgL1bbvle6xHA957rBT170X9F2Itu0sPNmwKRqwqkDVOI_Pw-dG5myf2pu5mCFrs-IUMx_XlMi2OYl5IjfQgqquSxEAaElda7W5e1ZN5LhTYUFQ");
              setIsEditingImage(true);
            }}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-pink-700 text-white flex items-center justify-center shadow-lg hover:bg-pink-800 transition-all border-2 border-white z-20 cursor-pointer active:scale-95"
            title="تغيير الصورة الترحيبية"
          >
            <Sparkles className="w-4 h-4 text-pink-100 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Edit Invoice Character Image Modal (Manager Only) */}
      {isEditingImage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-pink-100 shadow-2xl animate-fade-in text-right">
            <div className="flex items-center justify-between border-b border-pink-50 pb-3 flex-row-reverse">
              <button 
                onClick={() => setIsEditingImage(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h4 className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-pink-700 animate-pulse" />
                <span>تغيير صورة الترحيب بالفواتير (المديرة)</span>
              </h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-gray-500 mb-2">رابط الصورة الجديد (URL)</label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-pink-100 text-xs px-4 py-3 rounded-xl font-mono text-left focus:outline-none focus:border-pink-500"
                  placeholder="أدخلي رابط الصورة الجديد هنا..."
                />
              </div>

              {/* Predefined Presets */}
              <div className="space-y-2">
                <span className="block text-[10px] font-black text-gray-400">شخصيات ترحيبية جاهزة:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: 'هدوشة (افتراضي)', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDozyQcrL4Yfp5wLXW9Y-K0AeiCtSO2G3lZVMIyffDaIoEBlb_otr_uLGq-Drr0G6N0FS5d6-u6YBfHWJzesjiFbJdWnD15Ct9IDSO08EczvwkYAWgQgEP3d-v91GCN7bOyvBP_FftRv6BChSeEzC7BDbSMtH3DXgL1bbvle6xHA957rBT170X9F2Itu0sPNmwKRqwqkDVOI_Pw-dG5myf2pu5mCFrs-IUMx_XlMi2OYl5IjfQgqquSxEAaElda7W5e1ZN5LhTYUFQ' },
                    { name: 'بطوط الأنيق', url: 'https://lh3.googleusercontent.com/aida/AP1WRLtwlTtxpvh7CFWTWdRY_emR2xyBvTgx8v6zMnJSM8OrvnGrHK98fOcbdnwqMhudLD35tXhQRA9VBIsbRPIQxBCWcjiseBr_ZThUYOO2bASORtpBXsEwGUlke9kqXDQGVw-0hzUjOQZGvkAbigP02pHzK4tU63vK7UVYFj3MEl6UjVilDvrlHzDZhs-o55NTjiE4kAtBK7MfYbaxsU0axIHNlMxqsY-z3Mq4P6X0iHTAI-TEqMLAdFD53L8' },
                    { name: 'سيدة الأعمال', url: 'https://lh3.googleusercontent.com/aida/AP1WRLt6-KkaqmBMU0ma4nxf0K0zdNrE-JbMHCNgioablK3UA34SU_BYJdYiVDduyaLnaMLdxjAHykkh8WM2gdzHQMZPkvT3I6jHR79rKjlBHaP0ehlBvtbuGcNdbhpWsXxX5Cf-LEemxYpVddPfXvC8Ph322IFZguQxOz-1baaD7xJvlUUyQbZL-akA0fu93pAOzBb9gxtQlvG0TxiCGAyFYtRXx3_1fmXwa5k4Zknyl3UY3fr_uHFlDe_da50' },
                    { name: 'هدية لطيفة', url: 'https://lh3.googleusercontent.com/aida/AP1WRLs7xYMw1dlJILjhZ2VzHUgTES3bYmOtS532eeDn9JpDom3Gp-MaPoVhT_e495zabXi9PhvxGhgg_DGSwGWwf9dmXp5ZUWaJm0RCNd8GbCsm6Pfsr0iJJMO0aAxy5MOcRhILsJttChJdkmTm_mZbX5E5mSnfAvK48H_feUdzK0meAC_w_y8FpVIQyOMw7BefhhUleQ-yNPc9mOamo6Uhxfvs0PQtY8Tp68F3pQbyGpw3MPMMO_Rkhd2fSw' }
                  ].map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setNewImageUrl(preset.url)}
                      className="p-1.5 border border-pink-100 rounded-xl hover:border-pink-500 transition-colors flex flex-col items-center gap-1 cursor-pointer bg-pink-50/20"
                    >
                      <img src={preset.url} alt={preset.name} className="w-8 h-8 object-contain rounded-full" referrerPolicy="no-referrer" />
                      <span className="text-[8px] font-black text-gray-500 text-center whitespace-nowrap overflow-hidden text-ellipsis w-full">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              {newImageUrl && (
                <div className="flex flex-col items-center justify-center p-3 bg-pink-50/30 rounded-2xl border border-pink-100/50">
                  <span className="text-[9px] font-black text-pink-700 mb-2">معاينة الصورة الحية</span>
                  <div className="w-20 h-20 bg-white rounded-full overflow-hidden border border-pink-200 p-1">
                    <img src={newImageUrl} alt="Live Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await updateCustomizations({ invoiceHadooshaImageUrl: newImageUrl });
                    setIsEditingImage(false);
                  }}
                  className="flex-1 py-3 bg-pink-700 hover:bg-pink-800 text-white font-black rounded-xl text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  حفظ التغييرات
                </button>
                <button
                  onClick={() => setIsEditingImage(false)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-xl text-xs transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            placeholder="ابحثي عن متجر أو رقم الفاتورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-11 py-3 bg-white/95 border border-pink-100 rounded-2xl text-xs focus:outline-none focus:border-pink-500 shadow-sm"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {['All', 'Paid', 'Pending'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === status
                    ? 'bg-pink-700 text-white shadow-sm'
                    : 'bg-white border border-pink-100/50 text-gray-500 hover:bg-pink-50/40'
                }`}
              >
                {status === 'All' ? 'الكل' : status === 'Paid' ? 'مدفوعة' : 'قيد الانتظار'}
              </button>
            ))}
          </div>

          <button
            onClick={exportAllInvoices}
            disabled={exportingAll || filteredInvoices.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl text-xs font-black shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none self-end sm:self-auto cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>تصدير كشف الفواتير (PDF)</span>
          </button>
        </div>
      </div>

      {/* Monthly Shipping Payments Chart */}
      <div className="bg-white/95 border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-right" dir="rtl">
            <h3 className="font-bold text-sm text-gray-800">تحليل المصاريف الشهرية</h3>
            <p className="text-[10px] text-gray-400 font-bold">إجمالي مبالغ الشحن المدفوعة لكل شهر</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="h-[200px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getMonthlyStats()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#be184d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3e8ff" />
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `${(val / 1000).toLocaleString()}k`}
              />
              <Tooltip 
                cursor={{ fill: '#fdf2f8', opacity: 0.5 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white/95 border border-pink-100 p-3 rounded-2xl shadow-xl text-right text-xs space-y-1" dir="rtl">
                        <p className="font-bold text-gray-800">{data.month}</p>
                        <p className="font-black text-pink-700">المدفوع: {data.displayTotal}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="total" fill="url(#colorTotal)" radius={[8, 8, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Invoices List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {filteredInvoices.map((inv) => (
          <motion.div
            variants={itemVariants}
            key={inv.id}
            className="bg-white/95 rounded-3xl p-5 border border-pink-100/50 relative overflow-hidden flex flex-col gap-4 shadow-sm group hover:border-pink-200 transition-all"
          >
            {/* Left Accent Status Strip */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                inv.status === 'Paid' ? 'bg-green-400/80' : 'bg-amber-400/80'
              }`}
            ></div>

            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-gray-800 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-pink-700" />
                  {inv.store}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  رقم الطلب: {inv.order_id}
                </p>
                {inv.shippingStatus && (
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-bold">حالة الشحن:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black border flex items-center gap-1 shadow-sm/5 ${
                        getShippingStatusStyle(inv.shippingStatus).color
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5 text-current shrink-0" />
                      {getShippingStatusStyle(inv.shippingStatus).text}
                    </span>
                  </div>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight flex items-center gap-1 ${
                  inv.status === 'Paid'
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}
              >
                {inv.status === 'Paid' ? (
                  <>
                    <CheckCircle className="w-3 h-3" /> تم الدفع
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 animate-pulse" /> قيد الانتظار
                  </>
                )}
              </span>
            </div>

            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] text-gray-400">
                  تاريخ الطلب: <span className="font-bold text-gray-700">{inv.date}</span>
                </p>
                <p className="text-xl font-black text-pink-700 tracking-tight">{inv.amount}</p>
              </div>

              <div className="flex items-center gap-2">
                {inv.status === 'Pending' && (
                  <button
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setShowPaymentModal(true);
                      setPaySuccess(false);
                      setIsPaying(false);
                      // Set default or saved card details
                      setCardNumber(profile?.savedCardNumber || '5412 7500 1234 5678');
                      setCardHolder(profile?.savedCardHolder || profile?.name || 'Huda Al-Sultani');
                      setExpiry(profile?.savedCardExpiry || '12/28');
                      setCvv('345');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[11px] font-black bg-gradient-to-r from-pink-700 to-rose-600 hover:from-pink-800 hover:to-rose-700 text-white shadow-md shadow-pink-500/10 active:scale-95 transition-all border border-transparent cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>تسديد ماستركارد</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedInvoiceForVoucher(inv);
                    setPrintImmediately(true);
                    setShowVoucherModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[11px] font-black bg-pink-700 hover:bg-pink-800 text-white transition-all shadow-md shadow-pink-500/10 active:scale-95 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الفاتورة</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedInvoiceForVoucher(inv);
                    setShowVoucherModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[11px] font-bold bg-pink-50 hover:bg-pink-700 hover:text-white text-pink-700 border border-pink-100 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>عرض الوصل</span>
                </button>

                <button
                  onClick={() => handleDownload(inv)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[11px] font-bold transition-all shadow-sm active:scale-95 border cursor-pointer ${
                    downloadingId === inv.invoiceId
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-pink-50 hover:bg-pink-700 hover:text-white text-pink-700 border-pink-100'
                  }`}
                >
                  {downloadingId === inv.invoiceId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>تم التحميل!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleShareInvoice(inv)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[11px] font-bold bg-pink-50 hover:bg-pink-700 hover:text-white text-pink-700 border border-pink-100 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>مشاركة</span>
                </button>
              </div>
            </div>

            {/* Rating Section for Paid Invoices */}
            {inv.status === 'Paid' && (
              <div className="mt-2 pt-4 border-t border-dashed border-pink-100 flex flex-col gap-2 bg-pink-50/20 p-4 rounded-3xl text-right" dir="rtl">
                <div className="flex justify-between items-center flex-row-reverse">
                  <span className="text-xs font-black text-pink-900">تقييم الطلب والخدمة ⭐</span>
                  {inv.rating ? (
                    <span className="text-[10px] text-gray-400 font-bold">تم التقييم في {inv.ratingDate}</span>
                  ) : (
                    <span className="text-[10px] text-pink-700/70 font-bold">رأيكِ يسعدنا ويساعدنا على التحسين!</span>
                  )}
                </div>

                {inv.rating ? (
                  <div className="space-y-1.5 text-right flex flex-col items-end">
                    <div className="flex items-center gap-1 flex-row-reverse">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (inv.rating || 0)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {inv.ratingComment && (
                      <p className="text-[11px] text-gray-600 bg-white/70 p-2.5 rounded-xl border border-pink-100/30 w-full text-right" dir="rtl">
                        "{inv.ratingComment}"
                      </p>
                    )}
                  </div>
                ) : (
                  <InvoiceRatingForm invoiceId={inv.invoiceId || inv.id || ''} />
                )}
              </div>
            )}

          </motion.div>
        ))}

        {filteredInvoices.length === 0 && (
          <div className="text-center py-16 text-gray-400 space-y-2">
            <span className="material-symbols-outlined text-4xl">search_off</span>
            <p className="text-xs">لم نجد أي فواتير تطابق بحثكِ.</p>
          </div>
        )}
      </motion.div>

      {/* Mastercard Interactive Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[99999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl relative overflow-y-auto max-h-[92vh] space-y-6 border border-pink-100/50 text-right flex flex-col" dir="rtl">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-pink-100/30">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink-700">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-800">بطاقة الدفع المعتمدة (Mastercard)</h3>
                  <p className="text-[10px] text-gray-400 font-bold">تسديد الفواتير والتحويل المباشر لحساب الإدارة</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-400 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!paySuccess ? (
              <>
                {/* Invoice Summary */}
                <div className="bg-pink-50/40 border border-pink-100/30 p-4 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">متجر الطلب</p>
                    <p className="font-extrabold text-gray-800">{selectedInvoice.store} (#{selectedInvoice.order_id})</p>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-bold">المبلغ المطلوب</p>
                    <p className="font-black text-pink-700 text-sm">{selectedInvoice.amount}</p>
                  </div>
                </div>

                {/* Gorgeous Interactive Virtual Credit Card (Read Only Manager Card with copy functionality) */}
                <div 
                  onClick={handleCopyCard}
                  title="انقري لنسخ رقم البطاقة"
                  className="relative w-full aspect-[1.586/1] rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-850 to-neutral-950 p-6 text-white shadow-xl overflow-hidden border border-white/10 cursor-pointer select-none transition-all hover:scale-[1.02] active:scale-95 group"
                >
                  <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-pink-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute top-4 left-4 flex items-center gap-1.5">
                    <div className="flex -space-x-2.5">
                      <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                      <div className="w-6 h-6 bg-amber-500 rounded-full mix-blend-screen"></div>
                    </div>
                  </div>
                  
                  <div className="h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="text-right">
                        <span className="text-[9px] tracking-wider uppercase text-pink-300 font-bold block">إيرامو الممتازة - بطاقة الإدارة</span>
                        <div className="w-7 h-5 bg-amber-200/20 rounded-md border border-amber-200/30 flex items-center justify-center mt-1">
                          <div className="grid grid-cols-2 gap-0.5 w-3.5 h-2.5">
                            <div className="border border-white/20 rounded-sm"></div>
                            <div className="border border-white/20 rounded-sm"></div>
                            <div className="border border-white/20 rounded-sm"></div>
                            <div className="border border-white/20 rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-black tracking-widest bg-white/10 px-2 py-0.5 rounded text-white/80">Mastercard</span>
                    </div>

                    {/* Card Number Container */}
                    <div>
                      <div className="my-1 text-center tracking-[0.16em] font-mono text-base md:text-lg font-bold text-white drop-shadow-md group-hover:text-pink-300 transition-colors">
                        {customizations?.bankInfo?.superkey || '5412 7500 1234 5678'}
                      </div>
                      <span className="text-[8px] text-pink-300/80 block text-center mt-0.5 font-bold animate-pulse">
                        (انقري على البطاقة لنسخ رقم الحساب)
                      </span>
                    </div>

                    <div className="flex justify-between items-end font-mono">
                      <div className="text-right space-y-0.5 max-w-[70%]">
                        <span className="text-[7px] text-white/40 block">Card Holder / اسم صاحب البطاقة</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider truncate block text-white/90">
                          {customizations?.bankInfo?.holderName || 'HUDA AL-SULTANI'}
                        </span>
                      </div>
                      <div className="text-left space-y-0.5">
                        <span className="text-[7px] text-white/40 block">Expires / انتهاء</span>
                        <span className="text-[10px] font-bold tracking-wider text-white/90">
                          {customizations?.mastercardExpiry || '12/28'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {copiedNumber && (
                  <div className="bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl text-center animate-bounce shadow-sm">
                    ✅ تم نسخ رقم بطاقة Master Card بنجاح!
                  </div>
                )}

                <div className="bg-pink-50/50 rounded-2xl p-4 border border-pink-100/30 text-[11px] text-pink-950 leading-relaxed font-semibold space-y-1">
                  <p className="font-extrabold text-xs mb-1">ℹ️ تعليمات الدفع والتحويل المباشر</p>
                  <p>الرجاء نسخ رقم بطاقة الـ master card المعتمدة أعلاه وتحويل مبلغ الفاتورة الإجمالي إليها.</p>
                  <p className="text-pink-700 font-extrabold">بعد إتمام عملية التحويل بنجاح، يرجى الضغط على زر التأكيد أدناه لتسجيل الفاتورة كـ مدفوعة فوراً.</p>
                </div>

                {/* Trust Seal */}
                <div className="flex justify-center items-center gap-1.5 text-gray-400 text-[10px] font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>معاملاتكِ مشفرة بالكامل وتحت رعاية إدارة إيرامو 🔒</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    disabled={isPaying}
                    onClick={handleSimulatedPay}
                    className="flex-1 py-3 bg-gradient-to-r from-pink-700 to-rose-600 hover:from-pink-800 hover:to-rose-700 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 text-white font-black rounded-2xl text-xs transition-all active:scale-95 shadow-md shadow-pink-500/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPaying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>جاري تأكيد الدفع والتحويل...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>لقد قمت بالتحويل وتأكيد الدفع</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    disabled={isPaying}
                    className="px-4 py-3 border border-gray-200 hover:bg-gray-50 text-gray-500 font-extrabold rounded-2xl text-xs transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </>
            ) : (
              /* Success View */
              <div className="text-center py-8 space-y-6 animate-fade-in flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-lg border border-emerald-100 animate-scale-up">
                  <CheckCircle className="w-12 h-12 stroke-[2.5]" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-black text-lg text-emerald-800">تم تأكيد التحويل بنجاح!</h4>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                    لقد قمتِ بتأكيد تحويل مبلغ الفاتورة <span className="font-black text-gray-800">{selectedInvoice.amount}</span>. سنقوم بمراجعة التحويل وتجهيز طلبكِ فوراً!
                  </p>
                </div>

                {/* Point Reward feedback badge */}
                <div className="bg-gradient-to-r from-amber-50 to-pink-50 border border-amber-100/50 p-4 rounded-3xl inline-flex flex-col items-center gap-1">
                  <span className="text-[10px] text-amber-700 font-black uppercase tracking-wider">نقاط ولاء إضافية</span>
                  <span className="text-xl font-black text-pink-700">+150 نقطة ولاء 🥳</span>
                  <span className="text-[9px] text-gray-400 font-bold">تم إضافتها إلى رصيدكِ فوراً لتصل المكافأة التالية أسرع!</span>
                </div>

                <div className="w-full pt-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="w-full py-3 bg-gray-900 hover:bg-black text-white font-black rounded-2xl text-xs transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    العودة لصفحة الفواتير
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Elegant traditional Iraqi print voucher modal */}
      {showVoucherModal && selectedInvoiceForVoucher && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[99999] flex flex-col items-center justify-start md:justify-center p-4 py-8 md:py-12 overflow-y-auto animate-fade-in" dir="rtl">
          {/* Action controls for the voucher */}
          <div className="w-full max-w-[480px] flex items-center justify-between mb-3 no-print bg-white/90 backdrop-blur p-3 rounded-2xl shadow-md border border-pink-100">
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-700 text-white rounded-xl text-xs font-black shadow-sm hover:bg-pink-800 transition-all active:scale-95 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة الوصل</span>
              </button>
              <button
                onClick={handleCopyAccount}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  copiedAccount 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedAccount ? 'تم نسخ الحساب! ✅' : 'نسخ حساب التحويل'}</span>
              </button>
              <button
                onClick={() => handleShareInvoice(selectedInvoiceForVoucher)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  copiedShare 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedShare ? 'تم النسخ للمشاركة! ✅' : 'مشاركة الوصل 🔗'}</span>
              </button>
            </div>
            <button
              onClick={() => {
                setShowVoucherModal(false);
                setSelectedInvoiceForVoucher(null);
              }}
              className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-all active:scale-90 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Print style injection */}
          <style>{`
            @media print {
              /* Hide everything in the app except the printable element */
              body * {
                visibility: hidden !important;
              }
              #printable-voucher, #printable-voucher * {
                visibility: visible !important;
              }
              #printable-voucher {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                right: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                border: none !important;
                box-shadow: none !important;
                margin: 0 !important;
                padding: 10px !important;
                background-color: white !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          {/* The actual Voucher sheet */}
          {renderVoucherSheet(selectedInvoiceForVoucher, "printable-voucher")}

          {/* Quick Helper text below sheet */}
          <p className="text-white/60 text-[10px] mt-4 font-bold max-w-xs text-center leading-relaxed no-print">
            💡 يمكنكِ طباعة هذا الوصل فوراً أو حفظه كملف PDF عبر النقر على زر "طباعة الوصل" أعلاه.
          </p>
        </div>
      )}

      {/* Hidden elements for PDF rendering with perfect Arabic support */}
      {downloadingId && invoices.find(inv => inv.invoiceId === downloadingId) && (() => {
        const downloadingInvoice = invoices.find(inv => inv.invoiceId === downloadingId)!;
        return (
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -100 }}>
            {renderVoucherSheet(downloadingInvoice, `hidden-voucher-${downloadingInvoice.invoiceId}`)}
          </div>
        );
      })()}

      {/* Hidden Statement Table for Statement PDF */}
      {exportingAll && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -100 }}>
          <div 
            id="hidden-statement-container"
            className="w-[800px] bg-white p-8 overflow-hidden text-[#5A4A4A] select-none text-right"
            style={{ fontFamily: 'Tajawal, Noto Sans Arabic, sans-serif' }}
            dir="rtl"
          >
             <div className="flex items-center justify-between border-b-2 border-pink-100 pb-4 mb-6">
                <div>
                   <h1 className="text-2xl font-black text-pink-700">كشف الفواتير والطلبات</h1>
                   <p className="text-xs text-gray-500 mt-1">كشف تفصيلي بالطلبات والمشتريات المحلية للشحن</p>
                </div>
                <div className="text-left flex flex-col items-end">
                   <div className="text-xl font-serif text-pink-700 font-bold tracking-wider leading-none">IRAMO</div>
                   <div className="text-[7.5px] font-sans tracking-widest text-pink-600 font-bold leading-none mt-0.5">STORE</div>
                </div>
             </div>

             <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-4 mb-6 grid grid-cols-3 gap-4 text-xs font-bold text-gray-700">
                <div>الاسم: <span className="text-pink-950 font-black">{profile?.name || 'الزبونة الكريمة'}</span></div>
                <div>رقم الهاتف: <span className="text-pink-950 font-black font-mono">{profile?.phone || 'N/A'}</span></div>
                <div>المحافظة: <span className="text-pink-950 font-black">{profile?.city || 'العراق'}</span></div>
             </div>

             <table className="w-full text-right border-collapse text-xs">
                <thead>
                   <tr className="bg-pink-100/60 text-pink-900 font-black">
                      <th className="p-3 rounded-r-xl border-b border-pink-200">رقم الفاتورة</th>
                      <th className="p-3 border-b border-pink-200">المتجر / المنتج</th>
                      <th className="p-3 border-b border-pink-200">رقم الطلب</th>
                      <th className="p-3 border-b border-pink-200">التاريخ</th>
                      <th className="p-3 border-b border-pink-200">حالة الشحن</th>
                      <th className="p-3 border-b border-pink-200">حالة الدفع</th>
                      <th className="p-3 rounded-l-xl border-b border-pink-200">المبلغ</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-pink-100/40">
                   {filteredInvoices.map((inv) => (
                      <tr key={inv.invoiceId} className="hover:bg-pink-50/20 font-bold text-gray-700">
                         <td className="p-3 font-mono text-pink-700">#{inv.invoiceId}</td>
                         <td className="p-3 text-pink-950">{inv.store}</td>
                         <td className="p-3 font-mono text-gray-500">#{inv.order_id}</td>
                         <td className="p-3 font-mono">{inv.date}</td>
                         <td className="p-3 text-pink-600 text-[10px]">{inv.shippingStatus || 'قيد المعالجة'}</td>
                         <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${inv.status === 'Paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                               {inv.status === 'Paid' ? 'مدفوع' : 'قيد الانتظار'}
                            </span>
                         </td>
                         <td className="p-3 text-pink-900 font-extrabold">{inv.amount}</td>
                      </tr>
                   ))}
                </tbody>
             </table>

             <div className="mt-8 pt-4 border-t border-dotted border-pink-200 flex justify-between items-center text-[10px] text-gray-400 font-bold">
                <div>تم الإنشاء في: {new Date().toLocaleDateString('ar-IQ')}</div>
                <div>تطبيق إيرامو ستور 💖 IRAMO STORE</div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
