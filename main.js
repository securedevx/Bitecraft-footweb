/**
 * BITECRAFT - Professional Fast Food Web Application
 * Main JavaScript File
 * 
 * This file handles all interactive functionality including:
 * - Cart management
 * - Menu filtering
 * - Order processing
 * - Form validation
 * - UI interactions
 */

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================

const CONFIG = {
    APP_NAME: 'BITECRAFT',
    BRAND_COLORS: {
        primary: '#C62828',
        secondary: '#1E1E1E',
        accent: '#FFC107',
        background: '#FAFAFA'
    },
    CART_KEY: 'bitecraft_cart',
    CURRENCY: '$'
};

// ============================================
// STATE MANAGEMENT
// ============================================

const AppState = {
    cart: [],
    menuItems: [],
    currentPage: 'home'
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadCartFromStorage();
    initNavigation();
    initMobileMenu();
    initMenuFilters();
    initCartFunctionality();
    initOrderForm();
    initAnimations();
    updateCartUI();
    
    console.log(`${CONFIG.APP_NAME} - Application initialized successfully`);
}

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    AppState.currentPage = currentPage;
    
    // Set active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }
}

// ============================================
// MENU FUNCTIONALITY
// ============================================

function initMenuFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuCards = document.querySelectorAll('.menu-card');
    
    if (filterButtons.length === 0) return;
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.dataset.category;
            
            // Filter menu cards with animation
            menuCards.forEach(card => {
                const cardCategory = card.dataset.category;
                
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.4s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

function renderMenuItems(items) {
    const menuGrid = document.querySelector('.menu-grid');
    if (!menuGrid) return;
    
    menuGrid.innerHTML = items.map(item => `
        <div class="menu-card" data-category="${item.category}">
            <div class="menu-card-image">
                <img src="${item.image}" alt="${item.name}">
                ${item.badge ? `<span class="menu-badge">${item.badge}</span>` : ''}
            </div>
            <div class="menu-card-content">
                <h3 class="menu-card-title">${item.name}</h3>
                <p class="menu-card-desc">${item.description}</p>
                <div class="menu-card-footer">
                    <span class="menu-card-price">${CONFIG.CURRENCY}${item.price.toFixed(2)}</span>
                    <button class="btn btn-primary btn-sm add-to-cart" data-id="${item.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Re-initialize add to cart buttons
    initAddToCartButtons();
}

// ============================================
// CART FUNCTIONALITY
// ============================================

function initCartFunctionality() {
    // Cart icon click handler
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            openCartModal();
        });
    }
    
    // Initialize add to cart buttons
    initAddToCartButtons();
}

function initAddToCartButtons() {
    const buttons = document.querySelectorAll('.add-to-cart');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            addToCart(id);
        });
    });
}

function addToCart(itemId) {
    // Find item from menu cards
    const menuCard = document.querySelector(`.menu-card[data-id="${itemId}"]`);
    
    if (!menuCard) {
        // Try to find from menu items data
        const menuItem = AppState.menuItems.find(item => item.id === itemId);
        if (!menuItem) return;
        
        const existingItem = AppState.cart.find(item => item.id === itemId);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            AppState.cart.push({ ...menuItem, quantity: 1 });
        }
    } else {
        // Extract data from card
        const name = menuCard.querySelector('.menu-card-title').textContent;
        const priceText = menuCard.querySelector('.menu-card-price').textContent;
        const price = parseFloat(priceText.replace(CONFIG.CURRENCY, ''));
        const image = menuCard.querySelector('img').src;
        
        const existingItem = AppState.cart.find(item => item.id === itemId);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            AppState.cart.push({
                id: itemId,
                name: name,
                price: price,
                image: image,
                quantity: 1
            });
        }
    }
    
    saveCartToStorage();
    updateCartUI();
    showNotification('Item added to cart!');
}

function removeFromCart(itemId) {
    AppState.cart = AppState.cart.filter(item => item.id !== itemId);
    saveCartToStorage();
    updateCartUI();
    renderCartItems();
}

function updateQuantity(itemId, change) {
    const item = AppState.cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCartToStorage();
            updateCartUI();
            renderCartItems();
        }
    }
}

function clearCart() {
    AppState.cart = [];
    saveCartToStorage();
    updateCartUI();
    renderCartItems();
}

function getCartTotal() {
    return AppState.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartCount() {
    return AppState.cart.reduce((count, item) => count + item.quantity, 0);
}

function saveCartToStorage() {
    localStorage.setItem(CONFIG.CART_KEY, JSON.stringify(AppState.cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem(CONFIG.CART_KEY);
    if (savedCart) {
        AppState.cart = JSON.parse(savedCart);
    }
}

function updateCartUI() {
    // Update cart count badge
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        const count = getCartCount();
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'flex' : 'none';
    }
    
    // Update cart total display
    const cartTotal = document.querySelector('.cart-total');
    if (cartTotal) {
        cartTotal.textContent = `${CONFIG.CURRENCY}${getCartTotal().toFixed(2)}`;
    }
}

function renderCartItems() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartEmpty = document.querySelector('.cart-empty');
    const cartSummary = document.querySelector('.cart-summary');
    
    if (!cartItemsContainer) return;
    
    if (AppState.cart.length === 0) {
        if (cartEmpty) cartEmpty.style.display = 'block';
        if (cartItemsContainer) cartItemsContainer.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartItemsContainer) cartItemsContainer.style.display = 'block';
    if (cartSummary) cartSummary.style.display = 'block';
    
    cartItemsContainer.innerHTML = AppState.cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <span class="cart-item-price">${CONFIG.CURRENCY}${item.price.toFixed(2)}</span>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="qty-btn qty-decrease" data-id="${item.id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn qty-increase" data-id="${item.id}">+</button>
                </div>
                <button class="remove-btn" data-id="${item.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    
    // Update total in cart
    const cartTotalElement = document.querySelector('.cart-summary-total');
    if (cartTotalElement) {
        cartTotalElement.textContent = `${CONFIG.CURRENCY}${getCartTotal().toFixed(2)}`;
    }
    
    // Initialize quantity buttons
    initQuantityControls();
    initRemoveButtons();
}

function initQuantityControls() {
    const decreaseBtns = document.querySelectorAll('.qty-decrease');
    const increaseBtns = document.querySelectorAll('.qty-increase');
    
    decreaseBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            updateQuantity(id, -1);
        });
    });
    
    increaseBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            updateQuantity(id, 1);
        });
    });
}

function initRemoveButtons() {
    const removeBtns = document.querySelectorAll('.remove-btn');
    removeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('.remove-btn').dataset.id);
            removeFromCart(id);
        });
    });
}

function openCartModal() {
    const cartModal = document.querySelector('.cart-modal');
    const overlay = document.querySelector('.overlay');
    
    if (cartModal && overlay) {
        renderCartItems();
        cartModal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCartModal() {
    const cartModal = document.querySelector('.cart-modal');
    const overlay = document.querySelector('.overlay');
    
    if (cartModal && overlay) {
        cartModal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================
// ORDER FORM
// ============================================

function initOrderForm() {
    const orderForm = document.getElementById('orderForm');
    if (!orderForm) return;
    
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        processOrder();
    });
    
    // Real-time validation
    const inputs = orderForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    switch (field.id) {
        case 'customerName':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'Name must be at least 2 characters';
            }
            break;
        case 'customerEmail':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;
        case 'customerPhone':
            const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
            break;
        case 'customerAddress':
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'Please enter your complete address';
            }
            break;
    }
    
    setFieldValidation(field, isValid, errorMessage);
    return isValid;
}

function setFieldValidation(field, isValid, message) {
    const formGroup = field.closest('.form-group');
    const errorElement = formGroup?.querySelector('.error-message');
    
    if (isValid) {
        field.classList.remove('error');
        if (errorElement) errorElement.textContent = '';
    } else {
        field.classList.add('error');
        if (errorElement) errorElement.textContent = message;
    }
}

function processOrder() {
    // Validate all fields
    const form = document.getElementById('orderForm');
    const inputs = form.querySelectorAll('input, textarea');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showNotification('Please fill in all required fields correctly', 'error');
        return;
    }
    
    if (AppState.cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    // Collect order data
    const orderData = {
        orderId: generateOrderId(),
        timestamp: new Date().toISOString(),
        customer: {
            name: form.customerName.value.trim(),
            email: form.customerEmail.value.trim(),
            phone: form.customerPhone.value.trim(),
            address: form.customerAddress.value.trim()
        },
        items: AppState.cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        })),
        total: getCartTotal(),
        paymentMethod: form.paymentMethod.value,
        specialInstructions: form.specialInstructions?.value.trim() || ''
    };
    
    // Log order data (for backend integration)
    console.log('========================================');
    console.log(`${CONFIG.APP_NAME} - NEW ORDER RECEIVED`);
    console.log('========================================');
    console.log('Order ID:', orderData.orderId);
    console.log('Timestamp:', orderData.timestamp);
    console.log('Customer:', orderData.customer);
    console.log('Items:', orderData.items);
    console.log('Total:', `${CONFIG.CURRENCY}${orderData.total.toFixed(2)}`);
    console.log('Payment:', orderData.paymentMethod);
    console.log('========================================');
    
    // Store order for confirmation page
    localStorage.setItem('bitecraft_last_order', JSON.stringify(orderData));
    
    // Show success message
    showNotification('Order placed successfully! Redirecting...', 'success');
    
    // Clear cart
    clearCart();
    
    // Redirect to confirmation (simulate with timeout)
    setTimeout(() => {
        window.location.href = 'order-confirmation.html';
    }, 2000);
}

function generateOrderId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        animation: slideIn 0.3s ease forwards;
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    `;
    closeBtn.addEventListener('click', () => notification.remove());
    
    // Auto remove
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ============================================
// ANIMATIONS
// ============================================

function initAnimations() {
    // Add CSS animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .animate-on-scroll.visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
    
    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatCurrency(amount) {
    return `${CONFIG.CURRENCY}${amount.toFixed(2)}`;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        AppState,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getCartCount,
        clearCart
    };
}
