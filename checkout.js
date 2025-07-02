document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMEN DOM ---
    const cartItemsContainer = document.getElementById('cart-items-container');
    const totalPaymentElement = document.getElementById('total-payment');
    const pickupStoreNameElement = document.getElementById('pickup-store-name');
    const lanjutkanButton = document.getElementById('lanjutkan-btn'); // Ambil tombol Lanjutkan

    // --- KUMPULAN IKON SVG ---
    const ICONS = {
        edit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.7279 9.57629L14.3137 8.16207L5 17.4758V18.89H6.41421L15.7279 9.57629ZM17.1421 8.16207L18.5563 6.74786L17.1421 5.33365L15.7279 6.74786L17.1421 8.16207ZM12 20.89H20V2.89H12V4.89H18V18.89H12V20.89ZM7.24264 20.89H4V16.6473L14.3137 6.33365L17.8492 9.86919L7.53553 20.1828L7.24264 20.89Z"></path></svg>`,
        minus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 11V13H19V11H5Z"></path></svg>`,
        plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path></svg>`,
        trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z"></path></svg>`
    };

    // --- FUNGSI Tampilkan Lokasi Pickup ---
    function displayPickupLocation() {
        const selectedStore = localStorage.getItem('selectedStore');
        if (selectedStore && pickupStoreNameElement) {
            pickupStoreNameElement.textContent = selectedStore;
        } else if (pickupStoreNameElement) {
            pickupStoreNameElement.textContent = 'Pilih Lokasi Pickup';
            pickupStoreNameElement.style.color = '#D32F2F';
        }
    }

    // --- FUNGSI Render Keranjang Belanja ---
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
            const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price * item.quantity);
            
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
                        <button class="edit-item-btn" data-id="${item.id}" title="Ubah Pesanan">
                            ${ICONS.edit}
                        </button>
                        <div class="quantity-selector">
                            <button class="decrease-item-qty" data-id="${item.id}">
                                ${decreaseButtonIcon}
                            </button>
                            <span>${item.quantity}</span>
                            <button class="increase-item-qty" data-id="${item.id}">
                                ${ICONS.plus}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
        
        const formattedGrandTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(grandTotal);
        totalPaymentElement.textContent = formattedGrandTotal.replace('Rp', 'Rp ');
    }

    // --- FUNGSI Update Keranjang ---
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

    // --- EVENT LISTENER UNTUK AKSI DI DALAM KERANJANG ---
    cartItemsContainer.addEventListener('click', (event) => {
        const increaseButton = event.target.closest('.increase-item-qty');
        const decreaseButton = event.target.closest('.decrease-item-qty');
        const editButton = event.target.closest('.edit-item-btn');

        if (increaseButton) {
            updateCart(increaseButton.dataset.id, 1);
            return;
        }
        if (decreaseButton) {
            updateCart(decreaseButton.dataset.id, -1);
            return;
        }
        if (editButton) {
            // --- LOGIKA EDIT BARU ---
            const itemIdToEdit = editButton.dataset.id;
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const itemToEdit = cart.find(item => item.id === itemIdToEdit);

            if (itemToEdit) {
                // Simpan detail item yang akan diedit ke sessionStorage
                sessionStorage.setItem('editMode', 'true');
                sessionStorage.setItem('itemToEdit', JSON.stringify(itemToEdit));
                
                // Arahkan ke halaman detail produk
                // Kita asumsikan ada data produk asli yang disimpan saat pertama kali dibuat
                // Di sini kita butuh 'product-id' asli untuk membuka halaman detail yang benar
                // Mari kita buat asumsi 'product-id' adalah nama produk tanpa spasi
                const originalProductId = itemToEdit.name.replace(/\s+/g, '-').toLowerCase();
                window.location.href = `detail.html?product-id=${originalProductId}`;
            }
        }
    });
    
    // =======================================================
    // BAGIAN BARU: EVENT LISTENER UNTUK TOMBOL LANJUTKAN (WA)
    // =======================================================
    lanjutkanButton.addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const selectedStore = localStorage.getItem('selectedStore') || 'Belum Dipilih';
        
        if (cart.length === 0) {
            alert('Keranjang Anda kosong. Silakan pesan terlebih dahulu.');
            return;
        }

        // --- GANTI DENGAN NOMOR WA ANDA ---
        const yourWhatsAppNumber = '6281290493785'; 

        // --- Membuat format pesan ---
        let message = `Halo, saya mau pesan Fore Coffee.\n\n`;
        message += `*Lokasi Pengambilan:*\n${selectedStore}\n\n`;
        message += `*Detail Pesanan:*\n`;
        message += `---------------------------\n`;

        let grandTotal = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            grandTotal += itemTotal;
            const formattedItemTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(itemTotal).replace('Rp', 'Rp ');

            const defaultOptions = ['Regular Ice', 'Normal Sweet', 'Normal Ice', 'Normal Shot', 'Milk'];
            const customizations = item.customizations.filter(c => !defaultOptions.includes(c)).join(', ');

            message += `- ${item.quantity}x ${item.name}\n`;
            if (customizations) {
                message += `  (${customizations})\n`;
            }
            message += `  Subtotal: ${formattedItemTotal}\n\n`;
        });
        
        const formattedGrandTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(grandTotal).replace('Rp', 'Rp ');

        message += `---------------------------\n`;
        message += `*Total Pembayaran: ${formattedGrandTotal}*\n\n`;
        message += `Terima kasih.`;

        // Encode pesan dan buat link WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${yourWhatsAppNumber}?text=${encodedMessage}`;

        // Arahkan pengguna ke WhatsApp
        window.open(whatsappURL, '_blank');
    });

    // --- PANGGIL FUNGSI-FUNGSI SAAT HALAMAN DIMUAT ---
    displayPickupLocation();
    renderCart();
});