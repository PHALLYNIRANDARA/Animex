// events.js
import { fetchAnime } from "./api.js";
import { renderAnime, updateHero, renderLoadMoreLoading, cardsContainer, heroTitle, heroDesc, heroImg, searchInput } from "./ui.js";

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
    if (animeListObj.currentHeroIndex < 0) animeListObj.currentHeroIndex = animeListObj.list.length - 1;
    updateHero(animeListObj.list[animeListObj.currentHeroIndex], animeListObj.list);
  });

  heroNext.addEventListener("click", () => {
    if (!animeListObj.list.length) return;
    animeListObj.currentHeroIndex++;
    if (animeListObj.currentHeroIndex >= animeListObj.list.length) animeListObj.currentHeroIndex = 0;
    updateHero(animeListObj.list[animeListObj.currentHeroIndex], animeListObj.list);
  });
}

// Search setup (replaces trending cards only)
export function setupSearch(animeListObj) {
  searchInput.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return; // only proceed on Enter

    const query = searchInput.value.trim();

    // DOM references
    const heroSection = document.querySelector(".hero-section");
    const trendingSection = document.querySelector(".trending-section");
    const searchSection = document.querySelector(".search-section");
    const searchMsg = document.getElementById("search-msg");
    const searchCardsContainer = document.querySelector(".search-cards-container");
    const searchQuerySpan = document.getElementById("search-query");
searchQuerySpan.textContent = query;

    // If input is empty, reset hero + trending
    if (!query) {
      heroSection.style.display = "flex";
      trendingSection.style.display = "block";
      searchSection.style.display = "none";

      animeListObj.currentPage = 1;
      animeListObj.currentHeroIndex = 0;

      renderLoading();
      animeListObj.list = await fetchAnime(animeListObj.currentPage);
      renderAnime(animeListObj.list);

      if (animeListObj.list.length > 0)
        updateHero(animeListObj.list[0], animeListObj.list);

      return;
    }

    // Hide hero + trending, show search section
    heroSection.style.display = "none";
    trendingSection.style.display = "none";
    searchSection.style.display = "block";

    searchMsg.textContent = `Search results for: "${query}"`;
    searchCardsContainer.innerHTML = ""; // clear previous results

    renderLoadMoreLoading(); // optional loading placeholder

    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`);
      const data = await res.json();
      const results = data.data;

      animeListObj.list = results;
      animeListObj.currentPage = 1;
      animeListObj.currentHeroIndex = 0;

      if (results.length > 0) {
        // Render search results
        results.forEach((anime) => {
          const card = document.createElement("div");
          card.classList.add("anime-card");
          card.innerHTML = `
            <div class="anime-image">
              <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
            </div>
            <div class="anime-title">${anime.title}</div>
            <div class="anime-genre">${anime.type ?? "N/A"}</div>
          `;
          searchCardsContainer.appendChild(card);

          // Optional: click updates hero
          card.addEventListener("click", () => updateHero(anime, results));
        });

        // Update hero to first search result (optional, if you want top card preview)
        updateHero(results[0], results);

      } else {
        searchCardsContainer.innerHTML = `<p style="color:white;">No results found for "${query}".</p>`;
      }
    } catch (err) {
      console.error(err);
      searchCardsContainer.innerHTML = `<p style="color:white;">Search failed. Try again.</p>`;
    }
  });
}

