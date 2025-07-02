// detail.js

document.addEventListener('DOMContentLoaded', () => {
    // === Cek Mode Edit & Ambil Data ===
    const isEditMode = sessionStorage.getItem('editMode') === 'true';
    const itemToEdit = isEditMode ? JSON.parse(sessionStorage.getItem('itemToEdit')) : null;

    const productData = JSON.parse(sessionStorage.getItem('currentProduct'));

    if (!productData) {
        alert('Data produk tidak ditemukan, kembali ke halaman utama.');
        window.location.href = 'index.html';
        return;
    }

    const basePrice = productData.price;

    // === Definisi Elemen DOM ===
    const productNameHeader = document.getElementById('product-name-title-header');
    const detailImage = document.getElementById('product-detail-image');
    const detailName = document.getElementById('product-detail-name');
    const detailDescription = document.getElementById('product-detail-description');
    const detailPrice = document.getElementById('product-detail-price');
    const form = document.getElementById('options-form');
    const quantityElement = document.getElementById('quantity');
    const decreaseQtyBtn = document.getElementById('decrease-qty');
    const increaseQtyBtn = document.getElementById('increase-qty');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const cartBtnText = document.getElementById('cart-btn-text'); // elemen teks tombol baru
    const cartBtnPrice = document.getElementById('cart-btn-price'); // elemen harga tombol baru
    const successModal = document.getElementById('success-modal');
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    const toastNotification = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');

    let currentPrice = 0;
    let toastTimer;

    // === Fungsi-Fungsi Utama ===

    function populateProductDetails() {
        productNameHeader.textContent = productData.name;
        detailImage.src = productData.imageUrl;
        detailImage.alt = productData.name;
        detailName.textContent = productData.name;
        detailDescription.textContent = productData.description;
        const formattedBasePrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(basePrice);
        detailPrice.textContent = formattedBasePrice.replace('Rp', 'Rp ');

        // Jika dalam mode edit, isi form dengan data lama
        if (isEditMode && itemToEdit) {
            // Set kuantitas
            quantityElement.textContent = itemToEdit.quantity;

            // Set pilihan radio dan checkbox
            itemToEdit.customizations.forEach(customizationName => {
                const labels = Array.from(form.querySelectorAll('.option-name'));
                const targetLabel = labels.find(label => label.textContent.trim().includes(customizationName));
                if (targetLabel) {
                    const input = targetLabel.closest('.option-item').querySelector('input');
                    if (input) {
                        input.checked = true;
                    }
                }
            });

            // Ubah teks tombol
            cartBtnText.textContent = 'Perbarui';
        }
    }
    
    function calculateTotalPrice() {
        let optionsPrice = 0;
        const selectedOptions = form.querySelectorAll('input:checked');
        selectedOptions.forEach(option => {
            optionsPrice += parseInt(option.dataset.price, 10) || 0;
        });
        const quantity = parseInt(quantityElement.textContent, 10);
        currentPrice = (basePrice + optionsPrice) * quantity;
        updateButtonPrice(currentPrice);
    }

    function updateButtonPrice(price) {
        const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
        cartBtnPrice.textContent = `• ${formattedPrice.replace('Rp', 'Rp ')}`;
    }

    function showToast(message, type = 'success') {
        // ... (fungsi toast tidak berubah)
    }

    function setupCheckboxLimits() {
        // ... (fungsi limit checkbox tidak berubah)
    }

    function handleAddToCart() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const quantity = parseInt(quantityElement.textContent, 10);
        const selectedOptions = Array.from(form.querySelectorAll('input:checked'));

        const customizations = selectedOptions.map(opt => {
            const nameSpan = opt.closest('.option-item').querySelector('.option-name');
            const clone = nameSpan.cloneNode(true);
            const badge = clone.querySelector('.badge');
            if (badge) { badge.remove(); }
            return clone.textContent.trim().replace(/👍/g, '').trim();
        });

        const singleItemPrice = currentPrice / quantity;
        const newItem = {
            id: `${productData.name}-${customizations.join('-')}`.replace(/\s/g, ''),
            name: productData.name,
            customizations: customizations,
            price: singleItemPrice,
            quantity: quantity,
            image: productData.imageUrl
        };

        if (isEditMode && itemToEdit) {
            // --- LOGIKA UPDATE ---
            // Hapus item lama dulu
            cart = cart.filter(item => item.id !== itemToEdit.id);
        }

        const existingItemIndex = cart.findIndex(item => item.id === newItem.id);
        if (existingItemIndex > -1) {
            if(isEditMode) {
                 cart[existingItemIndex].quantity = newItem.quantity; // Set kuantitas baru jika id sama
            } else {
                 cart[existingItemIndex].quantity += newItem.quantity; // Tambah kuantitas jika tidak edit
            }
        } else {
            cart.push(newItem);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        if (isEditMode) {
            // Hapus status mode edit dan kembali ke checkout
            sessionStorage.removeItem('editMode');
            sessionStorage.removeItem('itemToEdit');
            window.location.href = 'checkout.html';
        } else {
            // Tampilkan modal sukses seperti biasa
            showSuccessModal(newItem);
        }
    }

    function showSuccessModal(item) {
        // ... (fungsi modal tidak berubah)
    }

    // === Event Listeners ===
    form.addEventListener('input', calculateTotalPrice);
    increaseQtyBtn.addEventListener('click', () => { /* ... (tidak berubah) ... */ });
    decreaseQtyBtn.addEventListener('click', () => { /* ... (tidak berubah) ... */ });
    addToCartBtn.addEventListener('click', handleAddToCart);
    continueShoppingBtn.addEventListener('click', () => { 
        // Hapus status edit jika pengguna lanjut belanja
        sessionStorage.removeItem('editMode');
        sessionStorage.removeItem('itemToEdit');
        window.location.href = 'index.html'; 
    });
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) { 
            sessionStorage.removeItem('editMode');
            sessionStorage.removeItem('itemToEdit');
            window.location.href = 'index.html'; 
        }
    });

    // === Panggilan Awal Saat Halaman Dimuat ===
    populateProductDetails();
    calculateTotalPrice();
    setupCheckboxLimits();
});