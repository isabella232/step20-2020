class ParameterInput extends HTMLElement {
  constructor() {
    super();
    this.label = document.createElement('label');
    this.textArea = document.createElement('textarea');
    this.button = document.createElement('button');
    this.container = document.createElement('div');

    this.container.appendChild(this.label);
    this.container.appendChild(this.textArea);
    this.container.appendChild(this.button);
  }

  connectedCallback() {
    this.name = this.getAttribute('name');
    this.index = parseInt(this.getAttribute('index'));
    this.parent = this.name + 's';

    this.textArea.rows = '1';
    this.button.type = 'button';
    this.button.innerText = 'Add ' + this.name;
    this.setIndexAttributes();

    this.appendChild(this.container);
  }

  setIndexAttributes() {
    var paramName = this.name.toLowerCase() + this.index;
    this.id = this.name + this.index;

    this.label.innerText = this.name + ' ' + (this.index + 1);
    this.label.for = paramName;

    this.textArea.name = paramName;

    this.button.onclick = event => {
      var newParameter = createParameterInput(this.name, this.index + 1);
      insertParameterInput(this, newParameter);
    }
  }

  get text() {
    return this.textArea.value;
  }

  get position() {
    return this.index;
  }

  get field() {
    return this.parent;
  }

  set text(value) {
    this.textArea.value = value;
  }

  set position(value)  {
    this.index = parseInt(value);
  }

  set field(value) {
    this.parent = value;
  }
}
customElements.define('parameter-input', ParameterInput);

function createParameterInput(name, index) {
  var newParameter = document.createElement('parameter-input');
  newParameter.setAttribute('name', name);
  newParameter.setAttribute('index', index);
  newParameter.setAttribute('id', name + index);
  return newParameter;
}

function insertParameterInput(previous, parameterInput) {
  previous.insertAdjacentElement('afterend', parameterInput);
  updateIndeces(parameterInput.field, parameterInput.position + 1);
}

function appendParameterInput(fieldName, parameterInput) {
  const field = document.getElementById(fieldName);
  field.appendChild(parameterInput);
}

function appendParameterInput(fieldName) {
  const field = document.getElementById(fieldName);
  field.appendChild(createParameterInput(fieldName.slice(0, -1), field.children.length));
}

function updateIndeces(fieldName, startIndex) {
  var parameters = document.getElementById(fieldName).children;
  for (var i = startIndex; i < parameters.length; i++) {
    parameters[i].position = i;
    parameters[i].setIndexAttributes();
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
