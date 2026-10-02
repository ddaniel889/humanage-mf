const fs = require('node:fs');
const path = require('node:path');

const envPath = path.resolve(__dirname, '../src/environments/environment.ts');
const outDir = path.resolve(__dirname, '../public');
const outFile = path.join(outDir, 'version.json');

const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/version:\s*['"`](.*?)['"`]/);

if (!match) {
  throw new Error('Version not found in environment.ts');
}

const version = match[1];

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

const versionInfo = {
  project: 'mf-humanage-leaves',
  version,
  date: new Date().toISOString()
};

fs.writeFileSync(outFile, JSON.stringify(versionInfo, null, 2));
