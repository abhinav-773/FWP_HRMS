const fs = require('fs');
const path = require('path');

const DIRS_TO_SCAN = [
  path.join(__dirname, 'frontend/src'),
  path.join(__dirname, 'frontend/index.html'),
  path.join(__dirname, 'backend/src'),
  path.join(__dirname, 'backend/prisma'),
  path.join(__dirname, 'backend/scripts')
];

const SEARCH_STR = 'HRGPT';
const REPLACE_STR = 'HireMind';

function scanAndReplace(targetPath) {
  if (!fs.existsSync(targetPath)) return;

  const stat = fs.statSync(targetPath);

  if (stat.isDirectory()) {
    const files = fs.readdirSync(targetPath);
    for (const file of files) {
      scanAndReplace(path.join(targetPath, file));
    }
  } else if (stat.isFile()) {
    if (
      targetPath.endsWith('.js') || 
      targetPath.endsWith('.jsx') || 
      targetPath.endsWith('.ts') || 
      targetPath.endsWith('.tsx') || 
      targetPath.endsWith('.html') ||
      targetPath.endsWith('.prisma')
    ) {
      let content = fs.readFileSync(targetPath, 'utf-8');
      if (content.includes(SEARCH_STR)) {
        content = content.replace(new RegExp(SEARCH_STR, 'g'), REPLACE_STR);
        
        // Also handle lower-case variations specifically for hrGPT to hireMind if it occurs, but standard is HRGPT
        content = content.replace(/hrgpt/g, 'hiremind');
        content = content.replace(/Hrgpt/g, 'Hiremind');
        
        fs.writeFileSync(targetPath, content, 'utf-8');
        console.log(`Rebranded: ${targetPath}`);
      }
    }
  }
}

console.log('Starting global rebrand...');
for (const dir of DIRS_TO_SCAN) {
  scanAndReplace(dir);
}
console.log('Rebrand complete.');
