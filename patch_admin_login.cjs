const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Replace the login box layout to look more elegant
const replacement = `
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-sm bg-stone-950/80 backdrop-blur-2xl border border-white/10 shadow-2xl p-8 text-center rounded-3xl relative overflow-hidden">
          
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-block bg-amber-600/20 border border-amber-500/30 px-6 py-2 rounded-full mb-6 backdrop-blur-md">
              <span className="text-xs font-bold text-amber-400 tracking-widest">
                إدارة الأكاديمية
              </span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-6">دخول الإدارة</h2>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="text"
                required
                placeholder="اسم المستخدم"
                className="w-full bg-stone-900 border border-stone-700 focus:border-amber-500 text-stone-100 rounded-xl p-4 text-center font-bold outline-none transition text-lg"
                value={adminUser}
                onChange={e => setAdminUser(e.target.value)}
              />
              <input
                type="password"
                required
                placeholder="كلمة المرور السرية"
                className="w-full bg-stone-900 border border-stone-700 focus:border-amber-500 text-stone-100 rounded-xl p-4 text-center font-bold outline-none transition text-lg"
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
              />
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-black py-4 rounded-xl text-xl transition shadow-lg mt-2"
              >
                تسجيل الدخول
              </button>
            </form>
            {loginError && (
              <p className="text-rose-500 font-bold mt-4 text-sm bg-rose-500/10 p-2 rounded-lg">رمز الدخول أو الاسم غير صحيح!</p>
            )}
          </div>
        </div>
      </div>
`;

code = code.replace(/<div className="min-h-screen flex items-center justify-center px-4 py-12">[\s\S]*?<\/div>\s*<\/div>/, replacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
