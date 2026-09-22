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

      // Layout & Backgrounds
      content = content.replace(/bg-slate-50 dark:bg-slate-95[05](\/[0-9]+)?/g, 'bg-page');
      content = content.replace(/bg-white dark:bg-slate-900(\/[0-9]+)?/g, 'bg-card');
      content = content.replace(/bg-white dark:bg-slate-950(\/[0-9]+)?/g, 'bg-card');
      
      // Text
      content = content.replace(/text-slate-900 dark:text-white/g, 'text-text-primary');
      content = content.replace(/text-slate-900 dark:text-slate-100/g, 'text-text-primary');
      content = content.replace(/text-slate-800 dark:text-slate-200/g, 'text-text-primary');
      content = content.replace(/text-slate-700 dark:text-slate-300/g, 'text-text-primary');
      content = content.replace(/text-slate-600 dark:text-slate-300/g, 'text-text-primary');
      
      content = content.replace(/text-slate-500 dark:text-slate-400/g, 'text-text-secondary');
      content = content.replace(/text-slate-600 dark:text-slate-400/g, 'text-text-secondary');
      
      // Borders
      content = content.replace(/border-slate-200 dark:border-slate-800(\/[0-9]+)?/g, 'border-border-default');
      content = content.replace(/border-slate-300 dark:border-slate-700(\/[0-9]+)?/g, 'border-border-default');

      // Badges
      content = content.replace(/bg-emerald-500\/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500\/20/g, 'badge-green');
      content = content.replace(/bg-amber-500\/10 text-amber-600 dark:text-amber-400 border border-amber-500\/20/g, 'badge-amber');
      content = content.replace(/bg-rose-500\/10 text-rose-600 dark:text-rose-400 border border-rose-500\/20/g, 'badge-red');

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'app'));
processDir(path.join(__dirname, 'components'));
