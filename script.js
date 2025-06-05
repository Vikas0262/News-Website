const API_KEY = "pub_8eb68eedf6e44ab486e6ce70fc75336a";
const url = "https://newsdata.io/api/1/latest";
let currentArticles = [];

// DOM Elements
const modal = document.getElementById("newsModal");
const modalClose = document.querySelector(".modal-close");
const modalImage = document.getElementById("modal-image");
const modalTitle = document.getElementById("modal-title");
const modalSource = document.getElementById("modal-source");
const modalDescription = document.getElementById("modal-description");
const readMoreBtn = document.getElementById("read-more");

// Initialize the app
window.addEventListener("load", () => {
    fetchNews("India");
    setupEventListeners();
});

function reload() {
    window.location.reload();
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchButton = document.getElementById("search-button");
    const searchText = document.getElementById("search-text");
    
    searchButton.addEventListener('click', handleSearch);
    searchText.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Modal close button
    modalClose.addEventListener('click', () => {
        modal.style.display = "none";
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
}

function handleSearch() {
    const query = searchText.value.trim();
    if (!query) return;
    fetchNews(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
}

async function fetchNews(query) {
    try {
        const cardsContainer = document.getElementById("cards-container");
        cardsContainer.innerHTML = "<div class='loading'>Loading news...</div>";
        
        const fullUrl = `${url}?apikey=${API_KEY}&country=in&q=${encodeURIComponent(query)}`;
        const res = await fetch(fullUrl);
        const data = await res.json();
        
        if (data.status === "success" && data.results && data.results.length > 0) {
            currentArticles = data.results;
            bindData(currentArticles);
        } else {
            cardsContainer.innerHTML = "<p>No articles found. Try a different search term.</p>";
            console.error("API Error:", data);
        }
    } catch (error) {
        document.getElementById("cards-container").innerHTML = "<p>Error loading news. Please try again later.</p>";
        console.error("Error fetching news:", error);
    }
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    if (!articles || articles.length === 0) {
        cardsContainer.innerHTML = "<p>No articles found. Try a different search term.</p>";
        return;
    }

    cardsContainer.innerHTML = "";

    articles.forEach((article, index) => {
        if (!article.image_url) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article, index);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article, index) {
    const card = cardClone.querySelector(".card");
    const newsImg = card.querySelector("#news-img");
    const newsTitle = card.querySelector("#news-title");
    const newsSource = card.querySelector("#news-source");
    const newsDesc = card.querySelector("#news-desc");

    // Set image with error handling
    newsImg.src = article.image_url || 'https://via.placeholder.com/400x200?text=No+Image';
    newsImg.onerror = () => {
        newsImg.src = 'https://via.placeholder.com/400x200?text=Image+Not+Available';
    };
    
    newsTitle.textContent = article.title || 'No title available';
    newsDesc.textContent = article.description || 'No description available';

    const date = article.pubDate ? new Date(article.pubDate).toLocaleDateString("en-US", {
        timeZone: "Asia/Kolkata",
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : 'Date not available';

    const sourceName = article.source_id ? article.source_id.charAt(0).toUpperCase() + article.source_id.slice(1) : 'Unknown source';
    newsSource.textContent = `${sourceName} • ${date}`;

    // Add click event to show modal
    card.addEventListener("click", () => {
        showArticleDetails(article);
    });
}

// Show article details in modal
function showArticleDetails(article) {
    modalImage.src = article.image_url || 'https://via.placeholder.com/800x400?text=No+Image';
    modalImage.alt = article.title || 'News Image';
    modalTitle.textContent = article.title || 'No title available';
    
    const date = article.pubDate ? new Date(article.pubDate).toLocaleDateString("en-US", {
        timeZone: "Asia/Kolkata",
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'Date not available';
    
    const sourceName = article.source_id ? article.source_id.charAt(0).toUpperCase() + article.source_id.slice(1) : 'Unknown source';
    modalSource.textContent = `${sourceName} • ${date}`;
    
    modalDescription.textContent = article.content || article.description || 'No content available.';
    
    if (article.link) {
        readMoreBtn.href = article.link;
        readMoreBtn.style.display = 'inline-block';
    } else {
        readMoreBtn.style.display = 'none';
    }
    
    modal.style.display = "block";
}

// Navbar link functionality
let curSelectedNav = null;
function onNavItemClick(id) {
    fetchNews(id);
    const navItem = document.getElementById(id);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = navItem;
    curSelectedNav.classList.add('active');
}

// ====================================================

