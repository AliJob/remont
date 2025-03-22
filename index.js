document.addEventListener("DOMContentLoaded", function () {
    // Инициализация услуг
    const services = [
        { title: "Ремонт самокатов", icon: "🛴", description: "Быстрый и качественный ремонт электрических и обычных самокатов." },
        { title: "Ремонт велосипедов", icon: "🚲", description: "Полный спектр услуг по ремонту и обслуживанию велосипедов." },
        { title: "Электротовары", icon: "🔌", description: "Профессиональный ремонт зарядных устройств, аккумуляторов и сложной электронной техники любого уровня" }
    ];

    const servicesContainer = document.getElementById("services");
    services.forEach(createServiceCard);

    // Обработчик отзывов
    const reviewForm = document.getElementById("reviewForm");
    const reviewsList = document.getElementById("reviewsList");
    let reviews = JSON.parse(localStorage.getItem('reviews')) || [];

    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const review = {
            author: formData.get('author'),
            text: formData.get('text'),
            date: new Date().toLocaleDateString()
        };

        reviews.push(review);
        localStorage.setItem('reviews', JSON.stringify(reviews));
        this.reset();
        displayReviews();
    });

    function displayReviews() {
        reviewsList.innerHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-author">${review.author} • ${review.date}</div>
                <p>${review.text}</p>
            </div>
        `).join('');
    }

    displayReviews();

    // Вспомогательные функции
    function createServiceCard(service) {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="icon">${service.icon}</div>
            <h2>${service.title}</h2>
            <p>${service.description}</p>
        `;
        servicesContainer.appendChild(card);
    }
});