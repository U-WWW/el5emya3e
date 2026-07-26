const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const bgReplacement = `
  const getBackgroundDetails = () => {
    return {
      overlay: 'bg-stone-950/80',
      image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=2070&auto=format&fit=crop' // Real Pyramids Image
    };
  };

  const bgDetails = getBackgroundDetails();
`;

code = code.replace(/const getBackgroundDetails = \(\) => \{[\s\S]*?const bgDetails = getBackgroundDetails\(\);/, bgReplacement);

fs.writeFileSync('src/App.tsx', code);
