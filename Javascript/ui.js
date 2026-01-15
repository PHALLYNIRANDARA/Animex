// ui.js
export const cardsContainer = document.querySelector(".cards-container");
export const heroTitle = document.getElementById("hero-title");
export const heroDesc = document.getElementById("hero-desc");
export const heroImg = document.querySelector(".hero-right img");
export const heroBtn = document.getElementById("heroBtn");
export const searchInput = document.querySelector(".search-bar");

// Render anime cards
export function renderAnime(animeArray) {
  cardsContainer.innerHTML = "";

  animeArray.forEach(anime => {
    const newCard = document.createElement("div");
    newCard.classList.add("anime-card");

    newCard.innerHTML = `
      <div class="anime-image">
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}" 
             style="width:100%; height:100%; object-fit:cover; border-radius:15px;">
      </div>
      <div class="anime-title">${anime.title}</div>
      <div class="anime-genre">${anime.type ?? "N/A"}</div>
    `;

    newCard.addEventListener("click", () => {
      console.log(`Clicked: ${anime.title}`);
    });

    cardsContainer.appendChild(newCard);
  });
}

// Loading placeholders
export function renderLoading(count = 5) {
  cardsContainer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const loadingCard = document.createElement("div");
    loadingCard.classList.add("anime-card");

    loadingCard.innerHTML = `
      <div class="anime-image" style="background:#333;"></div>
      <div class="anime-title" style="height:16px; background:#444; margin:10px; border-radius:4px;"></div>
      <div class="anime-genre" style="height:12px; background:#555; margin:10px; border-radius:4px;"></div>
    `;
    cardsContainer.appendChild(loadingCard);
  }
}

// Update hero section
let currentHeroIndex = 0;
export function updateHero(anime, animeList) {
  heroTitle.textContent = anime.title;
  heroDesc.textContent = anime.synopsis ?? "No description available.";

  // Fade image
  heroImg.style.opacity = 0;
  setTimeout(() => {
    heroImg.src = anime.images.jpg.large_image_url ?? "#";
    heroImg.style.opacity = 1;
  }, 250);

  heroBtn.onclick = () => console.log(`Watch Now clicked for: ${anime.title}`);

  // Update index
  const index = animeList.findIndex(a => a.mal_id === anime.mal_id);
  if (index !== -1) currentHeroIndex = index;
}

export { currentHeroIndex };


export function renderLoadMoreLoading(container, count = 5) {
  for (let i = 0; i < count; i++) {
    const loadingCard = document.createElement("div");
    loadingCard.classList.add("anime-card");
    loadingCard.innerHTML = `
      <div class="anime-image" style="background:#333;"></div>
      <div class="anime-title" style="height:16px; background:#444; margin:10px;"></div>
      <div class="anime-genre" style="height:12px; background:#555; margin:10px;"></div>
    `;
    container.appendChild(loadingCard);
  }
}


export function appendAnime(animeArray) {
  animeArray.forEach(anime => {
    const newCard = document.createElement("div");
    newCard.classList.add("anime-card");

    newCard.innerHTML = `
      <div class="anime-image">
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      </div>
      <div class="anime-title">${anime.title}</div>
      <div class="anime-genre">${anime.type ?? "N/A"}</div>
    `;

    cardsContainer.appendChild(newCard);
  });
}

function removeLoadingCards(container) {
  const loadingCards = container.querySelectorAll(".anime-card");

  loadingCards.forEach(card => {
    // loading cards have no <img>
    if (!card.querySelector("img")) {
      card.remove();
    }
  });
}

