const fs = require('fs');
let code = fs.readFileSync('src/components/StudentDashboard.tsx', 'utf8');

code = code.replace(/<\/div>\s*<\/div>\s*\{\/\* GLOBAL DESIGNER AND DEVELOPER FOOTER \*\/\}/, '</div></div></div>{/* GLOBAL DESIGNER AND DEVELOPER FOOTER */}');

fs.writeFileSync('src/components/StudentDashboard.tsx', code);
