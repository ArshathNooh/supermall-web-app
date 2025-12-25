/**
 * Super Mall Web Application - Main Application Logic
 * Handles UI, routing, and service integration
 */

// ============================================
// Logger Utility
// ============================================
const Logger = {
  log: (message, data) => {
    console.log(`[LOG] ${new Date().toISOString()} - ${message}`, data || '');
  },
  info: (message, data) => {
    console.info(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  },
  error: (message, error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  },
  warn: (message, data) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
  }
};

// Make Logger available globally
window.Logger = Logger;

// ============================================
// Application State
// ============================================
const App = {
  currentPage: 'dashboard',
  currentUser: null,
  userRole: null,
  shops: [],
  products: [],
  offers: [],
  categories: [],
  floors: [],
  selectedProducts: new Set()
};

// ============================================
// DOM Elements
// ============================================
const elements = {
  // Screens
  loginScreen: document.getElementById('loginScreen'),
  dashboardScreen: document.getElementById('dashboardScreen'),
  
  // Login
  loginForm: document.getElementById('loginForm'),
  registerForm: document.getElementById('registerForm'),
  showRegister: document.getElementById('showRegister'),
  showLogin: document.getElementById('showLogin'),
  loginError: document.getElementById('loginError'),
  registerError: document.getElementById('registerError'),
  
  // Sidebar
  sidebar: document.getElementById('sidebar'),
  sidebarToggle: document.getElementById('sidebarToggle'),
  mobileMenuToggle: document.getElementById('mobileMenuToggle'),
  navItems: document.querySelectorAll('.nav-item'),
  
  // Header
  pageTitle: document.getElementById('pageTitle'),
  userEmail: document.getElementById('userEmail'),
  userRole: document.getElementById('userRole'),
  userProfileBtn: document.getElementById('userProfileBtn'),
  userDropdown: document.getElementById('userDropdown'),
  logoutBtn: document.getElementById('logoutBtn'),
  
  // Pages
  pages: {
    dashboard: document.getElementById('pageDashboard'),
    shops: document.getElementById('pageShops'),
    products: document.getElementById('pageProducts'),
    offers: document.getElementById('pageOffers'),
    categories: document.getElementById('pageCategories'),
    floors: document.getElementById('pageFloors'),
    reports: document.getElementById('pageReports'),
    settings: document.getElementById('pageSettings')
  },
  
  // Dashboard
  totalShops: document.getElementById('totalShops'),
  totalProducts: document.getElementById('totalProducts'),
  totalOffers: document.getElementById('totalOffers'),
  totalCategories: document.getElementById('totalCategories'),
  recentShops: document.getElementById('recentShops'),
  
  // Shops
  shopsTableBody: document.getElementById('shopsTableBody'),
  shopSearch: document.getElementById('shopSearch'),
  shopFilterFloor: document.getElementById('shopFilterFloor'),
  shopFilterCategory: document.getElementById('shopFilterCategory'),
  addShopBtn: document.getElementById('addShopBtn'),
  
  // Products
  productsTableBody: document.getElementById('productsTableBody'),
  productSearch: document.getElementById('productSearch'),
  productFilterCategory: document.getElementById('productFilterCategory'),
  productFilterMinPrice: document.getElementById('productFilterMinPrice'),
  productFilterMaxPrice: document.getElementById('productFilterMaxPrice'),
  selectAllProducts: document.getElementById('selectAllProducts'),
  compareProductsBtn: document.getElementById('compareProductsBtn'),
  addProductBtn: document.getElementById('addProductBtn'),
  
  // Offers
  offersGrid: document.getElementById('offersGrid'),
  offerSearch: document.getElementById('offerSearch'),
  addOfferBtn: document.getElementById('addOfferBtn'),
  
  // Modals
  shopModal: document.getElementById('shopModal'),
  productModal: document.getElementById('productModal'),
  offerModal: document.getElementById('offerModal'),
  compareModal: document.getElementById('compareModal')
};

// ============================================
// Initialize Application
// ============================================
function init() {
  Logger.info('Initializing Super Mall Application');
  
  // Initialize Firebase Auth
  authService.init();
  
  // Setup event listeners
  setupEventListeners();
  
  // Setup auth state listener
  authService.onAuthStateChange((user, role) => {
    handleAuthStateChange(user, role);
  });
  
  Logger.info('Application initialized');
}

