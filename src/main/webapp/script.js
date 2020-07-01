class ParameterField extends HTMLElement {
  constructor() {
    super();
    const br = document.createElement('br');
    var wrapper = document.createElement('span');
    wrapper.class = "parameter-field";

    var name = this.getAttribute('name');
    var index = this.getAttribute('index');
    var paramName = name.toLowerCase() + index;
    
    var label = document.createElement('label');
    label.innerText = name + " " + index;
    label.for = paramName;

    var textArea = document.createElement('textarea');
    textArea.id = paramName;
    textArea.name = paramName;
    textArea.rows = "1";

    var button = document.createElement('button');
    button.onclick = "addParameterField(" + name + ", " + (index + 1) + ")";
    button.innerText = "Add " + name;

    wrapper.appendChild(label);
    wrapper.appendChild(br);
    wrapper.appendChild(textArea);
    wrapper.appendChild(button);
    wrapper.appendChild(br);
    wrapper.appendChild(br);
  }
}

function getOriginalRecipe() {
  const key = document.getElementById("key").value;
  if (key) {
    fetch("/new-recipe?key=" + key).then(response => response.json()).then((recipe) => {
      populateRecipeCreationForm(recipe);
    });
  }
}

function populateRecipeCreationForm(recipe) {
  document.getElementById("name").value = recipe.name;
  document.getElementById("description").value = recipe.description;

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
