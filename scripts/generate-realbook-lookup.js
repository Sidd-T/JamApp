const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const standardsPath = path.join(projectRoot, 'data/jazz-standards.json');
const indexDirectory = path.join(projectRoot, 'data/realbook-index');
const outputPath = path.join(indexDirectory, 'realbook-pages.generated.json');

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let field = '';
  let insideQuotes = false;

  for (let index = 0; index < csv.length; index++) {
    const character = csv[index];

    if (character === '"') {
      if (insideQuotes && csv[index + 1] === '"') {
        field += '"';
        index++;
      }
      else {
        insideQuotes = !insideQuotes;
      }
    }
    else if (character === ',' && !insideQuotes) {
      row.push(field);
      field = '';
    }
    else if ((character === '\n' || character === '\r') && !insideQuotes) {
      if (character === '\r' && csv[index + 1] === '\n')
        index++;
      row.push(field);
      if (row.some(value => value !== ''))
        rows.push(row);
      row = [];
      field = '';
    }
    else {
      field += character;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...records] = rows;
  if (!headers)
    throw new Error('CSV file has no header row');

  return records.map((values) => {
    if (values.length !== headers.length)
      throw new Error(`CSV row has ${values.length} fields; expected ${headers.length}`);
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
}

function normalizeTitle(title) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

const standards = JSON.parse(fs.readFileSync(standardsPath, 'utf8'));
const bookFiles = fs.readdirSync(indexDirectory)
  .filter(file => /^realbook-.+\.csv$/i.test(file))
  .sort();

if (bookFiles.length === 0)
  throw new Error(`No Real Book CSV files found in ${indexDirectory}`);

const indexesByBook = new Map();

for (const file of bookFiles) {
  const bookKey = path.basename(file, '.csv').replace(/^realbook-/i, '');
  const csv = fs.readFileSync(path.join(indexDirectory, file), 'utf8').replace(/^\uFEFF/, '');
  const rows = parseCsv(csv);
  const firstPrintedPage = Number(rows[0]?.['Start Page']);

  if (!Number.isInteger(firstPrintedPage))
    throw new Error(`${file} has an invalid first Start Page`);

  const titles = new Map();
  for (const row of rows) {
    const normalizedTitle = normalizeTitle(row.Title);
    const startPage = Number(row['Start Page']);
    const endPage = Number(row['End Page']);

    if (!normalizedTitle || !Number.isInteger(startPage) || !Number.isInteger(endPage))
      throw new Error(`${file} contains an invalid title or page range`);
    if (titles.has(normalizedTitle))
      throw new Error(`${file} contains duplicate normalized title: ${row.Title}`);

    titles.set(normalizedTitle, {
      startPage: startPage - firstPrintedPage + 1,
      endPage: endPage - firstPrintedPage + 1,
    });
  }

  indexesByBook.set(bookKey, titles);
}

const lookup = {};
for (const standard of standards) {
  const normalizedTitle = normalizeTitle(standard.Title);
  const bookPages = Object.fromEntries(
    [...indexesByBook].flatMap(([bookKey, titles]) => {
      const pages = titles.get(normalizedTitle);
      return pages ? [[bookKey, pages]] : [];
    }),
  );

  if (Object.keys(bookPages).length > 0)
    lookup[standard.Title.trim()] = bookPages;
}

fs.writeFileSync(outputPath, `${JSON.stringify(lookup, null, 2)}\n`);
console.log(`Generated ${Object.keys(lookup).length} matched standards from ${bookFiles.length} book indexes`);
