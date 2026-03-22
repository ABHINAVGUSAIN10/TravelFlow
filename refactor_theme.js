const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds
  { regex: /bg-\[#050e1c\](?!\/)/g, replacement: "bg-slate-50 dark:bg-[#050e1c]" },
  { regex: /bg-\[#0a1422\](?!\/)/g, replacement: "bg-slate-100 dark:bg-[#0a1422]" },
  { regex: /bg-\[#16202f\](?!\/)/g, replacement: "bg-white dark:bg-[#16202f]" },
  
  // Opacified Backgrounds
  { regex: /bg-\[#050e1c\]\/(\d+)/g, replacement: "bg-slate-50/$1 dark:bg-[#050e1c]/$1" },
  { regex: /bg-black\/(\d+)/g, replacement: "bg-white/$1 dark:bg-black/$1" },
  { regex: /bg-white\/(\d+)/g, replacement: "bg-slate-900/$1 dark:bg-white/$1" },
  
  // Texts
  { regex: /text-white(?!\/)(?!\s*['"])/g, replacement: "text-slate-900 dark:text-white" }, // Avoid replacing in exact class strings if needed, though Tailwind processes classes regardless.
  { regex: /text-white\/(\d+)/g, replacement: "text-slate-600 dark:text-white/$1" },
  
  // Borders
  { regex: /border-white\/(\d+)/g, replacement: "border-slate-300 dark:border-white/$1" },
  
  // Gradients
  { regex: /to-black\/(\d+)/g, replacement: "to-white/$1 dark:to-black/$1" },
  { regex: /from-\[#050e1c\]/g, replacement: "from-slate-50 dark:from-[#050e1c]" }
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
      
      for (const {regex, replacement} of replacements) {
        content = content.replace(regex, replacement);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

console.log("Starting theme refactoring script...");
processDirectory(path.join(__dirname, 'src', 'app'));
console.log("Refactoring complete.");
