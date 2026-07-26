const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const regexAdminShell = /return \(\s*<div className="min-h-screen text-stone-100">[\s\S]*?<main className="lg:pr-64 pb-24 lg:pb-0 min-h-screen pt-4">/;

const newAdminShell = `
  return (
    <div className="min-h-screen text-stone-100 flex flex-col relative z-10 font-sans">
      
      {/* Elegant Historic Header */}
      <header className="sticky top-0 z-50 bg-stone-950/80 backdrop-blur-3xl border-b border-rose-900/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            <div className="flex items-center gap-6">
              {/* Logo / Brand */}
              <div className="flex flex-col">
                <span className="font-black text-xl md:text-2xl tracking-widest text-rose-500 uppercase">
                  Al-Menshawy Admin
                </span>
                <span className="text-[10px] md:text-xs font-bold text-stone-400 tracking-widest uppercase">
                  History Academy - Management
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-2 bg-stone-900/50 p-1.5 rounded-2xl border border-white/5">
              {[
                { id: 'stats', label: 'الرئيسية', icon: Shield },
                { id: 'scanner', label: 'QR مسح', icon: QrCode },
                { id: 'students', label: 'الطلاب', icon: Users },
                { id: 'quizzes', label: 'بنك الامتحانات', icon: FileSignature },
                { id: 'videos', label: 'الفيديوهات', icon: Video },
                { id: 'results', label: 'السجلات', icon: Database },
                { id: 'rankings', label: 'الشرف', icon: Trophy },
                { id: 'messages', label: 'الرسائل', icon: MessageCircle }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSelectedQuiz(null);
                    }}
                    className={\`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-300 \${
                      isActive 
                        ? 'bg-rose-600 text-stone-950 shadow-lg scale-105' 
                        : 'text-stone-400 hover:text-rose-400 hover:bg-stone-800'
                    }\`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Actions & Logout */}
            <div className="flex items-center gap-4">
              <button
                onClick={fetchAdminData}
                className="bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-800 p-3 rounded-xl transition shadow-lg"
                title="تحديث البيانات"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button 
                onClick={handleAdminLogout}
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
      <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-950/95 backdrop-blur-xl border-t border-rose-900/50 pb-safe overflow-x-auto custom-scrollbar">
        <div className="flex items-center p-2 min-w-max">
          {[
            { id: 'stats', label: 'الرئيسية', icon: Shield },
            { id: 'scanner', label: 'مسح', icon: QrCode },
            { id: 'students', label: 'الطلاب', icon: Users },
            { id: 'quizzes', label: 'امتحانات', icon: FileSignature },
            { id: 'videos', label: 'فيديو', icon: Video },
            { id: 'results', label: 'سجلات', icon: Database },
            { id: 'rankings', label: 'شرف', icon: Trophy },
            { id: 'messages', label: 'رسائل', icon: MessageCircle }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedQuiz(null);
                }}
                className={\`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-16 \${
                  isActive ? 'text-rose-500 scale-110' : 'text-stone-500 hover:text-stone-300'
                }\`}
              >
                <Icon className={\`w-6 h-6 mb-1 \${isActive ? 'drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : ''}\`} />
                <span className="text-[10px] font-black">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 xl:pb-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
`;

code = code.replace(regexAdminShell, newAdminShell);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