// ============================================
// Event Listeners Setup
// ============================================
function setupEventListeners() {
  // Login/Register
  elements.loginForm.addEventListener('submit', handleLogin);
  elements.registerForm.addEventListener('submit', handleRegister);
  elements.showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    elements.loginForm.classList.add('hidden');
    elements.registerForm.classList.remove('hidden');
  });
  elements.showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    elements.registerForm.classList.add('hidden');
    elements.loginForm.classList.remove('hidden');
  });
  
  // Navigation
  elements.navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateToPage(page);
    });
  });
  
  // Sidebar toggle
  elements.sidebarToggle?.addEventListener('click', () => {
    elements.sidebar.classList.toggle('active');
  });
  elements.mobileMenuToggle?.addEventListener('click', () => {
    elements.sidebar.classList.toggle('active');
  });
  
  // User menu
  elements.userProfileBtn?.addEventListener('click', () => {
    elements.userDropdown.classList.toggle('active');
  });
  elements.logoutBtn?.addEventListener('click', handleLogout);
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!elements.userProfileBtn?.contains(e.target) && !elements.userDropdown?.contains(e.target)) {
      elements.userDropdown?.classList.remove('active');
    }
  });
  
  // Shops
  elements.addShopBtn?.addEventListener('click', () => openShopModal());
  elements.shopSearch?.addEventListener('input', debounce(handleShopSearch, 300));
  elements.shopFilterFloor?.addEventListener('change', handleShopFilter);
  elements.shopFilterCategory?.addEventListener('change', handleShopFilter);
  
  // Products
  elements.addProductBtn?.addEventListener('click', () => openProductModal());
  elements.productSearch?.addEventListener('input', debounce(handleProductSearch, 300));
  elements.productFilterCategory?.addEventListener('change', handleProductFilter);
  elements.productFilterMinPrice?.addEventListener('input', debounce(handleProductFilter, 300));
  elements.productFilterMaxPrice?.addEventListener('input', debounce(handleProductFilter, 300));
  elements.selectAllProducts?.addEventListener('change', handleSelectAllProducts);
  elements.compareProductsBtn?.addEventListener('click', handleCompareProducts);
  
  // Offers
  elements.addOfferBtn?.addEventListener('click', () => openOfferModal());
  elements.offerSearch?.addEventListener('input', debounce(handleOfferSearch, 300));
  
  // Modal close buttons
  setupModalListeners();
}

// ============================================
// Authentication Handlers
// ============================================
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  Logger.info('Login attempt:', email);
  elements.loginError.textContent = '';
  
  const result = await authService.login(email, password);
  if (result.success) {
    Logger.info('Login successful');
  } else {
    elements.loginError.textContent = result.error;
    Logger.error('Login failed:', result.error);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const role = document.getElementById('registerRole').value;
  
  Logger.info('Registration attempt:', email);
  elements.registerError.textContent = '';
  
  const result = await authService.register(email, password, role);
  if (result.success) {
    Logger.info('Registration successful');
    elements.registerForm.classList.add('hidden');
    elements.loginForm.classList.remove('hidden');
  } else {
    elements.registerError.textContent = result.error;
    Logger.error('Registration failed:', result.error);
  }
}

async function handleLogout() {
  Logger.info('Logout initiated');
  const result = await authService.logout();
  if (result.success) {
    Logger.info('Logout successful');
  }
}

function handleAuthStateChange(user, role) {
  App.currentUser = user;
  App.userRole = role;
  
  if (user) {
    elements.loginScreen.classList.remove('active');
    elements.dashboardScreen.classList.add('active');
    elements.userEmail.textContent = user.email;
    elements.userRole.textContent = role || 'user';
    
    // Update UI based on role
    updateUIForRole(role);
    
    // Load initial data
    loadInitialData();
  } else {
    elements.loginScreen.classList.add('active');
    elements.dashboardScreen.classList.remove('active');
    App.shops = [];
    App.products = [];
    App.offers = [];
  }
}

function updateUIForRole(role) {
  const isAdmin = role === 'admin';
  
  // Show/hide admin buttons
  const adminButtons = document.querySelectorAll('[id$="Btn"]');
  adminButtons.forEach(btn => {
    if (btn.id.includes('add') || btn.id.includes('Add')) {
      btn.style.display = isAdmin ? 'inline-flex' : 'none';
    }
  });
  
  // Show/hide admin nav items
  const adminNavItems = ['navCategories', 'navFloors', 'navReports'];
  adminNavItems.forEach(navId => {
    const navItem = document.getElementById(navId);
    if (navItem) {
      navItem.style.display = isAdmin ? 'flex' : 'none';
    }
  });
}

