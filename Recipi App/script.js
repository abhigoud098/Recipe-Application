const meals = document.getElementById("meals");
const favoriteContainer = document.getElementById("fev-meals");
const searchTerm = document.getElementById("search-Term");
const searchBtn = document.getElementById("search");


getRandomMeal();
fetchFavMeals();

//Get random meal in page.
async function getRandomMeal() {
  const resPo = await fetch("https://dummyjson.com/recipes");
  const data = await resPo.json();
  const randomNumber = Math.floor(Math.random() * 31); 
  const randomMeal = data.recipes[randomNumber];
  //   .then(res => res.json())
  // .then(console.log);

  addMeal(randomMeal, true); //Send data addMeals for showing
}

//Get the meal by Id
async function getMealById(id) {
  // Here a id is in argument is userId

  const resPo = await fetch("https://dummyjson.com/recipes");
  const wholeData = await resPo.json();
  let lengthOfData = wholeData.recipes.length;

  for (let i = 0; i <= lengthOfData; i++) {
    let arrOfRecipe = wholeData.recipes[i];
    if (arrOfRecipe.userId === id) {
      return wholeData.recipes[i];
    }
  }
}

//Get meals by searching
async function getMealsBySearch(term) {
  const meals = await fetch(`https://dummyjson.com/recipes/search?q=${term}`);
  let dataOfSearch = await meals.json();
  const item = dataOfSearch;
  return item;
  // console.log(meals);
}

//Add meals 
function addMeal(mealData, random = false) {

  //If meal are not present 
  if (mealData === "") {
    const meal = document.createElement("div"); 
    meal.classList.add("meal"); 
    meals.innerHTML = `
            <div class="meals-header">
             ${random ? `<span class="random"> Random Recipe </span>` : ""}
             <img
              src="https://cdni.iconscout.com/illustration/premium/thumb/cook-said-oops-no-food-available-illustration-download-in-svg-png-gif-file-formats--online-ordering-service-and-delivery-pack-e-commerce-shopping-illustrations-1784257.png"
              alt=""
            />
            </div>
            <div class="meal-body">
              <h4>Sorry 🤔</h4>
            </div>
          `;
  }

  //If meal is present
   else {
    const meal = document.createElement("div"); 
    meal.classList.add("meal"); 
    meals.innerHTML = `
          <div class="meals-header">
           ${random ? `<span class="random"> ${mealData.name} </span>` : ""}
            <img
              src="${mealData.image}"
              alt=""
            />
          </div>
          <div class="meal-body">
            <h4>${mealData.cuisine}</h4>
            <button class="fav-btn"><i class="fa-solid fa-heart"></i></button>
          </div>
        `;

    const btn = document.querySelector(".meal-body .fav-btn");

    //Remove meal or add meal
    btn.addEventListener("click", () => {
      if (btn.classList.contains("active")) {
        removeMealLS(mealData.userId);
        btn.classList.remove("active");
      } else {
        addMealLS(mealData.userId);
        btn.classList.add("active");
        getRandomMeal();
      }
      //clear the container
      fetchFavMeals();
    });
    //Add meal in fav container
    meals.appendChild(meal);
  }
}

//Add meal in Local Storage
function addMealLS(userId) {
  const userIds = getMealLS();

  localStorage.setItem("userIds", JSON.stringify([...userIds, userId]));
}

//Remove meal in local storage
function removeMealLS(userId) {
  const userIds = getMealLS();
  localStorage.setItem(
    "userIds",
    JSON.stringify(userIds.filter((id) => id !== userId))
  );
}

//Get meal in local storage
function getMealLS() {
  const userIds = JSON.parse(localStorage.getItem("userIds"));

  return userIds === null ? [] : userIds;
}

async function fetchFavMeals() {
  favoriteContainer.innerHTML = "";
  const mealsIds = getMealLS();

  for (let i = 0; i < mealsIds.length; i++) {
    const mealsId = mealsIds[i];
    let meal = await getMealById(mealsId);
    addMealToFav(meal);
  }
}

//Add them to the screen
function addMealToFav(mealData) {
  const favMeal = document.createElement("li"); //Here create a element li

  favMeal.innerHTML = `
          <li onclick="useridOfLi(${mealData.userId})">
            <img
              src="${mealData.image}"
              alt="${mealData.name}"
            /><span>${mealData.name}</span>
          </li>
        `;

  favoriteContainer.appendChild(favMeal);

  //Show recipes in details.
  favMeal.addEventListener("click", showRecipesOfFavMeals);
}

// Function to show recipes details based on fetched data
function showRecipesOfFavMeals(favMealsInLi) {
  const showRecipes = document.querySelector(".detailsOfMeal");
  showRecipes.style.display = "block";

  // Check if the div already exists and remove it
  const existingRecipe = showRecipes.querySelector(".recipesOfMeals");
  if (existingRecipe) {
    existingRecipe.remove(); // Remove the previous div if it exists
  }

  // Create the new recipe details div
  const detailsDiv = document.createElement("div");
  detailsDiv.classList.add("recipesOfMeals");

  // Ensure favMealsInLi contains the necessary properties
  detailsDiv.innerHTML = `
    <button class="clear"><i class="fa-solid fa-xmark"></i></button>
    <h1>HOW YOU MADE IT?</h1>
    <p>Name: <span>${favMealsInLi.name}</span></p>
    <p>Cooking Time: <span>${favMealsInLi.cookTimeMinutes}</span> min</p>
    <p>Ingredients: <span>${favMealsInLi.ingredients}</span></p>
    <p>Instructions: <span>${favMealsInLi.instructions}</span></p>
    <button class="remove"><span>Remove</span></button>
  `;

  //Remove Your Fav meal
  const btn = detailsDiv.querySelector(".remove");

  btn.addEventListener("click", () => {
    removeMealLS(favMealsInLi.userId);
    fetchFavMeals();
    showRecipes.style.display = "none";
  });

  // Add close button functionality
  const closeButton = detailsDiv.querySelector(".clear");
  closeButton.addEventListener("click", () => {
    showRecipes.style.display = "none"; // Hide the details div
  });

  // Append the details div to the .detailsOfMeal container
  showRecipes.appendChild(detailsDiv);
}

//Function for get fav meal userid for show the recipes of meals 
async function useridOfLi(uId) {
  const liInFavMeals = await getMealById(uId);
  return showRecipesOfFavMeals(liInFavMeals);
}

//Search meal by click button
searchBtn.addEventListener("click", async () => {
  const search = searchTerm.value;
  const searchMeal = await getMealsBySearch(search);
  const recipeOfMeals = searchMeal.recipes;

  if (recipeOfMeals.length === 0) {
    addMeal("");
  } else {
    recipeOfMeals.forEach((meal) => {
      addMeal(meal);
      searchTerm.value = "";
    });
  }
});
