import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wrench, ShieldAlert, RefreshCw, Key, CheckCircle, AlertTriangle, Sparkles, Terminal } from 'lucide-react';

interface MaintenanceScreenProps {
  message?: string;
  onRefresh?: () => void;
  onBypass?: () => void;
  onToggleStatus?: (active: boolean, key: string) => Promise<boolean>;
}

export default function MaintenanceScreen({
  message = 'الموقع تحت الصيانة حالياً',
  onRefresh,
  onBypass,
  onToggleStatus
}: MaintenanceScreenProps) {
  const [clickCount, setClickCount] = useState(0);
  const [showDevModal, setShowDevModal] = useState(false);
  const [devKey, setDevKey] = useState('');
  const [devError, setDevError] = useState('');
  const [devSuccess, setDevSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSecretTrigger = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);
    if (nextCount >= 5) {
      setShowDevModal(true);
      setClickCount(0);
    }
  };

  const handleDevToggle = async (targetActive: boolean) => {
    if (!devKey.trim()) {
      setDevError('يرجى إدخال مفتاح المطور السري');
      return;
    }
    setDevError('');
    setDevSuccess('');
    setIsSubmitting(true);

    try {
      if (onToggleStatus) {
        const success = await onToggleStatus(targetActive, devKey);
        if (success) {
          setDevSuccess(targetActive ? 'تم تفعيل المنصة بنجاح! جاري التحميل...' : 'تم تعطيل المنصة وتفعيل وضع الصيانة بنجاح.');
          if (targetActive) {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        } else {
          setDevError('مفتاح المطور غير صحيح!');
        }
      } else {
        const res = await fetch('/api/maintenance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: devKey, active: targetActive })
        });
        const data = await res.json();
        if (data.success) {
          setDevSuccess(targetActive ? 'تم تفعيل المنصة بنجاح!' : 'تم تفعيل الصيانة بنجاح.');
          if (targetActive) {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        } else {
          setDevError(data.error || 'مفتاح المطور غير صحيح!');
        }
      }
    } catch {
      setDevError('تعذر الاتصال بالخادم.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectBypass = () => {
    if (devKey === 'dev_secret_2026_khemiai') {
      sessionStorage.setItem('khemiai_dev_bypass', 'true');
      if (onBypass) onBypass();
      else window.location.reload();
    } else {
      setDevError('مفتاح التخطي غير صحيح.');
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-950 text-slate-100 overflow-hidden font-sans select-none" dir="rtl">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(14,165,233,0.15),_rgba(2,6,23,0.95))] pointer-events-none" />
      
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Content Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 max-w-xl w-full mx-4 p-8 sm:p-12 text-center rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl"
      >
        {/* Animated Icon Glow */}
        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-linear-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg border border-cyan-400/30">
            <Wrench className="w-10 h-10 animate-bounce duration-1000" />
          </div>
        </div>

        {/* Live Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>تحديثات وصيانة الأنظمة المجدولة</span>
        </div>

        {/* Primary Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          الموقع تحت الصيانة
        </h1>

        {/* Custom or default message */}
        <p className="text-base sm:text-lg font-semibold text-cyan-300/90 mb-4">
          {message}
        </p>

        {/* Explanation text */}
        <p className="text-sm text-slate-400 leading-relaxed mb-8">
          عفواً، المنصة مغلقة وموقوفة مؤقتاً لإجراء أعمال الصيانة والتطوير الدورية وتحديث قواعد البيانات لتحسين تجربة الاستخدام.
          <br className="hidden sm:block" />
          سيتم فتح المنصة وإعادتها للعمل بكامل طاقتها فور اكتمال التحديثات.
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              if (onRefresh) onRefresh();
              else window.location.reload();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-cyan-500/25 active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة التحقق من الحالة</span>
          </button>
        </div>

        {/* Developer Secret Trigger Footer */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span 
            onClick={handleSecretTrigger} 
            className="cursor-pointer hover:text-slate-400 transition-colors select-none"
            title="نظام الحماية والأمان"
          >
            © {new Date().getFullYear()} جميع الحقوق محفوظة
          </span>
          <span className="font-mono text-[11px] text-slate-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
            Mode: Maintenance Active
          </span>
        </div>
      </motion.div>

      {/* Secret Developer Modal */}
      <AnimatePresence>
        {showDevModal && (
          <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative text-right"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Terminal className="w-5 h-5" />
                  <span>لوحة تحكم المطور (Developer Switch)</span>
                </div>
                <button
                  onClick={() => setShowDevModal(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                هذه النافذة مخصصة للمطور فقط للتحكم في حالة تشغيل أو إيقاف المنصة وتفعيل/إلغاء وضع الصيانة.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    مفتاح المطور السري (Developer Secret Key):
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={devKey}
                      onChange={(e) => setDevKey(e.target.value)}
                      placeholder="أدخل مفتاح المطور هنا..."
                      className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 text-left font-mono"
                    />
                    <Key className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                  </div>
                </div>

                {devError && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{devError}</span>
                  </div>
                )}

                {devSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{devSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    disabled={isSubmitting}
                    onClick={() => handleDevToggle(true)}
                    className="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow cursor-pointer disabled:opacity-50"
                  >
                    تشغيل المنصة (Active: true)
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleDevToggle(false)}
                    className="px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow cursor-pointer disabled:opacity-50"
                  >
                    إيقاف المنصة (Active: false)
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <button
                    onClick={handleDirectBypass}
                    className="text-xs text-cyan-400 hover:underline cursor-pointer"
                  >
                    تخطي الصيانة لهذا المتصفح مؤقتاً
                  </button>
                  <span className="text-[11px] text-slate-500 font-mono">API: /api/maintenance</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
