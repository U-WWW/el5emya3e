import React, { useState, useEffect } from 'react';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import AppDownloadPrompt from './components/AppDownloadPrompt';

export default function App() {
  const [portal, setPortal] = useState<'student' | 'admin'>('student');
  const [theme, setTheme] = useState<'khemiai_light' | 'khemiai_dark' | 'atomic_glow' | 'deep_emerald'>('khemiai_light');

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