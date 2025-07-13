document.addEventListener('DOMContentLoaded', () => {
  // Initialize Telegram Web App
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();

  // Get elements
  const searchContainer = document.getElementById('search-container');
  const searchInput = document.getElementById('search-input');
  const productList = document.getElementById('product-list');
  const storeContainer = document.getElementById('store-container');
  const storeIframe = document.getElementById('store-iframe');
  const loadingSpinner = document.getElementById('loading-spinner');
  const searchBtn = document.getElementById('search-btn');
  const cartBtn = document.getElementById('cart-btn');
  const cartCount = document.getElementById('cart-count');
  const closeBtn = document.getElementById('close-btn');
  const workerToggle = document.getElementById('worker-toggle');
  const workerDashboard = document.getElementById('worker-dashboard');
  const pendingOrders = document.getElementById('pending-orders');
  const restockBtn = document.getElementById('restock-btn');
  const cartModal = document.getElementById('cart-modal');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const categoryButtons = document.querySelectorAll('.category-btn');

  // WooCommerce API configuration
  const API_BASE_URL = 'https://4kruga.ru/wp-json/wc/v3';
  const CONSUMER_KEY = 'your_consumer_key'; // Replace with your WooCommerce Consumer Key
  const CONSUMER_SECRET = 'your_consumer_secret'; // Replace with your WooCommerce Consumer Secret

  // Worker IDs (replace with actual Telegram IDs of workers)
  const WORKER_IDS = ['admin_id1', 'admin_id2'];

  // Cart state
  let cart = [];
  let isWorkerMode = false;

  // Get Telegram user data
  const user = Telegram.WebApp.initDataUnsafe.user;
  if (user) {
    console.log('Пользователь:', user);
    if (WORKER_IDS.includes(user.id.toString())) {
      workerToggle.classList.remove('hidden');
    }
  }

  // Update cart button and Telegram MainButton
  function updateCartButton() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
      cartCount.textContent = totalItems;
      cartCount.classList.remove('hidden');
      Telegram.WebApp.MainButton.show();
      Telegram.WebApp.MainButton.setText(`Оформить заказ (${totalItems})`);
    } else {
      cartCount.classList.add('hidden');
      Telegram.WebApp.MainButton.hide();
    }
    updateCartModal();
  }

  // Update cart modal
  function updateCartModal() {
    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;
    cart.forEach(item => {
      totalPrice += item.price * item.quantity;
      const itemElement = document.createElement('div');
      itemElement.className = 'flex justify-between items-center p-2 bg-white/20 rounded-lg';
      itemElement.innerHTML = `
        <div>
          <p class="font-semibold">${item.name}</p>
          <p class="text-sm text-gray-400">${item.quantity} x ${item.price} ₽</p>
        </div>
        <button class="remove-item text-red-400 hover:text-red-600" data-id="${item.id}">Удалить</button>
      `;
      cartItemsContainer.appendChild(itemElement);
    });
    cartTotal.textContent = `${totalPrice} ₽`;

    // Add remove item listeners
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        cart = cart.filter(item => item.id !== id);
        updateCartButton();
      });
    });
  }

  // Fetch products from WooCommerce API
  async function fetchProducts(query = '', category = '') {
    try {
      loadingSpinner.classList.remove('hidden');
      productList.classList.add('hidden');
      storeContainer.classList.add('hidden');

      const url = new URL(`${API_BASE_URL}/products`);
      url.searchParams.append('consumer_key', CONSUMER_KEY);
      url.searchParams.append('consumer_secret', CONSUMER_SECRET);
      if (query) url.searchParams.append('search', query);
      if (category && category !== 'all') url.searchParams.append('category', category);

      const response = await fetch(url);
      const products = await response.json();

      productList.innerHTML = '';
      products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white/10 backdrop-blur-lg rounded-lg shadow-md p-4 transition-all duration-200 hover:scale-105';
        productCard.innerHTML = `
          <img src="${product.images[0]?.src || 'https://via.placeholder.com/150'}" alt="${product.name}" class="w-full h-32 object-cover rounded-lg mb-2">
          <h3 class="text-lg font-semibold">${product.name}</h3>
          <p class="text-gray-400">${product.price} ₽</p>
          <button class="add-to-cart bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 mt-2" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Добавить в корзину</button>
        `;
        productList.appendChild(productCard);
      });

      productList.classList.remove('hidden');
      loadingSpinner.classList.add('hidden');

      // Add to cart listeners
      document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const name = btn.dataset.name;
          const price = parseFloat(btn.dataset.price);
          const existingItem = cart.find(item => item.id === id);
          if (existingItem) {
            existingItem.quantity++;
          } else {
            cart.push({ id, name, price, quantity: 1 });
          }
          updateCartButton();
          Telegram.WebApp.showAlert('Товар добавлен в корзину!');
        });
      });
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      Telegram.WebApp.showAlert('Ошибка загрузки товаров. Попробуйте позже.');
      productList.classList.add('hidden');
      storeContainer.classList.remove('hidden');
      loadingSpinner.classList.add('hidden');
    }
  }

  // Fetch pending orders (mock data, replace with API)
  async function fetchPendingOrders() {
    // Replace with real WooCommerce API call: GET /wp-json/wc/v3/orders
    const mockOrders = [
      { id: '1', customer: 'Иван Иванов', total: '15000 ₽', status: 'pending' },
      { id: '2', customer: 'Анна Петрова', total: '8000 ₽', status: 'pending' }
    ];

    pendingOrders.innerHTML = '';
    mockOrders.forEach(order => {
      const orderCard = document.createElement('div');
      orderCard.className = 'bg-white/20 rounded-lg p-4';
      orderCard.innerHTML = `
        <p class="font-semibold">Заказ #${order.id}</p>
        <p>Клиент: ${order.customer}</p>
        <p>Сумма: ${order.total}</p>
        <p>Статус: ${order.status}</p>
        <button class="approve-order bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-200 mt-2" data-id="${order.id}">Подтвердить</button>
        <button class="reject-order bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 mt-2" data-id="${order.id}">Отклонить</button>
      `;
      pendingOrders.appendChild(orderCard);
    });

    // Add order action listeners
    document.querySelectorAll('.approve-order').forEach(btn => {
      btn.addEventListener('click', () => {
        Telegram.WebApp.showAlert(`Заказ #${btn.dataset.id} подтвержден!`);
      });
    });
    document.querySelectorAll('.reject-order').forEach(btn => {
      btn.addEventListener('click', () => {
        Telegram.WebApp.showAlert(`Заказ #${btn.dataset.id} отклонен!`);
      });
    });
  }

  // Handle search
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        fetchProducts(query);
      }
    }
  });

  // Handle search button
  searchBtn.addEventListener('click', () => {
    searchContainer.classList.toggle('hidden');
    if (!searchContainer.classList.contains('hidden')) {
      searchInput.focus();
    }
  });

  // Handle category buttons
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      categoryButtons.forEach(btn => btn.classList.remove('bg-blue-500', 'text-white'));
      button.classList.add('bg-blue-500', 'text-white');

      const categoryMap = {
        all: '',
        scooter: 'elektrosamokaty',
        kick_scooter: 'samokaty',
        bicycle: 'velosipedy',
        ebike: 'elektrovelosipedy',
        stroller: 'detskie-kolyaski',
        wheelchair: 'invalidnye-kolyaski'
      };

      fetchProducts('', categoryMap[category]);
    });
  });

  // Handle cart button
  cartBtn.addEventListener('click', () => {
    cartModal.classList.toggle('hidden');
  });

  // Handle close cart modal
  closeCartBtn.addEventListener('click', () => {
    cartModal.classList.add('hidden');
  });

  // Handle checkout
  checkoutBtn.addEventListener('click', async () => {
    if (cart.length === 0) {
      Telegram.WebApp.showAlert('Ваша корзина пуста!');
      return;
    }

    try {
      // Create order via WooCommerce API
      const orderData = {
        payment_method: 'cod',
        payment_method_title: 'Оплата при получении',
        set_paid: false,
        customer_id: user ? user.id : 0,
        billing: {
          first_name: user ? user.first_name : 'Гость',
          last_name: user ? user.last_name || '' : '',
          email: 'guest@4kruga.ru',
          phone: ''
        },
        line_items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        }))
      };

      const response = await fetch(`${API_BASE_URL}/orders?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        cart = [];
        updateCartButton();
        cartModal.classList.add('hidden');
        Telegram.WebApp.showAlert('Заказ успешно оформлен!');
        Telegram.WebApp.sendData(JSON.stringify({ action: 'order_placed', order: orderData }));
      } else {
        throw new Error('Ошибка оформления заказа');
      }
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      Telegram.WebApp.showAlert('Ошибка оформления заказа. Попробуйте позже.');
    }
  });

  // Handle worker toggle
  workerToggle.addEventListener('click', () => {
    isWorkerMode = !isWorkerMode;
    workerToggle.textContent = isWorkerMode ? 'Клиентский режим' : 'Рабочий режим';
    workerDashboard.classList.toggle('hidden', !isWorkerMode);
    productList.classList.toggle('hidden', isWorkerMode);
    storeContainer.classList.toggle('hidden', isWorkerMode);
    if (isWorkerMode) {
      fetchPendingOrders();
    }
  });

  // Handle restock button (mock, replace with API)
  restockBtn.addEventListener('click', () => {
    Telegram.WebApp.showAlert('Склад пополнен (демо-действие)!');
  });

  // Handle close button
  closeBtn.addEventListener('click', () => {
    Telegram.WebApp.close();
  });

  // Handle main button click
  Telegram.WebApp.MainButton.onClick(() => {
    cartModal.classList.remove('hidden');
  });

  // Initial load
  fetchProducts();
  updateCartButton();
});
