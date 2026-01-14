// events.js
import { fetchAnime } from "./api.js";
import {
  renderAnime,
  updateHero,
  renderLoadMoreLoading,
  cardsContainer,
  heroTitle,
  heroDesc,
  heroImg,
  searchInput,
} from "./ui.js";

const loadMoreBtn = document.querySelector(".trendingBtn");
const loginBtn = document.querySelector(".loginBtn");
const heroPrev = document.getElementById("heroPrev");
const heroNext = document.getElementById("heroNext");

// Login button
loginBtn.addEventListener("click", () => {
  alert("Login feature coming soon 👀");
});

// Load more trending button
export function setupLoadMore(animeListObj) {
  loadMoreBtn.addEventListener("click", async () => {
    animeListObj.currentPage++;
    renderLoadMoreLoading();

    const newAnime = await fetchAnime(animeListObj.currentPage);

    animeListObj.list = animeListObj.list.concat(newAnime);
    renderAnime(animeListObj.list);

    if (newAnime.length > 0) updateHero(newAnime[0], animeListObj.list);
  });
}

// Hero navigation buttons
export function setupHeroNav(animeListObj) {
  heroPrev.addEventListener("click", () => {
    if (!animeListObj.list.length) return;
    animeListObj.currentHeroIndex--;
    if (animeListObj.currentHeroIndex < 0)
      animeListObj.currentHeroIndex = animeListObj.list.length - 1;
    updateHero(
      animeListObj.list[animeListObj.currentHeroIndex],
      animeListObj.list
    );
  });

  heroNext.addEventListener("click", () => {
    if (!animeListObj.list.length) return;
    animeListObj.currentHeroIndex++;
    if (animeListObj.currentHeroIndex >= animeListObj.list.length)
      animeListObj.currentHeroIndex = 0;
    updateHero(
      animeListObj.list[animeListObj.currentHeroIndex],
      animeListObj.list
    );
  });
}

// Search setup (replaces trending cards only)
export function setupSearch(animeListObj) {
  const heroSection = document.querySelector(".hero-section");
  const trendingSection = document.querySelector(".trending-section");
  const searchSection = document.querySelector(".search-section");
  const searchCardsContainer = document.querySelector(".search-cards-container");
  const searchMsg = document.getElementById("search-msg");
  const searchQuerySpan = document.getElementById("search-query");

  // Create Load More button inside search section
  let searchLoadMoreBtn = searchSection.querySelector(".searchLoadMoreBtn");
  if (!searchLoadMoreBtn) {
    searchLoadMoreBtn = document.createElement("button");
    searchLoadMoreBtn.textContent = "Load More";
    searchLoadMoreBtn.classList.add("trendingBtn", "searchLoadMoreBtn");
    searchSection.appendChild(searchLoadMoreBtn);
  }

  let currentQuery = ""; // store the active search query

  // Search on Enter
  searchInput.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;

    const query = searchInput.value.trim();
    currentQuery = query;
    animeListObj.currentPage = 1; // reset page for new search
    searchLoadMoreBtn.disabled = false;
    searchLoadMoreBtn.textContent = "Load More";

    // Show/hide sections
    heroSection.style.display = query ? "none" : "flex";
    trendingSection.style.display = query ? "none" : "block";
    searchSection.style.display = query ? "flex" : "none";

    searchQuerySpan.textContent = query;
    searchCardsContainer.innerHTML = "";

    renderLoadMoreLoading();

    if (!query) return;

    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10&page=1`);
      const data = await res.json();
      const results = data.data;

      animeListObj.list = results;

      if (results.length === 0) {
        searchCardsContainer.innerHTML = `<p style="color:white;">No results found for "${query}".</p>`;
        searchLoadMoreBtn.style.display = "none";
        return;
      } else {
        searchLoadMoreBtn.style.display = "block"; // show button if results exist
      }

      // Render results
      results.forEach(anime => {
        const card = document.createElement("div");
        card.classList.add("anime-card");
        card.innerHTML = `
          <div class="anime-image">
            <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
          </div>
          <div class="anime-title">${anime.title}</div>
          <div class="anime-genre">${anime.type ?? "N/A"}</div>
        `;
        card.addEventListener("click", () => updateHero(anime, animeListObj.list));
        searchCardsContainer.appendChild(card);
      });

      // Update hero to first search result
      updateHero(results[0], results);

    } catch (err) {
      console.error(err);
      searchCardsContainer.innerHTML = `<p style="color:white;">Search failed. Try again.</p>`;
    }
  });

  // Load More button click inside setupSearch
  searchLoadMoreBtn.addEventListener("click", async () => {
    if (!currentQuery) return;

    animeListObj.currentPage++;
    renderLoadMoreLoading();

    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(currentQuery)}&limit=10&page=${animeListObj.currentPage}`);
      const data = await res.json();
      const newResults = data.data;

      if (newResults.length === 0) {
        searchLoadMoreBtn.disabled = true;
        searchLoadMoreBtn.textContent = "No more results";
        return;
      }

      animeListObj.list = animeListObj.list.concat(newResults);

      newResults.forEach(anime => {
        const card = document.createElement("div");
        card.classList.add("anime-card");
        card.innerHTML = `
          <div class="anime-image">
            <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
          </div>
          <div class="anime-title">${anime.title}</div>
          <div class="anime-genre">${anime.type ?? "N/A"}</div>
        `;
        card.addEventListener("click", () => updateHero(anime, animeListObj.list));
        searchCardsContainer.appendChild(card);
      });
    } catch (err) {
      console.error(err);
    }
  });
}
