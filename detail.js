/**
 * @file detail.js
 * Mengelola semua logika untuk halaman detail produk.
 * Mampu menangani dua mode:
 * 1. Menambah item baru ke keranjang (default).
 * 2. Mengedit (update) item yang sudah ada di keranjang.
 */
document.addEventListener('DOMContentLoaded', () => {
    const isEditMode = sessionStorage.getItem('editMode') === 'true';
    const itemToEdit = isEditMode ? JSON.parse(sessionStorage.getItem('itemToEdit')) : null;
    const productData = JSON.parse(sessionStorage.getItem('currentProduct'));

    if (!itemToEdit && !productData) {
        alert('Data produk tidak ditemukan, kembali ke halaman utama.');
        window.location.href = 'index.html';
        return;
    }

    const productBaseData = {
        name: isEditMode ? itemToEdit.name : productData.name,
        description: isEditMode ? 'Ubah kustomisasi dan jumlah pesanan di bawah ini.' : productData.description,
        imageUrl: isEditMode ? itemToEdit.image : productData.imageUrl,
    };
    const basePrice = productData ? productData.price : (itemToEdit.price || 0);

    let currentPrice = 0;
    let toastTimer;
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

    function populateProductDetails() {
        productNameHeader.textContent = productBaseData.name;
        detailImage.src = productBaseData.imageUrl;
        detailImage.alt = productBaseData.name;
        detailName.textContent = productBaseData.name;
        detailDescription.textContent = productBaseData.description;
        detailPrice.textContent = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(basePrice).replace('Rp', 'Rp ');
    }

    function populateFormForEdit() {
        if (!itemToEdit) return;
        quantityElement.textContent = itemToEdit.quantity;

        const allInputs = form.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        allInputs.forEach(input => {
            const label = input.closest('.option-item');
            const nameSpan = label.querySelector('.option-name');
            if (!nameSpan) return;

            const clone = nameSpan.cloneNode(true);
            if (clone.querySelector('.badge')) clone.querySelector('.badge').remove();
            const optionText = clone.textContent.trim().replace(/👍/g, '').trim();

            if (itemToEdit.customizations.includes(optionText)) {
                input.checked = true;
            }
        });
    }

    function calculateTotalPrice() {
        let optionsPrice = 0;
        form.querySelectorAll('input:checked').forEach(option => {
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
        const buttonText = isEditMode ? 'Update' : 'Tambah';
        addToCartBtn.textContent = `${buttonText} • ${formattedPrice.replace('Rp', 'Rp ')}`;
    }

    function handleSubmit() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const quantity = parseInt(quantityElement.textContent, 10);

        const customizations = Array.from(form.querySelectorAll('input:checked')).map(opt => {
            const nameSpan = opt.closest('.option-item').querySelector('.option-name');
            const clone = nameSpan.cloneNode(true);
            if (clone.querySelector('.badge')) clone.querySelector('.badge').remove();
            return clone.textContent.trim().replace(/👍/g, '').trim();
        });

        const singleItemPrice = currentPrice / quantity;
        const newItemData = {
            id: `${productBaseData.name}-${customizations.join('-')}`.replace(/\s/g, ''),
            name: productBaseData.name,
            customizations,
            price: singleItemPrice,
            quantity,
            image: productBaseData.imageUrl,
        };

        if (isEditMode) {
            const itemIndex = cart.findIndex(item => item.id === itemToEdit.id);
            if (itemIndex > -1) {
                cart[itemIndex] = newItemData;
            } else {
                cart.push(newItemData);
            }
            sessionStorage.removeItem('editMode');
            sessionStorage.removeItem('itemToEdit');
            window.location.href = 'checkout.html';
        } else {
            const existingItemIndex = cart.findIndex(item => item.id === newItemData.id);
            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += newItemData.quantity;
            } else {
                cart.push(newItemData);
            }
            showSuccessModal(newItemData);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function showToast(message, type = 'success') {
        clearTimeout(toastTimer);
        toastMessage.textContent = message;
        toastNotification.className = 'toast-notification';
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
                        if (cb !== e.target) cb.checked = false;
                    });
                }
            });
        });

        const toppingCheckboxes = document.querySelectorAll('#topping-group input[type="checkbox"]');
        toppingCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const checkedCount = document.querySelectorAll('#topping-group input[type="checkbox"]:checked').length;
                if (checkedCount > 2) {
                    showToast('Maksimal 2 additional untuk kategori ini.', 'error');
                    e.target.checked = false;
                    calculateTotalPrice();
                }
            });
        });
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

    function initializeEventListeners() {
        form.addEventListener('input', calculateTotalPrice);
        addToCartBtn.addEventListener('click', handleSubmit);

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
    }

    function init() {
        populateProductDetails();
        if (isEditMode) {
            populateFormForEdit();
        }
        calculateTotalPrice();
        setupCheckboxLimits();
        initializeEventListeners();
    }

    init();
});