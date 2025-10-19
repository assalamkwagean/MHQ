document.addEventListener('DOMContentLoaded', () => {
    const menuSoalContainer = document.getElementById('menu-soal');
    const pdfViewerContainer = document.getElementById('pdf-viewer');
    const mushafUrl = './mushaf.pdf';

    let pdfDoc = null;
    let currentPage = 1;
    let pdfScale = 1.5;
    let canvas = null;
    let ctx = null;
    let activeSoalElement = null;

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
            page.render(renderContext);
            currentPage = num;
        });
    };

    pdfjsLib.getDocument(mushafUrl).promise.then(doc => {
        pdfDoc = doc;
        renderPage(currentPage);
    }).catch(err => {
        pdfViewerContainer.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Error: Tidak dapat memuat file <strong>mushaf.pdf</strong>.</p>`;
        console.error(err);
    });

    const jumpToPage = pageNum => {
        if (pdfDoc && pageNum >= 1 && pageNum <= pdfDoc.numPages) {
            renderPage(pageNum);
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
                        soalDiv.dataset.id = `soal-${katIndex}-${pakIndex}-${soalIndex}`; // Add unique stable ID

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
                        soalContainer.style.maxHeight = soalContainer.style.maxHeight ? null : soalContainer.scrollHeight + "px";
                    });
                });

                kategoriDiv.appendChild(paketContainer);
                menuSoalContainer.appendChild(kategoriDiv);
                kategoriTitle.addEventListener('click', () => {
                    kategoriTitle.classList.toggle('active');
                    paketContainer.style.maxHeight = paketContainer.style.maxHeight ? null : paketContainer.scrollHeight + "px";
                });
            });
        })
        .catch(error => {
            menuSoalContainer.innerHTML = `<p style="color: red;">Error: Gagal memuat soal.json.</p>`;
            console.error('Error fetching soal.json:', error);
        });
});
