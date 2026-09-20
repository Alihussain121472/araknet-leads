const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\DELL\\.gemini\\antigravity\\brain\\d044ca54-3088-4881-8821-44dc02ebfe78\\.system_generated\\steps\\823\\content.md', 'utf8');
const textRegex = /\\?"text\\?":\\?"(.*?)\\?"/g;
let match;
while ((match = textRegex.exec(html)) !== null) {
  if (match[1].length > 50) {
    console.log(match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'));
    console.log('---');
  }
}
