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
    if (e.key !== "Enter") return; // only continue if Enter is pressed

    const query = searchInput.value.trim();
    
    // If input is empty, reset hero + trending
    if (!query) {
      animeListObj.currentPage = 1;
      animeListObj.currentHeroIndex = 0;
      
      renderLoading();
      animeListObj.list = await fetchAnime(animeListObj.currentPage);
      renderAnime(animeListObj.list);

      if (animeListObj.list.length > 0) updateHero(animeListObj.list[0], animeListObj.list);
      return;
    }

    // Show loading for search
    renderLoadMoreLoading();

    try {
      const res = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`
      );
      const data = await res.json();
      const results = data.data;

      animeListObj.list = results;
      animeListObj.currentPage = 1;
      animeListObj.currentHeroIndex = 0;

      if (results.length > 0) {
        renderAnime(animeListObj.list);
        updateHero(results[0], animeListObj.list);
      } else {
        cardsContainer.innerHTML = `<p style="color:white; margin-left:2vw;">No results found for "${query}".</p>`;
        heroTitle.textContent = "No anime found";
        heroDesc.textContent = "";
        heroImg.src = "#";
      }
    } catch (error) {
      console.error("Search failed:", error);
      cardsContainer.innerHTML = `<p style="color:white; margin-left:2vw;">Search failed. Try again later.</p>`;
    }
  });
}
