document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.store-header');
    const searchInput = document.getElementById('store-search-input');
    const searchIconBtn = document.getElementById('header-search-btn');
    const title = header.querySelector('h1.header-title');
    
    const storeListContainer = document.querySelector('.store-list');
    const allStoreCards = storeListContainer.querySelectorAll('.store-card');
    const storeCountElement = document.querySelector('.store-count');
    const originalStoreCount = allStoreCards.length;

    if (!header || !searchInput || !searchIconBtn || !title) return;

    searchIconBtn.addEventListener('click', () => {
        header.classList.add('search-active');
        title.style.display = 'none';
        searchInput.style.display = 'block';
        searchInput.focus();
        searchIconBtn.style.display = 'none';
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        let storesFound = 0;

        allStoreCards.forEach(card => {
            const storeName = card.querySelector('.store-name').textContent.toLowerCase();
            const storeAddress = card.querySelector('.store-address').textContent.toLowerCase();
            const matches = storeName.includes(query) || storeAddress.includes(query);
            card.style.display = matches ? 'flex' : 'none';
            if(matches) {
                storesFound++;
            }
        });

        if (query) {
            storeCountElement.textContent = `${storesFound} Store ditemukan`;
        } else {
            storeCountElement.textContent = `${originalStoreCount} Store tersedia`;
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && header.classList.contains('search-active')) {
            closeSearch();
        }
    });

    searchInput.addEventListener('blur', (e) => {
        setTimeout(() => {
            if (!searchInput.value.trim()) {
                closeSearch();
            }
        }, 150);
    });

    function closeSearch() {
        header.classList.remove('search-active');
        title.style.display = 'block';
        searchInput.style.display = 'none';
        searchInput.value = '';
        searchIconBtn.style.display = 'block';
        
        allStoreCards.forEach(card => {
            card.style.display = 'flex';
        });
        storeCountElement.textContent = `${originalStoreCount} Store tersedia`;
    }
});
