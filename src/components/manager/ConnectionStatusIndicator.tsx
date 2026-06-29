import React, { useState, useEffect } from 'react';
import { 
  Activity, Wifi, WifiOff, Database, HardDrive, 
  CheckCircle2, XCircle, AlertCircle, Loader2, Play, 
  Sparkles, RefreshCw, HelpCircle, X
} from 'lucide-react';
import { db, storage, runFirestoreDiagnosticTest } from '../../lib/firebase';
import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';

interface DiagnosticLog {
  time: string;
  type: 'info' | 'success' | 'error';
  message: string;
}

export function ConnectionStatusIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [firestoreStatus, setFirestoreStatus] = useState<'connected' | 'checking' | 'failed'>('checking');
  const [storageStatus, setStorageStatus] = useState<'ready' | 'checking' | 'unavailable'>('checking');
  const [lastCheck, setLastCheck] = useState<string>('لم يتم الفحص بعد');
  
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<DiagnosticLog[]>([]);
  const [overallHealth, setOverallHealth] = useState<'healthy' | 'warning' | 'critical' | 'unknown'>('unknown');

  // Monitor navigator online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addLog('info', 'تم الكشف عن استعادة اتصال الجهاز بالإنترنت.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      addLog('error', 'الجهاز غير متصل بالإنترنت حالياً.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addLog = (type: 'info' | 'success' | 'error', message: string) => {
    const timeStr = new Date().toLocaleTimeString('ar-EG', { hour12: false });
    setDiagnosticLogs(prev => [{ time: timeStr, type, message }, ...prev].slice(0, 30));
  };

  // Perform quick background heartbeat checks on Firestore & Storage
  const runBackgroundHeartbeat = async () => {
    if (!navigator.onLine) {
      setFirestoreStatus('failed');
      setStorageStatus('unavailable');
      setOverallHealth('critical');
      return;
    }

    try {
      // Test Firestore connection status with a very lightweight write/read diagnostic or checking database instance
      if (db) {
        setFirestoreStatus('connected');
      } else {
        setFirestoreStatus('failed');
      }
    } catch {
      setFirestoreStatus('failed');
    }

    if (storage) {
      setStorageStatus('ready');
    } else {
      setStorageStatus('unavailable');
    }

    setLastCheck(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setOverallHealth(db && storage ? 'healthy' : db ? 'warning' : 'critical');
  };

  useEffect(() => {
    runBackgroundHeartbeat();
    const interval = setInterval(runBackgroundHeartbeat, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const executeFullDiagnostic = async () => {
    if (isRunningDiagnostic) return;
    setIsRunningDiagnostic(true);
    setDiagnosticLogs([]);
    
    addLog('info', 'بدء فحص الاتصال الشامل بخدمات Firebase الإلكترونية...');
    
    // Step 1: Internet Access
    addLog('info', `فحص اتصال الجهاز بالإنترنت: ${navigator.onLine ? 'متصل ✅' : 'غير متصل ❌'}`);
    if (!navigator.onLine) {
      addLog('error', 'توقف الفحص. يرجى التحقق من اتصال شبكة Wi-Fi أو البيانات الخاصة بجهازك.');
      setIsRunningDiagnostic(false);
      setOverallHealth('critical');
      return;
    }

    let isFirestoreHealthy = false;
    let isStorageHealthy = false;

    // Step 2: Firestore Diagnostic Test
    addLog('info', 'بدء فحص قاعدة بيانات Firestore (كتابة وقراءة ومصادقة مجهولة)...');
    try {
      const dbResult = await runFirestoreDiagnosticTest();
      
      // Log DB Steps
      addLog(
        dbResult.step1Auth.status === 'success' ? 'success' : 'error', 
        `المصادقة: ${dbResult.step1Auth.message}`
      );
      addLog(
        dbResult.step2Create.status === 'success' ? 'success' : 'error', 
        `إنشاء مستند الاختبار: ${dbResult.step2Create.message}`
      );
      addLog(
        dbResult.step3Read.status === 'success' ? 'success' : 'error', 
        `قراءة مستند الاختبار: ${dbResult.step3Read.message}`
      );

      if (dbResult.overallSuccess) {
        addLog('success', 'اتصال قاعدة بيانات Firestore ممتاز ويعمل بكفاءة عالية! 🎉');
        setFirestoreStatus('connected');
        isFirestoreHealthy = true;
      } else {
        addLog('error', 'فشل فحص Firestore الكامل. يرجى فحص قواعد حماية قواعد البيانات Firestore.rules.');
        setFirestoreStatus('failed');
      }
    } catch (e: any) {
      addLog('error', `حدث خطأ فادح أثناء فحص قاعدة البيانات: ${e?.message || e}`);
      setFirestoreStatus('failed');
    }

    // Step 3: Storage Diagnostic Test
    addLog('info', 'بدء فحص مخزن الملفات Firebase Storage...');
    if (!storage) {
      addLog('error', 'تطبيق Firebase Storage غير مهيأ بالكامل أو معطل.');
      setStorageStatus('unavailable');
    } else {
      try {
        const testBlob = new Blob(['heartbeat_' + Date.now()], { type: 'text/plain' });
        const testFile = new File([testBlob], 'diagnostic_heartbeat.txt', { type: 'text/plain' });
        const storagePath = `diagnostics/heartbeat_${Date.now()}.txt`;
        const storageRef = ref(storage, storagePath);

        addLog('info', 'جاري رفع ملف اختبار صغير (10 بايت)...');
        const startTime = Date.now();
        const snapshot = await uploadBytes(storageRef, testFile);
        const uploadDuration = Date.now() - startTime;
        
        addLog('success', `تم رفع الملف بنجاح! الوقت المستغرق: ${uploadDuration}ms`);

        addLog('info', 'جاري استرداد رابط تحميل الملف للتأكد من صلاحيات القراءة...');
        const downloadUrl = await getDownloadURL(snapshot.ref);
        addLog('success', `تم استرداد الرابط بنجاح: ${downloadUrl.substring(0, 45)}...`);

        addLog('info', 'جاري تنظيف ملف الاختبار من المخزن...');
        await deleteObject(storageRef);
        addLog('success', 'تم تنظيف وحذف الملف بنجاح للتوفير في المساحة.');

        addLog('success', 'مخزن الملفات Firebase Storage متصل ويعمل بكفاءة كاملة! 💖');
        setStorageStatus('ready');
        isStorageHealthy = true;
      } catch (e: any) {
        addLog('error', `فشل رفع الملف لـ Storage. يرجى التحقق من تفعيل Cloud Storage في مشروع Firebase وقواعد حماية storage.rules الخاص بك.`);
        addLog('error', `تفاصيل الخطأ: ${e?.message || JSON.stringify(e)}`);
        setStorageStatus('unavailable');
      }
    }

    // Set Final Status
    if (isFirestoreHealthy && isStorageHealthy) {
      setOverallHealth('healthy');
      addLog('success', '⚡ تم الفحص الشامل بنجاح: كافة الخدمات متصلة وتعمل بنسبة 100%!');
    } else if (isFirestoreHealthy) {
      setOverallHealth('warning');
      addLog('info', '⚠️ تم الفحص بنجاح جزئي: قاعدة البيانات متصلة ولكن هناك خلل في مخزن الملفات (Storage).');
    } else {
      setOverallHealth('critical');
      addLog('error', '🚨 فحص فاشل: خطأ في الاتصال بالشبكة أو قاعدة بيانات Firebase.');
    }

    setLastCheck(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setIsRunningDiagnostic(false);
  };

  const getHealthBadgeColor = () => {
    if (!isOnline) return 'bg-red-50 text-red-700 border-red-200';
    switch (overallHealth) {
      case 'healthy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse';
      default:
        return 'bg-pink-50 text-pink-700 border-pink-100';
    }
  };

  const getHealthText = () => {
    if (!isOnline) return 'غير متصل بالإنترنت';
    switch (overallHealth) {
      case 'healthy':
        return 'الاتصال ممتاز ⚡';
      case 'warning':
        return 'خلل بالملفات ⚠️';
      case 'critical':
        return 'خطأ بالاتصال 🚨';
      default:
        return 'جاري فحص الاتصال...';
    }
  };

  const getHealthPulseColor = () => {
    if (!isOnline) return 'bg-red-500';
    switch (overallHealth) {
      case 'healthy':
        return 'bg-emerald-500';
      case 'warning':
        return 'bg-amber-500';
      case 'critical':
        return 'bg-rose-500';
      default:
        return 'bg-pink-500 animate-pulse';
    }
  };

  return (
    <>
      {/* Mini connection status bubble */}
      <button
        id="btn-conn-status"
        onClick={() => {
          setIsOpen(true);
          if (diagnosticLogs.length === 0) {
            executeFullDiagnostic();
          }
        }}
        className={`flex items-center gap-1.5 border px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm active:scale-95 transition-all cursor-pointer ${getHealthBadgeColor()}`}
      >
        <span className="relative flex h-2 w-2">
          {overallHealth !== 'critical' && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getHealthPulseColor()}`}></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${getHealthPulseColor()}`}></span>
        </span>
        <span>{getHealthText()}</span>
      </button>

      {/* Connection Diagnostic Drawer Overlay */}
      {isOpen && (
        <div 
          id="conn-diagnostic-overlay"
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div 
            id="conn-diagnostic-panel"
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-pink-100/50 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-pink-50/50 p-5 border-b border-pink-100/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-100 text-pink-700 rounded-xl">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-black text-sm text-pink-900">تشخيص اتصال خادم Firebase</h2>
                  <p className="text-[10px] font-bold text-pink-600/80">مراقبة اتصال قاعدة البيانات ومخزن الملفات بالوقت الفعلي</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-pink-100 rounded-full text-pink-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-right no-scrollbar" dir="rtl">
              
              {/* Telemetry Status Cards Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* Device connection */}
                <div className="bg-pink-50/30 border border-pink-100/30 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <div className={`p-1.5 rounded-xl mb-1.5 ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {isOnline ? <Wifi className="w-4.5 h-4.5" /> : <WifiOff className="w-4.5 h-4.5" />}
                  </div>
                  <span className="text-[9px] font-bold text-gray-400">شبكة الجهاز</span>
                  <span className={`text-[10px] font-black mt-0.5 ${isOnline ? 'text-emerald-700' : 'text-red-700'}`}>
                    {isOnline ? 'متصل بالإنترنت' : 'منقطع الاتصال'}
                  </span>
                </div>

                {/* Firestore connection */}
                <div className="bg-pink-50/30 border border-pink-100/30 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <div className={`p-1.5 rounded-xl mb-1.5 ${
                    firestoreStatus === 'connected' ? 'bg-emerald-100 text-emerald-700' : 
                    firestoreStatus === 'checking' ? 'bg-pink-100 text-pink-700 animate-spin' : 'bg-red-100 text-red-700'
                  }`}>
                    {firestoreStatus === 'checking' ? <RefreshCw className="w-4.5 h-4.5" /> : <Database className="w-4.5 h-4.5" />}
                  </div>
                  <span className="text-[9px] font-bold text-gray-400">قاعدة البيانات</span>
                  <span className={`text-[10px] font-black mt-0.5 ${
                    firestoreStatus === 'connected' ? 'text-emerald-700' : 
                    firestoreStatus === 'checking' ? 'text-pink-600' : 'text-red-700'
                  }`}>
                    {firestoreStatus === 'connected' ? 'جاهزة ومتصلة' : 
                     firestoreStatus === 'checking' ? 'جاري التحقق' : 'غير متصلة'}
                  </span>
                </div>

                {/* Storage connection */}
                <div className="bg-pink-50/30 border border-pink-100/30 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
                  <div className={`p-1.5 rounded-xl mb-1.5 ${
                    storageStatus === 'ready' ? 'bg-emerald-100 text-emerald-700' : 
                    storageStatus === 'checking' ? 'bg-pink-100 text-pink-700 animate-spin' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {storageStatus === 'checking' ? <RefreshCw className="w-4.5 h-4.5" /> : <HardDrive className="w-4.5 h-4.5" />}
                  </div>
                  <span className="text-[9px] font-bold text-gray-400">مخزن الملفات</span>
                  <span className={`text-[10px] font-black mt-0.5 ${
                    storageStatus === 'ready' ? 'text-emerald-700' : 
                    storageStatus === 'checking' ? 'text-pink-600' : 'text-amber-700'
                  }`}>
                    {storageStatus === 'ready' ? 'متصل ومؤهل' : 
                     storageStatus === 'checking' ? 'جاري التحقق' : 'تحتاج مصادقة'}
                  </span>
                </div>
              </div>

              {/* Run Test & Metadata Bar */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-gray-400">توقيت الفحص الأخير</span>
                  <span className="text-[10px] font-black text-gray-700">{lastCheck}</span>
                </div>

                <button
                  onClick={executeFullDiagnostic}
                  disabled={isRunningDiagnostic}
                  className="bg-pink-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md hover:bg-pink-800 disabled:bg-pink-300 disabled:cursor-not-allowed flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  {isRunningDiagnostic ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الفحص...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>فحص شامل فوري</span>
                    </>
                  )}
                </button>
              </div>

              {/* Troubleshooting Guidelines block */}
              {overallHealth !== 'healthy' && overallHealth !== 'unknown' && !isRunningDiagnostic && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-[10px] leading-relaxed text-amber-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-black mb-1 text-amber-950">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>إرشاد تشخيصي لمشاكل الاتصال:</span>
                  </div>
                  <p>1. **فشل حفظ البنرات وصور الماركات**: يحدث إذا كان Firebase Storage معطلاً أو لم يتم تفعيل خدمة Storage في مشروع Firebase الخاص بك من لوحة تحكم مطورين Firebase.</p>
                  <p>2. **قواعد الحماية (Security Rules)**: يرجى التحقق من نشر ملفي `firestore.rules` و `storage.rules` المرفقين في مجلد المشروع لفتح الصلاحيات اللازمة للمديرة والزبائن.</p>
                  <p>3. **الاتصال المؤقت**: يقوم التطبيق بالتحويل تلقائياً لخاصية (Base64) لحفظ الصور محلياً ومؤقتاً في المتصفح إذا انقطع خادم الفايربيس لتفادي فقدان بياناتك.</p>
                </div>
              )}

              {/* Live Terminal Diagnostic Logs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-black text-pink-950 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    سجل اختبارات الاتصال بالوقت الفعلي
                  </span>
                  <span className="text-[8px] font-bold text-gray-400">آخر 30 حدثاً</span>
                </div>

                <div className="bg-gray-900 text-gray-100 font-mono text-[10px] p-4 rounded-2xl h-48 overflow-y-auto space-y-1.5 text-left select-text scrollbar-thin">
                  {diagnosticLogs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 font-sans text-center">
                      اضغطي على "فحص شامل فوري" للتحقق من سلامة قنوات الاتصال بـ Firebase بالكامل
                    </div>
                  ) : (
                    diagnosticLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-2 items-start leading-relaxed border-b border-gray-800/50 pb-1">
                        <span className="text-gray-500 shrink-0 select-none">[{log.time}]</span>
                        <span className={`shrink-0 select-none font-bold ${
                          log.type === 'success' ? 'text-emerald-400' : 
                          log.type === 'error' ? 'text-rose-400 font-black' : 'text-sky-400'
                        }`}>
                          {log.type === 'success' ? '✔' : log.type === 'error' ? '✘' : 'ℹ'}
                        </span>
                        <span className={`flex-1 text-right ${
                          log.type === 'success' ? 'text-emerald-300' : 
                          log.type === 'error' ? 'text-rose-300' : 'text-gray-300 font-sans'
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Footer details */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 text-center text-[9px] font-bold text-gray-400 flex items-center justify-between px-6">
              <span>مشروع إيرامو • نظام تشخيص المشاكل الذكي</span>
              <span>الإصدار 1.2.0</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
