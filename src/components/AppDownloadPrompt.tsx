import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles, CheckCircle2 } from 'lucide-react';

const APK_DOWNLOAD_URL = "https://github.com/U-WWW/el5emya2e-apk/releases/download/apk/default.apk";

export function isAndroidWebView(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  
  const ua = (navigator.userAgent || navigator.vendor || (window as any).opera || '').toLowerCase();
  
  // 1. Check for custom Android JavaScript interfaces injected by Android native webview apps
  if (
    (window as any).Android !== undefined || 
    (window as any).AndroidInterface !== undefined || 
    (window as any).jsBridge !== undefined ||
    (window as any).flutter_inappwebview !== undefined ||
    (window as any).ReactNativeWebView !== undefined
  ) {
    return true;
  }

  // 2. Check if user agent indicates Android device
  const isAndroid = ua.includes('android');
  if (!isAndroid) return false;

  // 3. Check for Android WebView signatures in UserAgent
  const isWv = /\bwv\b/.test(ua) || ua.includes('; wv') || ua.includes('(wv)');
  const isVersionChrome = ua.includes('version/') && ua.includes('chrome/');
  const isStandalone = Boolean((window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches);

  const searchParams = new URLSearchParams(window.location.search);
  const isAppQuery = searchParams.get('app') === 'true' || searchParams.get('webview') === 'true' || searchParams.get('is_apk') === 'true';

  return isWv || isVersionChrome || isStandalone || isAppQuery;
}

export default function AppDownloadPrompt() {
  const [inWebView, setInWebView] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    // Check WebView state
    const detectedWebView = isAndroidWebView();
    setInWebView(detectedWebView);

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('khemiai_apk_prompt_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // DO NOT show anything if the user is using the Android WebView / App!
  if (inWebView) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('khemiai_apk_prompt_dismissed', 'true');
  };

  return (
    <div className="relative z-50">
      {/* Top Fixed / Sticky Banner */}
      {!isDismissed ? (
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-amber-950 border-b border-cyan-500/30 text-white shadow-xl px-4 py-3 sm:px-6 relative transition-all">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-right">
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-2.5 bg-cyan-500/20 border border-cyan-400/40 rounded-2xl shrink-0 text-cyan-300 shadow-inner">
                <Smartphone className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm sm:text-base text-white tracking-wide">
                    تطبيق الأندرويد الرسمي لمنصة الخيميائي 🧪
                  </span>
                  <span className="bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> الإصدار المباشر
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 font-medium hidden sm:block">
                  حمل التطبيق للوصول السريع، مشاهدة الدروس بدون تقطيع، وتلقي إشعارات الحصص والتقييمات أولاً بأول!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <a
                href={APK_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                download="Elkhemiaey.apk"
                className="flex-1 md:flex-none bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition flex items-center justify-center gap-2 border border-cyan-300/40 transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تحميل التطبيق الآن (APK)</span>
              </a>

              <button
                onClick={handleDismiss}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
                title="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* Floating Pill Button if dismissed so user can still access the download link */
        <div className="fixed bottom-5 left-5 z-50">
          <a
            href={APK_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            download="Elkhemiaey.apk"
            className="group flex items-center gap-2 bg-stone-900/90 hover:bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs font-bold"
            title="تحميل تطبيق الأندرويد الرسمى"
          >
            <Smartphone className="w-4 h-4 text-cyan-400 group-hover:animate-bounce" />
            <span className="hidden sm:inline">تحميل تطبيق الأندرويد</span>
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </a>
        </div>
      )}
    </div>
  );
}
