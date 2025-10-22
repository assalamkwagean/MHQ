# Aplikasi Musabaqoh Hifdzil Qur'an (MHQ)

Aplikasi web modern untuk menampilkan soal Musabaqoh Hifdzil Qur'an (MHQ) dalam format PDF dengan fitur-fitur canggih. Aplikasi ini memungkinkan panitia untuk dengan mudah menampilkan halaman mushaf yang sesuai dengan soal yang dipilih dari menu, baik dalam mode biasa maupun mode acak.

## ✨ Fitur Utama

### 📚 **Tampilan Mushaf PDF**
- Menampilkan file `mushaf.pdf` langsung di browser menggunakan PDF.js
- **Default fit width** untuk keterbacaan yang optimal
- Navigasi halaman dengan tombol atau keyboard (↑/↓)
- Zoom modes: Fit to Page dan Fit to Width

*Catatan : Download mushafnya di https://islamdownload.net/129945-download-mushaf-madinah-pdf.html dan **jangan lupa di rename menjadi mushaf.pdf***

### 🎯 **Dua Mode Menu Soal**
- **Mode Normal**: Menu soal terstruktur (kategori → paket → soal) dimuat dari `soal.json`
- **Mode Acak**: Generator soal acak dengan filter berdasarkan Juz (1-30)
- Toggle mudah antara kedua mode dengan switch yang elegan

### 🎲 **Generator Soal Acak**
- Pilih jumlah soal (1-7 soal)
- Filter berdasarkan Juz yang dipilih (multi-select)
- Loading animation yang menarik
- Hasil soal acak dengan navigasi langsung ke PDF

### 🎨 **Interface Modern**
- **Tema Gelap/Terang**: Pilihan tema untuk kenyamanan visual
- **Highlighter Cerdas**: Sorotan horizontal yang mengikuti kursor dengan ukuran yang lebih lebar
- **Design Responsif**: Optimal di desktop, tablet, dan mobile
- **Typography Modern**: Font Poppins untuk keterbacaan yang lebih baik

### ⚙️ **Pengaturan Lanjutan**
- Halaman pengaturan (`settings.html`) untuk mengelola soal secara visual
- Pengaturan posisi scroll (atas, tengah, bawah) untuk setiap soal
- Toggle highlighter dengan ikon candle/flame yang elegan
- Kontrol tema dengan animasi smooth

### 🎮 **Navigasi & Kontrol**
- Navigasi cepat dengan klik pada soal
- Tombol navigasi PDF dengan hover effects
- Keyboard shortcuts untuk navigasi halaman
- Smooth animations dan transitions

## 🚀 Instalasi dan Penggunaan

