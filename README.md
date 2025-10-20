# Aplikasi Musabaqoh Hifdzil Qur'an (MHQ)

Aplikasi web sederhana untuk menampilkan soal Musabaqoh Hifdzil Qur'an (MHQ) dalam format PDF. Aplikasi ini memungkinkan panitia untuk dengan mudah menampilkan halaman mushaf yang sesuai dengan soal yang dipilih dari menu.

## Fitur Utama

-   **Tampilan Mushaf PDF**: Menampilkan file `mushaf.pdf` langsung di browser menggunakan PDF.js.
-   **Menu Soal Dinamis**: Menu soal (kategori, paket, dan soal individu) dimuat dari file eksternal `soal.json`, sehingga mudah untuk disesuaikan tanpa mengubah kode.
-   **Navigasi Cepat**: Klik pada soal akan langsung membawa tampilan ke halaman PDF yang sesuai.
-   **Pengaturan Posisi Scroll**: Untuk setiap soal, posisi scroll vertikal pada halaman PDF dapat diatur (atas, tengah, atau bawah) untuk fokus yang lebih baik.
-   **Pengaturan via Web**: Halaman pengaturan (`settings.html`) memungkinkan untuk menambah, mengubah, dan menghapus soal, kategori, dan paket secara visual.
-   **Highlighter**: Fitur sorotan horizontal yang mengikuti kursor untuk membantu peserta fokus pada baris tertentu.
-   **Tema Gelap/Terang**: Pilihan tema untuk kenyamanan visual.
-   **Navigasi Halaman PDF**: Tombol untuk berpindah halaman, serta menyesuaikan tampilan (fit to page/width).

## Instalasi dan Penggunaan

Untuk menjalankan aplikasi ini di komputer lokal Anda, ikuti langkah-langkah berikut:

1.  **Prasyarat**:
    -   Pastikan Anda memiliki [Python](https://www.python.org/) terinstal di sistem Anda. Python akan digunakan untuk menjalankan server web sederhana.
    -   Pastikan Anda memiliki file `mushaf.pdf` dan `logo_pondok.png` di direktori utama proyek.

2.  **Clone Repositori (Opsional)**:
    Jika Anda mendapatkan kode ini dari repositori Git, clone terlebih dahulu:
    ```bash
    git clone <url-repositori>
    cd <nama-folder-repositori>
    ```

3.  **Jalankan Server Web**:
    Karena aplikasi ini memuat file (`soal.json`, `mushaf.pdf`) menggunakan `fetch`, aplikasi ini perlu dijalankan melalui server web untuk menghindari masalah CORS (Cross-Origin Resource Sharing). Cara termudah adalah menggunakan server bawaan Python.

    Buka terminal atau command prompt di direktori utama proyek, lalu jalankan perintah berikut:

    ```bash
    python -m http.server 8000
    ```
    Server akan berjalan di port 8000.

4.  **Buka Aplikasi**:
    Buka browser web Anda dan kunjungi alamat berikut:
    -   Aplikasi Utama: `http://localhost:8000`
    -   Halaman Pengaturan: `http://localhost:8000/settings.html`

## Konfigurasi Soal

Semua data soal disimpan dalam file `soal.json`. Anda bisa mengedit file ini secara manual atau menggunakan halaman pengaturan yang lebih ramah pengguna.

-   **Melalui Halaman Pengaturan (Disarankan)**:
    1.  Buka `http://localhost:8000/settings.html`.
    2.  Lakukan perubahan yang Anda inginkan (tambah/ubah/hapus kategori, paket, atau soal).
    3.  Atur halaman dan posisi scroll untuk setiap soal.
    4.  Klik tombol "Simpan & Unduh soal.json".
    5.  **Penting**: Ganti file `soal.json` yang ada di direktori proyek Anda dengan file yang baru saja Anda unduh.
    6.  Refresh halaman utama untuk melihat perubahan.

-   **Manual**:
    Anda juga bisa mengedit file `soal.json` secara langsung. Strukturnya adalah sebagai berikut:
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
                  "posisi": "tengah" // "atas", "tengah", atau "bawah"
                }
              ]
            }
          ]
        }
      ]
    }
    ```
