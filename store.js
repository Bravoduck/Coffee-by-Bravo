/**
 * @file store.js
 * Mengelola semua logika untuk halaman pemilihan toko (store.html), termasuk:
 * - Mengimpor data toko dari file eksternal.
 * - Merender daftar toko secara dinamis.
 * - Fungsionalitas pencarian toko berbasis data.
 * - Logika untuk memilih dan menyimpan toko ke localStorage.
 */
import {
    storeData
} from './storeData.js';

document.addEventListener('DOMContentLoaded', () => {
    const UIElements = {
        header: document.querySelector('.store-header'),
        searchBtn: document.querySelector('.header-search-btn'),
        searchInput: document.getElementById('search-input'),
        backBtn: document.querySelector('.back-btn'),
        storeListContainer: document.querySelector('.store-list'),
        storeCountElement: document.querySelector('.store-count'),
    };

    /**
     * Merender daftar toko ke dalam DOM berdasarkan data yang diberikan.
     * @param {Array} stores - Array berisi objek data toko yang akan ditampilkan.
     */
    function renderStores(stores) {
        if (!UIElements.storeListContainer) return;
        UIElements.storeListContainer.innerHTML = '';

        if (!stores || stores.length === 0) {
            UIElements.storeListContainer.innerHTML = '<p class="empty-cart-msg" style="padding: 24px 0;">Toko tidak ditemukan.</p>';
            return;
        }

        const storeCardsHTML = stores.map(store => `
            <a href="#" class="store-card" data-store-name="${store.name}">
                <div class="store-details">
                    <h3 class="store-name">${store.name}</h3>
                    <p class="store-address">${store.address}</p>
                    <div class="store-services">
                        <span>${store.services.join(' & ')}</span>
                    </div>
                    <div class="store-hours open">Buka ${store.hours}</div>
                </div>
                <div class="store-amenities">
                    <svg class="go-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path></svg>
                </div>
            </a>
        `).join('');

        UIElements.storeListContainer.innerHTML = storeCardsHTML;
    }

    const SearchHandler = {
        init() {
            if (UIElements.searchBtn) UIElements.searchBtn.addEventListener('click', this.enterSearchMode.bind(this));
            if (UIElements.backBtn) UIElements.backBtn.addEventListener('click', this.handleBackClick.bind(this));
            if (UIElements.searchInput) UIElements.searchInput.addEventListener('input', this.filterStores.bind(this));
        },
        enterSearchMode(event) {
            event.preventDefault();
            UIElements.header.classList.add('search-active');
            UIElements.searchInput.focus();
        },
        handleBackClick(event) {
            if (UIElements.header.classList.contains('search-active')) {
                event.preventDefault();
                this.exitSearchMode();
            }
        },
        exitSearchMode() {
            UIElements.header.classList.remove('search-active');
            UIElements.searchInput.value = '';
            renderStores(storeData);
            UIElements.storeCountElement.textContent = `${storeData.length} Store`;
        },
        filterStores() {
            const query = UIElements.searchInput.value.toLowerCase().trim();
            const filteredStores = storeData.filter(store => store.name.toLowerCase().includes(query));

            renderStores(filteredStores);

            const storeText = filteredStores.length === 1 ? 'Store' : 'Store';
            UIElements.storeCountElement.textContent = `${filteredStores.length} ${storeText} ditemukan`;
        }
    };

    const StoreSelectionHandler = {
        init() {
            if (UIElements.storeListContainer) {
                UIElements.storeListContainer.addEventListener('click', this.handleStoreSelect.bind(this));
            }
        },
        handleStoreSelect(event) {
            const card = event.target.closest('.store-card');
            if (!card) return;

            event.preventDefault();
            const selectedStoreName = card.dataset.storeName;

            if (selectedStoreName) {
                localStorage.setItem('selectedStore', selectedStoreName);
                window.location.href = 'index.html';
            }
        }
    };

    function init() {
        if (!storeData) {
            console.error("Data toko tidak berhasil diimpor.");
            return;
        }

        if (UIElements.storeCountElement) {
            UIElements.storeCountElement.textContent = `${storeData.length} Store`;
        }

        renderStores(storeData);

        SearchHandler.init();
        StoreSelectionHandler.init();
    }

    init();
});