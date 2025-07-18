// Real M-Pesa Payment Integration
// Till Number: 3788280, Store Number: 8231249

const SERVER_URL = 'http://localhost:5000';
let currentOrder = null;

// Show payment modal with order summary
function showPaymentModal() {
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }

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
                <span>KSH ${(item.price * item.quantity * 130).toFixed(2)}</span>
            </div>
        `).join('');
    }

    if (orderTotalElement) {
        orderTotalElement.textContent = (totalAmount * 130).toFixed(2);
    }

    currentOrder = {
        items: orderItems,
        totalAmount: totalAmount * 130,
        orderId: 'ORD-' + Date.now()
    };

    closeModal('cart');
    openModal('payment');
}

// Process real M-Pesa payment
async function processPayment(phoneNumber) {
    const paymentStatus = document.getElementById('paymentStatus');
    const payNowBtn = document.getElementById('payNowBtn');
    
    paymentStatus.style.display = 'block';
    payNowBtn.disabled = true;
    payNowBtn.textContent = 'Processing...';

    try {
        const response = await fetch(`${SERVER_URL}/api/mpesa/stkpush`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                phoneNumber: phoneNumber,
                amount: currentOrder.totalAmount,
                items: currentOrder.items
            })
        });

        const data = await response.json();

        if (data.success) {
            paymentStatus.innerHTML = `
                <p style="color: #2563eb;">📱 STK Push sent to ${phoneNumber}</p>
                <p><strong>Till Number: 3788280</strong></p>
                <p>Check your phone and enter M-Pesa PIN to complete payment.</p>
                <div class="loading-spinner"></div>
            `;
            checkPaymentStatus(data.orderId);
        } else {
            throw new Error(data.error || 'Payment initiation failed');
        }
    } catch (error) {
        paymentStatus.innerHTML = `
            <p style="color: red;">❌ Error: ${error.message}</p>
            <p>Please check your connection and try again.</p>
        `;
        payNowBtn.disabled = false;
        payNowBtn.textContent = 'Try Again';
    }
}

// Check payment status
async function checkPaymentStatus(orderId) {
    let attempts = 0;
    const maxAttempts = 60; // Check for 5 minutes
    
    const statusCheck = setInterval(async () => {
        attempts++;
        
        try {
            const response = await fetch(`${SERVER_URL}/api/orders/${orderId}/status`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            
            if (data.status === 'completed') {
                clearInterval(statusCheck);
                const paymentStatus = document.getElementById('paymentStatus');
                paymentStatus.innerHTML = `
                    <p style="color: green;">🎉 Payment Successful!</p>
                    <p>Order ID: ${data.order.orderId}</p>
                    <p>M-Pesa Receipt: ${data.order.mpesaReceiptNumber || 'Processing...'}</p>
                    <p>Amount: KSH ${(data.order.totalAmount * 130).toFixed(2)}</p>
                    <small>Your order is now in the admin dashboard.</small>
                `;
                setTimeout(() => {
                    clearCart();
                    closeModal('payment');
                    alert('Payment successful! Your order has been placed.');
                }, 3000);
            } else if (data.status === 'failed') {
                clearInterval(statusCheck);
                const paymentStatus = document.getElementById('paymentStatus');
                const payNowBtn = document.getElementById('payNowBtn');
                paymentStatus.innerHTML = `
                    <p style="color: red;">❌ Payment Failed</p>
                    <p>Transaction was cancelled or failed. Please try again.</p>
                `;
                payNowBtn.disabled = false;
                payNowBtn.textContent = 'Try Again';
            } else if (attempts >= maxAttempts) {
                clearInterval(statusCheck);
                const paymentStatus = document.getElementById('paymentStatus');
                const payNowBtn = document.getElementById('payNowBtn');
                paymentStatus.innerHTML = `
                    <p style="color: orange;">⏱️ Payment Timeout</p>
                    <p>Please check your M-Pesa messages or try again.</p>
                `;
                payNowBtn.disabled = false;
                payNowBtn.textContent = 'Try Again';
            }
        } catch (error) {
            console.error('Status check error:', error);
        }
    }, 5000); // Check every 5 seconds
}



// Handle payment form submission
document.addEventListener('DOMContentLoaded', function() {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
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
});