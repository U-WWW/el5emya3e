const fs = require('fs');
let code = fs.readFileSync('src/components/StudentDashboard.tsx', 'utf8');

const newHome = `
              {activeTab === 'home' && (
                <div className="space-y-8">
                  
                  {/* Majestic Hero Banner */}
                  <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl group min-h-[400px] flex items-end">
                    <div className="absolute inset-0 bg-stone-950">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/e/ea/Auguste_Couder_-_Mehemet_Ali_Vice-roi_d_Egypte.jpg" 
                        alt="Muhammad Ali Pasha" 
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 ease-in-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent"></div>
                    </div>
                    
                    <div className="relative z-10 p-8 md:p-12 w-full text-right">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                      >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-amber-600/20 border border-amber-500/50 text-amber-400 font-bold text-xs tracking-widest mb-4 backdrop-blur-sm">
                          مؤسس مصر الحديثة
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                          مرحباً بك يا <span className="text-amber-500">مؤرخ المستقبل</span>
                        </h2>
                        <p className="text-lg md:text-xl text-stone-300 max-w-2xl font-medium leading-relaxed ml-auto">
                          هنا حيث تلتقي الأصالة بالحداثة. استكشف أعظم حقب التاريخ وصقل معرفتك تحت إشراف الأستاذ محمود المنشاوي.
                        </p>
                      </motion.div>
                    </div>
                  </div>

                  {/* Majestic Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="bg-stone-900/80 backdrop-blur-md border border-stone-800 p-8 rounded-3xl text-center relative overflow-hidden group shadow-xl"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-3xl group-hover:bg-amber-600/20 transition-colors"></div>
                      <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                      <span className="text-sm font-black text-stone-400 uppercase tracking-widest block mb-2">إنجازاتك</span>
                      <span className="text-4xl font-black text-white block">
                        {studentResults.length}
                      </span>
                    </motion.div>
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="bg-stone-900/80 backdrop-blur-md border border-stone-800 p-8 rounded-3xl text-center relative overflow-hidden group shadow-xl"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-3xl group-hover:bg-rose-600/20 transition-colors"></div>
                      <BookOpen className="w-10 h-10 text-rose-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(243,33,110,0.5)]" />
                      <span className="text-sm font-black text-stone-400 uppercase tracking-widest block mb-2">المهام المتاحة</span>
                      <span className="text-4xl font-black text-white block">
                        {quizzes.length}
                      </span>
                    </motion.div>
                    <motion.div 
                      whileHover={{ y: -5 }}
                      className="bg-stone-900/80 backdrop-blur-md border border-stone-800 p-8 rounded-3xl text-center relative overflow-hidden group shadow-xl"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl group-hover:bg-emerald-600/20 transition-colors"></div>
                      <Play className="w-10 h-10 text-emerald-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                      <span className="text-sm font-black text-stone-400 uppercase tracking-widest block mb-2">المحاضرات</span>
                      <span className="text-4xl font-black text-white block">
                        {videos.length}
                      </span>
                    </motion.div>
                  </div>

                  {/* Past attempts log */}
`;

const regexHome = /\{activeTab === 'home' && \(\s*<div className="space-y-6">\s*\{\/\* Dashboard Welcome Banner \*\/\}[\s\S]*?\{\/\* Past attempts log \*\/\}/;

code = code.replace(regexHome, newHome);

fs.writeFileSync('src/components/StudentDashboard.tsx', code);
