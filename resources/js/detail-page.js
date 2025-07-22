document.addEventListener('DOMContentLoaded', () => {
    const detailMain = document.querySelector('.detail-main');
    if (!detailMain) return;

    const isEditMode = sessionStorage.getItem('editMode') === 'true';
    const itemToEdit = isEditMode ? JSON.parse(sessionStorage.getItem('itemToEdit')) : null;
    const backBtn = document.querySelector('.detail-header .back-btn');
    const basePrice = parseInt(detailMain.dataset.basePrice, 10);
    const form = document.getElementById('options-form');
    const quantityElement = document.getElementById('quantity');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const toastNotification = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    const productId = document.getElementById('product-detail-name').dataset.productId;
    let toastTimer;

    if (backBtn) {
        backBtn.href = isEditMode ? '/checkout' : '/';
        backBtn.addEventListener('click', (e) => {
            if (isEditMode) {
                e.preventDefault();
                sessionStorage.removeItem('editMode');
                sessionStorage.removeItem('itemToEdit');
                window.location.href = backBtn.href;
            }
        });
    }

    function showToast(message) {
        clearTimeout(toastTimer);
        if (toastMessage && toastNotification) {
            toastMessage.textContent = message;
            toastNotification.className = 'toast-notification error show';
            toastTimer = setTimeout(() => {
                toastNotification.classList.remove('show');
            }, 3000);
        }
    }

    function setupCheckboxLimits() {
        const toppingGroup = document.getElementById('option-group-7');
        if (toppingGroup) {
            toppingGroup.addEventListener('change', (e) => {
                if (e.target.type === 'checkbox') {
                    const checkedCount = toppingGroup.querySelectorAll('input[type="checkbox"]:checked').length;
                    if (checkedCount > 2) {
                        showToast('Maksimal 2 topping yang bisa dipilih.');
                        e.target.checked = false;
                        calculateTotalPrice();
                    }
                }
            });
        }
        
        const syrupGroup = document.getElementById('option-group-6');
        if (syrupGroup) {
            syrupGroup.addEventListener('change', (e) => {
                if (e.target.type === 'checkbox' && e.target.checked) {
                    syrupGroup.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                        if (cb !== e.target) cb.checked = false;
                    });
                }
            });
        }
    }

    function populateFormForEdit() {
        if (!itemToEdit) return;
        quantityElement.textContent = itemToEdit.quantity;
        const allInputs = form.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        allInputs.forEach(input => {
            const nameSpan = input.closest('.option-item').querySelector('.option-name');
            const optionText = nameSpan.textContent.trim().replace(/👍/g, '').trim();
            if (itemToEdit.customizations && itemToEdit.customizations.includes(optionText)) {
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
        const currentPrice = (basePrice + optionsPrice) * quantity;
        updateButtonPrice(currentPrice);
    }

    function updateButtonPrice(price) {
        const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
        const buttonText = isEditMode ? 'Update' : 'Tambah';
        addToCartBtn.textContent = `${buttonText} • ${formattedPrice.replace('Rp', 'Rp ')}`;
    }

    function handleSubmit(event) {
        event.preventDefault();
        const formElement = document.getElementById('options-form');
        
        const quantityInput = formElement.querySelector('input[name="quantity"]');
        if (quantityInput) {
            quantityInput.value = quantityElement.textContent;
        }

        if (isEditMode && itemToEdit) {
            const oldItemIdInput = document.createElement('input');
            oldItemIdInput.type = 'hidden';
            oldItemIdInput.name = 'old_cart_item_id';
            oldItemIdInput.value = itemToEdit.id;
            formElement.appendChild(oldItemIdInput);
        }

        addToCartBtn.disabled = true;
        addToCartBtn.textContent = 'Memproses...';
        
        sessionStorage.removeItem('editMode');
        sessionStorage.removeItem('itemToEdit');
        
        formElement.submit();
    }

    if (isEditMode) {
        populateFormForEdit();
    }

    calculateTotalPrice();
    setupCheckboxLimits();
    
    form.addEventListener('change', calculateTotalPrice);
    addToCartBtn.addEventListener('click', handleSubmit);

    document.getElementById('increase-qty').addEventListener('click', () => {
        quantityElement.textContent = parseInt(quantityElement.textContent, 10) + 1;
        calculateTotalPrice();
    });
    
    document.getElementById('decrease-qty').addEventListener('click', () => {
        let qty = parseInt(quantityElement.textContent, 10);
        if (qty > 1) {
            quantityElement.textContent = qty - 1;
            calculateTotalPrice();
        }
    });
});