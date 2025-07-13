document.addEventListener('DOMContentLoaded', () => {
  // Initialize Telegram Web App
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();

  // Get elements
  const storeContainer = document.getElementById('store-container');
  const storeIframe = document.getElementById('store-iframe');
  const loadingSpinner = document.getElementById('loading-spinner');
  const optionsToggle = document.getElementById('options-toggle');
  const optionsContainer = document.getElementById('options-container');
  const searchContainer = document.getElementById('search-container');
  const searchInput = document.getElementById('search-input');
  const workerDashboard = document.getElementById('worker-dashboard');
  const pendingOrders = document.getElementById('pending-orders');
  const restockBtn = document.getElementById('restock-btn');
  const floatingButtons = document.getElementById('floating-buttons');
  const cartBtn = document.getElementById('cart-btn');
  const cartCount = document.getElementById('cart-count');
  const closeBtn = document.getElementById('close-btn');
  const cartModal = document.getElementById('cart-modal');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');

  // WooCommerce API configuration (placeholders, replace with secure method)
  const API_BASE_URL = 'https://4kruga.ru/wp-json/wc/v3';
  const CONSUMER_KEY = 'your_consumer_key'; // Replace with your WooCommerce Consumer Key
  const CONSUMER_SECRET = 'your_consumer_secret'; // Replace with your WooCommerce Consumer Secret

  // Worker IDs (replace with actual Telegram IDs of workers)
  const WORKER_IDS = ['admin_id1', 'admin_id2'];

  // Cart state
  let cart = [];

  // Get Telegram user data
  const user = Telegram.WebApp.initDataUnsafe.user;
  if (user) {
    console.log('Пользователь:', user);
  }

  // Load store on startup
  function loadStore() {
    loadingSpinner.classList.remove('hidden');
    storeIframe.onload = () => {
      loadingSpinner.classList.add('hidden');
    };
  }
  loadStore();

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

  // Handle options toggle
  optionsToggle.addEventListener('click', () => {
    optionsContainer.classList.toggle('hidden');
    floatingButtons.classList.toggle('hidden');
    if (!optionsContainer.classList.contains('hidden') && WORKER_IDS.includes(user?.id.toString())) {
      workerDashboard.classList.remove('hidden');
      fetchPendingOrders();
    }
  });

  // Handle search
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        // Simulate search (replace with API if needed)
        Telegram.WebApp.showAlert(`Поиск: ${query} (демо)`);
      }
    }
  });

  // Fetch pending orders (mock data, replace with API)
  async function fetchPendingOrders() {
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

  // Handle restock button
  restockBtn.addEventListener('click', () => {
    Telegram.WebApp.showAlert('Склад пополнен (демо-действие)!');
  });

  // Handle cart button
  cartBtn.addEventListener('click', () => {
    cartModal.classList.toggle('hidden');
  });

  // Handle checkout
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      Telegram.WebApp.showAlert('Ваша корзина пуста!');
      return;
    }
    Telegram.WebApp.showAlert('Заказ оформлен (демо)!');
    cart = [];
    updateCartButton();
    cartModal.classList.add('hidden');
  });

  // Handle close cart modal
  closeCartBtn.addEventListener('click', () => {
    cartModal.classList.add('hidden');
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
  updateCartButton();
});
