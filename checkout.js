/**
 * @file checkout.js
 * Mengelola semua logika untuk halaman checkout, termasuk rendering keranjang,
 * pembaruan kuantitas, dan proses validasi sebelum ke pembayaran.
 */

document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const totalPaymentElement = document.getElementById('total-payment');
    const pickupStoreNameElement = document.getElementById('pickup-store-name');
    const lanjutkanButton = document.getElementById('lanjutkan-btn');
    const locationAlertModal = document.getElementById('location-alert-modal');
    const goToStoresBtn = document.getElementById('go-to-stores-btn');

    const ICONS = {
        edit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>`,
        minus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 11V13H19V11H5Z"></path></svg>`,
        plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>`,
        trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path></svg>`
    };

    function showLocationModal() {
        if (locationAlertModal) locationAlertModal.style.display = 'flex';
    }

    function hideLocationModal() {
        if (locationAlertModal) locationAlertModal.style.display = 'none';
    }

    function displayPickupLocation() {
        const selectedStore = localStorage.getItem('selectedStore');
        if (selectedStore && pickupStoreNameElement) {
            pickupStoreNameElement.textContent = selectedStore;
            pickupStoreNameElement.style.color = 'var(--text-color)';
        } else if (pickupStoreNameElement) {
            pickupStoreNameElement.textContent = 'Pilih Lokasi Pickup';
            pickupStoreNameElement.style.color = '#D32F2F';
        }
    }

    function renderCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Keranjang Anda kosong.</p>';
            totalPaymentElement.textContent = 'Rp 0';
            lanjutkanButton.style.backgroundColor = '#cccccc';
            lanjutkanButton.style.cursor = 'not-allowed';
            return;
        }

        lanjutkanButton.style.backgroundColor = 'var(--primary-green)';
        lanjutkanButton.style.cursor = 'pointer';

        let grandTotal = 0;
        cart.forEach(item => {
            grandTotal += item.price * item.quantity;
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            const formattedPrice = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(item.price * item.quantity);

            const defaultOptions = ['Regular Ice', 'Normal Sweet', 'Normal Ice', 'Normal Shot', 'Milk'];
            const displayedCustomizations = item.customizations.filter(c => !defaultOptions.includes(c));
            const customizationText = displayedCustomizations.length > 0 ? displayedCustomizations.join(', ') : 'Regular';

            const decreaseButtonIcon = item.quantity === 1 ? ICONS.trash : ICONS.minus;

            itemElement.innerHTML = `
                <div class="cart-item-row-1">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>${customizationText}</p>
                    </div>
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                </div>
                <div class="cart-item-row-2">
                    <p class="cart-item-price">${formattedPrice.replace('Rp', 'Rp ')}</p>
                    <div class="cart-item-actions">
                        <button class="edit-item-btn" data-id="${item.id}">${ICONS.edit}</button>
                        <div class="quantity-selector">
                            <button class="decrease-item-qty" data-id="${item.id}">${decreaseButtonIcon}</button>
                            <span>${item.quantity}</span>
                            <button class="increase-item-qty" data-id="${item.id}">${ICONS.plus}</button>
                        </div>
                    </div>
                </div>`;
            cartItemsContainer.appendChild(itemElement);
        });

        const formattedGrandTotal = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(grandTotal);
        totalPaymentElement.textContent = formattedGrandTotal.replace('Rp', 'Rp ');
    }

    function updateCart(itemId, change) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemIndex = cart.findIndex(item => item.id === itemId);

        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }

    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        const increaseButton = target.closest('.increase-item-qty');
        const decreaseButton = target.closest('.decrease-item-qty');
        const editButton = target.closest('.edit-item-btn');

        if (increaseButton) {
            updateCart(increaseButton.dataset.id, 1);
            return;
        }

        if (decreaseButton) {
            updateCart(decreaseButton.dataset.id, -1);
            return;
        }

        if (editButton) {
            const itemIdToEdit = editButton.dataset.id;
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const itemToEdit = cart.find(item => item.id === itemIdToEdit);

            if (itemToEdit) {
                sessionStorage.setItem('editMode', 'true');
                sessionStorage.setItem('itemToEdit', JSON.stringify(itemToEdit));
                const originalProductId = itemToEdit.name.replace(/\s+/g, '-').toLowerCase();
                window.location.href = `detail.html?product-id=${originalProductId}`;
            }
        }
    });

    lanjutkanButton.addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const selectedStore = localStorage.getItem('selectedStore');

        if (cart.length === 0) {
            alert('Keranjang Anda kosong. Silakan pesan terlebih dahulu.');
            return;
        }

        if (!selectedStore) {
            showLocationModal();
            return;
        }

        let grandTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        sessionStorage.setItem('paymentTotal', grandTotal);
        const paymentUrl = `payment.html`;
        window.location.href = paymentUrl;
    });

    if (goToStoresBtn) {
        goToStoresBtn.addEventListener('click', () => {
            window.location.href = 'store.html';
        });
    }

    if (locationAlertModal) {
        locationAlertModal.addEventListener('click', (event) => {
            if (event.target === locationAlertModal) {
                hideLocationModal();
            }
        });
    }

    function init() {
        displayPickupLocation();
        renderCart();
    }

    init();
});