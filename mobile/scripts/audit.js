const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.expo') continue;
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (/\.(ts|tsx)$/.test(file)) {
      results.push(full);
    }
  }
  return results;
}

const files = walk('src').concat(walk('app'));
const over350 = [];
const routeFiles = [];

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n').length;
  if (lines > 350) {
    over350.push({ file, lines });
  }
  if (file.startsWith('app' + path.sep) && !file.includes('_layout')) {
    routeFiles.push({ file, lines });
  }
});

console.log('=== BOLAJON ERP MOBILE AUDIT ===');
console.log(`Total TypeScript files scanned: ${files.length}`);
console.log(`Files exceeding 350 lines: ${over350.length}`);
if (over350.length > 0) {
  console.error('VIOLATION: Following files exceed 350 lines:');
  over350.forEach((f) => console.error(`  - ${f.file}: ${f.lines} lines`));
  process.exit(1);
} else {
  console.log('✓ ALL FILES STRICTLY <= 350 LINES: PASSED!');
}

console.log('\n=== THIN ROUTE AUDIT (app/ routes should be <= 35 lines) ===');
let thinRoutesPassed = true;
routeFiles.forEach((r) => {
  console.log(`  - ${r.file}: ${r.lines} lines`);
  if (r.lines > 35) thinRoutesPassed = false;
});
if (thinRoutesPassed) {
  console.log('✓ ALL APP ROUTES ARE THIN WRAPPERS: PASSED!');
} else {
  console.error('VIOLATION: Some routes are not thin wrappers');
  process.exit(1);
}
