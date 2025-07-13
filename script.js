document.addEventListener('DOMContentLoaded', () => {
  // Initialize Telegram Web App
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();

  // Get elements
  const searchInput = document.getElementById('search-input');
  const storeIframe = document.getElementById('store-iframe');
  const loadingSpinner = document.getElementById('loading-spinner');
  const closeBtn = document.getElementById('close-btn');
  const mainBtn = document.getElementById('main-btn');
  const categoryButtons = document.querySelectorAll('.category-btn');

  // Get Telegram user data
  const user = Telegram.WebApp.initDataUnsafe.user;
  if (user) {
    console.log('Пользователь:', user);
  }

  // Handle close button
  closeBtn.addEventListener('click', () => {
    Telegram.WebApp.close();
  });

  // Handle back button
  Telegram.WebApp.onEvent('backButtonClicked', () => {
    Telegram.WebApp.close();
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

      // Map categories to store URLs or search queries
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

  // Simulate cart preview (replace with actual store API if available)
  let cartItems = 0; // Placeholder for cart count
  function updateMainButton() {
    if (cartItems > 0) {
      mainBtn.textContent = `Перейти к оформлению (${cartItems})`;
      mainBtn.classList.remove('hidden');
      Telegram.WebApp.MainButton.show();
      Telegram.WebApp.MainButton.setText(`Перейти к оформлению (${cartItems})`);
    } else {
      mainBtn.classList.add('hidden');
      Telegram.WebApp.MainButton.hide();
    }
  }

  // Handle main button click (e.g., proceed to checkout)
  Telegram.WebApp.MainButton.onClick(() => {
    Telegram.WebApp.sendData(JSON.stringify({ action: 'proceed_to_checkout', items: cartItems }));
  });

  // Simulate adding to cart (replace with actual store interaction)
  // Example: Listen for messages from iframe or integrate with store API
  window.addEventListener('message', (event) => {
    if (event.origin === 'https://4kruga.ru') {
      if (event.data.action === 'add_to_cart') {
        cartItems++;
        updateMainButton();
      }
    }
  });

  // Initial load
  updateMainButton();
});
