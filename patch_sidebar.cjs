const fs = require('fs');
let code = fs.readFileSync('src/components/StudentDashboard.tsx', 'utf8');

const regexSidebar = /\{\/\* Dashboard layout with 2 grid columns \*\/\}[\s\S]*?\{\/\* Column 1: Profile & Progress HUD \*\/\}[\s\S]*?\{\/\* Column 2 & 3: Content area with custom Tabs \*\/\}/;

const newSidebar = `
        {/* Dashboard layout with 2 grid columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          {/* Column 1: Profile & Progress HUD */}
          <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
            
            {/* Monumental teacher portrait */}
            <div className="bg-stone-900/80 backdrop-blur-md border border-stone-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent pointer-events-none" />
              
              <div className="text-center relative z-10">
                <span className="text-xs font-black text-amber-500 bg-amber-950/40 border border-amber-900/60 px-4 py-1.5 rounded-full uppercase tracking-widest inline-block mb-6 shadow-lg">
                  مؤسس الأكاديمية
                </span>
                
                <div className="w-40 h-40 rounded-full border-4 border-stone-800 mx-auto relative p-1 mb-6 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-amber-500/50 p-1">
                    {!teacherAvatarError ? (
                      <img
                        src="/teacher.png"
                        alt="Mr. Mahmoud Al-Menshawy"
                        onError={() => setTeacherAvatarError(true)}
                        className="w-full h-full rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-stone-800 flex items-center justify-center text-stone-400 text-5xl font-black italic">
                        M
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="text-2xl font-black tracking-tight text-white mb-2">
                  الأستاذ محمود المنشاوي
                </h3>
                <p className="text-sm font-bold text-amber-500/80 mb-6">
                  مؤرخ الأجيال وصانع العقول
                </p>
                
                {/* Motivational Quote */}
                <div className="bg-stone-950/50 border border-stone-800 p-5 rounded-2xl text-center relative">
                  <span className="absolute -top-3 right-4 text-3xl text-amber-900">"</span>
                  <p className="text-xs font-bold text-stone-300 leading-relaxed text-right relative z-10">
                    التاريخ ليس مجرد حكايات تُروى، بل هو مرآة الحاضر ومصباح المستقبل. ثق بنفسك واصنع تاريخك الخاص بجدك وتفوقك!
                  </p>
                </div>
                
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="mt-6 w-full flex justify-center items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 font-bold py-4 rounded-2xl transition shadow-lg group-hover:border-amber-500/50 group-hover:text-amber-400"
                >
                  <MessageCircle className="w-5 h-5" /> مراسلة الأستاذ
                </button>
              </div>
            </div>

            {/* Teacher Message Modal */}
            <AnimatePresence>
              {showMessageModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-stone-900 border border-stone-800 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-rose-600" />
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-black text-white">صندوق الرسائل</h3>
                      <button onClick={() => setShowMessageModal(false)} className="text-stone-500 hover:text-white bg-stone-800 p-2 rounded-full transition">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <form onSubmit={handleSendTeacherMessage} className="space-y-5 text-right">
                      <textarea
                        required
                        className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-2xl p-5 text-stone-100 resize-none font-medium placeholder-stone-600 outline-none transition"
                        rows={5}
                        placeholder="اكتب رسالتك أو استفسارك هنا..."
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                      />
                      <div className="flex items-center gap-3 justify-end bg-stone-950 border border-stone-800 p-4 rounded-2xl">
                        <label htmlFor="anonymous" className="text-sm text-stone-400 font-bold cursor-pointer select-none">إرسال كرسالة مجهولة</label>
                        <input
                          id="anonymous"
                          type="checkbox"
                          className="w-5 h-5 accent-amber-600 cursor-pointer rounded bg-stone-800 border-stone-700"
                          checked={isAnonymousMessage}
                          onChange={e => setIsAnonymousMessage(e.target.checked)}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSendingMessage}
                        className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-black py-4 rounded-2xl text-lg transition shadow-lg"
                      >
                        {isSendingMessage ? 'جاري الإرسال...' : 'إرسال'}
                      </button>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Student statistics panel */}
            <div className="bg-stone-900/80 backdrop-blur-md border border-stone-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex justify-between items-center border-b border-stone-800 pb-4">
                <h4 className="font-black text-stone-300 text-sm tracking-widest uppercase">
                  الشخصية التاريخية
                </h4>
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
              
              {/* Dynamic Historic Avatar Icon Frame */}
              <div className="flex items-center gap-5 bg-stone-950/50 border border-stone-800 p-4 rounded-2xl">
                <div className="w-16 h-16 rounded-full border-2 border-amber-500 overflow-hidden shadow-lg flex-shrink-0">
                  <img src={
                    selectedAvatar === 'ironman' ? 'https://images.unsplash.com/photo-1600100659773-f14d9b040c79?w=150&h=150&fit=crop' :
                    selectedAvatar === 'captainamerica' ? 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=150&h=150&fit=crop' :
                    selectedAvatar === 'thor' ? 'https://images.unsplash.com/photo-1643900223789-54848dcf3283?w=150&h=150&fit=crop' :
                    selectedAvatar === 'blackwidow' ? 'https://images.unsplash.com/photo-1533615562761-1e967a6d5817?w=150&h=150&fit=crop' :
                    selectedAvatar === 'doctorstrange' ? 'https://images.unsplash.com/photo-1551041777-674ee6b6ed9a?w=150&h=150&fit=crop' :
                    'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=150&h=150&fit=crop'
                  } alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-xs font-black text-stone-500 block mb-1">الشخصية الحالية</span>
                  <span className="text-base font-black text-white block">
                    {selectedAvatar === 'ironman' ? 'توت عنخ آمون' :
                     selectedAvatar === 'captainamerica' ? 'رمسيس الثاني' :
                     selectedAvatar === 'thor' ? 'محمد علي باشا' :
                     selectedAvatar === 'blackwidow' ? 'حتشبسوت' :
                     selectedAvatar === 'doctorstrange' ? 'صلاح الدين الأيوبي' :
                     'أبو الهول'}
                  </span>
                </div>
              </div>
            </div>

            {/* Badges Display */}
            <div className="bg-stone-900/80 backdrop-blur-md border border-stone-800 rounded-3xl p-6 shadow-xl">
              <div className="flex justify-between items-center border-b border-stone-800 pb-4 mb-5">
                <h4 className="font-black text-stone-300 text-sm tracking-widest uppercase">
                  الرتبة العسكرية / العلمية
                </h4>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex items-center gap-5 bg-stone-950/50 border border-stone-800 p-4 rounded-2xl">
                <div className="p-4 bg-amber-950/30 border border-amber-900/50 rounded-2xl text-amber-400 font-sans font-black text-3xl shadow-inner">
                  🎖️
                </div>
                <div>
                  <span className={\`text-lg font-black \${currentLevelInfo.color} block mb-1\`}>
                    {currentLevelInfo.badge}
                  </span>
                  <span className="text-xs font-bold text-stone-400 block leading-relaxed">
                    {currentLevelInfo.desc}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Column 2 & 3: Content area with custom Tabs */}
          <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">
`;

code = code.replace(regexSidebar, newSidebar);

fs.writeFileSync('src/components/StudentDashboard.tsx', code);
