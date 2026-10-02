const fs = require('node:fs');
const path = require('node:path');

const stylesPath = path.join(__dirname, '..', 'src', 'styles.scss');
const now = new Date();

fs.utimesSync(stylesPath, now, now);
console.log('Styles file touched - triggering Tailwind rebuild');
