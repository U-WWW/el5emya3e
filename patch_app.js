const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const themeClassesReplacement = `
  const getBackgroundDetails = () => {
    if (theme === 'pharaoh') {
      return {
        overlay: 'bg-black/60',
        image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=2070&auto=format&fit=crop'
      };
    }
    if (theme === 'islamic') {
      return {
        overlay: 'bg-emerald-950/70',
        image: 'https://images.unsplash.com/photo-1564344445582-7e9b0151f893?q=80&w=2069&auto=format&fit=crop'
      };
    }
    // modern (Muhammad Ali Pasha era)
    return {
      overlay: 'bg-stone-950/70',
      image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop'
    };
  };

  const bgDetails = getBackgroundDetails();
`;

code = code.replace(/const getThemeClasses = \(\) => {[\s\S]*?};/, themeClassesReplacement);

code = code.replace(/<div className=\{`min-h-screen relative font-sans text-white \$\{getThemeClasses\(\)\}`\}>[\s\S]*?<\/div>/, `<div className="min-h-screen relative font-sans text-white overflow-hidden">
      {/* Dynamic Background Image with subtle zoom animation */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out scale-105 animate-[pulse_20s_ease-in-out_infinite_alternate]"
        style={{ backgroundImage: \`url(\${bgDetails.image})\` }}
      ></div>
      {/* Background overlay pattern */}
      <div className={\`absolute inset-0 \${bgDetails.overlay} backdrop-blur-[2px] transition-colors duration-1000\`}></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      
      <div className="relative z-10 h-full">
        {portal === 'student' && <AppDownloadPrompt />}
        
        {portal === 'student' && (
          <StudentDashboard onLogout={handleStudentLogout} currentTheme={theme} onThemeChange={handleThemeChange} />
        )}
        {portal === 'admin' && (
          <AdminDashboard onLogout={handleAdminLogout} />
        )}
      </div>
    </div>`);

fs.writeFileSync('src/App.tsx', code);
