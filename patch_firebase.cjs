const fs = require('fs');
const firebaseConfigJson = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));

let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const newConfig = `const firebaseConfig = {
  apiKey: "${firebaseConfigJson.apiKey}",
  authDomain: "${firebaseConfigJson.authDomain}",
  projectId: "${firebaseConfigJson.projectId}",
  storageBucket: "${firebaseConfigJson.storageBucket}",
  messagingSenderId: "${firebaseConfigJson.messagingSenderId}",
  appId: "${firebaseConfigJson.appId}"
};`;

code = code.replace(/const firebaseConfig = \{[\s\S]*?\};/, newConfig);
fs.writeFileSync('src/lib/firebase.ts', code);
