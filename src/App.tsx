import React, { useState, useEffect, useCallback } from 'react';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import AppDownloadPrompt from './components/AppDownloadPrompt';
import MaintenanceScreen from './components/MaintenanceScreen';
import { db } from './lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export default function App() {
  const [portal, setPortal] = useState<'student' | 'admin'>('student');
  const [theme, setTheme] = useState<'khemiai_light' | 'khemiai_dark' | 'atomic_glow' | 'deep_emerald'>('khemiai_light');
  
  // Developer maintenance kill-switch states
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>('الموقع تحت الصيانة حالياً');
  const [isDevBypassed, setIsDevBypassed] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('khemiai_dev_bypass') === 'true';
  });

  // Check URL query parameters for developer bypass
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const bypassKey = queryParams.get('dev_bypass') || queryParams.get('dev_key');
    if (bypassKey === 'dev_secret_2026_khemiai') {
      sessionStorage.setItem('khemiai_dev_bypass', 'true');
      setIsDevBypassed(true);
    }
  }, []);

  // Real-time Firestore sync for instant maintenance mode updates across all clients
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    try {
      const systemDocRef = doc(db, 'settings', 'system_control');
      unsubscribe = onSnapshot(systemDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const active = data.active !== undefined 
            ? Boolean(data.active) 
            : (data.isMaintenance === true ? false : true);

          setIsMaintenanceMode(!active);
          if (data.message) {
            setMaintenanceMessage(data.message);
          }
        }
      }, (err) => {
        console.warn('[App] Firestore system listener note:', err);
      });
    } catch (e) {
      console.warn('[App] Firestore connection note:', e);
    }

    return () => unsubscribe();
  }, []);

  // Direct backend API check as secondary authoritative source
  const checkApiMaintenance = useCallback(async () => {
    try {
      const res = await fetch('/api/maintenance');
      if (res.ok) {
        const data = await res.json();
        if (data.active === false || data.maintenance === true) {
          setIsMaintenanceMode(true);
          if (data.message) setMaintenanceMessage(data.message);
        } else if (data.active === true) {
          setIsMaintenanceMode(false);
        }
      }
    } catch (err) {
      console.warn('[App] API maintenance check note:', err);
    }
  }, []);

  useEffect(() => {
    checkApiMaintenance();
    const interval = setInterval(checkApiMaintenance, 20000);
    return () => clearInterval(interval);
  }, [checkApiMaintenance]);

  // Handler for developer toggle inside MaintenanceScreen
  const handleToggleStatus = async (targetActive: boolean, key: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, active: targetActive })
      });
      const data = await res.json();
      if (data.success) {
        setIsMaintenanceMode(!targetActive);
        try {
          await setDoc(doc(db, 'settings', 'system_control'), {
            active: targetActive,
            isMaintenance: !targetActive,
            message: targetActive ? 'المنصة تعمل بصورة طبيعية' : 'الموقع تحت الصيانة حالياً',
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.warn('[App] Firestore sync note:', e);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('khemiai_theme') as 'khemiai_light' | 'khemiai_dark' | 'atomic_glow' | 'deep_emerald';
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme('khemiai_light');
      localStorage.setItem('khemiai_theme', 'khemiai_light');
    }
  }, []);

  useEffect(() => {
    if (theme === 'khemiai_light') {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
      document.documentElement.classList.add('dark');
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  const handleThemeChange = (newTheme: 'khemiai_light' | 'khemiai_dark' | 'atomic_glow' | 'deep_emerald') => {
    setTheme(newTheme);
    localStorage.setItem('khemiai_theme', newTheme);
  };

  // URL query parameter check & pathname check to isolate admin area
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const isAdminParam = queryParams.get('admin') === 'true' || queryParams.get('role') === 'admin' || queryParams.get('portal') === 'admin';
    const isAdminPath = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');

    if (isAdminParam || isAdminPath) {
      setPortal('admin');
    } else {
      setPortal('student');
    }
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem('jamal_admin_auth');
    // Keep or set the admin query param so we always stay on the admin panel login screen
    const url = new URL(window.location.href);
    url.searchParams.set('admin', 'true');
    url.searchParams.delete('role');
    url.searchParams.delete('portal');
    window.history.replaceState({}, '', url.toString());
    setPortal('admin');
  };

  const handleStudentLogout = () => {
    localStorage.removeItem('jamal_student');
    window.location.reload();
  };

  const getBackgroundDetails = () => {
    if (theme === 'atomic_glow') {
      return {
        isLight: false,
        bgBase: 'bg-slate-950',
        textColor: 'text-white',
        overlay: 'bg-[#030712]/92',
        gradient: 'from-amber-900/20 via-slate-950/80 to-slate-950',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop'
      };
    }
    if (theme === 'deep_emerald') {
      return {
        isLight: false,
        bgBase: 'bg-slate-950',
        textColor: 'text-white',
        overlay: 'bg-[#021f17]/90',
        gradient: 'from-emerald-900/20 via-slate-950/80 to-slate-950',
        image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=2000&auto=format&fit=crop'
      };
    }
    if (theme === 'khemiai_dark') {
      return {
        isLight: false,
        bgBase: 'bg-slate-950',
        textColor: 'text-white',
        overlay: 'bg-slate-950/92',
        gradient: 'from-cyan-900/20 via-slate-950/80 to-slate-950',
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop' // Science & Chemistry Lab
      };
    }
    // Default: khemiai_light (Light Mode)
    return {
      isLight: true,
      bgBase: 'bg-slate-50',
      textColor: 'text-slate-900',
      overlay: 'bg-white/94 backdrop-blur-[2px]',
      gradient: 'from-cyan-100/40 via-slate-50/80 to-slate-100/90',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop' // Science & Chemistry Lab
    };
  };

  // If Maintenance mode is active and developer has not bypassed, render ONLY MaintenanceScreen!
  if (isMaintenanceMode && !isDevBypassed) {
    return (
      <MaintenanceScreen 
        message={maintenanceMessage} 
        onRefresh={checkApiMaintenance} 
        onBypass={() => setIsDevBypassed(true)}
        onToggleStatus={handleToggleStatus}
      />
    );
  }

  const bgDetails = getBackgroundDetails();

  return (
    <div className={`min-h-screen relative font-sans ${bgDetails.textColor} overflow-hidden ${bgDetails.bgBase} ${theme === 'khemiai_light' ? 'light-mode' : ''}`}>
      {/* Dynamic Chemistry Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out scale-105"
        style={{ backgroundImage: `url(${bgDetails.image})` }}
      ></div>
      {/* Dynamic Chemistry Overlay */}
      <div className={`absolute inset-0 ${bgDetails.overlay} transition-colors duration-1000`}></div>
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${bgDetails.gradient} pointer-events-none`}></div>
      
      {/* Floating Theme Quick Toggle */}
      <div className="fixed top-3 left-3 z-50 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 shadow-lg rounded-full p-1 backdrop-blur-md">
        <button
          onClick={() => handleThemeChange(theme === 'khemiai_light' ? 'khemiai_dark' : 'khemiai_light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
            theme === 'khemiai_light'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-cyan-500 text-slate-950 shadow-md'
          }`}
          title="تبديل الوضع الفاتح / الداكن"
        >
          {theme === 'khemiai_light' ? (
            <>
              <span>☀️</span>
              <span>لايت مود</span>
            </>
          ) : (
            <>
              <span>🌙</span>
              <span>دارك مود</span>
            </>
          )}
        </button>
      </div>

      <div className="relative z-10 h-full">
        {portal === 'student' && <AppDownloadPrompt />}
        
        {portal === 'student' && (
          <StudentDashboard onLogout={handleStudentLogout} currentTheme={theme} onThemeChange={handleThemeChange} />
        )}
        {portal === 'admin' && (
          <AdminDashboard onLogout={handleAdminLogout} />
        )}
      </div>
    </div>
  );
}