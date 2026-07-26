const fs = require('fs');
let code = fs.readFileSync('src/components/AppDownloadPrompt.tsx', 'utf8');

const bannerReplacement = `
            className="w-full bg-stone-900/90 backdrop-blur-md border-b border-white/10 text-stone-100 font-sans flex items-center justify-between px-4 py-3 z-50 sticky top-0 shadow-lg gap-2 select-none"
`;
code = code.replace(/className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 border-b-4 border-black text-black font-sans font-black flex items-center justify-between px-4 py-2\.5 z-50 sticky top-0 shadow-xl gap-2 select-none"/, bannerReplacement);

const badgeReplacement = `
              <span className="bg-amber-600 text-stone-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider hidden sm:inline-block">
                تطبيق رسمي
              </span>
              <span className="text-stone-100 text-xs sm:text-sm font-medium flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-amber-500" />
                استخدم التطبيق الرسمي للحصول على أفضل تجربة وسرعة مضاعفة!
              </span>
`;
code = code.replace(/<span className="bg-black text-amber-300 border border-amber-900 font-sans font-black text-\[10px\] px-2 py-0\.5 rounded-md shadow-xl uppercase tracking-wider animate-pulse hidden sm:inline-block">[\s\S]*?<\/span>\s*<span className="text-white text-xs sm:text-sm font-black flex items-center gap-1\.5 drop-shadow-xl">[\s\S]*?<\/span>/, badgeReplacement);

const downloadBtnReplacement = `
              <button
                onClick={handleDownload}
                className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs px-4 py-2 rounded-full shadow-md transition flex items-center gap-1 cursor-pointer"
              >
`;
code = code.replace(/<button\s*onClick=\{handleDownload\}\s*className="bg-amber-600 hover:bg-amber-500 text-black border border-amber-900 font-sans font-black text-xs px-3\.5 py-1\.5 rounded-xl shadow-xl flex items-center gap-1 cursor-pointer"\s*>/, downloadBtnReplacement);

const popupReplacement = `
              className="w-full max-w-md bg-stone-950/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-6 md:p-8 relative text-center"
`;
code = code.replace(/className="w-full max-w-md bg-stone-900 border border-amber-500 shadow-xl rounded-3xl p-6 md:p-8 relative text-center"/, popupReplacement);


fs.writeFileSync('src/components/AppDownloadPrompt.tsx', code);
