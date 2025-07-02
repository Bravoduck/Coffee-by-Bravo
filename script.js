document.addEventListener('DOMContentLoaded', () => {
    function loadSelectedStore() {
        const selectedStore = localStorage.getItem('selectedStore');
        if (selectedStore) {
            document.querySelector('.location-name').textContent = selectedStore;
        }
    }
    // Panggil fungsi ini saat halaman dimuat
    loadSelectedStore();
    // === Bagian 1: Logika untuk tombol '+' di setiap produk ===
    const addButtons = document.querySelectorAll('.add-btn');
    addButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const productCard = button.closest('.product-card');

            // Mengambil semua data dari kartu produk
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

            // Menyimpan semua data ke sessionStorage
            sessionStorage.setItem('currentProduct', JSON.stringify(productData));

            // Arahkan pengguna ke halaman detail
            window.location.href = 'detail.html';
        });
    });

    // === Bagian 2: Logika untuk menampilkan footer keranjang ===
    function displayCartFooter() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) { return; }

        let totalItems = 0;
        let totalPrice = 0;
        cart.forEach(item => {
            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;
        });

        // Hapus footer lama jika ada untuk mencegah duplikasi
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