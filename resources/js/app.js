/**
 * @file script.js
 * FINAL VERSION untuk halaman utama.
 */
document.addEventListener('DOMContentLoaded', () => {

    const App = {
        state: {
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
            filterButtons: null,
            allProductSections: null,
            allProductCards: null,
        },

        init() {
            this.loadSelectedStore();
            this.ui.filterButtons = this.ui.filterContainer.querySelectorAll('.filter-btn');
            this.ui.allProductSections = this.ui.productListContainer.querySelectorAll('.product-section');
            this.ui.allProductCards = this.ui.productListContainer.querySelectorAll('.product-card');
            this.registerHandlers();
        },

        loadSelectedStore() {
            const selectedStore = localStorage.getItem('selectedStore');
            if (selectedStore) this.ui.locationName.textContent = selectedStore;
        },

        registerHandlers() {
            if (this.ui.searchIconBtn) {
                this.ui.searchIconBtn.addEventListener('click', () => this.SearchHandler.enter());
            }
            if (this.ui.backFromSearchBtn) {
                this.ui.backFromSearchBtn.addEventListener('click', (e) => this.SearchHandler.exit(e));
            }
            if (this.ui.searchInput) {
                this.ui.searchInput.addEventListener('input', () => this.SearchHandler.filter());
            }
            if (this.ui.filterContainer) {
                this.ui.filterContainer.addEventListener('click', (e) => {
                    if (e.target.classList.contains('filter-btn')) this.CategoryFilter.handle(e);
                });
            }
            
            document.body.addEventListener('click', (e) => {
                if (e.target.closest('.cart-footer')) {
                    window.location.href = '/checkout';
                }
            });

            this.ScrollSpy.init();
        },

        SearchHandler: {
            enter() {
                App.ui.appHeader.classList.add('search-active');
                App.ui.filterWrapper.classList.add('hidden');
                App.ui.noResultsMessage.style.display = 'none';
                App.ui.searchInput.style.display = 'block';
                App.ui.backFromSearchBtn.style.display = 'inline-flex';
                App.ui.searchInput.focus();
            },
            exit(event) {
                event.preventDefault();
                App.ui.appHeader.classList.remove('search-active');
                App.ui.filterWrapper.classList.remove('hidden');
                App.ui.searchInput.value = '';
                App.ui.searchInput.style.display = 'none';
                App.ui.backFromSearchBtn.style.display = 'none';
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
                    }, 1000);
                }
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
    };

    App.init();
});