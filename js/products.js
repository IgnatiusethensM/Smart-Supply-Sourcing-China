// Custom JS for products.html (Product Categories Page)

// Fetch products from backend API and render by category (copied from custom.js)
function fetchProductsFromAPI(selectedCategory = null) {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(products => {
        // If a category is selected, filter products
        let filtered = products;
        if (selectedCategory) {
            filtered = products.filter(p => p.category === selectedCategory);
        }
        renderProducts(filtered);
        renderCategoryLinks(products);
      })
      .catch(err => {
          console.error('Failed to load products:', err);
          // Optionally, show a message to the user
      });
}

// Render Products (accepts array)
function renderProducts(productList) {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) return;
    productsContainer.innerHTML = '';
    if (!productList || productList.length === 0) {
        productsContainer.innerHTML = '<p>No products found for this category.</p>';
        return;
    }
    // Group products by category
    const grouped = {};
    productList.forEach(product => {
        if (!grouped[product.category]) grouped[product.category] = [];
        grouped[product.category].push(product);
    });
    // Render each category section vertically, one after another
    Object.keys(grouped).forEach(category => {
        const section = document.createElement('section');
        section.className = 'category-section';
        section.style.marginBottom = '3rem';
        section.innerHTML = `<h2 class="category-heading" style="margin-bottom:1.5rem;">${category || 'Uncategorized'}</h2>`;
        // Create a vertical list for products in this category
        const list = document.createElement('div');
        list.className = 'products-vertical-list';
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = '2rem';
        grouped[category].forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.style.display = 'flex';
            productCard.style.alignItems = 'flex-start';
            productCard.style.gap = '2rem';
            productCard.style.background = '#fff';
            productCard.style.borderRadius = '10px';
            productCard.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)';
            productCard.style.padding = '1.5rem';
            productCard.style.margin = '0 auto';
            productCard.style.maxWidth = '700px';
            productCard.innerHTML = `
                <div class="product-image" style="min-width:160px;max-width:200px;display:flex;align-items:center;justify-content:center;height:180px;background:#f8f8f8;border-radius:8px;overflow:hidden;">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" style="max-width:100%;max-height:160px;object-fit:contain;">
                </div>
                <div class="product-info" style="flex:1;">
                    <h3 class="product-title" style="margin-top:0;">${product.name}</h3>
                    <p class="product-description">${product.description || ''}</p>
                    <div class="product-price" style="margin-top:1rem;display:flex;align-items:center;gap:1rem;">
                        <span class="price-current" style="font-size:1.2rem;font-weight:bold;color:#2563eb;">KSH ${product.price ? product.price.toFixed(2) : 'N/A'}</span>
                        <button class="add-to-cart" style="background:#f59e0b;color:#fff;border:none;padding:0.5rem 1.2rem;border-radius:6px;cursor:pointer;">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                </div>
            `;
            list.appendChild(productCard);
        });
        section.appendChild(list);
        productsContainer.appendChild(section);
    });
}

// Render category links and set up event listeners
function renderCategoryLinks(products) {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const nav = document.getElementById('productCategoriesNav');
    if (!nav) return;
    nav.innerHTML = '';
    // Modern horizontal, responsive button group
    nav.style.display = 'flex';
    nav.style.flexDirection = 'row';
    nav.style.justifyContent = 'flex-start';
    nav.style.alignItems = 'center';
    nav.style.gap = '1rem';
    nav.style.position = 'static';
    nav.style.background = 'transparent';
    nav.style.padding = '0';
    nav.style.margin = '2rem 0 2.5rem 0';
    nav.style.borderRadius = '0';
    nav.style.boxShadow = 'none';

    // Button style (modern, clean)
    const baseBtnStyle = `
        background: #fff;
        color: #222;
        border: none;
        border-radius: 2rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        padding: 0.6rem 1.6rem;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        outline: none;
    `;
    const hoverStyle = `background: #f59e0b; color: #fff; box-shadow: 0 4px 16px rgba(245,158,11,0.12);`;

    // Add 'All' button
    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.textContent = 'All';
    allBtn.className = 'category-btn';
    allBtn.setAttribute('style', baseBtnStyle + 'margin-bottom:0;');
    allBtn.onmouseenter = function() { allBtn.style.cssText = baseBtnStyle + hoverStyle + 'margin-bottom:0;'; };
    allBtn.onmouseleave = function() { allBtn.style.cssText = baseBtnStyle + 'margin-bottom:0;'; };
    allBtn.onclick = function(e) {
        e.preventDefault();
        fetchProductsFromAPI();
    };
    nav.appendChild(allBtn);
    // Add category buttons
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = cat;
        btn.className = 'category-btn';
        btn.setAttribute('style', baseBtnStyle + 'margin-bottom:0;');
        btn.onmouseenter = function() { btn.style.cssText = baseBtnStyle + hoverStyle + 'margin-bottom:0;'; };
        btn.onmouseleave = function() { btn.style.cssText = baseBtnStyle + 'margin-bottom:0;'; };
        btn.onclick = function(e) {
            e.preventDefault();
            fetchProductsFromAPI(cat);
        };
        nav.appendChild(btn);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Example: Highlight the active nav link for Products
    var navLinks = document.querySelectorAll('.main-nav .nav-link');
    navLinks.forEach(function(link) {
        if (link.getAttribute('href') === 'products.html') {
            link.classList.add('active');
        }
    });
    // Fetch and render products on page load
    fetchProductsFromAPI();
});
