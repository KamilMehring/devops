const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

fs.mkdirSync(dist, { recursive: true });

const filesToCopy = ['server.js', 'package.json'];

for (const file of filesToCopy) {
  const src = path.join(root, file);
  const dest = path.join(dist, file);
  fs.copyFileSync(src, dest);
}

fs.writeFileSync(
  path.join(dist, 'build-info.txt'),
  `Build time: ${new Date().toISOString()}\n`,
  'utf8'
);

console.log('Build finished successfully.');
console.log('Files in dist:', fs.readdirSync(dist).join(', '));