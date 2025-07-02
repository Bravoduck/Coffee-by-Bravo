document.addEventListener('DOMContentLoaded', () => {
    // === Inisialisasi & Pengambilan Data dari sessionStorage ===
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
        const formattedBasePrice = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(basePrice);
        detailPrice.textContent = formattedBasePrice.replace('Rp', 'Rp ');
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
        const formattedPrice = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
        addToCartBtn.textContent = `Tambah • ${formattedPrice.replace('Rp', 'Rp ')}`;
    }

    function showToast(message, type = 'success') {
        clearTimeout(toastTimer);
        toastMessage.textContent = message;
        toastNotification.classList.remove('error');
        if (type === 'error') {
            toastNotification.classList.add('error');
        }
        toastNotification.classList.add('show');
        toastTimer = setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3000);
    }

    function setupCheckboxLimits() {
        const syrupCheckboxes = document.querySelectorAll('#syrup-group input[type="checkbox"]');
        syrupCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    syrupCheckboxes.forEach(cb => {
                        if (cb !== e.target) {
                            cb.checked = false;
                        }
                    });
                }
            });
        });

        const toppingCheckboxes = document.querySelectorAll('#topping-group input[type="checkbox"]');
        toppingCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const checkedCount = document.querySelectorAll('#topping-group input[type="checkbox"]:checked').length;
                if (checkedCount > 2) {
                    showToast('Additional untuk kategori yang dipilih tidak bisa lebih dari 2 additional', 'error');
                    e.target.checked = false;
                    calculateTotalPrice();
                }
            });
        });
    }

    function handleAddToCart() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const quantity = parseInt(quantityElement.textContent, 10);
        const selectedOptions = Array.from(form.querySelectorAll('input:checked'));

        const customizations = selectedOptions.map(opt => {
            const nameSpan = opt.closest('.option-item').querySelector('.option-name');
            const clone = nameSpan.cloneNode(true);
            const badge = clone.querySelector('.badge');
            if (badge) {
                badge.remove();
            }
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

        const existingItemIndex = cart.findIndex(item => item.id === newItem.id);
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += newItem.quantity;
        } else {
            cart.push(newItem);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        showSuccessModal(newItem);
    }

    function showSuccessModal(item) {
        const defaultOptions = ['Regular Ice', 'Normal Sweet', 'Normal Ice', 'Normal Shot', 'Milk'];
        const displayedCustomizations = item.customizations.filter(c => !defaultOptions.includes(c));

        document.getElementById('modal-product-image').src = item.image;
        document.getElementById('modal-product-name').textContent = `Iced ${item.name}`;
        document.getElementById('modal-product-customizations').textContent = displayedCustomizations.length > 0 ? displayedCustomizations.join(', ') : (item.customizations.find(c => c.includes('Large')) || 'Regular Ice');
        document.getElementById('modal-product-quantity').textContent = item.quantity;
        successModal.style.display = 'flex';
    }

    // === Event Listeners ===
    form.addEventListener('input', calculateTotalPrice);
    increaseQtyBtn.addEventListener('click', () => {
        quantityElement.textContent = parseInt(quantityElement.textContent, 10) + 1;
        calculateTotalPrice();
    });
    decreaseQtyBtn.addEventListener('click', () => {
        let quantity = parseInt(quantityElement.textContent, 10);
        if (quantity > 1) {
            quantityElement.textContent = quantity - 1;
            calculateTotalPrice();
        }
    });
    addToCartBtn.addEventListener('click', handleAddToCart);
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            window.location.href = 'index.html';
        }
    });

    populateProductDetails();
    calculateTotalPrice();
    setupCheckboxLimits();
});