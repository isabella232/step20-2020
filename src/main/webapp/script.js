function getOriginalRecipe() {
  const key = document.getElementById("key").value;
  if (key) {
    fetch("/new-recipe?key=" + key).then(response => response.json()).then((recipe) => {
      populateRecipeCreationForm(recipe);
    });
  }
}

function populateRecipeCreationForm(recipe) {
  var name = document.getElementById("name");
  name.value = recipe.name;

  var description = document.getElementById("description");
  description.value = recipe.description;

  populateFormComponent("tag", recipe.tags);
  populateFormComponent("ingredient", recipe.ingredients);
  populateFormComponent("step", recipe.steps);
}

function populateFormComponent(componentName, data) {
  var componentNum = 1;
  for (var i = 0; i < data.length; i++) {
    var component = document.getElementById(componentName + componentNum++);
    component.value = data[i];
  }
}
