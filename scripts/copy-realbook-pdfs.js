const fs = require('node:fs');
const path = require('node:path');

const sourceDirectory = path.resolve(__dirname, '../web-assets/realbooks');
const outputDirectory = path.resolve(__dirname, '../dist/realbooks');

const pdfFiles = fs.readdirSync(sourceDirectory).filter(file => file.toLowerCase().endsWith('.pdf'));

if (pdfFiles.length === 0) {
  throw new Error(`No Real Book PDFs found in ${sourceDirectory}`);
}

fs.mkdirSync(outputDirectory, { recursive: true });

for (const file of pdfFiles) {
  fs.copyFileSync(path.join(sourceDirectory, file), path.join(outputDirectory, file));
}

console.log(`Copied ${pdfFiles.length} Real Book PDFs to ${outputDirectory}`);
