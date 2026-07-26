const fs = require('fs');
let code = fs.readFileSync('src/components/StudentDashboard.tsx', 'utf8');

// Replace the login box layout to look more elegant
const replacement = `
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-lg bg-stone-950/80 backdrop-blur-2xl border border-white/10 shadow-2xl p-8 md:p-10 rounded-3xl relative overflow-hidden">
          
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

          <div className="text-center mb-8 relative">
            <div className="inline-block bg-amber-600/20 border border-amber-500/30 px-6 py-2 rounded-full mb-6 backdrop-blur-md">
              <span className="text-xs font-bold text-amber-400 tracking-widest">
                أكاديمية الأستاذ محمود المنشاوي للتاريخ
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-3">
              بوابة المؤرخين
            </h2>
            <p className="text-sm font-medium text-stone-300">
              ادخل بوابات الأكاديمية وصقل مهاراتك ومعرفتك التاريخية مع الأستاذ المنشاوي
            </p>
          </div>
`;

code = code.replace(/<div className="min-h-screen flex items-center justify-center px-4 py-12 relative">[\s\S]*?<\/p>\s*<\/div>/, replacement);

fs.writeFileSync('src/components/StudentDashboard.tsx', code);
