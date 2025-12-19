document.addEventListener("DOMContentLoaded", () => {
  const mealsContainer = document.getElementById("meals");
  const popularContainer = document.getElementById("popular-meals");
  const favoriteContainer = document.getElementById("fav-meals");
  const searchTerm = document.getElementById("search-term");
  const searchBtn = document.getElementById("search");
  const modalContainer = document.getElementById("meal-info-container");
  const modalContent = document.querySelector(".meal-details-content");
  const warningModal = document.getElementById("search-warning");
  const closeWarningBtn = document.getElementById("close-warning");

  let allRecipes = [];

  //Start App
  init();

  async function init() {
    const res = await fetch("https://dummyjson.com/recipes");
    const data = await res.json();
    allRecipes = data.recipes;

    getRandomMeal();
    getPopularMeals();
    fetchFavMeals();
  }

  function getRandomMeal() {
    const random = allRecipes[Math.floor(Math.random() * allRecipes.length)];
    mealsContainer.innerHTML = "";
    addMeal(random, mealsContainer);
  }

  function getPopularMeals() {
    popularContainer.innerHTML = "";
    allRecipes.slice(0, 8).forEach((r) => addMeal(r, popularContainer));
  }

  function addMeal(mealData, container) {
    const meal = document.createElement("div");
    meal.classList.add("meal");

    meal.innerHTML = `
      <img src="${mealData.image}" alt="${mealData.name}" />
      <div class="meal-body">
        <h4>${mealData.name}</h4>
        <button class="fav-btn"><i class="fa-solid fa-heart"></i></button>
      </div>
    `;

    const favBtn = meal.querySelector(".fav-btn");

    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      favBtn.classList.toggle("active");

      favBtn.classList.contains("active")
        ? addMealLS(mealData.id)
        : removeMealLS(mealData.id);

      fetchFavMeals();
    });

    meal.addEventListener("click", () => showMealPopup(mealData));
    container.appendChild(meal);
  }

  function addMealLS(id) {
    localStorage.setItem("mealIds", JSON.stringify([...getMealLS(), id]));
  }

  function removeMealLS(id) {
    localStorage.setItem(
      "mealIds",
      JSON.stringify(getMealLS().filter((i) => i !== id))
    );
  }

  function getMealLS() {
    return JSON.parse(localStorage.getItem("mealIds")) || [];
  }

  function fetchFavMeals() {
    favoriteContainer.innerHTML = "";
    const ids = getMealLS();

    if (!ids.length) {
      favoriteContainer.innerHTML = "<p>No favorites added yet...</p>";
      return;
    }

    ids.forEach((id) => {
      const meal = allRecipes.find((m) => m.id === id);
      if (meal) addMealToFav(meal);
    });
  }

  function addMealToFav(mealData) {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${mealData.image}" />
      <span>${mealData.name}</span>
    `;
    li.addEventListener("click", () => showMealPopup(mealData));
    favoriteContainer.appendChild(li);
  }

  function showMealPopup(meal) {
    modalContainer.style.display = "flex";
    modalContent.innerHTML = `
    <div class=popUp-hading-div><h2>${meal.name}</h2>
     <button id="modal-close-btn" class="modal-close-btn">
          <i class="fa-solid fa-xmark"></i>
        </button>
    </div>
  <img src="${meal.image}" />
  <p><strong>Cooking Time:</strong> ${meal.cookTimeMinutes} min</p>
  <p><strong>Ingredients:</strong> ${meal.ingredients.join(", ")}</p>
  <p><strong>Instructions:</strong> ${meal.instructions}</p>

  <button id="remove-fav-btn" class="remove-fav-btn">
    Remove from Favorites
  </button>
`;

    const closeBtn = document.getElementById("modal-close-btn");

    closeBtn.addEventListener("click", () => {
      modalContainer.style.display = "none";
    });

    const removeBtn = document.getElementById("remove-fav-btn");

    removeBtn.addEventListener("click", () => {
      removeMealLS(meal.id); // remove from localStorage
      fetchFavMeals(); // update favorites list
      modalContainer.style.display = "none"; // close popup
    });
  }

  function fuzzyMatch(str, query) {
    let i = -1;
    for (const c of query.toLowerCase()) {
      i = str.toLowerCase().indexOf(c, i + 1);
      if (i === -1) return false;
    }
    return true;
  }

  function searchRecipes(term) {
    mealsContainer.innerHTML = "";
    const results = allRecipes.filter(
      (r) =>
        r.name.toLowerCase().includes(term.toLowerCase()) ||
        fuzzyMatch(r.name, term)
    );

    results.length
      ? results.forEach((m) => addMeal(m, mealsContainer))
      : (mealsContainer.innerHTML = "<p>No recipes found 😕</p>");
  }

  // Search button
  searchBtn.addEventListener("click", () => {
    const term = searchTerm.value.trim();
    if (!term) {
      warningModal.style.display = "flex";
      return;
    }
    searchRecipes(term);
    searchTerm.value = "";
  });

  // Close warning
  closeWarningBtn?.addEventListener("click", () => {
    warningModal.style.display = "none";
    searchTerm.focus();
  });

  // ⌨️ Live search
  searchTerm.addEventListener("input", (e) => {
    const term = e.target.value.trim();
    if (!term) {
      mealsContainer.innerHTML = "";
      getRandomMeal();
      getPopularMeals();
      return;
    }
    if (term.length >= 2) searchRecipes(term);
  });
});
