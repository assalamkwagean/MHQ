document.addEventListener('DOMContentLoaded', () => {
    const menuSoalContainer = document.getElementById('menu-soal');
    const pdfViewerContainer = document.getElementById('pdf-viewer');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const mushafUrl = './mushaf.pdf';

    let pdfDoc = null;
    let currentPage = 1;
    let pdfScale = 1.5;
    let canvas = null;
    let ctx = null;
    let activeSoalElement = null;

    const updateNavButtons = () => {
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= pdfDoc.numPages;
    };

    const renderPage = num => {
        pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: pdfScale });
            if (!canvas) {
                canvas = document.createElement('canvas');
                ctx = canvas.getContext('2d');
                pdfViewerContainer.appendChild(canvas);
            }
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            const renderContext = { canvasContext: ctx, viewport: viewport };
            page.render(renderContext).promise.then(() => {
                currentPage = num;
                updateNavButtons();
            });
        });
    };

    pdfjsLib.getDocument(mushafUrl).promise.then(doc => {
        pdfDoc = doc;
        renderPage(currentPage);
    }).catch(err => {
        pdfViewerContainer.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Error: Tidak dapat memuat file <strong>mushaf.pdf</strong>.</p>`;
        console.error(err);
        document.querySelector('.pdf-navigation').style.display = 'none';
    });

    const jumpToPage = pageNum => {
        if (pdfDoc && pageNum >= 1 && pageNum <= pdfDoc.numPages) {
            renderPage(pageNum);
        }
    };

    prevPageBtn.addEventListener('click', () => {
        if (currentPage <= 1) return;
        jumpToPage(currentPage - 1);
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage >= pdfDoc.numPages) return;
        jumpToPage(currentPage + 1);
    });

    // --- Accordion Logic ---
    const updateParentMaxHeight = (element, change) => {
        let parent = element.parentElement;
        while (parent && parent.classList.contains('paket-container') || parent.classList.contains('kategori-container')) {
             if (parent.style.maxHeight) {
                parent.style.maxHeight = (parseInt(parent.style.maxHeight) + change) + 'px';
            }
            parent = parent.parentElement;
        }
    };

    fetch('soal.json')
        .then(response => response.json())
        .then(data => {
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
                            if (soal.deskripsi) {
                                soalDiv.textContent = soal.deskripsi;
                            }
                            if (activeSoalElement) {
                                activeSoalElement.classList.remove('soal-active');
                            }
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
                    if (paketContainer.style.maxHeight) {
                        paketContainer.style.maxHeight = null;
                    } else {
                        paketContainer.style.maxHeight = change + "px";
                    }
                });
            });
        })
        .catch(error => {
            menuSoalContainer.innerHTML = `<p style="color: red;">Error: Gagal memuat soal.json.</p>`;
            console.error('Error fetching soal.json:', error);
        });
});
