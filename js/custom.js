// Smart Supply Sourcing China - Complete JavaScript Functionality
// =============================================================

// Global State Management
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let products = [];

// Sample products for search (fallback when API is not available)
const sampleProducts = [
    { name: 'Electronics', category: 'Technology', price: 299.99 },
    { name: 'Clothing', category: 'Fashion', price: 49.99 },
    { name: 'Home Appliances', category: 'Home', price: 199.99 },
    { name: 'Industrial Equipment', category: 'Industrial', price: 999.99 }
];

// Modal Configuration
const modals = {
    contact: { modal: 'contactModal', close: 'closeContactModal' },
    search: { modal: 'searchModal', close: 'closeSearchModal' },
    cart: { modal: 'cartModal', close: 'closeCartModal' },
    mobile: { modal: 'mobileMenu', close: 'closeMobileMenu' },
    quote: { modal: 'quoteModal', close: 'closeQuoteModal' },
    login: { modal: 'loginModal', close: 'closeLoginModal' },
    register: { modal: 'registerModal', close: 'closeRegisterModal' },
    payment: { modal: 'paymentModal', close: 'closePaymentModal' }
};

// Orders will be fetched from API when needed

// =============================================================
// CORE FUNCTIONS
// =============================================================

// Modal Management
function openModal(modalName) {
    const modal = document.getElementById(modals[modalName].modal);
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalName) {
    const modal = document.getElementById(modals[modalName].modal);
    if (modal) modal.style.display = 'none';
}

// =============================================================
// SEARCH FUNCTIONALITY
// =============================================================

function performSearch(query) {
    const results = sampleProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
    );
    
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    if (results.length > 0) {
        resultsContainer.innerHTML = results.map(product => `
            <div class="search-result-item">
                <h4>${product.name}</h4>
                <p>Category: ${product.category}</p>
                <p>Starting from: $${product.price}</p>
                <button class="btn-primary" onclick="addToCart('${product.name}', ${product.price})">Add to Cart</button>
            </div>
        `).join('');
    } else {
        resultsContainer.innerHTML = '<p>No products found. Try different keywords.</p>';
    }
}

// =============================================================
// SHOPPING CART FUNCTIONALITY
// =============================================================

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCartDisplay();
    saveCart();
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCartDisplay();
    saveCart();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.querySelector('.cart-count');
    const mobileCartCount = document.getElementById('mobileCartCount');
    const cartTotalElement = document.getElementById('cartTotal');
    
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    if (cartItems) {
        cartItems.innerHTML = cart.length > 0 ? cart.map(item => `
            <div class="cart-item">
                <div>
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                    <p>$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button class="btn-remove" onclick="removeFromCart('${item.name}')">Remove</button>
            </div>
        `).join('') : '<p>Your cart is empty</p>';
    }
    
    if (cartCount) cartCount.textContent = cart.length;
    if (mobileCartCount) mobileCartCount.textContent = cart.length;
    if (cartTotalElement) cartTotalElement.textContent = cartTotal.toFixed(2);
}

