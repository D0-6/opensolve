@const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(path.join(__dirname, '..', 'app'), function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace max-w-[1250px] with max-w-[125rem] (2000px) and w-full
    let updated = content.replace(/max-w-\[1250px\]/g, 'w-full max-w-[125rem]');
    
    if (updated !== content) {
      fs.writeFileSync(filePath, updated);
      console.log(`Updated width in: ${filePath}`);
    }
  }
});
