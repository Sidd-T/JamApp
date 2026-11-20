const fs = require('node:fs');
const path = require('node:path');

const sourceDirectory = path.resolve(__dirname, '../web-assets/realbooks');
const outputDirectory = path.resolve(__dirname, '../dist/realbooks');
const webAssetsDirectory = path.resolve(__dirname, '../web-assets');
const pdfjsBuildDirectory = path.dirname(require.resolve('pdfjs-dist/build/pdf.mjs'));
const pdfjsSourceDirectory = path.resolve(pdfjsBuildDirectory, '..');
const pdfjsOutputDirectory = path.resolve(__dirname, '../dist/pdfjs');

const pdfFiles = fs.readdirSync(sourceDirectory).filter(file => file.toLowerCase().endsWith('.pdf'));

if (pdfFiles.length === 0) {
  throw new Error(`No Real Book PDFs found in ${sourceDirectory}`);
}

fs.mkdirSync(outputDirectory, { recursive: true });

for (const file of pdfFiles) {
  fs.copyFileSync(path.join(sourceDirectory, file), path.join(outputDirectory, file));
}

fs.copyFileSync(
  path.join(webAssetsDirectory, 'realbook-viewer.html'),
  path.resolve(__dirname, '../dist/realbook-viewer.html'),
);
fs.copyFileSync(
  path.join(webAssetsDirectory, 'realbook-viewer.js'),
  path.resolve(__dirname, '../dist/realbook-viewer.mjs'),
);

fs.mkdirSync(pdfjsOutputDirectory, { recursive: true });
for (const file of ['pdf.mjs', 'pdf.worker.mjs']) {
  fs.copyFileSync(path.join(pdfjsBuildDirectory, file), path.join(pdfjsOutputDirectory, file));
}
for (const directory of ['cmaps', 'standard_fonts']) {
  fs.cpSync(path.join(pdfjsSourceDirectory, directory), path.join(pdfjsOutputDirectory, directory), { recursive: true });
}

console.log(`Copied ${pdfFiles.length} Real Book PDFs to ${outputDirectory}`);
