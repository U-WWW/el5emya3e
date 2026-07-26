const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const returnStatement = `
  return (
    <div className="min-h-screen relative font-sans text-white overflow-hidden">
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
    </div>
  );
`;

code = code.replace(/return \([\s\S]*?\);\s*\}\s*$/m, returnStatement + "\n}");

fs.writeFileSync('src/App.tsx', code);
