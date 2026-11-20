import * as pdfjs from '/pdfjs/pdf.mjs';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';

const allowedBooks = new Set([
  'realbook-a-flat.pdf',
  'realbook-a.pdf',
  'realbook-b-flat.pdf',
  'realbook-b.pdf',
  'realbook-c-sharp.pdf',
  'realbook-c.pdf',
  'realbook-d.pdf',
  'realbook-e-flat.pdf',
  'realbook-e.pdf',
  'realbook-f.pdf',
  'realbook-g-flat.pdf',
  'realbook-g.pdf',
]);

const params = new URLSearchParams(window.location.search);
const book = params.get('book');
const requestedPage = Number.parseInt(params.get('page') ?? '1', 10);
const status = document.querySelector('#status');
const canvas = document.querySelector('#page-canvas');
const pageInput = document.querySelector('#page');
const pageCount = document.querySelector('#page-count');
const previousButton = document.querySelector('#previous');
const nextButton = document.querySelector('#next');
const viewport = document.querySelector('#viewport');
const downloadLink = document.querySelector('#download');

let pdfDocument;
let pageNumber = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
let zoom = 1;
let renderTask;
let renderSequence = 0;

function showError(message) {
  status.textContent = message;
  status.dataset.error = 'true';
  canvas.style.display = 'none';
}

function updateControls() {
  pageInput.value = String(pageNumber);
  pageInput.max = String(pdfDocument.numPages);
  pageCount.textContent = String(pdfDocument.numPages);
  previousButton.disabled = pageNumber <= 1;
  nextButton.disabled = pageNumber >= pdfDocument.numPages;
}

async function renderPage() {
  if (!pdfDocument)
    return;

  const sequence = ++renderSequence;
  if (renderTask) {
    renderTask.cancel();
    renderTask = undefined;
  }

  try {
    const page = await pdfDocument.getPage(pageNumber);
    if (sequence !== renderSequence)
      return;

    const baseViewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(240, viewport.clientWidth - 40);
    const fitScale = Math.min(1.7, availableWidth / baseViewport.width);
    const pageViewport = page.getViewport({ scale: fitScale * zoom });
    const pixelRatio = window.devicePixelRatio || 1;
    const context = canvas.getContext('2d');

    canvas.width = Math.ceil(pageViewport.width * pixelRatio);
    canvas.height = Math.ceil(pageViewport.height * pixelRatio);
    canvas.style.width = `${pageViewport.width}px`;
    canvas.style.height = `${pageViewport.height}px`;
    canvas.style.display = 'block';
    viewport.scrollTop = 0;
    status.hidden = true;

    renderTask = page.render({
      canvasContext: context,
      viewport: pageViewport,
      transform: pixelRatio === 1 ? undefined : [pixelRatio, 0, 0, pixelRatio, 0, 0],
    });
    await renderTask.promise;
    if (sequence === renderSequence)
      renderTask = undefined;
  }
  catch (error) {
    if (error?.name !== 'RenderingCancelledException')
      showError('Could not render this page. Please reload and try again.');
  }
}

async function loadBook() {
  if (!allowedBooks.has(book)) {
    showError('This Real Book was not found.');
    return;
  }

  const pdfUrl = `/realbooks/${book}`;
  downloadLink.href = pdfUrl;
  try {
    pdfDocument = await pdfjs.getDocument({
      url: pdfUrl,
      cMapUrl: '/pdfjs/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: '/pdfjs/standard_fonts/',
    }).promise;
    pageNumber = Math.min(pageNumber, pdfDocument.numPages);
    updateControls();
    document.title = `${book.replace(/^realbook-/, '').replace(/\.pdf$/, '')} Real Book · OpenChords`;
    await renderPage();
  }
  catch {
    showError('Could not load this Real Book. Check your connection and try again.');
  }
}

previousButton.addEventListener('click', () => {
  if (pageNumber > 1) {
    pageNumber--;
    updateControls();
    void renderPage();
  }
});

nextButton.addEventListener('click', () => {
  if (pageNumber < pdfDocument.numPages) {
    pageNumber++;
    updateControls();
    void renderPage();
  }
});

pageInput.addEventListener('change', () => {
  const nextPage = Number.parseInt(pageInput.value, 10);
  if (Number.isInteger(nextPage))
    pageNumber = Math.min(Math.max(1, nextPage), pdfDocument.numPages);
  updateControls();
  void renderPage();
});

document.querySelector('#zoom-out').addEventListener('click', () => {
  zoom = Math.max(0.6, zoom - 0.2);
  void renderPage();
});

document.querySelector('#zoom-in').addEventListener('click', () => {
  zoom = Math.min(2.4, zoom + 0.2);
  void renderPage();
});

window.addEventListener('resize', () => void renderPage());
void loadBook();