// ============================================
// Navigation
// ============================================
function navigateToPage(page) {
  Logger.info(`Navigating to page: ${page}`);
  
  // Update active nav item
  elements.navItems.forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === page) {
      item.classList.add('active');
    }
  });
  
  // Hide all pages
  Object.values(elements.pages).forEach(pageEl => {
    if (pageEl) pageEl.classList.remove('active');
  });
  
  // Show selected page
  if (elements.pages[page]) {
    elements.pages[page].classList.add('active');
    elements.pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
    App.currentPage = page;
    
    // Load page data
    loadPageData(page);
  }
  
  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    elements.sidebar.classList.remove('active');
  }
}

// ============================================
// Data Loading
// ============================================
async function loadInitialData() {
  Logger.info('Loading initial data');
  await Promise.all([
    loadShops(),
    loadProducts(),
    loadOffers(),
    loadCategories(),
    loadFloors()
  ]);
  updateDashboard();
}

async function loadPageData(page) {
  switch (page) {
    case 'dashboard':
      updateDashboard();
      break;
    case 'shops':
      await loadShops();
      renderShops();
      break;
    case 'products':
      await loadProducts();
      renderProducts();
      break;
    case 'offers':
      await loadOffers();
      renderOffers();
      break;
    case 'categories':
      await loadCategories();
      renderCategories();
      break;
    case 'floors':
      await loadFloors();
      renderFloors();
      break;
    case 'reports':
      renderReports();
      break;
  }
}

async function loadShops() {
  const result = await shopsService.getAllShops();
  if (result.success) {
    App.shops = result.data;
    Logger.info(`Loaded ${App.shops.length} shops`);
  }
}

async function loadProducts() {
  const result = await productsService.getAllProducts();
  if (result.success) {
    App.products = result.data;
    Logger.info(`Loaded ${App.products.length} products`);
  }
}

async function loadOffers() {
  const result = await offersService.getActiveOffers();
  if (result.success) {
    App.offers = result.data;
    Logger.info(`Loaded ${App.offers.length} offers`);
  }
}

async function loadCategories() {
  // Extract unique categories from shops and products
  const shopCategories = [...new Set(App.shops.map(s => s.category).filter(Boolean))];
  const productCategories = [...new Set(App.products.map(p => p.category).filter(Boolean))];
  App.categories = [...new Set([...shopCategories, ...productCategories])];
  Logger.info(`Loaded ${App.categories.length} categories`);
}

async function loadFloors() {
  // Extract unique floors from shops
  App.floors = [...new Set(App.shops.map(s => s.floor).filter(Boolean))];
  Logger.info(`Loaded ${App.floors.length} floors`);
}

