const fs = require('fs');
let code = fs.readFileSync('src/components/StudentDashboard.tsx', 'utf8');

// Replace the navigation and sidebar with a new elegant header
const newNavReplacement = `
  return (
    <div className="min-h-screen text-stone-100 flex flex-col relative z-10">
      
      {/* Elegant Historic Header */}
      <header className="sticky top-0 z-50 bg-stone-950/80 backdrop-blur-3xl border-b border-amber-900/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center gap-6">
              {/* Logo / Brand */}
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-widest text-amber-500 uppercase font-sans">
                  Al-Menshawy
                </span>
                <span className="text-xs font-bold text-stone-400 tracking-widest uppercase">
                  History Academy
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2 bg-stone-900/50 p-1.5 rounded-2xl border border-white/5">
              {[
                { id: 'home', label: 'الرئيسية', icon: Home },
                { id: 'missions', label: 'المهام والاختبارات', icon: BookOpen },
                { id: 'lectures', label: 'المحاضرات', icon: Play },
                { id: 'friday', label: 'ابن خلدون AI', icon: Sparkles },
                { id: 'community', label: 'مجتمع المؤرخين', icon: Users },
                { id: 'profile', label: 'ملفي', icon: User }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={\`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300 \${
                      isActive 
                        ? 'bg-amber-600 text-stone-950 shadow-lg scale-105' 
                        : 'text-stone-400 hover:text-amber-400 hover:bg-stone-800'
                    }\`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-stone-900/80 border border-stone-800 px-4 py-2 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-sm font-bold text-stone-300">{student.code}</span>
              </div>
              <button 
                onClick={onLogout}
                className="bg-stone-900 border border-rose-900/50 text-rose-500 hover:bg-rose-600 hover:text-white p-3 rounded-xl transition shadow-lg"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation (Bottom) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-950/95 backdrop-blur-xl border-t border-amber-900/50 pb-safe">
        <div className="flex justify-around items-center p-2">
          {[
            { id: 'home', label: 'الرئيسية', icon: Home },
            { id: 'missions', label: 'مهام', icon: BookOpen },
            { id: 'lectures', label: 'محاضرات', icon: Play },
            { id: 'friday', label: 'AI', icon: Sparkles },
            { id: 'community', label: 'مجتمع', icon: Users },
            { id: 'profile', label: 'ملفي', icon: User }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={\`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-16 \${
                  isActive ? 'text-amber-500 scale-110' : 'text-stone-500 hover:text-stone-300'
                }\`}
              >
                <Icon className={\`w-6 h-6 mb-1 \${isActive ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : ''}\`} />
                <span className="text-[10px] font-black">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 lg:pb-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
`;

// we replace from return (\n    <div className="min-h-screen text-stone-100"> down to <main className="lg:pr-64 pb-24 lg:pb-0 min-h-screen pt-4">
// Let's use regex to match this large block
const regexShell = /return \(\s*<div className="min-h-screen text-stone-100">[\s\S]*?<main className="lg:pr-64 pb-24 lg:pb-0 min-h-screen pt-4">\s*<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">/;

code = code.replace(regexShell, newNavReplacement);

fs.writeFileSync('src/components/StudentDashboard.tsx', code);
