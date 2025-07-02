document.addEventListener('DOMContentLoaded', () => {

    // -----------------------------------------------------------------
    // ▼▼▼ KODE FILTER DIGANTI MENJADI LOGIKA SCROLL ▼▼▼
    // -----------------------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 1. Atur status tombol 'active'
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // 2. Ambil ID target dari data-filter
            const filterValue = button.dataset.filter;
            const targetSection = document.getElementById(filterValue);

            // 3. Jika section target ada, scroll ke sana dengan mulus
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    // -----------------------------------------------------------------
    // ▲▲▲ AKHIR DARI LOGIKA SCROLL ▲▲▲
    // -----------------------------------------------------------------

    function loadSelectedStore() {
        const selectedStore = localStorage.getItem('selectedStore');
        if (selectedStore) {
            document.querySelector('.location-name').textContent = selectedStore;
        }
    }
    loadSelectedStore();
    
    // === Bagian 1: Logika untuk tombol '+' di setiap produk (TETAP SAMA) ===
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

    // === Bagian 2: Logika untuk menampilkan footer keranjang (TETAP SAMA) ===
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