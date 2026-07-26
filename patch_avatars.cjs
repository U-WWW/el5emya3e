const fs = require('fs');
let code = fs.readFileSync('src/components/StudentDashboard.tsx', 'utf8');

// Replace the superhero avatar options with real historical images
const avatarReplacement = `
                      {[
                        { id: 'spiderman', image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=150&h=150&fit=crop', nameAr: 'أبو الهول', color: 'border-amber-500 hover:border-red-400 bg-red-950/20' },
                        { id: 'ironman', image: 'https://images.unsplash.com/photo-1600100659773-f14d9b040c79?w=150&h=150&fit=crop', nameAr: 'توت عنخ آمون', color: 'border-amber-500 hover:border-amber-400 bg-amber-950/20' },
                        { id: 'captainamerica', image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=150&h=150&fit=crop', nameAr: 'رمسيس الثاني', color: 'border-blue-500 hover:border-blue-400 bg-blue-950/20' },
                        { id: 'thor', image: 'https://images.unsplash.com/photo-1643900223789-54848dcf3283?w=150&h=150&fit=crop', nameAr: 'محمد علي باشا', color: 'border-sky-500 hover:border-sky-400 bg-sky-950/20' },
                        { id: 'doctorstrange', image: 'https://images.unsplash.com/photo-1551041777-674ee6b6ed9a?w=150&h=150&fit=crop', nameAr: 'صلاح الدين', color: 'border-emerald-500 hover:border-emerald-400 bg-emerald-950/20' },
                        { id: 'blackwidow', image: 'https://images.unsplash.com/photo-1533615562761-1e967a6d5817?w=150&h=150&fit=crop', nameAr: 'حتشبسوت', color: 'border-stone-500 hover:border-stone-400 bg-stone-950/20' },
                      ].map(hero => (
                        <button
                          key={hero.id}
                          onClick={() => handleSelectAvatar(hero.id)}
                          className={\`p-3 rounded-xl border font-black transition flex flex-col items-center gap-2 \${hero.color} \${
                            selectedAvatar === hero.id
                              ? 'scale-105 shadow-xl ring-2 ring-white/20'
                              : 'opacity-70 hover:opacity-100'
                          }\`}
                        >
                          <img src={hero.image} alt={hero.nameAr} className="w-16 h-16 rounded-full object-cover border border-white/20" />
                          <span className="text-xs text-stone-100 mt-1">{hero.nameAr}</span>
                        </button>
                      ))}
`;

// we need to replace the old .map(hero => ...) array
code = code.replace(/\{\[\s*\{ id: 'spiderman'[\s\S]*?\}\]\.map\(hero => \([\s\S]*?<\/button>\s*\)\)\}/, avatarReplacement);

fs.writeFileSync('src/components/StudentDashboard.tsx', code);
