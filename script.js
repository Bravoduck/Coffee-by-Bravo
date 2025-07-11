/**
 * @file script.js
 * Mengelola semua logika dan interaktivitas untuk halaman utama (index.html).
 * Dikelola oleh objek utama 'App'.
 */
document.addEventListener('DOMContentLoaded', () => {

    const App = {
        state: {
            allProducts: [],
            activeProducts: [],
            cart: [],
            isClickScrolling: false,
        },
        ui: {
            appHeader: document.querySelector('.app-header'),
            searchIconBtn: document.getElementById('search-icon-btn'),
            backFromSearchBtn: document.getElementById('back-from-search'),
            searchInput: document.getElementById('product-search-input'),
            filterContainer: document.querySelector('.filters'),
            filterWrapper: document.querySelector('.filter-wrapper'),
            locationName: document.querySelector('.location-name'),
            productListContainer: document.getElementById('product-list-container'),
            noResultsMessage: document.getElementById('no-results-message'),
            productCardTemplate: document.getElementById('product-card-template'),
            filterButtons: null,
            allProductSections: null,
            allProductCards: null,
        },

        async init() {
            this.updateCartState();
            this.loadSelectedStore();
            await this.fetchProducts();
            this.render();
            this.registerHandlers();
            this.SessionManager.init();
        },

        updateCartState() {
            try {
                this.state.cart = JSON.parse(localStorage.getItem('cart')) || [];
            } catch (error) {
                console.error('Gagal mem-parsing data keranjang:', error);
                this.state.cart = [];
            }
        },

        async fetchProducts() {
            try {
                const response = await fetch('products.json');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                this.state.allProducts = await response.json();
                this.state.activeProducts = this.state.allProducts.filter(cat => cat.enabled !== false);
            } catch (error) {
                console.error("Gagal memuat produk:", error);
                this.ui.productListContainer.innerHTML = '<p class="error-message">Gagal memuat daftar menu.</p>';
            }
        },

        render() {
            this.renderFilterButtons();
            this.renderProducts();
            this.renderCartFooter();
        },

        renderFilterButtons() {
            this.ui.filterContainer.innerHTML = '';
            this.state.activeProducts.forEach((category, index) => {
                const button = document.createElement('button');
                button.className = 'filter-btn';
                button.dataset.filter = category.slug;
                button.textContent = category.category;
                if (index === 0) button.classList.add('active');
                this.ui.filterContainer.appendChild(button);
            });
            this.ui.filterButtons = this.ui.filterContainer.querySelectorAll('.filter-btn');
        },

        renderProducts() {
            this.ui.productListContainer.innerHTML = '';
            this.state.activeProducts.forEach(category => {
                const sectionEl = document.createElement('section');
                sectionEl.id = category.slug;
                sectionEl.className = 'product-section';

                const headerEl = this.createProductSectionHeader(category);
                const listEl = document.createElement('div');
                listEl.className = 'product-list';

                category.items.forEach(item => {
                    const cardEl = this.createProductCard(item);
                    listEl.appendChild(cardEl);
                });

                sectionEl.appendChild(headerEl);
                sectionEl.appendChild(listEl);
                this.ui.productListContainer.appendChild(sectionEl);
            });
            this.ui.productListContainer.appendChild(this.ui.noResultsMessage);

            this.ui.allProductSections = this.ui.productListContainer.querySelectorAll('.product-section');
            this.ui.allProductCards = this.ui.productListContainer.querySelectorAll('.product-card');
        },

        createProductSectionHeader(category) {
            const headerEl = document.createElement('div');
            headerEl.className = 'product-list-header';
            headerEl.innerHTML = `<h2>${category.category}</h2>${category.items.length > 0 ? `<span>${category.items.length} items</span>` : ''}`;
            return headerEl;
        },

        createProductCard(item) {
            const card = this.ui.productCardTemplate.content.cloneNode(true).querySelector('.product-card');
            card.dataset.productName = item.name;
            card.dataset.basePrice = item.price;
            card.dataset.description = item.description;
            card.dataset.imageUrl = item.image;
            card.querySelector('.product-image').src = item.image;
            card.querySelector('.product-image').alt = item.name;
            card.querySelector('h3').textContent = item.name;
            card.querySelector('.product-description').textContent = item.description;
            card.querySelector('.product-price').textContent = this.formatCurrency(item.price);
            return card;
        },

        renderCartFooter() {
            const existingFooter = document.querySelector('.cart-footer');
            if (existingFooter) existingFooter.remove();
            if (this.state.cart.length === 0) return;

            const totalItems = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
            const totalPrice = this.state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

            const footer = document.createElement('div');
            footer.className = 'cart-footer';
            footer.innerHTML = `<div class="cart-summary"><span>Cek Keranjang (${totalItems} produk)</span></div><div class="cart-total"><span>${this.formatCurrency(totalPrice)}</span></div>`;
            document.body.appendChild(footer);
            footer.addEventListener('click', () => window.location.href = 'checkout.html');
        },

        loadSelectedStore() {
            const selectedStore = localStorage.getItem('selectedStore');
            if (selectedStore) this.ui.locationName.textContent = selectedStore;
        },

        registerHandlers() {
            this.ui.searchIconBtn.addEventListener('click', () => this.SearchHandler.enter());
            this.ui.backFromSearchBtn.addEventListener('click', (e) => this.SearchHandler.exit(e));
            this.ui.searchInput.addEventListener('input', () => this.SearchHandler.filter());

            this.ui.filterContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) this.CategoryFilter.handle(e);
            });

            this.ui.productListContainer.addEventListener('click', (e) => this.ProductCardHandler.handle(e));

            this.ScrollSpy.init();
        },

        SearchHandler: {
            enter() {
                App.ui.appHeader.classList.add('search-active');
                App.ui.filterWrapper.classList.add('hidden');
                App.ui.noResultsMessage.style.display = 'none';
                App.ui.searchInput.focus();
            },
            exit(event) {
                event.preventDefault();
                App.ui.appHeader.classList.remove('search-active');
                App.ui.filterWrapper.classList.remove('hidden');
                App.ui.searchInput.value = '';
                this.filter();
            },
            filter() {
                const query = App.ui.searchInput.value.toLowerCase().trim();
                let itemsFound = 0;
                App.ui.allProductCards.forEach(card => {
                    const productName = card.dataset.productName.toLowerCase();
                    const matches = productName.includes(query);
                    card.classList.toggle('hidden', !matches);
                    if (matches) itemsFound++;
                });
                App.ui.allProductSections.forEach(section => {
                    const visibleCards = section.querySelectorAll('.product-card:not(.hidden)');
                    section.classList.toggle('hidden', visibleCards.length === 0);
                });
                App.ui.noResultsMessage.style.display = (itemsFound === 0 && query !== '') ? 'block' : 'none';
            }
        },

        CategoryFilter: {
            handle(event) {
                if (App.ui.appHeader.classList.contains('search-active')) return;
                const clickedButton = event.target;
                const targetSection = document.getElementById(clickedButton.dataset.filter);

                if (targetSection) {
                    App.state.isClickScrolling = true;

                    App.ui.filterButtons.forEach(btn => btn.classList.remove('active'));
                    clickedButton.classList.add('active');
                    clickedButton.scrollIntoView({
                        behavior: 'smooth',
                        inline: 'center',
                        block: 'nearest'
                    });

                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    setTimeout(() => {
                        App.state.isClickScrolling = false;
                    }, 1);
                }
            }
        },

        ProductCardHandler: {
            handle(event) {
                const addButton = event.target.closest('.add-btn');
                if (!addButton) return;

                event.preventDefault();
                event.stopPropagation();

                const productCard = addButton.closest('.product-card');
                const productData = {
                    name: productCard.dataset.productName,
                    price: parseInt(productCard.dataset.basePrice, 10),
                    description: productCard.dataset.description,
                    imageUrl: productCard.dataset.imageUrl,
                };

                if (!productData.name || isNaN(productData.price)) return;
                sessionStorage.setItem('currentProduct', JSON.stringify(productData));
                window.location.href = 'detail.html';
            }
        },

        ScrollSpy: {
            observer: null,
            init() {
                if (!App.ui.allProductSections || App.ui.allProductSections.length === 0) return;
                const options = {
                    rootMargin: '-115px 0px -85% 0px',
                    threshold: 0
                };
                this.observer = new IntersectionObserver(this.handleIntersect.bind(this), options);
                App.ui.allProductSections.forEach(section => this.observer.observe(section));
            },
            handleIntersect(entries) {
                if (App.state.isClickScrolling) return;

                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const sectionId = entry.target.id;
                        this.updateActiveFilter(sectionId);
                    }
                });
            },
            updateActiveFilter(sectionId) {
                const activeButton = App.ui.filterContainer.querySelector(`.filter-btn[data-filter="${sectionId}"]`);
                if (activeButton && !activeButton.classList.contains('active')) {
                    App.ui.filterButtons.forEach(btn => btn.classList.remove('active'));
                    activeButton.classList.add('active');
                    activeButton.scrollIntoView({
                        behavior: 'smooth',
                        inline: 'center',
                        block: 'nearest'
                    });
                }
            }
        },

        SessionManager: {
            INACTIVITY_TIMEOUT: 60 * 60 * 1000,
            inactivityTimer: null,
            init() {
                this.setupInactivityListeners();
            },
            end() {
                clearTimeout(this.inactivityTimer);
                alert('Sesi Anda berakhir karena tidak ada aktivitas.');
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
            },
            reset() {
                clearTimeout(this.inactivityTimer);
                this.inactivityTimer = setTimeout(() => this.end(), this.INACTIVITY_TIMEOUT);
            },
            setupInactivityListeners() {
                this.reset();
                ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
                    window.addEventListener(event, () => this.reset());
                });
            }
        },

        formatCurrency(amount) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(amount).replace(/\s?Rp/g, 'Rp ');
        }
    };

    App.init();
});