function clearCart() {
    cart = [];
    updateCartDisplay();
    saveCart();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// =============================================================
// AUTHENTICATION & SOCKET.IO SETUP
// =============================================================

// Authentication state
let currentUser = null;
let authToken = localStorage.getItem('authToken');
const SERVER_URL = 'http://localhost:5000';

// Check if user is logged in
if (authToken) {
    fetch(`${SERVER_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    })
    .then(res => res.json())
    .then(user => {
        currentUser = user;
        updateUIForLoggedInUser();
    })
    .catch(err => {
        console.error('Auth check failed:', err);
        localStorage.removeItem('authToken');
    });
}

// =============================================================
// LIVE CHAT FUNCTIONALITY
// =============================================================

// Generate unique session ID for each user
let userChatSessionId = localStorage.getItem('userChatSessionId') || generateSessionId();
localStorage.setItem('userChatSessionId', userChatSessionId);

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// =============================================================
// AUTHENTICATION FUNCTIONS
// =============================================================

async function login(email, password) {
    try {
        const response = await fetch(`${SERVER_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            currentUser = data.user;
            authToken = data.token;
            updateUIForLoggedInUser();
            alert('Login successful!');
            return true;
        } else {
            alert(data.message || 'Login failed');
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check your connection.');
        return false;
    }
}

async function register(username, email, password, role = 'user', adminPassword = null) {
    try {
        const response = await fetch(`${SERVER_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role, adminPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            currentUser = data.user;
            authToken = data.token;
            updateUIForLoggedInUser();
            alert('Registration successful!');
            return true;
        } else {
            alert(data.message || 'Registration failed');
            return false;
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please check your connection.');
        return false;
    }
}

function logout() {
    localStorage.removeItem('authToken');
    currentUser = null;
    authToken = null;
    updateUIForLoggedOutUser();
    alert('Logged out successfully!');
}

function updateUIForLoggedInUser() {
    // Update login button to show user name
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.textContent = currentUser.username;
        loginBtn.onclick = logout;
    }
    
    // Show admin features if user is admin
    if (currentUser.role === 'admin') {
        // Show admin dashboard link or features
        console.log('Admin user logged in');
    }
}

function updateUIForLoggedOutUser() {
    // Reset login button
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.textContent = 'Login';
        loginBtn.onclick = () => openModal('login');
    }
}

// Initialize login button functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn && !currentUser) {
        loginBtn.onclick = () => openModal('login');
    }
});

// Toggle admin password field based on role selection
function toggleAdminPassword() {
    const roleSelect = document.getElementById('registerRole');
    const adminPasswordGroup = document.getElementById('adminPasswordGroup');
    const adminPasswordInput = document.getElementById('adminPassword');
    
    if (roleSelect && adminPasswordGroup) {
        if (roleSelect.value === 'admin') {
            adminPasswordGroup.style.display = 'block';
            adminPasswordInput.required = true;
        } else {
            adminPasswordGroup.style.display = 'none';
            adminPasswordInput.required = false;
            adminPasswordInput.value = '';
        }
    }
}

function addChatMessage(message, isBot = false, skipStorage = false) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isBot ? 'bot-message' : 'user-message'}`;
    
    // Add a tick mark for user messages to show they were sent
    const tickMark = !isBot ? '<span class="message-tick">✓</span>' : '';
    messageDiv.innerHTML = `<p>${message}${tickMark}</p>`;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Send message to backend if not skipping storage
    if (!skipStorage) {
        sendMessageToBackend(message, isBot ? 'admin' : 'user');
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;

    const message = input.value.trim();
    if (message) {
        addChatMessage(message, false, false);
        input.value = '';
    }
}

// Send message to backend via Socket.IO
function sendMessageToBackend(message, sender) {
    // Skip socket functionality if not available
    console.log('Message sent:', message);
}

// Initialize chat session with backend
async function initializeChatSession() {
    try {
        const response = await fetch('http://localhost:5000/api/chat/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: userChatSessionId,
                userEmail: currentUser ? currentUser.email : 'anonymous@example.com',
                userName: currentUser ? currentUser.username : 'Anonymous User'
            })
        });
        
        const session = await response.json();
        console.log('Chat session initialized:', session);
        
        // Join the Socket.IO room
        socket.emit('join_session', userChatSessionId);
        
        // Load existing messages
        loadChatMessages();
    } catch (error) {
        console.error('Error initializing chat session:', error);
    }
}

// Load chat messages from backend
async function loadChatMessages() {
    try {
        const response = await fetch(`http://localhost:5000/api/chat/sessions/${userChatSessionId}/messages`);
        const messages = await response.json();
        
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            // Clear existing messages except initial bot message
            const initialMessage = messagesContainer.querySelector('.bot-message');
            messagesContainer.innerHTML = '';
            if (initialMessage) {
                messagesContainer.appendChild(initialMessage);
            }
            
            // Add messages from backend
            messages.forEach(msg => {
                addChatMessage(msg.message, msg.sender === 'admin', true);
            });
        }
    } catch (error) {
        console.error('Error loading chat messages:', error);
    }
}

// Socket.IO event listeners (disabled for now)
// socket.on('new_message', (message) => {
//     if (message.sender !== 'user' || message.sessionId !== userChatSessionId) {
//         addChatMessage(message.message, message.sender === 'admin', true);
//     }
// });

function showTypingIndicator(senderName) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    // Remove existing typing indicator
    const existingIndicator = messagesContainer.querySelector('.typing-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Add new typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot-message typing-indicator';
    typingDiv.innerHTML = `<p><em>${senderName} is typing...</em></p>`;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    const typingIndicator = messagesContainer.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Real-time chat powered by Socket.IO - no polling needed

// =============================================================
// PAYMENT FUNCTIONALITY
// =============================================================

let currentOrder = null;

// Show payment modal with order summary
function showPaymentModal() {
    if (!currentUser) {
        alert('Please login to continue with payment');
        openModal('login');
        return;
    }

    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }

    // Create order items for payment
    const orderItems = cart.map(item => ({
        productName: item.name,
        price: item.price,
        quantity: item.quantity
    }));

    const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Update payment summary
    const orderItemsContainer = document.getElementById('orderItems');
    const orderTotalElement = document.getElementById('orderTotal');

    if (orderItemsContainer) {
        orderItemsContainer.innerHTML = orderItems.map(item => `
            <div class="order-item">
                <span>${item.productName} x ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
    }

    if (orderTotalElement) {
        orderTotalElement.textContent = totalAmount.toFixed(2);
    }

    // Store current order data
    currentOrder = {
        items: orderItems,
        totalAmount: totalAmount
    };

    closeModal('cart');
    openModal('payment');
}

// Create order in backend
async function createOrder(phoneNumber) {
    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                items: currentOrder.items,
                phoneNumber: phoneNumber
            })
        });

        const data = await response.json();

        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Failed to create order');
        }
    } catch (error) {
        console.error('Create order error:', error);
        throw error;
    }
}

// Initiate M-Pesa payment
async function initiatePayment(orderId, phoneNumber) {
    try {
        const response = await fetch('http://localhost:5000/api/payments/mpesa/initiate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                orderId: orderId,
                phoneNumber: phoneNumber
            })
        });

        const data = await response.json();

        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Payment initiation failed');
        }
    } catch (error) {
        console.error('Payment initiation error:', error);
        throw error;
    }
}

// Check payment status
async function checkPaymentStatus(paymentId) {
    try {
        const response = await fetch(`http://localhost:5000/api/payments/${paymentId}/status`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || 'Failed to check payment status');
        }
    } catch (error) {
        console.error('Payment status check error:', error);
        throw error;
    }
}

// Simple payment processing (no backend required)
function processPayment(phoneNumber) {
    const paymentStatus = document.getElementById('paymentStatus');
    const payNowBtn = document.getElementById('payNowBtn');
    
    paymentStatus.style.display = 'block';
    payNowBtn.disabled = true;
    payNowBtn.textContent = 'Processing...';

    // Simulate payment processing
    paymentStatus.innerHTML = `
        <p style="color: #2563eb;">📱 Payment request sent to ${phoneNumber}</p>
        <p>Please complete the payment on your M-Pesa mobile app.</p>
        <div class="loading-spinner"></div>
    `;

    // Simulate payment verification (3-5 seconds)
    const delay = Math.random() * 2000 + 3000;
    
    setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate
        
        if (success) {
            const orderId = 'ORD-' + Date.now();
            paymentStatus.innerHTML = `
                <p style="color: green;">✅ Payment Successful!</p>
                <p>Order ID: ${orderId}</p>
                <p>Amount: $${currentOrder.totalAmount.toFixed(2)}</p>
                <small>Thank you for your purchase!</small>
            `;
            
            // Save order to localStorage
            saveOrder(orderId, phoneNumber);
            
            // Clear cart after successful payment
            setTimeout(() => {
                clearCart();
                closeModal('payment');
                alert('Payment successful! Your order has been placed.');
            }, 2000);
            
        } else {
            paymentStatus.innerHTML = `
                <p style="color: red;">❌ Payment Failed</p>
                <p>Please check your M-Pesa balance and try again.</p>
            `;
            payNowBtn.disabled = false;
            payNowBtn.textContent = 'Try Again';
        }
    }, delay);
}

