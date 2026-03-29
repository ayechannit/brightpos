const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes('Button') || !content.includes('@mui/material')) return;

  const muiImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@mui\/material['"];?/g;
  let replaced = false;

  content = content.replace(muiImportRegex, (match, p1) => {
    const parts = p1.split(',').map(s => s.trim());
    if (parts.includes('Button')) {
      replaced = true;
      const newParts = parts.filter(s => s !== 'Button' && s !== '');
      if (newParts.length > 0) {
        return `import { ${newParts.join(', ')} } from '@mui/material';`;
      } else {
        return '';
      }
    }
    return match;
  });

  if (replaced) {
    let relativePath = '';
    const normalizedPath = filePath.replace(/\\/g, '/');
    if (normalizedPath.includes('src/pages')) {
      relativePath = '../components/LoadingButton';
    } else if (normalizedPath.includes('src/components')) {
      relativePath = './LoadingButton';
    } else {
      relativePath = './components/LoadingButton';
    }
    
    const importStatement = `import Button from '${relativePath}';\n`;
    
    // insert right after the last import statement
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const endOfLastImport = content.indexOf('\n', lastImportIndex);
      content = content.substring(0, endOfLastImport + 1) + importStatement + content.substring(endOfLastImport + 1);
    } else {
      content = importStatement + content;
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') && file !== 'LoadingButton.jsx') {
      processFile(fullPath);
    }
  }
}

walk('frontend/src');
