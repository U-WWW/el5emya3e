const fs = require('fs');
let code = fs.readFileSync('src/components/StudentDashboard.tsx', 'utf8');

const replacement = `
              {/* Dynamic Historic Avatar Icon Frame */}
              <div className="flex items-center gap-4 bg-stone-900 border border-stone-800 p-3 rounded-2xl">
                <div className="w-14 h-14 rounded-full border-2 border-amber-500 overflow-hidden shadow-lg">
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
                  <span className="text-xs font-black text-gray-500 block">الشخصية التاريخية النشطة</span>
                  <span className="text-sm font-black text-stone-100 block">
                    {selectedAvatar === 'ironman' ? 'توت عنخ آمون' :
                     selectedAvatar === 'captainamerica' ? 'رمسيس الثاني' :
                     selectedAvatar === 'thor' ? 'محمد علي باشا' :
                     selectedAvatar === 'blackwidow' ? 'حتشبسوت' :
                     selectedAvatar === 'doctorstrange' ? 'صلاح الدين الأيوبي' :
                     'أبو الهول'}
                  </span>
                </div>
              </div>
`;

code = code.replace(/\{\/\* Dynamic Historic Avatar Icon Frame \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, replacement);

fs.writeFileSync('src/components/StudentDashboard.tsx', code);
