// events.js
import { fetchAnime } from "./api.js";
import {
  renderAnime,
  appendAnime,
  updateHero,
  renderLoadMoreLoading,
  cardsContainer,
  searchInput,
} from "./ui.js";

const loadMoreBtn = document.querySelector(".trendingBtn");
const loginBtn = document.querySelector(".loginBtn");
const heroPrev = document.getElementById("heroPrev");
const heroNext = document.getElementById("heroNext");

/* =======================
   HELPER: REMOVE LOADERS
======================= */
function removeLoadingCards(container) {
  const cards = container.querySelectorAll(".anime-card");
  cards.forEach(card => {
    // loading cards do NOT contain images
    if (!card.querySelector("img")) {
      card.remove();
    }
  });
}

/* =======================
   LOGIN BUTTON
======================= */
loginBtn.addEventListener("click", () => {
  alert("Login feature coming soon 👀");
});

/* =======================
   TRENDING LOAD MORE
======================= */
export function setupLoadMore(animeListObj) {
  loadMoreBtn.addEventListener("click", async () => {
    animeListObj.currentPage++;

    // show loading placeholders
    renderLoadMoreLoading(cardsContainer);

    const newAnime = await fetchAnime(animeListObj.currentPage);

    // remove loading cards
    removeLoadingCards(cardsContainer);

    animeListObj.list = animeListObj.list.concat(newAnime);

    // append new cards
    appendAnime(newAnime);

    if (newAnime.length > 0) {
      updateHero(newAnime[0], animeListObj.list);
    }
  });
}

/* =======================
   HERO NAVIGATION
======================= */
export function setupHeroNav(animeListObj) {
  heroPrev.addEventListener("click", () => {
    if (!animeListObj.list.length) return;

    animeListObj.currentHeroIndex--;
    if (animeListObj.currentHeroIndex < 0) {
      animeListObj.currentHeroIndex = animeListObj.list.length - 1;
    }

    updateHero(
      animeListObj.list[animeListObj.currentHeroIndex],
      animeListObj.list
    );
  });

  heroNext.addEventListener("click", () => {
    if (!animeListObj.list.length) return;

    animeListObj.currentHeroIndex++;
    if (animeListObj.currentHeroIndex >= animeListObj.list.length) {
      animeListObj.currentHeroIndex = 0;
    }

    updateHero(
      animeListObj.list[animeListObj.currentHeroIndex],
      animeListObj.list
    );
  });
}

/* =======================
   SEARCH FEATURE
======================= */
export function setupSearch(animeListObj) {
  const heroSection = document.querySelector(".hero-section");
  const trendingSection = document.querySelector(".trending-section");
  const searchSection = document.querySelector(".search-section");
  const searchCardsContainer = document.querySelector(".search-cards-container");
  const searchQuerySpan = document.getElementById("search-query");

  // create / get search load more button
  let searchLoadMoreBtn = searchSection.querySelector(".searchLoadMoreBtn");
  if (!searchLoadMoreBtn) {
    searchLoadMoreBtn = document.createElement("button");
    searchLoadMoreBtn.textContent = "Load More";
    searchLoadMoreBtn.classList.add("trendingBtn", "searchLoadMoreBtn");
    searchCardsContainer.after(searchLoadMoreBtn);
  }

  let currentQuery = "";

  /* ---------- SEARCH ON ENTER ---------- */
  searchInput.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;

    const query = searchInput.value.trim();
    currentQuery = query;
    animeListObj.currentPage = 1;

    // toggle sections
    heroSection.style.display = query ? "none" : "flex";
    trendingSection.style.display = query ? "none" : "block";
    loadMoreBtn.style.display = query ? "none" : "block";
    searchSection.style.display = query ? "flex" : "none";

    if (!query) return;

    searchQuerySpan.textContent = query;
    searchCardsContainer.innerHTML = "";
    searchLoadMoreBtn.disabled = false;
    searchLoadMoreBtn.textContent = "Load More";

    // show loading cards
    renderLoadMoreLoading(searchCardsContainer);

    try {
      const res = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
          query
        )}&limit=10&page=1`
      );
      const data = await res.json();
      const results = data.data;

      // remove loading cards
      removeLoadingCards(searchCardsContainer);

      animeListObj.list = results;

      if (results.length === 0) {
        searchCardsContainer.innerHTML = `
          <p style="color:white; margin-left:20px;">
            No results found for "${query}"
          </p>`;
        searchLoadMoreBtn.style.display = "none";
        return;
      }

      searchLoadMoreBtn.style.display = "block";

      appendSearchCards(results, searchCardsContainer, animeListObj);

      updateHero(results[0], results);
    } catch (err) {
      console.error(err);
    }
  });

  /* ---------- SEARCH LOAD MORE ---------- */
  searchLoadMoreBtn.addEventListener("click", async () => {
    if (!currentQuery) return;

    animeListObj.currentPage++;

    // show loading cards
    renderLoadMoreLoading(searchCardsContainer);

    try {
      const res = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
          currentQuery
        )}&limit=10&page=${animeListObj.currentPage}`
      );
      const data = await res.json();
      const newResults = data.data;

      // remove loading cards
      removeLoadingCards(searchCardsContainer);

      if (newResults.length === 0) {
        searchLoadMoreBtn.disabled = true;
        searchLoadMoreBtn.textContent = "No more results";
        return;
      }

      animeListObj.list = animeListObj.list.concat(newResults);

      appendSearchCards(newResults, searchCardsContainer, animeListObj);
    } catch (err) {
      console.error(err);
    }
  });
}

/* =======================
   SEARCH CARD APPENDER
======================= */
function appendSearchCards(animeArray, container, animeListObj) {
  animeArray.forEach((anime) => {
    const card = document.createElement("div");
    card.classList.add("anime-card");

    card.innerHTML = `
      <div class="anime-image">
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      </div>
      <div class="anime-title">${anime.title}</div>
      <div class="anime-genre">${anime.type ?? "N/A"}</div>
    `;

    card.addEventListener("click", () =>
      updateHero(anime, animeListObj.list)
    );

    container.appendChild(card);
  });
}
