const fs = require('fs');
let code = fs.readFileSync('src/components/StudentDashboard.tsx', 'utf8');

code = code.replace(/<\/div>\s*<\/div>\s*\);\s*\}\s*$/, "</main>\n    </div>\n  );\n}");

fs.writeFileSync('src/components/StudentDashboard.tsx', code);