// ============================================
// Dashboard
// ============================================
function updateDashboard() {
  elements.totalShops.textContent = App.shops.length;
  elements.totalProducts.textContent = App.products.length;
  elements.totalOffers.textContent = App.offers.length;
  elements.totalCategories.textContent = App.categories.length;
  
  // Show recent shops
  const recentShops = App.shops.slice(0, 5);
  if (recentShops.length > 0) {
    let html = '<table class="data-table"><thead><tr><th>Name</th><th>Floor</th><th>Category</th></tr></thead><tbody>';
    recentShops.forEach(shop => {
      html += `<tr>
        <td>${escapeHtml(shop.name)}</td>
        <td>${escapeHtml(shop.floor)}</td>
        <td>${escapeHtml(shop.category)}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    elements.recentShops.innerHTML = html;
  } else {
    elements.recentShops.innerHTML = '<p class="text-center">No shops available</p>';
  }
}

// ============================================
// Shops Management
// ============================================
function renderShops() {
  if (!elements.shopsTableBody) return;
  
  // Update filter options
  updateShopFilters();
  
  let shops = App.shops;
  
  // Apply filters
  const floorFilter = elements.shopFilterFloor?.value;
  const categoryFilter = elements.shopFilterCategory?.value;
  
  if (floorFilter) {
    shops = shops.filter(s => s.floor === floorFilter);
  }
  if (categoryFilter) {
    shops = shops.filter(s => s.category === categoryFilter);
  }
  
  if (shops.length === 0) {
    elements.shopsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No shops found</td></tr>';
    return;
  }
  
  let html = '';
  shops.forEach(shop => {
    html += `<tr>
      <td>${escapeHtml(shop.name)}</td>
      <td>${escapeHtml(shop.floor)}</td>
      <td>${escapeHtml(shop.category)}</td>
      <td>${escapeHtml(shop.location || '-')}</td>
      <td>${escapeHtml(shop.contact || '-')}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="viewShop('${shop.id}')">View</button>
        ${App.userRole === 'admin' ? `
          <button class="btn btn-sm btn-primary" onclick="editShop('${shop.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteShop('${shop.id}')">Delete</button>
        ` : ''}
      </td>
    </tr>`;
  });
  
  elements.shopsTableBody.innerHTML = html;
}

function updateShopFilters() {
  // Update floor filter
  if (elements.shopFilterFloor) {
    const currentFloor = elements.shopFilterFloor.value;
    let html = '<option value="">All Floors</option>';
    App.floors.forEach(floor => {
      html += `<option value="${escapeHtml(floor)}" ${floor === currentFloor ? 'selected' : ''}>${escapeHtml(floor)}</option>`;
    });
    elements.shopFilterFloor.innerHTML = html;
  }
  
  // Update category filter
  if (elements.shopFilterCategory) {
    const currentCategory = elements.shopFilterCategory.value;
    let html = '<option value="">All Categories</option>';
    App.categories.forEach(category => {
      html += `<option value="${escapeHtml(category)}" ${category === currentCategory ? 'selected' : ''}>${escapeHtml(category)}</option>`;
    });
    elements.shopFilterCategory.innerHTML = html;
  }
}

async function handleShopSearch() {
  const query = elements.shopSearch?.value.trim();
  if (!query) {
    renderShops();
    return;
  }
  
  const result = await shopsService.searchShops(query);
  if (result.success) {
    App.shops = result.data;
    renderShops();
  }
}

function handleShopFilter() {
  renderShops();
}

function openShopModal(shopId = null) {
  const modal = elements.shopModal;
  const form = document.getElementById('shopForm');
  const title = document.getElementById('shopModalTitle');
  
  if (shopId) {
    const shop = App.shops.find(s => s.id === shopId);
    if (shop) {
      title.textContent = 'Edit Shop';
      document.getElementById('shopId').value = shop.id;
      document.getElementById('shopName').value = shop.name || '';
      document.getElementById('shopDescription').value = shop.description || '';
      document.getElementById('shopFloor').value = shop.floor || '';
      document.getElementById('shopCategory').value = shop.category || '';
      document.getElementById('shopLocation').value = shop.location || '';
      document.getElementById('shopContact').value = shop.contact || '';
      document.getElementById('shopEmail').value = shop.email || '';
      document.getElementById('shopOpeningHours').value = shop.openingHours || '';
    }
  } else {
    title.textContent = 'Add Shop';
    form.reset();
    document.getElementById('shopId').value = '';
    
    // Populate floor and category dropdowns
    populateShopFormDropdowns();
  }
  
  modal.classList.add('active');
}

function populateShopFormDropdowns() {
  // Populate floor dropdown
  const floorSelect = document.getElementById('shopFloor');
  if (floorSelect) {
    let html = '<option value="">Select Floor</option>';
    App.floors.forEach(floor => {
      html += `<option value="${escapeHtml(floor)}">${escapeHtml(floor)}</option>`;
    });
    floorSelect.innerHTML = html;
  }
  
  // Populate category dropdown
  const categorySelect = document.getElementById('shopCategory');
  if (categorySelect) {
    let html = '<option value="">Select Category</option>';
    App.categories.forEach(category => {
      html += `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`;
    });
    categorySelect.innerHTML = html;
  }
}

function setupModalListeners() {
  // Shop modal
  document.getElementById('shopForm')?.addEventListener('submit', handleShopSubmit);
  document.getElementById('closeShopModal')?.addEventListener('click', () => {
    elements.shopModal.classList.remove('active');
  });
  document.getElementById('cancelShopBtn')?.addEventListener('click', () => {
    elements.shopModal.classList.remove('active');
  });
  
  // Product modal
  document.getElementById('productForm')?.addEventListener('submit', handleProductSubmit);
  document.getElementById('closeProductModal')?.addEventListener('click', () => {
    elements.productModal.classList.remove('active');
  });
  document.getElementById('cancelProductBtn')?.addEventListener('click', () => {
    elements.productModal.classList.remove('active');
  });
  
  // Offer modal
  document.getElementById('offerForm')?.addEventListener('submit', handleOfferSubmit);
  document.getElementById('closeOfferModal')?.addEventListener('click', () => {
    elements.offerModal.classList.remove('active');
  });
  document.getElementById('cancelOfferBtn')?.addEventListener('click', () => {
    elements.offerModal.classList.remove('active');
  });
  
  // Compare modal
  document.getElementById('closeCompareModal')?.addEventListener('click', () => {
    elements.compareModal.classList.remove('active');
  });
}

async function handleShopSubmit(e) {
  e.preventDefault();
  const shopId = document.getElementById('shopId').value;
  const shopData = {
    name: document.getElementById('shopName').value,
    description: document.getElementById('shopDescription').value,
    floor: document.getElementById('shopFloor').value,
    category: document.getElementById('shopCategory').value,
    location: document.getElementById('shopLocation').value,
    contact: document.getElementById('shopContact').value,
    email: document.getElementById('shopEmail').value,
    openingHours: document.getElementById('shopOpeningHours').value
  };
  
  let result;
  if (shopId) {
    Logger.info(`Updating shop: ${shopId}`);
    result = await shopsService.updateShop(shopId, shopData);
  } else {
    Logger.info('Creating new shop');
    result = await shopsService.createShop(shopData);
  }
  
  if (result.success) {
    elements.shopModal.classList.remove('active');
    await loadShops();
    await loadFloors();
    renderShops();
    updateDashboard();
  } else {
    alert(result.error);
  }
}

async function deleteShop(shopId) {
  if (!confirm('Are you sure you want to delete this shop?')) return;
  
  Logger.info(`Deleting shop: ${shopId}`);
  const result = await shopsService.deleteShop(shopId);
  if (result.success) {
    await loadShops();
    renderShops();
    updateDashboard();
  } else {
    alert(result.error);
  }
}

function viewShop(shopId) {
  const shop = App.shops.find(s => s.id === shopId);
  if (shop) {
    alert(`Shop: ${shop.name}\nFloor: ${shop.floor}\nCategory: ${shop.category}\nLocation: ${shop.location || 'N/A'}\nContact: ${shop.contact || 'N/A'}\nDescription: ${shop.description || 'N/A'}`);
  }
}

function editShop(shopId) {
  openShopModal(shopId);
}

// ============================================
// Products Management
// ============================================
function renderProducts() {
  if (!elements.productsTableBody) return;
  
  let products = App.products;
  
  // Apply filters
  const categoryFilter = elements.productFilterCategory?.value;
  const minPrice = parseFloat(elements.productFilterMinPrice?.value) || 0;
  const maxPrice = parseFloat(elements.productFilterMaxPrice?.value) || Infinity;
  
  if (categoryFilter) {
    products = products.filter(p => p.category === categoryFilter);
  }
  products = products.filter(p => {
    const price = p.price || 0;
    return price >= minPrice && price <= maxPrice;
  });
  
  if (products.length === 0) {
    elements.productsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No products found</td></tr>';
    return;
  }
  
  let html = '';
  products.forEach(product => {
    const isSelected = App.selectedProducts.has(product.id);
    html += `<tr>
      <td><input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleProductSelection('${product.id}')"></td>
      <td>${escapeHtml(product.name)}</td>
      <td>${escapeHtml(product.shopName || '-')}</td>
      <td>${escapeHtml(product.category || '-')}</td>
      <td>$${parseFloat(product.price || 0).toFixed(2)}</td>
      <td>${escapeHtml(product.brand || '-')}</td>
      <td>${product.inStock ? '<span class="badge-success">In Stock</span>' : '<span class="badge-danger">Out of Stock</span>'}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="viewProduct('${product.id}')">View</button>
        ${App.userRole === 'admin' ? `
          <button class="btn btn-sm btn-primary" onclick="editProduct('${product.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
        ` : ''}
      </td>
    </tr>`;
  });
  
  elements.productsTableBody.innerHTML = html;
}

async function handleProductSearch() {
  const query = elements.productSearch?.value.trim();
  if (!query) {
    await loadProducts();
    renderProducts();
    return;
  }
  
  const result = await productsService.searchProducts(query);
  if (result.success) {
    App.products = result.data;
    renderProducts();
  }
}

function handleProductFilter() {
  renderProducts();
}

function toggleProductSelection(productId) {
  if (App.selectedProducts.has(productId)) {
    App.selectedProducts.delete(productId);
  } else {
    App.selectedProducts.add(productId);
  }
  elements.selectAllProducts.checked = App.selectedProducts.size === App.products.length;
}

function handleSelectAllProducts(e) {
  if (e.target.checked) {
    App.products.forEach(p => App.selectedProducts.add(p.id));
  } else {
    App.selectedProducts.clear();
  }
  renderProducts();
}

async function handleCompareProducts() {
  if (App.selectedProducts.size < 2) {
    alert('Please select at least 2 products to compare');
    return;
  }
  
  const productIds = Array.from(App.selectedProducts);
  const result = await productsService.compareProducts(productIds);
  
  if (result.success && result.data.length > 0) {
    renderCompareProducts(result.data);
    elements.compareModal.classList.add('active');
  }
}

function renderCompareProducts(products) {
  const container = document.getElementById('compareProductsContainer');
  if (!container) return;
  
  let html = '';
  products.forEach(product => {
    html += `<div class="compare-product">
      <h4>${escapeHtml(product.name)}</h4>
      <div class="compare-feature">
        <span class="compare-feature-label">Shop:</span>
        <span class="compare-feature-value">${escapeHtml(product.shopName || '-')}</span>
      </div>
      <div class="compare-feature">
        <span class="compare-feature-label">Price:</span>
        <span class="compare-feature-value">$${parseFloat(product.price || 0).toFixed(2)}</span>
      </div>
      <div class="compare-feature">
        <span class="compare-feature-label">Brand:</span>
        <span class="compare-feature-value">${escapeHtml(product.brand || '-')}</span>
      </div>
      <div class="compare-feature">
        <span class="compare-feature-label">Category:</span>
        <span class="compare-feature-value">${escapeHtml(product.category || '-')}</span>
      </div>
      <div class="compare-feature">
        <span class="compare-feature-label">In Stock:</span>
        <span class="compare-feature-value">${product.inStock ? 'Yes' : 'No'}</span>
      </div>
      ${product.features && product.features.length > 0 ? `
        <div class="compare-feature">
          <span class="compare-feature-label">Features:</span>
          <span class="compare-feature-value">${escapeHtml(product.features.join(', '))}</span>
        </div>
      ` : ''}
      ${product.description ? `
        <div class="compare-feature">
          <span class="compare-feature-label">Description:</span>
          <span class="compare-feature-value">${escapeHtml(product.description)}</span>
        </div>
      ` : ''}
    </div>`;
  });
  
  container.innerHTML = html;
}

function openProductModal(productId = null) {
  const modal = elements.productModal;
  const form = document.getElementById('productForm');
  const title = document.getElementById('productModalTitle');
  
  if (productId) {
    const product = App.products.find(p => p.id === productId);
    if (product) {
      title.textContent = 'Edit Product';
      document.getElementById('productId').value = product.id;
      document.getElementById('productName').value = product.name || '';
      document.getElementById('productDescription').value = product.description || '';
      document.getElementById('productShop').value = product.shopId || '';
      document.getElementById('productCategory').value = product.category || '';
      document.getElementById('productPrice').value = product.price || '';
      document.getElementById('productBrand').value = product.brand || '';
      document.getElementById('productFeatures').value = Array.isArray(product.features) ? product.features.join(', ') : '';
      document.getElementById('productImageUrl').value = product.imageUrl || '';
      document.getElementById('productInStock').checked = product.inStock !== false;
    }
  } else {
    title.textContent = 'Add Product';
    form.reset();
    document.getElementById('productId').value = '';
    document.getElementById('productInStock').checked = true;
    
    // Populate shop dropdown
    const shopSelect = document.getElementById('productShop');
    if (shopSelect) {
      let html = '<option value="">Select Shop</option>';
      App.shops.forEach(shop => {
        html += `<option value="${shop.id}">${escapeHtml(shop.name)}</option>`;
      });
      shopSelect.innerHTML = html;
    }
  }
  
  modal.classList.add('active');
}

async function handleProductSubmit(e) {
  e.preventDefault();
  const productId = document.getElementById('productId').value;
  const shopId = document.getElementById('productShop').value;
  const shop = App.shops.find(s => s.id === shopId);
  
  const productData = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDescription').value,
    shopId: shopId,
    shopName: shop ? shop.name : '',
    category: document.getElementById('productCategory').value,
    price: document.getElementById('productPrice').value,
    brand: document.getElementById('productBrand').value,
    features: document.getElementById('productFeatures').value.split(',').map(f => f.trim()).filter(Boolean),
    imageUrl: document.getElementById('productImageUrl').value,
    inStock: document.getElementById('productInStock').checked
  };
  
  let result;
  if (productId) {
    Logger.info(`Updating product: ${productId}`);
    result = await productsService.updateProduct(productId, productData);
  } else {
    Logger.info('Creating new product');
    result = await productsService.createProduct(productData);
  }
  
  if (result.success) {
    elements.productModal.classList.remove('active');
    await loadProducts();
    renderProducts();
    updateDashboard();
  } else {
    alert(result.error);
  }
}

async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  Logger.info(`Deleting product: ${productId}`);
  const result = await productsService.deleteProduct(productId);
  if (result.success) {
    await loadProducts();
    renderProducts();
    updateDashboard();
  } else {
    alert(result.error);
  }
}

function viewProduct(productId) {
  const product = App.products.find(p => p.id === productId);
  if (product) {
    alert(`Product: ${product.name}\nShop: ${product.shopName || 'N/A'}\nPrice: $${parseFloat(product.price || 0).toFixed(2)}\nBrand: ${product.brand || 'N/A'}\nCategory: ${product.category || 'N/A'}\nDescription: ${product.description || 'N/A'}`);
  }
}

function editProduct(productId) {
  openProductModal(productId);
}

// ============================================
// Offers Management
// ============================================
function renderOffers() {
  if (!elements.offersGrid) return;
  
  if (App.offers.length === 0) {
    elements.offersGrid.innerHTML = '<p class="text-center">No offers available</p>';
    return;
  }
  
  let html = '';
  App.offers.forEach(offer => {
    const discountText = offer.discountType === 'percentage' 
      ? `${offer.discount}% OFF` 
      : `$${offer.discount} OFF`;
    
    html += `<div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${escapeHtml(offer.title)}</div>
          <div class="card-subtitle">${escapeHtml(offer.shopName || 'N/A')}</div>
        </div>
        <span class="badge-success">${discountText}</span>
      </div>
      <div class="card-body">
        <p>${escapeHtml(offer.description || 'No description')}</p>
        ${offer.validUntil ? `<p><small>Valid until: ${formatDate(offer.validUntil.toDate())}</small></p>` : ''}
      </div>
      <div class="card-footer">
        <button class="btn btn-sm btn-secondary" onclick="viewOffer('${offer.id}')">View</button>
        ${App.userRole === 'admin' ? `
          <button class="btn btn-sm btn-primary" onclick="editOffer('${offer.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteOffer('${offer.id}')">Delete</button>
        ` : ''}
      </div>
    </div>`;
  });
  
  elements.offersGrid.innerHTML = html;
}

async function handleOfferSearch() {
  const query = elements.offerSearch?.value.trim();
  if (!query) {
    await loadOffers();
    renderOffers();
    return;
  }
  
  const result = await offersService.searchOffers(query);
  if (result.success) {
    App.offers = result.data;
    renderOffers();
  }
}

function openOfferModal(offerId = null) {
  const modal = elements.offerModal;
  const form = document.getElementById('offerForm');
  const title = document.getElementById('offerModalTitle');
  
  if (offerId) {
    const offer = App.offers.find(o => o.id === offerId);
    if (offer) {
      title.textContent = 'Edit Offer';
      document.getElementById('offerId').value = offer.id;
      document.getElementById('offerTitle').value = offer.title || '';
      document.getElementById('offerDescription').value = offer.description || '';
      document.getElementById('offerShop').value = offer.shopId || '';
      document.getElementById('offerDiscount').value = offer.discount || '';
      document.getElementById('offerDiscountType').value = offer.discountType || 'percentage';
      document.getElementById('offerValidFrom').value = offer.validFrom ? formatDateInput(offer.validFrom.toDate()) : '';
      document.getElementById('offerValidUntil').value = offer.validUntil ? formatDateInput(offer.validUntil.toDate()) : '';
      document.getElementById('offerTerms').value = offer.terms || '';
      document.getElementById('offerIsActive').checked = offer.isActive !== false;
    }
  } else {
    title.textContent = 'Add Offer';
    form.reset();
    document.getElementById('offerId').value = '';
    document.getElementById('offerDiscountType').value = 'percentage';
    document.getElementById('offerIsActive').checked = true;
    
    // Populate shop dropdown
    const shopSelect = document.getElementById('offerShop');
    if (shopSelect) {
      let html = '<option value="">Select Shop</option>';
      App.shops.forEach(shop => {
        html += `<option value="${shop.id}">${escapeHtml(shop.name)}</option>`;
      });
      shopSelect.innerHTML = html;
    }
  }
  
  modal.classList.add('active');
}

async function handleOfferSubmit(e) {
  e.preventDefault();
  const offerId = document.getElementById('offerId').value;
  const shopId = document.getElementById('offerShop').value;
  const shop = App.shops.find(s => s.id === shopId);
  
  const offerData = {
    title: document.getElementById('offerTitle').value,
    description: document.getElementById('offerDescription').value,
    shopId: shopId,
    shopName: shop ? shop.name : '',
    discount: document.getElementById('offerDiscount').value,
    discountType: document.getElementById('offerDiscountType').value,
    validFrom: document.getElementById('offerValidFrom').value,
    validUntil: document.getElementById('offerValidUntil').value,
    terms: document.getElementById('offerTerms').value,
    isActive: document.getElementById('offerIsActive').checked
  };
  
  let result;
  if (offerId) {
    Logger.info(`Updating offer: ${offerId}`);
    result = await offersService.updateOffer(offerId, offerData);
  } else {
    Logger.info('Creating new offer');
    result = await offersService.createOffer(offerData);
  }
  
  if (result.success) {
    elements.offerModal.classList.remove('active');
    await loadOffers();
    renderOffers();
    updateDashboard();
  } else {
    alert(result.error);
  }
}

async function deleteOffer(offerId) {
  if (!confirm('Are you sure you want to delete this offer?')) return;
  
  Logger.info(`Deleting offer: ${offerId}`);
  const result = await offersService.deleteOffer(offerId);
  if (result.success) {
    await loadOffers();
    renderOffers();
    updateDashboard();
  } else {
    alert(result.error);
  }
}

function viewOffer(offerId) {
  const offer = App.offers.find(o => o.id === offerId);
  if (offer) {
    const discountText = offer.discountType === 'percentage' 
      ? `${offer.discount}% OFF` 
      : `$${offer.discount} OFF`;
    alert(`Offer: ${offer.title}\nShop: ${offer.shopName || 'N/A'}\nDiscount: ${discountText}\nDescription: ${offer.description || 'N/A'}\nTerms: ${offer.terms || 'N/A'}`);
  }
}

function editOffer(offerId) {
  openOfferModal(offerId);
}

// ============================================
// Categories & Floors
// ============================================
function renderCategories() {
  const container = document.getElementById('categoriesGrid');
  if (!container) return;
  
  if (App.categories.length === 0) {
    container.innerHTML = '<p class="text-center">No categories available</p>';
    return;
  }
  
  let html = '';
  App.categories.forEach(category => {
    const shopCount = App.shops.filter(s => s.category === category).length;
    const productCount = App.products.filter(p => p.category === category).length;
    
    html += `<div class="card">
      <div class="card-header">
        <div class="card-title">${escapeHtml(category)}</div>
      </div>
      <div class="card-body">
        <p>Shops: ${shopCount}</p>
        <p>Products: ${productCount}</p>
      </div>
    </div>`;
  });
  
  container.innerHTML = html;
}

function renderFloors() {
  const container = document.getElementById('floorsGrid');
  if (!container) return;
  
  if (App.floors.length === 0) {
    container.innerHTML = '<p class="text-center">No floors available</p>';
    return;
  }
  
  let html = '';
  App.floors.forEach(floor => {
    const shopCount = App.shops.filter(s => s.floor === floor).length;
    
    html += `<div class="card">
      <div class="card-header">
        <div class="card-title">${escapeHtml(floor)}</div>
      </div>
      <div class="card-body">
        <p>Shops: ${shopCount}</p>
      </div>
    </div>`;
  });
  
  container.innerHTML = html;
}

function renderReports() {
  // Simple text-based reports (can be enhanced with charts)
  const floorChart = document.getElementById('floorDistributionChart');
  const categoryChart = document.getElementById('categoryDistributionChart');
  const priceChart = document.getElementById('priceAnalysisChart');
  
  if (floorChart) {
    let html = '<ul>';
    App.floors.forEach(floor => {
      const count = App.shops.filter(s => s.floor === floor).length;
      html += `<li>${escapeHtml(floor)}: ${count} shops</li>`;
    });
    html += '</ul>';
    floorChart.innerHTML = html;
  }
  
  if (categoryChart) {
    let html = '<ul>';
    App.categories.forEach(category => {
      const count = App.shops.filter(s => s.category === category).length;
      html += `<li>${escapeHtml(category)}: ${count} shops</li>`;
    });
    html += '</ul>';
    categoryChart.innerHTML = html;
  }
  
  if (priceChart) {
    const prices = App.products.map(p => parseFloat(p.price || 0)).filter(p => p > 0);
    if (prices.length > 0) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      priceChart.innerHTML = `
        <p>Min Price: $${min.toFixed(2)}</p>
        <p>Max Price: $${max.toFixed(2)}</p>
        <p>Average Price: $${avg.toFixed(2)}</p>
        <p>Total Products: ${prices.length}</p>
      `;
    } else {
      priceChart.innerHTML = '<p>No price data available</p>';
    }
  }
}

// ============================================
// Utility Functions
// ============================================
function escapeHtml(text) {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

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

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDateInput(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Make functions available globally for onclick handlers
window.toggleProductSelection = toggleProductSelection;
window.viewShop = viewShop;
window.editShop = editShop;
window.deleteShop = deleteShop;
window.viewProduct = viewProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.viewOffer = viewOffer;
window.editOffer = editOffer;
window.deleteOffer = deleteOffer;

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