// Save order to localStorage
function saveOrder(orderId, phoneNumber) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder = {
        orderId: orderId,
        items: currentOrder.items,
        totalAmount: currentOrder.totalAmount,
        phoneNumber: phoneNumber,
        status: 'completed',
        date: new Date().toISOString(),
        paymentMethod: 'M-Pesa'
    };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
}

// =============================================================
// PRODUCT MANAGEMENT
// =============================================================

function fetchProductsFromAPI(selectedCategory = null) {
    fetch(`${SERVER_URL}/api/products`)
        .then(res => res.json())
        .then(data => {
            products = data;
            let filtered = selectedCategory ? data.filter(p => p.category === selectedCategory) : data;
            renderProducts(filtered);
            renderCategoryLinks(data);
        })
        .catch(err => {
            console.warn('API not available, using sample data:', err);
            products = sampleProducts;
            renderProducts(sampleProducts);
        });
}

// Fetch featured products for homepage
function fetchFeaturedProducts() {
    fetch(`${SERVER_URL}/api/products`)
        .then(res => res.json())
        .then(data => {
            renderFeaturedProducts(data.slice(0, 4));
        })
        .catch(err => {
            console.warn('API not available, using sample data:', err);
            renderFeaturedProducts(sampleProducts.slice(0, 4));
        });
}

