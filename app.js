document.addEventListener('DOMContentLoaded', () => {
    const menuSoalContainer = document.getElementById('menu-soal');
    const pdfViewerContainer = document.getElementById('pdf-viewer');
    const mushafUrl = './mushaf.pdf'; // Pastikan file mushaf.pdf ada di sini

    let pdfDoc = null;
    let currentPage = 1;
    let pdfScale = 1.5;
    let canvas = null;
    let ctx = null;

    // Fungsi untuk merender halaman PDF
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

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            page.render(renderContext);
            currentPage = num;
        });
    };

    // Muat PDF saat aplikasi pertama kali dibuka
    pdfjsLib.getDocument(mushafUrl).promise.then(doc => {
        pdfDoc = doc;
        renderPage(currentPage);
    }).catch(err => {
        pdfViewerContainer.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Error: Tidak dapat memuat file <strong>mushaf.pdf</strong>. Pastikan file tersebut ada di folder yang sama dengan aplikasi.</p>`;
        console.error(err);
    });

    // Fungsi untuk melompat ke halaman PDF
    const jumpToPage = pageNum => {
        if (pdfDoc && pageNum >= 1 && pageNum <= pdfDoc.numPages) {
            renderPage(pageNum);
        }
    };

    // Muat data soal dari soal.json dan bangun menu
    fetch('soal.json')
        .then(response => response.json())
        .then(data => {
            data.kategori.forEach(kategori => {
                // Buat elemen untuk kategori
                const kategoriDiv = document.createElement('div');
                kategoriDiv.classList.add('kategori-container');

                const kategoriTitle = document.createElement('div');
                kategoriTitle.classList.add('kategori-title');
                kategoriTitle.textContent = kategori.nama;
                kategoriDiv.appendChild(kategoriTitle);

                const paketContainer = document.createElement('div');
                paketContainer.classList.add('paket-container');

                kategori.paket.forEach(paket => {
                    // Buat elemen untuk paket
                    const paketTitle = document.createElement('div');
                    paketTitle.classList.add('paket-title');
                    paketTitle.textContent = paket.nama;
                    paketContainer.appendChild(paketTitle);

                    const soalContainer = document.createElement('div');
                    soalContainer.classList.add('soal-container');

                    paket.soal.forEach(soal => {
                        // Buat elemen untuk soal
                        const soalDiv = document.createElement('div');
                        soalDiv.classList.add('soal');
                        soalDiv.textContent = soal.nama;
                        soalDiv.addEventListener('click', () => {
                            jumpToPage(soal.halaman);
                        });
                        soalContainer.appendChild(soalDiv);
                    });

                    paketContainer.appendChild(soalContainer);

                    // Accordion logic untuk paket
                    paketTitle.addEventListener('click', () => {
                        paketTitle.classList.toggle('active');
                        if (soalContainer.style.maxHeight) {
                            soalContainer.style.maxHeight = null;
                        } else {
                            soalContainer.style.maxHeight = soalContainer.scrollHeight + "px";
                        }
                    });
                });

                kategoriDiv.appendChild(paketContainer);
                menuSoalContainer.appendChild(kategoriDiv);

                // Accordion logic untuk kategori
                kategoriTitle.addEventListener('click', () => {
                    kategoriTitle.classList.toggle('active');
                    if (paketContainer.style.maxHeight) {
                        paketContainer.style.maxHeight = null;
                    } else {
                        paketContainer.style.maxHeight = paketContainer.scrollHeight + "px";
                    }
                });
            });
        })
        .catch(error => {
            menuSoalContainer.innerHTML = `<p style="color: red;">Error: Gagal memuat soal.json.</p>`;
            console.error('Error fetching soal.json:', error);
        });
});
