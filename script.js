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
  const productList = document.getElementById('product-list');
  const cartSummary = document.getElementById('cart-summary');
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const floatingButtons = document.getElementById('floating-buttons');
  const cartBtn = document.getElementById('cart-btn');
  const cartCount = document.getElementById('cart-count');
  const closeBtn = document.getElementById('close-btn');
  const whatsappBtn = document.getElementById('whatsapp-btn');
  const telegramBtn = document.getElementById('telegram-btn');
  const phoneBtn = document.getElementById('phone-btn');

  // OpenCart API configuration
  const API_BASE_URL = 'https://4kruga.ru/index.php?route=api';
  const API_KEY = '4zrEXMmoBgstC7dRKxp12NV7nqNCzpY1PZ4uXWU8YtTxDYzFVcb2HcwzAEdfuqPInNMTWPdrDFbKFs0NAFUAclEOwzKSdW80Oo0kWXPQKSxBwvf8lTC5lVYRtNIuvY0RyDTZO5zjLX8HNmvhpLbhWRI6KBBFzMKoyKYR4LqSu0W6wGfoHbK0Qym0yi95Y9TurqWKrKfTYZSf7uIfaiuaqSFDXtVdFEMBJnN3nBUrvmPtxbwbdpijluxj4rWmAYgh';

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

  // Fetch products from OpenCart API
  async function fetchProducts(query = '') {
    try {
      loadingSpinner.classList.remove('hidden');
      productList.classList.add('hidden');
      storeContainer.classList.add('hidden');

      const url = `${API_BASE_URL}/product&filter_name=${encodeURIComponent(query)}&api_key=${API_KEY}`;
      const response = await fetch(url);
      const products = await response.json();

      productList.innerHTML = '';
      products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white/10 backdrop-blur-lg rounded-lg shadow-md p-4 transition-all duration-200 hover:scale-105';
        productCard.innerHTML = `
          <img src="${product.image || 'https://via.placeholder.com/150'}" alt="${product.name}" class="w-full h-32 object-cover rounded-lg mb-2">
          <h3 class="text-lg font-semibold">${product.name}</h3>
          <p class="text-gray-400">${product.price} ₽</p>
          <button class="add-to-cart bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 mt-2" data-id="${product.product_id}" data-name="${product.name}" data-price="${product.price}">Добавить в корзину</button>
        `;
        productList.appendChild(productCard);
      });

      productList.classList.remove('hidden');
      storeContainer.classList.add('hidden');
      loadingSpinner.classList.add('hidden');

      // Add to cart listeners
      document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const name = btn.dataset.name;
          const price = parseFloat(btn.dataset.price);
          addToCart(id, name, price);
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

  // Add to cart via OpenCart API
  async function addToCart(productId, name, price) {
    try {
      const data = { product_id: productId, quantity: 1 };
      const response = await fetch(`${API_BASE_URL}/cart/add&api_key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      });

      if (response.ok) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
          existingItem.quantity++;
        } else {
          cart.push({ id: productId, name, price, quantity: 1 });
        }
        updateCart();
        Telegram.WebApp.showAlert('Товар добавлен в корзину!');
      } else {
        throw new Error('Ошибка добавления в корзину');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      Telegram.WebApp.showAlert('Ошибка добавления в корзину.');
    }
  }

  // Fetch cart products from OpenCart API
  async function fetchCartProducts() {
    try {
      const url = `${API_BASE_URL}/cart/products&api_key=${API_KEY}`;
      console.log('Запрос корзины:', url);
      const response = await fetch(url);
      console.log('Статус ответа:', response.status);
      console.log('Полный ответ:', await response.text());
      const cartData = await response.json();
      console.log('Данные корзины:', cartData);
      cart = cartData.products.map(product => ({
        id: product.product_id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: product.quantity
      }));
      updateCart();
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      Telegram.WebApp.showAlert('Ошибка загрузки корзины. Проверьте консоль.');
    }
  }

  // Update cart display
  function updateCart() {
    cartItems.innerHTML = '';
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
      cartItems.appendChild(itemElement);
    });
    cartTotal.textContent = `${totalPrice} ₽`;
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.classList.toggle('hidden', cart.length === 0);
    cartSummary.classList.toggle('hidden', cart.length === 0);
    Telegram.WebApp.MainButton.toggle(cart.length > 0);
    Telegram.WebApp.MainButton.setText(`Оформить заказ (${cart.length})`);

    // Add remove item listeners
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        await removeFromCart(id);
      });
    });
  }

  // Remove from cart via OpenCart API
  async function removeFromCart(productId) {
    try {
      const data = { product_id: productId, quantity: 0 };
      const response = await fetch(`${API_BASE_URL}/cart/add&api_key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      });

      if (response.ok) {
        cart = cart.filter(item => item.id !== productId);
        fetchCartProducts();
      } else {
        throw new Error('Ошибка удаления из корзины');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      Telegram.WebApp.showAlert('Ошибка удаления из корзины.');
    }
  }

  // Create order via OpenCart API
  async function createOrder() {
    try {
      if (cart.length === 0) {
        Telegram.WebApp.showAlert('Ваша корзина пуста!');
        return;
      }

      const orderData = {
        products: cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
        customer: {
          firstname: user?.first_name || 'Гость',
          lastname: user?.last_name || '',
          email: 'guest@4kruga.ru',
          telephone: '+00000000000'
        },
        payment_method: 'cod',
        shipping_method: 'flat.flat'
      };

      const response = await fetch(`${API_BASE_URL}/order/add&api_key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        cart = [];
        updateCart();
        optionsContainer.classList.add('hidden');
        floatingButtons.classList.add('hidden');
        Telegram.WebApp.showAlert(`Заказ успешно оформлен! Номер заказа: ${result.order_id}`);
        Telegram.WebApp.sendData(JSON.stringify({ action: 'order_placed', order_id: result.order_id }));
      } else {
        throw new Error('Ошибка оформления заказа');
      }
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      Telegram.WebApp.showAlert('Ошибка оформления заказа. Попробуйте позже.');
    }
  }

  // Handle options toggle
  optionsToggle.addEventListener('click', () => {
    optionsContainer.classList.toggle('hidden');
    floatingButtons.classList.toggle('hidden');
    if (!optionsContainer.classList.contains('hidden')) {
      fetchCartProducts();
    }
  });

  // Handle search
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        fetchProducts(query);
      }
    }
  });

  // Handle checkout
  checkoutBtn.addEventListener('click', () => {
    createOrder();
  });

  // Handle cart button
  cartBtn.addEventListener('click', () => {
    cartSummary.classList.toggle('hidden');
  });

  // Handle close button
  closeBtn.addEventListener('click', () => {
    Telegram.WebApp.close();
  });

  // Handle main button click
  Telegram.WebApp.MainButton.onClick(() => {
    cartSummary.classList.remove('hidden');
  });

  // Handle contact buttons
  const phoneNumber = '+79991234567'; // Замените на реальный номер, например, +79991234567
  whatsappBtn.addEventListener('click', () => {
    Telegram.WebApp.openLink(`https://wa.me/${phoneNumber}`);
  });
  telegramBtn.addEventListener('click', () => {
    Telegram.WebApp.openLink(`https://t.me/+${phoneNumber}`);
  });
  phoneBtn.addEventListener('click', () => {
    Telegram.WebApp.openLink(`tel:${phoneNumber}`);
  });

  // Initial load
  updateCart();
});