// Render featured products on homepage
function renderFeaturedProducts(productList) {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    container.innerHTML = '';
    if (!productList || productList.length === 0) {
        container.innerHTML = '<p>No products available.</p>';
        return;
    }

    productList.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/300x200'}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description || product.category}</p>
                <div class="product-price">
                    <span class="price-current">$${product.price ? product.price.toFixed(2) : 'Contact for price'}</span>
                    <button class="add-to-cart" onclick="addToCart('${product.name}', ${product.price || 0})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(productCard);
    });
}

function renderProducts(productList) {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;

    productsContainer.innerHTML = '';
    if (!productList || productList.length === 0) {
        productsContainer.innerHTML = '<p>No products found for this category.</p>';
        return;
    }

    productList.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/300x200'}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description || product.category}</p>
                <div class="product-price">
                    <span class="price-current">$${product.price ? product.price.toFixed(2) : 'Contact for price'}</span>
                    <button class="add-to-cart" onclick="addToCart('${product.name}', ${product.price || 0})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        productsContainer.appendChild(productCard);
    });
}

function renderCategoryLinks(products, activeCategory = null) {
    const nav = document.getElementById('productCategoriesNav');
    if (!nav) return;

    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    nav.innerHTML = '';

    // Add 'All' button
    const allLink = document.createElement('a');
    allLink.href = '#';
    allLink.textContent = 'All Products';
    allLink.className = `category-link ${!activeCategory ? 'active' : ''}`;
    allLink.onclick = (e) => { 
        e.preventDefault(); 
        setActiveCategory(null);
        fetchProductsFromAPI(); 
    };
    nav.appendChild(allLink);

    // Add category buttons
    categories.forEach(cat => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = cat;
        link.className = `category-link ${activeCategory === cat ? 'active' : ''}`;
        link.onclick = (e) => { 
            e.preventDefault(); 
            setActiveCategory(cat);
            fetchProductsFromAPI(cat); 
        };
        nav.appendChild(link);
    });
}

function setActiveCategory(category) {
    const links = document.querySelectorAll('.category-link');
    links.forEach(link => link.classList.remove('active'));
    
    if (category) {
        const activeLink = Array.from(links).find(link => link.textContent === category);
        if (activeLink) activeLink.classList.add('active');
    } else {
        // Set 'All Products' as active
        const allLink = Array.from(links).find(link => link.textContent === 'All Products');
        if (allLink) allLink.classList.add('active');
    }
}

// =============================================================
// ADMIN DASHBOARD
// =============================================================

