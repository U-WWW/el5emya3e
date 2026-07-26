import React, { useState, useEffect } from 'react';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import AppDownloadPrompt from './components/AppDownloadPrompt';

export default function App() {
  const [portal, setPortal] = useState<'student' | 'admin'>('student');
  const [theme, setTheme] = useState<'khemiai_dark' | 'atomic_glow' | 'deep_emerald'>('khemiai_dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('khemiai_theme') as 'khemiai_dark' | 'atomic_glow' | 'deep_emerald';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = (newTheme: 'khemiai_dark' | 'atomic_glow' | 'deep_emerald') => {
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
        overlay: 'bg-[#030712]/92',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop'
      };
    }
    if (theme === 'deep_emerald') {
      return {
        overlay: 'bg-[#021f17]/90',
        image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=2000&auto=format&fit=crop'
      };
    }
    return {
      overlay: 'bg-slate-950/92',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2070&auto=format&fit=crop' // Science & Chemistry Lab
    };
  };

  const bgDetails = getBackgroundDetails();

  return (
    <div className="min-h-screen relative font-sans text-white overflow-hidden bg-slate-950">
      {/* Dynamic Chemistry Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out scale-105"
        style={{ backgroundImage: `url(${bgDetails.image})` }}
      ></div>
      {/* Dark Chemistry Overlay */}
      <div className={`absolute inset-0 ${bgDetails.overlay} backdrop-blur-[3px] transition-colors duration-1000`}></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/80 to-slate-950 pointer-events-none"></div>
      
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