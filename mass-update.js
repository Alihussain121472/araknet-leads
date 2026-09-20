const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /\bbg-slate-950\b/g, to: 'bg-slate-50 dark:bg-slate-950' },
  { from: /\bbg-slate-900\b/g, to: 'bg-white dark:bg-slate-900' },
  { from: /\bborder-slate-800\b/g, to: 'border-slate-200 dark:border-slate-800' },
  { from: /\bborder-slate-700\b/g, to: 'border-slate-300 dark:border-slate-700' },
  { from: /\btext-slate-400\b/g, to: 'text-slate-500 dark:text-slate-400' },
  { from: /\btext-slate-300\b/g, to: 'text-slate-600 dark:text-slate-300' },
  { from: /\btext-slate-200\b/g, to: 'text-slate-800 dark:text-slate-200' },
  { from: /\btext-slate-100\b/g, to: 'text-slate-900 dark:text-slate-100' },
  { from: /\btext-white\b/g, to: 'text-slate-900 dark:text-white' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const rule of replacements) {
        content = content.replace(rule.from, rule.to);
      }
      
      // Cleanup duplicate prefixes if any occurred
      content = content.replace(/bg-white dark:bg-white/g, 'bg-white');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDirectory('./app');
processDirectory('./components');
