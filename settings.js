document.addEventListener('DOMContentLoaded', () => {
    const editorContainer = document.getElementById('editor-container');
    const addKategoriBtn = document.getElementById('add-kategori-btn');
    const saveBtn = document.getElementById('save-btn');
    let soalData = null;

    // --- Fungsi Render ---
    const renderEditor = () => {
        editorContainer.innerHTML = '';
        if (!soalData || !soalData.kategori) return;
        soalData.kategori.forEach((kategori, katIndex) => {
            editorContainer.appendChild(createKategoriGroup(kategori, katIndex));
        });
    };

    const createKategoriGroup = (kategori, katIndex) => {
        const div = document.createElement('div');
        div.className = 'editor-group';
        div.innerHTML = `
            <label><b>Nama Kategori:</b></label>
            <input type="text" value="${kategori.nama}" class="kategori-name" data-kat-index="${katIndex}">
            <button class="btn btn-danger" data-kat-index="${katIndex}">Hapus Kategori</button>
            <hr>
        `;
        const paketContainer = document.createElement('div');
        kategori.paket.forEach((paket, pakIndex) => {
            paketContainer.appendChild(createPaketGroup(paket, katIndex, pakIndex));
        });
        div.appendChild(paketContainer);
        const addPaketBtn = document.createElement('button');
        addPaketBtn.textContent = 'Tambah Paket Soal';
        addPaketBtn.className = 'btn';
        addPaketBtn.dataset.katIndex = katIndex;
        addPaketBtn.addEventListener('click', addPaketHandler);
        div.appendChild(addPaketBtn);
        return div;
    };

    const createPaketGroup = (paket, katIndex, pakIndex) => {
        const div = document.createElement('div');
        div.className = 'editor-group paket-group';
        div.innerHTML = `
            <label>Nama Paket:</label>
            <input type="text" value="${paket.nama}" class="paket-name" data-kat-index="${katIndex}" data-pak-index="${pakIndex}">
            <button class="btn btn-danger" data-kat-index="${katIndex}" data-pak-index="${pakIndex}">Hapus Paket</button>
        `;
        const soalContainer = document.createElement('div');
        paket.soal.forEach((soal, soalIndex) => {
            soalContainer.appendChild(createSoalItem(soal, katIndex, pakIndex, soalIndex));
        });
        div.appendChild(soalContainer);
        const addSoalBtn = document.createElement('button');
        addSoalBtn.textContent = 'Tambah Soal';
        addSoalBtn.className = 'btn';
        addSoalBtn.dataset.katIndex = katIndex;
        addSoalBtn.dataset.pakIndex = pakIndex;
        addSoalBtn.addEventListener('click', addSoalHandler);
        div.appendChild(addSoalBtn);
        return div;
    };

    const createSoalItem = (soal, katIndex, pakIndex, soalIndex) => {
        const div = document.createElement('div');
        div.className = 'soal-item';
        const deskripsi = soal.deskripsi || '';
        const posisi = soal.posisi || 'atas'; // Default ke 'atas'
        div.innerHTML = `
            <input type="text" value="${soal.nama}" class="soal-name" placeholder="Nama Soal" data-kat-index="${katIndex}" data-pak-index="${pakIndex}" data-soal-index="${soalIndex}">
            <input type="number" value="${soal.halaman}" class="soal-halaman" placeholder="Halaman" data-kat-index="${katIndex}" data-pak-index="${pakIndex}" data-soal-index="${soalIndex}">
            <input type="text" value="${deskripsi}" class="soal-deskripsi" placeholder="Deskripsi (e.g., Al-Baqarah: 155)" data-kat-index="${katIndex}" data-pak-index="${pakIndex}" data-soal-index="${soalIndex}">
            <select class="soal-posisi" data-kat-index="${katIndex}" data-pak-index="${pakIndex}" data-soal-index="${soalIndex}">
                <option value="atas" ${posisi === 'atas' ? 'selected' : ''}>Atas</option>
                <option value="tengah" ${posisi === 'tengah' ? 'selected' : ''}>Tengah</option>
                <option value="bawah" ${posisi === 'bawah' ? 'selected' : ''}>Bawah</option>
            </select>
            <button class="btn btn-danger" data-kat-index="${katIndex}" data-pak-index="${pakIndex}" data-soal-index="${soalIndex}">Hapus</button>
        `;
        return div;
    };

    // --- Event Handlers untuk Tambah/Hapus ---
    const addKategoriHandler = () => {
        soalData.kategori.push({ nama: "Kategori Baru", paket: [] });
        renderEditor();
    };
    const addPaketHandler = (e) => {
        const { katIndex } = e.target.dataset;
        soalData.kategori[katIndex].paket.push({ nama: "Paket Baru", soal: [] });
        renderEditor();
    };
    const addSoalHandler = (e) => {
        const { katIndex, pakIndex } = e.target.dataset;
        // Tambahkan field deskripsi dan posisi saat membuat soal baru
        soalData.kategori[katIndex].paket[pakIndex].soal.push({ nama: "Soal Baru", halaman: 1, deskripsi: "", posisi: "atas" });
        renderEditor();
    };
    const deleteHandler = (e) => {
        if (!e.target.classList.contains('btn-danger')) return;
        const { katIndex, pakIndex, soalIndex } = e.target.dataset;
        if (soalIndex !== undefined) {
            soalData.kategori[katIndex].paket[pakIndex].soal.splice(soalIndex, 1);
        } else if (pakIndex !== undefined) {
            soalData.kategori[katIndex].paket.splice(pakIndex, 1);
        } else {
            soalData.kategori.splice(katIndex, 1);
        }
        renderEditor();
    };

    // --- Fungsi Simpan ---
    const saveAndDownload = () => {
        const newData = { kategori: [] };
        document.querySelectorAll('.editor-group:not(.paket-group)').forEach((katDiv, katIndex) => {
            const kategoriName = katDiv.querySelector(`.kategori-name[data-kat-index="${katIndex}"]`).value;
            const newKategori = { nama: kategoriName, paket: [] };
            katDiv.querySelectorAll(`.paket-group`).forEach((pakDiv) => {
                if (pakDiv.querySelector(`.paket-name[data-kat-index="${katIndex}"]`)) {
                    const pakIndex = pakDiv.querySelector('.paket-name').dataset.pakIndex;
                    const paketName = pakDiv.querySelector(`.paket-name[data-pak-index="${pakIndex}"]`).value;
                    const newPaket = { nama: paketName, soal: [] };
                    pakDiv.querySelectorAll('.soal-item').forEach((soalDiv) => {
                        const soalIndex = soalDiv.querySelector('.soal-name').dataset.soalIndex;
                        const soalName = soalDiv.querySelector(`.soal-name[data-soal-index="${soalIndex}"]`).value;
                        const soalHalaman = parseInt(soalDiv.querySelector(`.soal-halaman[data-soal-index="${soalIndex}"]`).value, 10);
                        const soalDeskripsi = soalDiv.querySelector(`.soal-deskripsi[data-soal-index="${soalIndex}"]`).value;
                        const soalPosisi = soalDiv.querySelector(`.soal-posisi[data-soal-index="${soalIndex}"]`).value;
                        newPaket.soal.push({ nama: soalName, halaman: soalHalaman, deskripsi: soalDeskripsi, posisi: soalPosisi });
                    });
                    newKategori.paket.push(newPaket);
                }
            });
            newData.kategori.push(newKategori);
        });

        const jsonString = JSON.stringify(newData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'soal.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('File soal.json berhasil dibuat! Ganti file yang lama dengan yang baru ini.');
    };

    // --- Inisialisasi ---
    fetch('soal.json')
        .then(response => {
            if (!response.ok) throw new Error("File not found");
            return response.json();
        })
        .then(data => {
            soalData = data;
            renderEditor();
        })
        .catch(error => {
            editorContainer.innerHTML = '<p style="color:red;"><b>Error:</b> Gagal memuat <code>soal.json</code>. Mungkin file tersebut belum ada. Anda bisa membuat struktur baru di sini dan menyimpannya.</p>';
            soalData = { kategori: [] };
            renderEditor();
        });

    addKategoriBtn.addEventListener('click', addKategoriHandler);
    editorContainer.addEventListener('click', deleteHandler);
    saveBtn.addEventListener('click', saveAndDownload);
});
