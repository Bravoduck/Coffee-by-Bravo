# ☕ Coffee by Bravo

**Kualitas Premium, Harga yang Terjangkau.**

Selamat datang di Coffee by Bravo, sebuah aplikasi web pemesanan kopi modern yang dirancang untuk memberikan pengalaman kafe premium dengan kemudahan dan harga yang terjangkau. Proyek ini merupakan hasil migrasi dan pengembangan ulang dari aplikasi berbasis Vanilla JavaScript menjadi sebuah sistem yang kokoh dan aman menggunakan **Laravel 12**.

## 🚀 Tentang Project 

Coffee by Bravo lahir dari ide sederhana: "ngopi enak nggak perlu mahal". Aplikasi ini memungkinkan pengguna untuk menjelajahi menu, melakukan kustomisasi pesanan secara detail, memilih lokasi pickup, dan melakukan pembayaran dengan aman, semuanya dalam beberapa klik.

Proyek ini menunjukkan evolusi dari frontend statis menjadi aplikasi full-stack yang dinamis, dengan fokus pada:
* **Keamanan:** Memindahkan semua logika bisnis (keranjang, harga) dari sisi klien ke sisi server.
* **Fleksibilitas:** Sistem menu tambahan yang sepenuhnya dinamis dan dikelola melalui database.
* **Pengalaman Pengguna:** Alur pemesanan yang mulus dan profesional, dari pemilihan produk hingga notifikasi pembayaran.

---

## ✨ Fitur Utama

* **Menu Produk Dinamis:** Daftar produk dan kategori ditampilkan langsung dari database.
* **Kustomisasi Produk Tingkat Lanjut:** Sistem opsi tambahan (add-on) yang sepenuhnya dinamis dan spesifik untuk beberapa produk, termasuk varian **Iced & Hot**.
* **Pemilihan Lokasi Pickup:** Pengguna dapat memilih dari daftar toko yang tersedia, dan pilihan tersebut akan terekam dalam transaksi.
* **Keranjang Belanja Server-Side:** Semua data keranjang disimpan dengan aman di dalam session server.
* **Validasi Checkout:** Sistem validasi yang memastikan lokasi pickup dan nama pemesan wajib diisi sebelum melanjutkan pembayaran.
* **Integrasi Pembayaran Midtrans:** Alur pembayaran yang aman menggunakan Midtrans Snap.js, lengkap dengan detail pesanan.
* **Notifikasi Pesanan Otomatis:** Notifikasi email real-time dikirim ke admin setelah pembayaran berhasil, berisi detail lengkap pesanan untuk persiapan.
* **Halaman Admin (Dalam Pengembangan):** Fondasi untuk halaman admin guna melihat riwayat pesanan yang masuk.

---

## 🛠️ Dibangun Dengan

* **Backend:** [Laravel 12](https://laravel.com/), PHP 8.2
* **Frontend:** Blade, Vanilla JavaScript, [Vite](https://vitejs.dev/)
* **Database:** MySQL
* **Payment Gateway:** [Midtrans](https://midtrans.com/)
* **Email Testing:** [Mailtrap.io](https://mailtrap.io/)

---

## ⚙️ Panduan Instalasi & Setup

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/bravoduck/coffee-by-bravo.git](https://github.com/bravoduck/coffee-by-bravo.git)
    cd coffee-by-bravo
    ```

2.  **Instal dependensi Composer:**
    ```bash
    composer install
    ```

3.  **Instal dependensi NPM:**
    ```bash
    npm install
    ```

4.  **Konfigurasi Database & Layanan:**
    * Buka file `.env` dan atur koneksi database Anda (DB_DATABASE, DB_USERNAME, DB_PASSWORD).
    * Isi kunci API dari Midtrans (Sandbox) dan kredensial Mailtrap Anda.

5.  **Jalankan Migrasi & Seeding:**
    * Perintah ini akan membuat semua tabel dan mengisinya dengan data produk, toko, dan opsi.
        ```bash
        php artisan migrate:fresh --seed
        ```

7.  **Jalankan Aplikasi:**
    * Buka dua terminal.
    * Di terminal pertama, jalankan server Laravel:
        ```bash
        php artisan serve
        ```
    * Di terminal kedua, jalankan Vite untuk kompilasi aset frontend:
        ```bash
        npm run dev
        ```

8.  **Buka Aplikasi:**
    * Akses `http://127.0.0.1:8000` di browser Anda. Enjoy!

---

## 👤 Author

**Bravoduck**
* GitHub: [@bravoduck](https://github.com/bravoduck)

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file `LICENSE.md` untuk detailnya.