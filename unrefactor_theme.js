const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds
  { regex: /bg-slate-50 dark:bg-\[#050e1c\]/g, replacement: "bg-[#050e1c]" },
  { regex: /bg-slate-100 dark:bg-\[#0a1422\]/g, replacement: "bg-[#0a1422]" },
  { regex: /bg-white dark:bg-\[#16202f\]/g, replacement: "bg-[#16202f]" },
  
  // Opacified Backgrounds
  { regex: /bg-slate-50\/(\d+) dark:bg-\[#050e1c\]\/\1/g, replacement: "bg-[#050e1c]/$1" },
  { regex: /bg-white\/(\d+) dark:bg-black\/\1/g, replacement: "bg-black/$1" },
  { regex: /bg-slate-900\/(\d+) dark:bg-white\/\1/g, replacement: "bg-white/$1" },

  // Special ones
  { regex: /bg-slate-50\/80 dark:bg-\[#050e1c\]\/80/g, replacement: "bg-[#050e1c]/80" },
  { regex: /bg-slate-900\/5 dark:bg-white\/5/g, replacement: "bg-white/5" },
  { regex: /bg-slate-900\/10 dark:bg-white\/10/g, replacement: "bg-white/10" },
  { regex: /bg-slate-900\/20 dark:bg-white\/20/g, replacement: "bg-white/20" },
  
  // Texts
  { regex: /text-slate-900 dark:text-white/g, replacement: "text-white" },
  { regex: /text-slate-600 dark:text-white\/(\d+)/g, replacement: "text-white/$1" },
  { regex: /text-slate-500 dark:text-white\/(\d+)/g, replacement: "text-white/$1" },
  { regex: /text-slate-400 dark:text-white\/(\d+)/g, replacement: "text-white/$1" },
  
  // Borders
  { regex: /border-slate-300 dark:border-white\/(\d+)/g, replacement: "border-white/$1" },
  { regex: /border-slate-200 dark:border-white\/(\d+)/g, replacement: "border-white/$1" },
  { regex: /border-slate-100 dark:border-white\/(\d+)/g, replacement: "border-white/$1" },
  
  // Gradients
  { regex: /to-white\/(\d+) dark:to-black\/\1/g, replacement: "to-black/$1" },
  { regex: /from-slate-50 dark:from-\[#050e1c\]/g, replacement: "from-[#050e1c]" }
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const {regex, replacement} of replacements) {
        content = content.replace(regex, replacement);
      }
      
      // Specifically remove ThemeToggle imports and instances
      content = content.replace(/import \{ ThemeToggle \} from "[^"]+";\r?\n?/g, "");
      content = content.replace(/<ThemeToggle \/>\s*/g, "");

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Reverted ${fullPath}`);
      }
    }
  }
}

console.log("Starting theme unrefactoring script...");
processDirectory(path.join(__dirname, 'src', 'app'));
processDirectory(path.join(__dirname, 'src', 'components'));
console.log("Unrefactoring complete.");
