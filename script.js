document.addEventListener('DOMContentLoaded', () => {

    // ▼▼▼ KODE BARU: FUNGSI PENCARIAN PRODUK ▼▼▼
    const appHeader = document.querySelector('.app-header');
    const searchIconBtn = document.getElementById('search-icon-btn');
    const backFromSearchBtn = document.getElementById('back-from-search');
    const searchInput = document.getElementById('product-search-input');
    const filterWrapper = document.querySelector('.filter-wrapper');
    const allProductSections = document.querySelectorAll('.product-section');
    const allProductCards = document.querySelectorAll('.product-card');
    const noResultsMessage = document.getElementById('no-results-message');

    // Fungsi untuk menjalankan filter pencarian
    const handleSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        let itemsFound = 0;

        // 1. Filter kartu produk
        allProductCards.forEach(card => {
            const productName = card.dataset.productName.toLowerCase();
            const matches = productName.includes(query);
            card.classList.toggle('hidden', !matches);
            if(matches) itemsFound++;
        });

        // 2. Sembunyikan/tampilkan header kategori berdasarkan produk yang terlihat
        allProductSections.forEach(section => {
            const visibleCards = section.querySelectorAll('.product-card:not(.hidden)');
            section.classList.toggle('hidden', visibleCards.length === 0);
        });
        
        // 3. Tampilkan pesan "tidak ditemukan" jika tidak ada hasil dan query tidak kosong
        noResultsMessage.style.display = (itemsFound === 0 && query !== '') ? 'block' : 'none';
    };

    // Saat ikon search di klik
    searchIconBtn.addEventListener('click', () => {
        appHeader.classList.add('search-active');
        filterWrapper.classList.add('hidden'); // Sembunyikan filter kategori
        noResultsMessage.style.display = 'none'; // Pastikan pesan tersembunyi saat mulai
        searchInput.focus();
    });

    // Saat tombol kembali dari mode search di klik
    backFromSearchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        appHeader.classList.remove('search-active');
        filterWrapper.classList.remove('hidden'); // Tampilkan lagi filter kategori
        searchInput.value = ''; // Kosongkan input
        
        // Tampilkan kembali semua elemen yang mungkin tersembunyi
        allProductCards.forEach(card => card.classList.remove('hidden'));
        allProductSections.forEach(section => section.classList.remove('hidden'));
        noResultsMessage.style.display = 'none';
    });

    // Saat pengguna mengetik di kolom pencarian
    searchInput.addEventListener('input', handleSearch);
    // ▲▲▲ AKHIR DARI KODE PENCARIAN ▲▲▲


    // -----------------------------------------------------------------
    // ▼▼▼ KODE ASLI ANDA (Sedikit modifikasi) ▼▼▼
    // -----------------------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Jangan jalankan fungsi scroll jika sedang dalam mode pencarian
            if (appHeader.classList.contains('search-active')) return;

            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filterValue = button.dataset.filter;
            const targetSection = document.getElementById(filterValue);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    function loadSelectedStore() {
        const selectedStore = localStorage.getItem('selectedStore');
        if (selectedStore) {
            document.querySelector('.location-name').textContent = selectedStore;
        }
    }
    loadSelectedStore();
    
    // === Logika untuk tombol '+' di setiap produk ===
    const addButtons = document.querySelectorAll('.add-btn');
    addButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const productCard = button.closest('.product-card');
            const productData = {
                name: productCard.dataset.productName,
                price: parseInt(productCard.dataset.basePrice, 10),
                description: productCard.querySelector('.product-description').textContent,
                imageUrl: productCard.querySelector('.product-image').src
            };

            if (!productData.name || !productData.price) {
                console.error('Data produk (nama/harga) tidak ditemukan pada kartu.');
                return;
            }

            sessionStorage.setItem('currentProduct', JSON.stringify(productData));
            window.location.href = 'detail.html';
        });
    });

    // === Logika untuk menampilkan footer keranjang ===
    function displayCartFooter() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) { return; }

        let totalItems = 0;
        let totalPrice = 0;
        cart.forEach(item => {
            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;
        });

        const existingFooter = document.querySelector('.cart-footer');
        if(existingFooter) existingFooter.remove();

        const footer = document.createElement('div');
        footer.className = 'cart-footer';
        const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalPrice);
        
        footer.innerHTML = `
            <div class="cart-summary">
                <span>Cek Keranjang (${totalItems} produk)</span>
            </div>
            <div class="cart-total">
                <span>${formattedPrice.replace('Rp', 'Rp ')}</span>
            </div>
        `;

        document.body.appendChild(footer);
        footer.addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }
    displayCartFooter();
});