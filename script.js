document.addEventListener('DOMContentLoaded', () => {
  // Initialize Telegram Web App
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();

  // Get elements
  const searchContainer = document.getElementById('search-container');
  const searchInput = document.getElementById('search-input');
  const storeIframe = document.getElementById('store-iframe');
  const loadingSpinner = document.getElementById('loading-spinner');
  const searchBtn = document.getElementById('search-btn');
  const cartBtn = document.getElementById('cart-btn');
  const cartCount = document.getElementById('cart-count');
  const closeBtn = document.getElementById('close-btn');
  const categoryButtons = document.querySelectorAll('.category-btn');

  // Get Telegram user data
  const user = Telegram.WebApp.initDataUnsafe.user;
  if (user) {
    console.log('Пользователь:', user);
  }

  // Cart state (replace with store API if available)
  let cartItems = 0;

  // Update cart button and Telegram MainButton
  function updateCartButton() {
    if (cartItems > 0) {
      cartCount.textContent = cartItems;
      cartCount.classList.remove('hidden');
      Telegram.WebApp.MainButton.show();
      Telegram.WebApp.MainButton.setText(`Оформить заказ (${cartItems})`);
    } else {
      cartCount.classList.add('hidden');
      Telegram.WebApp.MainButton.hide();
    }
  }

  // Handle search button (toggle search bar)
  searchBtn.addEventListener('click', () => {
    searchContainer.classList.toggle('hidden');
    if (!searchContainer.classList.contains('hidden')) {
      searchInput.focus();
    }
  });

  // Handle search
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        loadingSpinner.classList.remove('hidden');
        storeIframe.classList.add('hidden');
        const searchUrl = `https://4kruga.ru/?s=${encodeURIComponent(query)}`;
        storeIframe.src = searchUrl;
        setTimeout(() => {
          loadingSpinner.classList.add('hidden');
          storeIframe.classList.remove('hidden');
        }, 1000);
      }
    }
  });

  // Handle category buttons
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      loadingSpinner.classList.remove('hidden');
      storeIframe.classList.add('hidden');
      
      // Reset active state
      categoryButtons.forEach(btn => btn.classList.remove('bg-blue-500', 'text-white'));
      button.classList.add('bg-blue-500', 'text-white');

      // Map categories to store URLs
      const categoryMap = {
        all: 'https://4kruga.ru/',
        scooter: 'https://4kruga.ru/product-category/elektrosamokaty/',
        kick_scooter: 'https://4kruga.ru/product-category/samokaty/',
        bicycle: 'https://4kruga.ru/product-category/velosipedy/',
        ebike: 'https://4kruga.ru/product-category/elektrovelosipedy/',
        stroller: 'https://4kruga.ru/product-category/detskie-kolyaski/',
        wheelchair: 'https://4kruga.ru/product-category/invalidnye-kolyaski/'
      };

      storeIframe.src = categoryMap[category] || 'https://4kruga.ru/';
      setTimeout(() => {
        loadingSpinner.classList.add('hidden');
        storeIframe.classList.remove('hidden');
      }, 1000);
    });
  });

  // Handle cart button
  cartBtn.addEventListener('click', () => {
    if (cartItems > 0) {
      Telegram.WebApp.MainButton.click();
    } else {
      Telegram.WebApp.showAlert('Ваша корзина пуста!');
    }
  });

  // Handle main button click (proceed to checkout)
  Telegram.WebApp.MainButton.onClick(() => {
    Telegram.WebApp.sendData(JSON.stringify({ action: 'proceed_to_checkout', items: cartItems }));
  });

  // Handle close button
  closeBtn.addEventListener('click', () => {
    Telegram.WebApp.close();
  });

  // Handle back button
  Telegram.WebApp.onEvent('backButtonClicked', () => {
    Telegram.WebApp.close();
  });

  // Simulate adding to cart (replace with store API integration)
  window.addEventListener('message', (event) => {
    if (event.origin === 'https://4kruga.ru') {
      if (event.data.action === 'add_to_cart') {
        cartItems++;
        updateCartButton();
      }
    }
  });

  // Initial load
  updateCartButton();
});