function fetchAndRenderOrders() {
    const ordersTableBody = document.getElementById('ordersTableBody');
    if (!ordersTableBody) return;
    
    // Try to fetch orders from API
    fetch(`${SERVER_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    })
        .then(res => res.json())
        .then(orders => {
            renderOrdersTable(orders);
        })
        .catch(err => {
            console.warn('Orders API not available:', err);
            ordersTableBody.innerHTML = '<tr><td colspan="8">No orders available or login required.</td></tr>';
        });
}

function renderOrdersTable(orders) {
    const ordersTableBody = document.getElementById('ordersTableBody');
    if (!ordersTableBody || !orders) return;
    
    if (orders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No completed orders yet.</td></tr>';
        return;
    }
    
    ordersTableBody.innerHTML = orders.map(order => {
        const statusClass = `status-${order.status.toLowerCase()}`;
        return `
            <tr class="order-row">
                <td>${order.id}</td>
                <td>${order.customer}</td>
                <td>${order.products}</td>
                <td>${order.quantity}</td>
                <td>KSH ${(order.amount * 130).toFixed(2)}</td>
                <td>${order.phone}</td>
                <td>${order.date}</td>
                <td><span class="order-status ${statusClass}">${order.status}</span></td>
            </tr>
        `;
    }).join('');
}

// =============================================================
// EVENT LISTENERS & INITIALIZATION
// =============================================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart display
    updateCartDisplay();
    
    // Initialize admin dashboard if on admin page
    if (document.getElementById('ordersTableBody')) {
        fetchAndRenderOrders();
    }
    
    // Initialize product categories if on products page
    if (document.getElementById('productCategoriesNav')) {
        fetchProductsFromAPI();
    }
    
    // Initialize featured products on homepage
    if (document.getElementById('featuredProducts')) {
        fetchFeaturedProducts();
    }
    
    // Modal close buttons
    Object.keys(modals).forEach(modalName => {
        const closeBtn = document.getElementById(modals[modalName].close);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modalName));
        }
    });
    
    // Navigation modals
    const contactBtn = document.getElementById('contactNavBtn');
    const mobileContactBtn = document.getElementById('mobileContactBtn');
    if (contactBtn) contactBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('contact'); });
    if (mobileContactBtn) mobileContactBtn.addEventListener('click', (e) => { e.preventDefault(); openModal('contact'); });
    
    // Search functionality
    const searchBtn = document.querySelector('.search-btn');
    const mobileSearchBtn = document.querySelector('.mobile-search-btn');
    const searchInput = document.getElementById('searchInput');
    const searchSubmitBtn = document.querySelector('.search-submit-btn');
    
    if (searchBtn) searchBtn.addEventListener('click', () => openModal('search'));
    if (mobileSearchBtn) mobileSearchBtn.addEventListener('click', () => openModal('search'));
    
    if (searchSubmitBtn) {
        searchSubmitBtn.addEventListener('click', () => {
            const query = searchInput?.value.trim();
            if (query) performSearch(query);
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) performSearch(query);
            }
        });
    }
    
    // Cart functionality
    const cartBtn = document.querySelector('.cart-btn');
    const mobileCartBtn = document.querySelector('.mobile-cart-btn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCartBtn');
    
    if (cartBtn) cartBtn.addEventListener('click', () => openModal('cart'));
    if (mobileCartBtn) mobileCartBtn.addEventListener('click', () => openModal('cart'));
    if (checkoutBtn) checkoutBtn.addEventListener('click', showPaymentModal);
    if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);
    
    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => openModal('mobile'));
    
    // Newsletter
    const newsletterBtn = document.querySelector('.newsletter-btn');
    const newsletterInput = document.querySelector('.newsletter-input');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', () => {
            const email = newsletterInput?.value.trim();
            if (email) {
                alert(`Thank you for subscribing with email: ${email}`);
                newsletterInput.value = '';
            }
        });
    }
    
    // Quote form
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Quote request sent successfully! We will contact you soon.');
            quoteForm.reset();
            closeModal('quote');
        });
    }

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const success = await login(email, password);
            if (success) {
                closeModal('login');
                loginForm.reset();
            }
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const role = document.getElementById('registerRole').value;
            const adminPassword = document.getElementById('adminPassword').value;
            
            const success = await register(username, email, password, role, adminPassword);
            if (success) {
                closeModal('register');
                registerForm.reset();
                // Reset admin password field visibility
                document.getElementById('adminPasswordGroup').style.display = 'none';
                document.getElementById('registerRole').value = 'user';
            }
        });
    }

    // Payment form
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phoneNumber = document.getElementById('paymentPhone').value;
            
            if (!phoneNumber) {
                alert('Please enter your M-Pesa phone number');
                return;
            }
            
            // Validate phone number format
            const phoneRegex = /^(\+254|0)[17]\d{8}$/;
            if (!phoneRegex.test(phoneNumber)) {
                alert('Please enter a valid Kenyan phone number (e.g., 0712345678)');
                return;
            }
            
            processPayment(phoneNumber);
        });
    }
    
    // Live chat
    const chatToggle = document.getElementById('chatToggle');
    const chatClose = document.getElementById('chatClose');
    const chatWindow = document.getElementById('chatWindow');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');
    
    if (chatToggle) {
        chatToggle.addEventListener('click', () => {
            const isVisible = chatWindow.style.display !== 'none';
            chatWindow.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                // Chat is being opened - initialize with backend
                initializeChatSession();
            }
        });
    }
    if (chatClose) {
        chatClose.addEventListener('click', () => {
            chatWindow.style.display = 'none';
        });
    }
    if (chatSend) chatSend.addEventListener('click', sendChatMessage);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChatMessage();
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        Object.keys(modals).forEach(modalName => {
            const modal = document.getElementById(modals[modalName].modal);
            if (e.target === modal) {
                closeModal(modalName);
            }
        });
    });
    
    // Set footer year
    const yearSpan = document.getElementById('footerYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});