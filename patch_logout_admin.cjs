const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(/MessageCircle\n\} from 'lucide-react';/, "MessageCircle,\n  LogOut\n} from 'lucide-react';");

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
