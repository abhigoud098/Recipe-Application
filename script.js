const mealsContainer = document.getElementById("meals");
const popularContainer = document.getElementById("popular-meals");
const favoriteContainer = document.getElementById("fav-meals");
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");
const modalContainer = document.getElementById("meal-info-container");
const modalContent = document.querySelector(".meal-details-content");

let allRecipes = [];

// 🔹 Initialize app
init();

async function init() {
  const res = await fetch("https://dummyjson.com/recipes");
  const data = await res.json();
  allRecipes = data.recipes;

  getRandomMeal();
  getPopularMeals();
  fetchFavMeals();
}

/* 🧩 Random recipe */
function getRandomMeal() {
  const random = allRecipes[Math.floor(Math.random() * allRecipes.length)];
  mealsContainer.innerHTML = "";
  addMeal(random, mealsContainer);
}

/* 🔥 Popular (top 6) */
function getPopularMeals() {
  const topRecipes = allRecipes.slice(0, 6);
  popularContainer.innerHTML = "";
  topRecipes.forEach((r) => addMeal(r, popularContainer));
}

/* 🍽️ Add meal card */
function addMeal(mealData, container) {
  const meal = document.createElement("div");
  meal.classList.add("meal");
  meal.innerHTML = `
    <img src="${mealData.image}" alt="${mealData.name}" />
    <div class="meal-body">
      <h4>${mealData.name}</h4>
      <button class="fav-btn"><i class="fa-solid fa-heart"></i></button>
    </div>`;

  const btn = meal.querySelector(".fav-btn");
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
    if (btn.classList.contains("active")) addMealLS(mealData.id);
    else removeMealLS(mealData.id);
    fetchFavMeals();
  });

  meal.addEventListener("click", () => showMealPopup(mealData));
  container.appendChild(meal);
}

/* ❤️ Favorites LocalStorage */
function addMealLS(id) {
  const ids = getMealLS();
  localStorage.setItem("mealIds", JSON.stringify([...ids, id]));
}
function removeMealLS(id) {
  const ids = getMealLS();
  localStorage.setItem("mealIds", JSON.stringify(ids.filter((i) => i !== id)));
}
function getMealLS() {
  const ids = JSON.parse(localStorage.getItem("mealIds"));
  return ids ? ids : [];
}

/* 🧡 Fetch Favorites */
function fetchFavMeals() {
  favoriteContainer.innerHTML = "";
  const ids = getMealLS();

  ids.forEach((id) => {
    const favMeal = allRecipes.find((m) => m.id === id);
    if (favMeal) addMealToFav(favMeal);
  });

  if (ids.length === 0)
    favoriteContainer.innerHTML = "<p>No favorites added yet ❤️</p>";
}

function addMealToFav(mealData) {
  const li = document.createElement("li");
  li.innerHTML = `<img src="${mealData.image}" alt="${mealData.name}" />
  <span>${mealData.name}</span>`;
  li.addEventListener("click", () => showMealPopup(mealData));
  favoriteContainer.appendChild(li);
}

/* 📖 Modal Popup */
function showMealPopup(meal) {
  modalContainer.style.display = "flex";
  modalContent.innerHTML = `
    <h2>${meal.name}</h2>
    <img src="${meal.image}" alt="${meal.name}" />
    <p><strong>Cooking Time:</strong> ${meal.cookTimeMinutes} min</p>
    <p><strong>Ingredients:</strong> ${meal.ingredients.join(", ")}</p>
    <p><strong>Instructions:</strong> ${meal.instructions}</p>`;
}

document
  .getElementById("close-popup")
  .addEventListener("click", () => (modalContainer.style.display = "none"));

/* 🔍 Smart Search + Refresh When Empty */
function fuzzyMatch(str, query) {
  str = str.toLowerCase();
  query = query.toLowerCase();
  let lastIndex = -1;
  for (let char of query) {
    lastIndex = str.indexOf(char, lastIndex + 1);
    if (lastIndex === -1) return false;
  }
  return true;
}

/* 🔗 Related Websites — shown as buttons with icons + retry */
function showRelatedLinks(term) {
  mealsContainer.innerHTML = `
    <div class="no-results">
      <p>No recipes found for "<b>${term}</b>" 😕</p>
      </div>
      <button id="try-again-btn" class="try-again-btn">🔄 Try Again</button>
    </div>
  `;

  // 🔁 "Try Again" button refreshes to show random & popular recipes again
  const tryAgainBtn = document.getElementById("try-again-btn");
  tryAgainBtn.addEventListener("click", () => {
    mealsContainer.innerHTML = "";
    getRandomMeal();
    getPopularMeals();
  });
}

/* 🎯 Filter and show matches */
function searchRecipes(term) {
  const results = allRecipes.filter(
    (r) =>
      r.name.toLowerCase().includes(term.toLowerCase()) ||
      fuzzyMatch(r.name, term)
  );

  mealsContainer.innerHTML = "";
  if (results.length === 0) {
    showRelatedLinks(term);
  } else {
    results.forEach((m) => addMeal(m, mealsContainer));
  }
}

/* 🖱️ Search Button Click */
searchBtn.addEventListener("click", () => {
  const term = searchTerm.value.trim();

  // 🔄 If empty → refresh homepage
  if (!term) {
    mealsContainer.innerHTML = "";
    getRandomMeal();
    getPopularMeals();
    return;
  }

  searchRecipes(term);
});

/* ⌨️ Live Typing (real-time search) */
searchTerm.addEventListener("input", (e) => {
  const term = e.target.value.trim();

  // 🔄 If cleared → refresh homepage
  if (term === "") {
    mealsContainer.innerHTML = "";
    getRandomMeal();
    getPopularMeals();
    return;
  }

  if (term.length >= 2) searchRecipes(term);
});

/* ↩️ Enter Key */
searchTerm.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchBtn.click();
  }
});
