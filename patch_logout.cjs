const fs = require('fs');
let code = fs.readFileSync('src/components/StudentDashboard.tsx', 'utf8');

code = code.replace(/Palette\n\} from 'lucide-react';/, "Palette,\n  LogOut\n} from 'lucide-react';");

fs.writeFileSync('src/components/StudentDashboard.tsx', code);