### Prasyarat
- [Python](https://www.python.org/) terinstal di sistem Anda
- File `mushaf.pdf` dan `logo_pondok.png` di direktori utama proyek
- Browser modern dengan dukungan JavaScript ES6+

### Langkah Instalasi

1. **Clone atau Download Proyek**
   ```bash
   git clone <url-repositori>
   cd MHQ-fitur-soal-acak
   ```

2. **Jalankan Server Web**
   ```bash
   python -m http.server 8000
   ```
   Server akan berjalan di port 8000.

3. **Akses Aplikasi**
   - **Aplikasi Utama**: `http://localhost:8000`
   - **Halaman Pengaturan**: `http://localhost:8000/settings.html`

## 📋 Konfigurasi Soal

### Mode Normal - File soal.json
Semua data soal disimpan dalam file `soal.json` dengan struktur hierarkis:

```json
{
  "kategori": [
    {
      "nama": "Nama Kategori",
      "paket": [
        {
          "nama": "Nama Paket",
          "soal": [
            {
              "nama": "Soal 1",
              "halaman": 123,
              "deskripsi": "Deskripsi singkat soal",
              "posisi": "tengah"
            }
          ]
        }
      ]
    }
  ]
}
```

### Mode Acak - File bank-soal.json
Database soal acak dengan struktur yang lebih sederhana:

```json
[
  {
    "halaman": 15,
    "posisi": "tengah",
    "deskripsi": "Soal tentang...",
    "juz": 1
  }
]
```

### Menggunakan Halaman Pengaturan
1. Buka `http://localhost:8000/settings.html`
2. Lakukan perubahan (tambah/ubah/hapus kategori, paket, atau soal)
3. Atur halaman dan posisi scroll untuk setiap soal
4. Klik "Simpan & Unduh soal.json"
5. Ganti file `soal.json` di direktori proyek
6. Refresh halaman utama untuk melihat perubahan

## 🎮 Cara Penggunaan

### Mode Normal
1. Pilih kategori dari menu accordion
2. Pilih paket yang diinginkan
3. Klik soal untuk langsung ke halaman PDF yang sesuai

### Mode Acak
1. Toggle switch ke mode "Acak"
2. Pilih jumlah soal (1-7)
3. Pilih Juz yang diinginkan (opsional)
4. Klik "Acak Soal"
5. Tunggu loading animation selesai
6. Klik soal hasil acak untuk navigasi ke PDF

### Kontrol PDF
- **Navigasi**: Gunakan tombol ▲/▼ atau keyboard arrow keys
- **Zoom**: Tombol ↔ (fit width) dan ↕ (fit page)
- **Highlighter**: Toggle dengan ikon candle untuk sorotan mengikuti kursor

## 🎨 Customization

### Tema
- Toggle tema gelap/terang dengan tombol 🌙
- Semua warna menggunakan CSS variables untuk kemudahan kustomisasi

### Styling
- Font: Poppins (Google Fonts)
- Color scheme: Modern dengan CSS variables
- Responsive breakpoints: 768px dan 480px

## 📱 Responsive Design

Aplikasi dioptimalkan untuk berbagai ukuran layar:
- **Desktop**: Layout sidebar + content
- **Tablet**: Layout stacked dengan sidebar di atas
- **Mobile**: Kontrol yang touch-friendly dengan ukuran yang disesuaikan

## 🔧 Teknologi yang Digunakan

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **PDF Rendering**: PDF.js
- **Styling**: CSS Variables, Flexbox, Grid
- **Icons**: SVG icons dan emoji
- **Fonts**: Google Fonts (Poppins)

## 📄 Struktur File

```
FOLDER APLIKASI/
├── index.html          # Halaman utama
├── settings.html       # Halaman pengaturan
├── style.css          # Styling utama
├── app.js             # Logic aplikasi
├── theme.js           # Logic tema
├── settings.js        # Logic pengaturan
├── soal.json          # Database soal normal
├── bank-soal.json     # Database soal acak
├── mushaf.pdf         # File PDF mushaf
├── logo.png           # Logo aplikasi
└── README.md          # Dokumentasi
```

## 🐛 Troubleshooting

### Masalah Umum
1. **CORS Error**: Pastikan menjalankan melalui server web (bukan file://)
2. **PDF tidak muncul**: Pastikan file `mushaf.pdf` ada di direktori utama
3. **Soal tidak muncul**: Periksa struktur file `soal.json` atau `bank-soal.json`

### Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive support

## 📝 Changelog

### v2.0.0 - Latest Updates
- ✨ Added random question generator with Juz filtering
- 🎨 Modernized UI with Poppins font and improved styling
- 🔧 Enhanced highlighter with candle/flame icon
- 📱 Improved responsive design
- ⚡ Better performance and smooth animations
- 🎯 Default PDF mode set to fit width
- 🔄 Toggle between Normal and Random modes

### v1.0.0 - Initial Release
- Basic PDF viewer with soal navigation
- Settings page for soal management
- Dark/Light theme toggle
- Highlighter feature
- Responsive design

## 📞 Support

Untuk pertanyaan atau masalah teknis, silakan buat issue di repository atau hubungi tim pengembang.

---

**Dikembangkan untuk Pondok As-Salam Fathul Ulum Kwagean** 🕌
