document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selectors ---
    const pdfViewerContainer = document.getElementById('pdf-viewer');
    const pdfHighlighter = document.getElementById('pdf-highlighter');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const fitWidthBtn = document.getElementById('fit-width');
    const fitPageBtn = document.getElementById('fit-page');
    const highlighterToggle = document.getElementById('highlighter-toggle');
    const fullscreenToggle = document.getElementById('fullscreen-toggle');

    // --- State Variables ---
    let pdfDoc = null;
    let currentPage = 1;
    let canvas = null;
    let ctx = null;
    let activeSoalElement = null;
    let isHighlighterActive = false;
    let zoomMode = 'width'; // 'page' or 'width'
    let currentViewport = null; // Store current viewport for highlighter calculations
    let canvasOffset = { x: 0, y: 0 }; // Store canvas offset for stable positioning
    let lastMouseEvent = null; // Track last mousemove event for scroll updates

    // --- Highlighter Toggle Logic ---
    const setHighlighterState = (isActive) => {
        isHighlighterActive = isActive;
        highlighterToggle.checked = isActive;
        localStorage.setItem('highlighterActive', isActive);
        if (!isActive) pdfHighlighter.style.visibility = 'hidden';
    };
    setHighlighterState(localStorage.getItem('highlighterActive') === 'true');
    highlighterToggle.addEventListener('change', (e) => setHighlighterState(e.target.checked));

    // --- Menu Type Toggle Logic ---
    const menuTypeToggle = document.getElementById('menu-type-toggle');
    const menuSoalContainer = document.getElementById('menu-soal');
    const menuAcakContainer = document.querySelector('.menu-acak-container');

    menuTypeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            // Show Acak Menu
            menuSoalContainer.style.display = 'none';
            menuAcakContainer.style.display = 'block';
        } else {
            // Show Biasa Menu
            menuSoalContainer.style.display = 'block';
            menuAcakContainer.style.display = 'none';
        }
    });

    // --- PDF Rendering Logic ---
    const updateNavButtons = () => {
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= pdfDoc.numPages;
        fitWidthBtn.classList.toggle('active', zoomMode === 'width');
        fitPageBtn.classList.toggle('active', zoomMode === 'page');
    };

    const renderPage = (num, posisi = 'atas') => {
        pdfDoc.getPage(num).then(page => {
            const viewerWidth = pdfViewerContainer.clientWidth;
            const viewerHeight = pdfViewerContainer.clientHeight;

            let viewport = page.getViewport({ scale: 1 });
            let scale;

            if (zoomMode === 'width') {
                scale = viewerWidth / viewport.width;
            } else {
                const scaleX = viewerWidth / viewport.width;
                const scaleY = viewerHeight / viewport.height;
                scale = Math.min(scaleX, scaleY);
            }

            viewport = page.getViewport({ scale: scale });
            currentViewport = viewport;

            if (!canvas) {
                canvas = document.createElement('canvas');
                ctx = canvas.getContext('2d');
                pdfViewerContainer.innerHTML = '';
                pdfViewerContainer.appendChild(canvas);
            }
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = { canvasContext: ctx, viewport: viewport };
            page.render(renderContext).promise.then(() => {
                currentPage = num;
                updateNavButtons();

                // Scroll based on position
                if (posisi === 'tengah') {
                    pdfViewerContainer.scrollTop = (pdfViewerContainer.scrollHeight - pdfViewerContainer.clientHeight) / 2;
                } else if (posisi === 'bawah') {
                    pdfViewerContainer.scrollTop = pdfViewerContainer.scrollHeight;
                } else {
                    pdfViewerContainer.scrollTop = 0;
                }
                
                setTimeout(updateCanvasOffset, 10);
            });
        });
    };

    const jumpToPage = (pageNum, posisi) => {
        if (pdfDoc && pageNum >= 1 && pageNum <= pdfDoc.numPages) {
            renderPage(pageNum, posisi);
        }
    };

    // --- Event Listeners ---
    prevPageBtn.addEventListener('click', () => (currentPage > 1) && jumpToPage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => (currentPage < pdfDoc.numPages) && jumpToPage(currentPage + 1));
    fitWidthBtn.addEventListener('click', () => { zoomMode = 'width'; renderPage(currentPage); });
    fitPageBtn.addEventListener('click', () => { zoomMode = 'page'; renderPage(currentPage); });

    fullscreenToggle.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });

    pdfViewerContainer.addEventListener('mouseenter', () => isHighlighterActive && (pdfHighlighter.style.visibility = 'visible'));
    pdfViewerContainer.addEventListener('mouseleave', () => pdfHighlighter.style.visibility = 'hidden');
    // --- Universal Highlighter Function ---
    const updateHighlighter = (e) => {
        if (!isHighlighterActive || !canvas || !currentViewport) return;
        
        // Hitung langsung relatif terhadap .content agar tidak double-count scroll
        const content = document.querySelector('.content');
        if (!content) return;
        const contentRect = content.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        
        // Batas canvas di dalam koordinat .content (CSS pixel)
        const canvasTopInContent = canvasRect.top - contentRect.top;
        const canvasBottomInContent = canvasRect.bottom - contentRect.top;
        
        // Target posisi top highlighter relatif ke .content
        const desiredTop = e.clientY - contentRect.top - (pdfHighlighter.offsetHeight / 2);
        
        // Clamp agar tetap di dalam area canvas
        const minTop = canvasTopInContent;
        const maxTop = canvasBottomInContent - pdfHighlighter.offsetHeight;
        const clampedTop = Math.max(minTop, Math.min(desiredTop, maxTop));
        
        pdfHighlighter.style.top = `${clampedTop}px`;
    };

    // --- Update Canvas Offset on Scroll ---
    const updateCanvasOffset = () => {
        if (canvas) {
            const rect = pdfViewerContainer.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            canvasOffset.x = canvasRect.left - rect.left;
            canvasOffset.y = canvasRect.top - rect.top;
        }
    };

    // --- Event Listeners ---
    pdfViewerContainer.addEventListener('mousemove', (e) => {
        lastMouseEvent = e;
        updateHighlighter(e);
    });
    pdfViewerContainer.addEventListener('scroll', () => {
        updateCanvasOffset();
        if (lastMouseEvent) updateHighlighter(lastMouseEvent);
    });
    pdfViewerContainer.addEventListener('wheel', () => {
        // Ensure highlighter stays aligned during wheel scrolling
        updateCanvasOffset();
        if (lastMouseEvent) updateHighlighter(lastMouseEvent);
    }, { passive: true });
    window.addEventListener('resize', () => {
        updateCanvasOffset();
        if (lastMouseEvent) updateHighlighter(lastMouseEvent);
    });

    // --- Keyboard Navigation (Arrow Up/Down) ---
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        // Ignore when typing in inputs/textareas/contenteditable
        const target = e.target;
        const tag = (target && target.tagName ? target.tagName.toLowerCase() : '');
        if (tag === 'input' || tag === 'textarea' || (target && target.isContentEditable)) return;

        if (e.key === 'ArrowUp' && currentPage > 1) {
            e.preventDefault();
            jumpToPage(currentPage - 1);
        } else if (e.key === 'ArrowDown' && pdfDoc && currentPage < pdfDoc.numPages) {
            e.preventDefault();
            jumpToPage(currentPage + 1);
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

        const createAccordionIcon = () => {
            const iconSpan = document.createElement('span');
            iconSpan.classList.add('accordion-icon');
            iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-right"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
            return iconSpan;
        };

        data.kategori.forEach((kategori, katIndex) => {
            const kategoriDiv = document.createElement('div');
            kategoriDiv.classList.add('kategori-container');

            const kategoriTitle = document.createElement('div');
            kategoriTitle.classList.add('kategori-title');
            const kategoriTitleText = document.createElement('span');
            kategoriTitleText.textContent = kategori.nama;
            kategoriTitle.appendChild(kategoriTitleText);
            kategoriTitle.appendChild(createAccordionIcon());

            kategoriDiv.appendChild(kategoriTitle);
            const paketContainer = document.createElement('div');
            paketContainer.classList.add('paket-container');

            kategori.paket.forEach((paket, pakIndex) => {
                const paketTitle = document.createElement('div');
                paketTitle.classList.add('paket-title');
                const paketTitleText = document.createElement('span');
                paketTitleText.textContent = paket.nama;
                paketTitle.appendChild(paketTitleText);
                paketTitle.appendChild(createAccordionIcon());

                paketContainer.appendChild(paketTitle);
                const soalContainer = document.createElement('div');
                soalContainer.classList.add('soal-container');

                paket.soal.forEach((soal, soalIndex) => {
                    const soalDiv = document.createElement('div');
                    soalDiv.classList.add('soal');
                    soalDiv.textContent = soal.nama;
                    soalDiv.dataset.id = `soal-${katIndex}-${pakIndex}-${soalIndex}`;

                    soalDiv.addEventListener('click', () => {
                        jumpToPage(soal.halaman, soal.posisi);
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

    // --- SOAL ACAK LOGIC ---
    const acakButton = document.getElementById('acak-button');
    const jumlahSoalInput = document.getElementById('jumlah-soal');
    const loaderContainer = document.getElementById('loader-container');
    const hasilAcakContainer = document.getElementById('hasil-acak-container');
    const juzButtonsContainer = document.getElementById('juz-buttons');

    let bankSoal = [];
    let selectedJuz = [];

    // 1. Load Bank Soal
    fetch('bank-soal.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            bankSoal = data;
        })
        .catch(error => {
            hasilAcakContainer.innerHTML = `<p style="color: red;">Error: Gagal memuat bank-soal.json.</p>`;
            console.error('Error fetching bank-soal.json:', error);
            acakButton.disabled = true;
        });

    // 2. Juz Selection Logic (Multi-select)
    juzButtonsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('juz-btn')) {
            const juz = parseInt(e.target.dataset.juz, 10);
            e.target.classList.toggle('active');

            if (e.target.classList.contains('active')) {
                // Add to list if not already present
                if (!selectedJuz.includes(juz)) {
                    selectedJuz.push(juz);
                }
            } else {
                // Remove from list
                const index = selectedJuz.indexOf(juz);
                if (index > -1) {
                    selectedJuz.splice(index, 1);
                }
            }
        }
    });

    // 3. Acak Button Logic
    acakButton.addEventListener('click', () => {
        // Clear previous results
        hasilAcakContainer.innerHTML = '';
        // Show loader
        loaderContainer.style.display = 'flex';

        setTimeout(() => {
            let filteredSoal = [];

            // Filter by Juz if any are selected
            if (selectedJuz.length > 0) {
                filteredSoal = bankSoal.filter(soal => selectedJuz.includes(soal.juz));
            } else {
                // If no juz is selected, use all questions
                filteredSoal = bankSoal;
            }

            if (filteredSoal.length === 0) {
                 hasilAcakContainer.innerHTML = `<p style="color: var(--text-secondary);">Tidak ada soal ditemukan untuk kriteria yang dipilih.</p>`;
                 loaderContainer.style.display = 'none';
                 return;
            }

            // Shuffle the array
            const shuffledSoal = [...filteredSoal].sort(() => 0.5 - Math.random());

            // Get the requested number of questions
            const jumlahSoal = parseInt(jumlahSoalInput.value, 10);
            const selectedSoal = shuffledSoal.slice(0, jumlahSoal);

            // Hide loader
            loaderContainer.style.display = 'none';

            // 4. Display results
            selectedSoal.forEach((soal, index) => {
                const soalDiv = document.createElement('div');
                soalDiv.classList.add('soal');
                soalDiv.textContent = `Soal ${index + 1}`;

                soalDiv.addEventListener('click', () => {
                    jumpToPage(soal.halaman, soal.posisi);
                    if (soal.deskripsi) {
                        soalDiv.textContent = soal.deskripsi;
                    }
                    // Handle active state for random questions
                    if (activeSoalElement) {
                        activeSoalElement.classList.remove('soal-active');
                    }
                    document.querySelectorAll('#hasil-acak-container .soal').forEach(el => el.classList.remove('soal-active'));
                    soalDiv.classList.add('soal-active');
                    activeSoalElement = soalDiv;
                });
                hasilAcakContainer.appendChild(soalDiv);
            });

        }, 1500); // Simulate loading time
    });
});
