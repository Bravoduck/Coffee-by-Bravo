document.addEventListener('DOMContentLoaded', () => {
    // === BAGIAN BARU: Fungsionalitas Pencarian ===
    const header = document.querySelector('.store-header');
    const searchBtn = document.querySelector('.header-search-btn');
    const searchInput = document.getElementById('search-input');
    const backBtn = document.querySelector('.back-btn');
    const storeListContainer = document.querySelector('.store-list');
    const allStoreCards = document.querySelectorAll('.store-card'); // Pindahkan ini ke atas
    const storeCountElement = document.querySelector('.store-count');
    const totalStores = allStoreCards.length;

    // Fungsi untuk memfilter toko
    const filterStores = () => {
        const query = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;

        allStoreCards.forEach(card => {
            const storeName = card.dataset.storeName.toLowerCase();
            const isVisible = storeName.includes(query);
            
            // Gunakan kelas .hidden untuk menyembunyikan kartu yang tidak cocok
            card.classList.toggle('hidden', !isVisible);
            
            if (isVisible) {
                visibleCount++;
            }
        });

        // Update jumlah store yang ditampilkan
        storeCountElement.textContent = `${visibleCount} Store ditemukan`;
    };
    
    // Event listener untuk tombol search di header
    searchBtn.addEventListener('click', (event) => {
        event.preventDefault();
        header.classList.add('search-active'); // Aktifkan mode pencarian
        searchInput.focus(); // Langsung fokus ke input
    });

    // Event listener untuk tombol kembali
    backBtn.addEventListener('click', (event) => {
        // Jika sedang dalam mode pencarian, batalkan pencarian, jangan pindah halaman
        if (header.classList.contains('search-active')) {
            event.preventDefault(); // Mencegah navigasi ke index.html
            header.classList.remove('search-active'); // Nonaktifkan mode pencarian
            searchInput.value = ''; // Kosongkan input
            
            // Tampilkan kembali semua kartu toko
            allStoreCards.forEach(card => card.classList.remove('hidden'));
            storeCountElement.textContent = `${totalStores} Store`; // Kembalikan jumlah total
        }
        // Jika tidak dalam mode pencarian, tombol akan berfungsi normal (kembali ke index.html)
    });

    // Event listener untuk input pencarian (saat pengguna mengetik)
    searchInput.addEventListener('input', filterStores);


    // === BAGIAN LAMA: Fungsionalitas Memilih Toko (Tetap dipertahankan) ===
    allStoreCards.forEach(card => {
        card.addEventListener('click', (event) => {
            // Cek apakah mode pencarian aktif, jika ya jangan lakukan apa-apa
            // Biarkan event back button yang menanganinya
            if (header.classList.contains('search-active')) {
                return;
            }
            
            event.preventDefault(); // Mencegah link default berjalan

            // Ambil nama toko dari atribut data-*
            const selectedStoreName = card.dataset.storeName;

            if (selectedStoreName) {
                // Simpan nama toko yang dipilih ke localStorage
                localStorage.setItem('selectedStore', selectedStoreName);

                // Arahkan kembali ke halaman utama
                window.location.href = 'index.html';
            }
        });
    });
});