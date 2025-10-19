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

    // Recalculate open accordion heights (useful after PDF render or window resize)
    const adjustOpenHeights = () => {
        document.querySelectorAll('.paket-container, .soal-container').forEach(container => {
            if (container.style.maxHeight) {
                // set to current scrollHeight to keep it open after layout changes
                container.style.maxHeight = container.scrollHeight + 'px';
            }
        });
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
                        // Pastikan klik pada item soal tidak memicu event parent (accordion toggle)
                        soalDiv.addEventListener('click', (e) => {
                            e.stopPropagation();
                            jumpToPage(soal.halaman);
                            // adjust heights in case rendering the PDF changes layout
                            requestAnimationFrame(adjustOpenHeights);
                        });
                        soalContainer.appendChild(soalDiv);
                    });

                    paketContainer.appendChild(soalContainer);

                    // Accordion logic untuk paket
                    paketTitle.addEventListener('click', (e) => {
                        e.stopPropagation();
                        paketTitle.classList.toggle('active');
                        if (soalContainer.style.maxHeight) {
                            soalContainer.style.maxHeight = null;
                        } else {
                            // use requestAnimationFrame to ensure accurate scrollHeight after style changes
                            requestAnimationFrame(() => {
                                soalContainer.style.maxHeight = soalContainer.scrollHeight + "px";
                            });
                        }
                    });
                });

                kategoriDiv.appendChild(paketContainer);
                menuSoalContainer.appendChild(kategoriDiv);

                // Accordion logic untuk kategori
                kategoriTitle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    kategoriTitle.classList.toggle('active');
                    if (paketContainer.style.maxHeight) {
                        paketContainer.style.maxHeight = null;
                    } else {
                        requestAnimationFrame(() => {
                            paketContainer.style.maxHeight = paketContainer.scrollHeight + "px";
                        });
                    }
                });
            });
            // Jika ada perubahan ukuran jendela atau PDF yang dirender, perbaiki tinggi accordion
            window.addEventListener('resize', adjustOpenHeights);
            // Pastikan tinggi dihitung ulang setelah PDF dimuat/render
            // (renderPage sudah memanggil page.render; kita panggil adjust pada frame berikutnya)
            requestAnimationFrame(adjustOpenHeights);
        })
        .catch(error => {
            menuSoalContainer.innerHTML = `<p style="color: red;">Error: Gagal memuat soal.json.</p>`;
            console.error('Error fetching soal.json:', error);
        });
});
