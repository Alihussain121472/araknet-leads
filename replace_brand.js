const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // Buttons and Brands
      content = content.replace(/bg-blue-600/g, 'bg-brand-primary');
      content = content.replace(/hover:bg-blue-500/g, 'hover:bg-brand-hover');
      content = content.replace(/text-blue-600 dark:text-blue-400/g, 'text-brand-primary');
      content = content.replace(/text-blue-400/g, 'text-brand-primary');
      content = content.replace(/text-blue-500/g, 'text-brand-primary');
      
      // Terminal specific
      content = content.replace(/bg-slate-950 border border-slate-800/g, 'terminal-block');

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated brand colors:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'app'));
processDir(path.join(__dirname, 'components'));
