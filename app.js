document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const pdfViewerContainer = document.getElementById('pdf-viewer');
    const pdfHighlighter = document.getElementById('pdf-highlighter');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const fitWidthBtn = document.getElementById('fit-width');
    const fitPageBtn = document.getElementById('fit-page');
    const highlighterToggle = document.getElementById('highlighter-toggle');

    // --- State Variables ---
    let pdfDoc = null;
    let currentPage = 1;
    let canvas = null;
    let ctx = null;
    let activeSoalElement = null;
    let isHighlighterActive = false;
    let zoomMode = 'page'; // 'page' or 'width'

    // --- Highlighter Toggle Logic ---
    const setHighlighterState = (isActive) => {
        isHighlighterActive = isActive;
        highlighterToggle.checked = isActive;
        localStorage.setItem('highlighterActive', isActive);
        if (!isActive) pdfHighlighter.style.visibility = 'hidden';
    };
    setHighlighterState(localStorage.getItem('highlighterActive') === 'true');
    highlighterToggle.addEventListener('change', (e) => setHighlighterState(e.target.checked));

    // --- PDF Rendering Logic ---
    const updateNavButtons = () => {
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= pdfDoc.numPages;
        fitWidthBtn.classList.toggle('active', zoomMode === 'width');
        fitPageBtn.classList.toggle('active', zoomMode === 'page');
    };

    const renderPage = (num) => {
        pdfDoc.getPage(num).then(page => {
            const viewerWidth = pdfViewerContainer.clientWidth;
            const viewerHeight = pdfViewerContainer.clientHeight;

            let viewport = page.getViewport({ scale: 1 }); // Start with default scale to get dimensions
            let scale;

            if (zoomMode === 'width') {
                scale = viewerWidth / viewport.width;
            } else { // 'page'
                const scaleX = viewerWidth / viewport.width;
                const scaleY = viewerHeight / viewport.height;
                scale = Math.min(scaleX, scaleY);
            }

            viewport = page.getViewport({ scale: scale });

            if (!canvas) {
                canvas = document.createElement('canvas');
                ctx = canvas.getContext('2d');
                pdfViewerContainer.innerHTML = ''; // Clear previous content
                pdfViewerContainer.appendChild(canvas);
            }
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = { canvasContext: ctx, viewport: viewport };
            page.render(renderContext).promise.then(() => {
                currentPage = num;
                updateNavButtons();
                pdfViewerContainer.scrollTop = 0; // Scroll to top of new page
            });
        });
    };

    const jumpToPage = (pageNum) => {
        if (pdfDoc && pageNum >= 1 && pageNum <= pdfDoc.numPages) {
            renderPage(pageNum);
        }
    };

    // --- Event Listeners ---
    prevPageBtn.addEventListener('click', () => (currentPage > 1) && jumpToPage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => (currentPage < pdfDoc.numPages) && jumpToPage(currentPage + 1));
    fitWidthBtn.addEventListener('click', () => { zoomMode = 'width'; renderPage(currentPage); });
    fitPageBtn.addEventListener('click', () => { zoomMode = 'page'; renderPage(currentPage); });

    pdfViewerContainer.addEventListener('mouseenter', () => isHighlighterActive && (pdfHighlighter.style.visibility = 'visible'));
    pdfViewerContainer.addEventListener('mouseleave', () => pdfHighlighter.style.visibility = 'hidden');
    pdfViewerContainer.addEventListener('mousemove', (e) => {
        if (isHighlighterActive) {
            const rect = pdfViewerContainer.getBoundingClientRect();
            // Adjust for scrolling inside the viewer
            const y = e.clientY - rect.top + pdfViewerContainer.scrollTop - (pdfHighlighter.offsetHeight / 2);
            pdfHighlighter.style.top = `${y}px`;
        }
    });

    // --- Initial Load ---
    const mushafUrl = './mushaf.pdf';
    pdfjsLib.getDocument(mushafUrl).promise.then(doc => {
        pdfDoc = doc;
        renderPage(currentPage);
    }).catch(err => {
        pdfViewerContainer.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Error: Tidak dapat memuat file <strong>mushaf.pdf</strong>.</p>`;
        console.error(err);
        document.querySelector('.pdf-navigation').style.display = 'none';
    });

    // --- Accordion Logic ---
    const updateParentMaxHeight = (element, change) => {
        let parent = element.parentElement;
        while (parent && (parent.classList.contains('paket-container') || parent.classList.contains('kategori-container'))) {
             if (parent.style.maxHeight) {
                parent.style.maxHeight = (parseInt(parent.style.maxHeight) + change) + 'px';
            }
            parent = parent.parentElement;
        }
    };

    fetch('soal.json').then(response => response.json()).then(data => {
        const menuSoalContainer = document.getElementById('menu-soal');
        data.kategori.forEach((kategori, katIndex) => {
            const kategoriDiv = document.createElement('div');
            kategoriDiv.classList.add('kategori-container');
            const kategoriTitle = document.createElement('div');
            kategoriTitle.classList.add('kategori-title');
            kategoriTitle.textContent = kategori.nama;
            kategoriDiv.appendChild(kategoriTitle);
            const paketContainer = document.createElement('div');
            paketContainer.classList.add('paket-container');

            kategori.paket.forEach((paket, pakIndex) => {
                const paketTitle = document.createElement('div');
                paketTitle.classList.add('paket-title');
                paketTitle.textContent = paket.nama;
                paketContainer.appendChild(paketTitle);
                const soalContainer = document.createElement('div');
                soalContainer.classList.add('soal-container');

                paket.soal.forEach((soal, soalIndex) => {
                    const soalDiv = document.createElement('div');
                    soalDiv.classList.add('soal');
                    soalDiv.textContent = soal.nama;
                    soalDiv.dataset.id = `soal-${katIndex}-${pakIndex}-${soalIndex}`;

                    soalDiv.addEventListener('click', () => {
                        jumpToPage(soal.halaman);
                        if (soal.deskripsi) soalDiv.textContent = soal.deskripsi;
                        if (activeSoalElement) activeSoalElement.classList.remove('soal-active');
                        soalDiv.classList.add('soal-active');
                        activeSoalElement = soalDiv;
                    });
                    soalContainer.appendChild(soalDiv);
                });

                paketContainer.appendChild(soalContainer);
                paketTitle.addEventListener('click', () => {
                    paketTitle.classList.toggle('active');
                    const change = soalContainer.scrollHeight;
                    if (soalContainer.style.maxHeight) {
                        soalContainer.style.maxHeight = null;
                        updateParentMaxHeight(paketTitle, -change);
                    } else {
                        soalContainer.style.maxHeight = change + "px";
                        updateParentMaxHeight(paketTitle, change);
                    }
                });
            });

            kategoriDiv.appendChild(paketContainer);
            menuSoalContainer.appendChild(kategoriDiv);
            kategoriTitle.addEventListener('click', () => {
                kategoriTitle.classList.toggle('active');
                const change = paketContainer.scrollHeight;
                paketContainer.style.maxHeight = paketContainer.style.maxHeight ? null : change + "px";
            });
        });
    }).catch(error => {
        document.getElementById('menu-soal').innerHTML = `<p style="color: red;">Error: Gagal memuat soal.json.</p>`;
        console.error('Error fetching soal.json:', error);
    });
});
