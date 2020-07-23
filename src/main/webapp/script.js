// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Set the sign-in link for the sign-in page.
function getSignInLink() {
  fetch('/sign-in').then(response => response.json()).then(info => {
    const linkEl = document.getElementById('sign-in-button');
    linkEl.href = info.url;
  });
}

// Show sign-in fail message if appropriate.
function signInFailMessage() {
  var url = window.location.href;
  var status = url.split('=')[1];

  if(status === 'fail') {
    document.getElementById('fail-message').classList.remove('d-none');
    document.getElementById('normal-title').classList.add('d-none');
    document.getElementById('normal-message').classList.add('d-none');
  }
}

// Set the sign-up link for the sign-up page.
function getSignUpLink() {
  fetch('/sign-up').then(response => response.text()).then(link => {
    const linkEl = document.getElementById('sign-up-button');
    linkEl.href = link;
  });
}

// Get a specific user's data to populate their profile page.
function getProfilePageData() {
  var url = window.location.href;
  var key = url.split('?')[1];

  fetch('/user?' + key).then(response => response.json()).then(userInfo => {
    document.getElementById('profile-pic-display').src = '/blob?blob-key=' +  userInfo.profilePicKey;
    document.getElementById('username-display').innerHTML = userInfo.username;
    document.getElementById('location-display').innerHTML = userInfo.location;
    document.getElementById('bio-display').innerHTML = userInfo.bio;

    document.getElementById('username').innerHTML = userInfo.username;
    document.getElementById('location').innerHTML = userInfo.location;
    document.getElementById('bio').innerHTML = userInfo.bio;

    if(!userInfo.isCurrentUser) {
      document.getElementById('edit-button').classList.add('d-none');
    }
  });
}

// Sets the image upload URL in the account creation and profile pages.
function fetchBlobstoreUrl() {
  fetch('/profile-pic-upload-url').then(response => response.text()).then(imageUploadUrl => {
    const signupForm = document.getElementById('user-form');
    signupForm.action = imageUploadUrl;
  });
}

// Enables or disables the editable form in the profile page.
function toggleProfileEditMode() {
  const staticEl = document.getElementById('static-user-info');
  const editableEl = document.getElementById('user-form');
  const buttonEl = document.getElementById('edit-button');

  if(staticEl.classList.contains('d-none')) {
    staticEl.classList.remove('d-none');
    editableEl.classList.add('d-none');
    buttonEl.innerHTML = 'Edit Profile';
  }
  else {
    staticEl.classList.add('d-none');
    editableEl.classList.remove('d-none');
    buttonEl.innerHTML = 'Back';
  }
}

/** Fetches comments from the server and adds them to the DOM. */
function loadComments() {
  fetch('/display-comments').then(response => response.json()).then((comments) => {
    const commentListElement = document.getElementById('comment-list');
    comments.forEach((comment) => {
      commentListElement.appendChild(createCommentElement(comment));
    })
  });
}

/** Creates an element that represents a comment. */
function createCommentElement(comment) {
  const commentElement = document.createElement('div');
  commentElement.className = 'small-sep';

  const userComment = document.createElement('span');
  var userInfoDisplayed = comment.username + " • " + comment.location + " • " + comment.MMDDYYYY;
  userComment.innerHTML += addParagraph(userInfoDisplayed) + addParagraph(comment.comment);

  commentElement.appendChild(userComment);
  return commentElement;
}

function addParagraph(content) {
  return "<p>" + content + "</p>";
}

/** Redirects the user to the result page, with the given parameter for user-query. */
function redirectToResults(userQuery) {
  document.location.href = "search-results-test.html?user-query=" + userQuery;
  return false;
}

/** Fetches results from the server and adds them to the DOM. */
function getResults(param) {
  var userQuery = getURLParamVal(param);
  // Search string is in all caps, so the userQuery should also be in all caps for querying purposes.
  fetch('/results?user-query=' + userQuery.toUpperCase()).then(response => response.json()).then((results) => {
    const resultListElement = document.getElementById('result-list');
    results.forEach((result) => {
      resultListElement.appendChild(createResultElement(result));
    })
  });
}

/** Gets the value of the given parameter from the current URL string. */
function getURLParamVal(param) {
  let searchParams = (new URL(document.location)).searchParams;
  return searchParams.get(param);
}

/** Creates an element to display a result. */
function createResultElement(result) {
  const resultElement = document.createElement('li');
  resultElement.className = 'result';

  const resultId = document.createElement('span');
  resultId.innerText = result.id;

  resultElement.appendChild(resultId);
  return resultElement;
}

/** Loads options from Datastore and displays them using Datalist
    as autofill suggestions to the user. HTML5 Datalist itself does not
    currently support multiple select so this is a workaround.
    loadAutofill is chained here because it must happen AFTER the
    options are loaded in from Datastore; this way, the user continues
    to get autofill suggestions past the first keyword entered. */
function loadOptions() {
  var optionList = document.getElementById('allOptions');
  fetch('/fetch-options').then(response => response.json()).then((options) => {
    options.forEach(function(option) {
      var singleOption = document.createElement('option');
      singleOption.value = option;
      optionList.appendChild(singleOption);
    })
  })
  .then(() => {
    loadAutofill();
  });
}

// Sets up the navbar for any page.
function navBarSetup() {
  fetch('/sign-in').then(response => response.json()).then(info => {
    if(info.status) {
      document.getElementById('navbar-dropdown').classList.remove('d-none');
      document.getElementById('sign-in-button').classList.add('d-none');
      document.getElementById('sign-out-link').href = info.url;
      getProfilePicture();
    }
  });
}

// Gets the profile picture for the navbar
function getProfilePicture() {
  fetch('/user').then(response => response.json()).then(userInfo => {
    document.getElementById('profile-pic-nav').src = '/blob?blob-key=' +  userInfo.profilePicKey;
  });
}

const searchSep = ','; // Character used to separate keywords.
function loadAutofill() {
  for (const input of document.getElementsByTagName("input")) {
    if (input.list instanceof HTMLDataListElement) {
      const options = Array.from(input.list.options).map(opt => opt.value);
      let keywordCount = input.value.split(searchSep).length;
      input.addEventListener("input", () => {
      const currkeywordCount = input.value.split(searchSep).length;
      if (keywordCount !== currkeywordCount) {  // User added a separator.
        const lastSepIdx = input.value.lastIndexOf(searchSep);
        let existingInput = "";
        if (lastSepIdx !== -1) {
          existingInput = input.value.substr(0, lastSepIdx) + searchSep;
        }
        refillDatalist(input, options, existingInput);
        keywordCount = currkeywordCount;
        }
      });
    }
  }
}

/** Reloads Datalist options after user enters a new keyword,
    such that existing user input is not shown in the Datalist. */
function refillDatalist(input, options, existingInput) {
  const list = input.list;
  if (list && options.length > 0) {
    list.innerHTML = "";
    const usedOptions = existingInput.split(searchSep).map(value => value.trim());
    for (const option of options) {
      if (usedOptions.indexOf(option) < 0) {
        const optionElement = document.createElement("option");
        optionElement.value = existingInput + " " + option;
        list.append(optionElement);
      }
    }
  }
}

function shareViaGmail() {
  let msgbody = "Yum!";
  let url = 'https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=&su=Check+out+this+recipe!&body='+msgbody+'&ui=2&tf=1&pli=1';
  window.open(url, 'sharer', 'toolbar=0,status=0,width=648,height=395');
}

/** @class A custom element that represents a parameter input. */
class ParameterInput extends HTMLElement {
  constructor() {
    super();
    this.label = document.createElement('label');
    this.textArea = document.createElement('textarea');
    this.addButton = document.createElement('button');
    this.deleteButton = document.createElement('button');
    this.container = document.createElement('div');

    this.container.appendChild(this.label);
    this.container.appendChild(this.textArea);
    this.container.appendChild(this.addButton);
    this.container.appendChild(this.deleteButton);
  }

  /** Once the attributes for the ParameterInput exist, set its values accordingly. */
  connectedCallback() {
    this.name = this.getAttribute('name');
    this.index = parseInt(this.getAttribute('index'));
    this.parent = this.name + 's';

    this.textArea.rows = '1';
    this.addButton.type = 'button';
    this.addButton.innerText = 'Add ' + this.name;
    this.deleteButton.type = 'button';
    this.deleteButton.innerText = 'Delete ' + this.name;
    this.setIndexAttributes();

    this.appendChild(this.container);
  }

  /**
   * Sets all attributes that depend on the ParameterInput's index.
   * These attributes are separated into their own method so that they can be updated
   * when ParameterInputs change position.
   */
  setIndexAttributes() {
    var paramName = this.name.toLowerCase() + this.index;
    this.id = this.name + this.index;
    this.label.innerText = this.name + ' ' + (this.index + 1);
    this.label.for = paramName;
    this.textArea.name = paramName;

    // Inserts a new ParameterInput below the one clicked.
    this.addButton.onclick = event => {
      var newParameter = createParameterInput(this.name, this.index + 1);
      insertParameterInput(this, newParameter);
    }

    // Deletes the ParameterInput clicked.
    this.deleteButton.onclick = event => {
      const fieldName = this.field;
      const startIndex = this.index;
      this.remove();
      updateIndices(fieldName, startIndex);
    }
  }

  /** Gets the text in a ParameterInput's text area. */
  get text() {
    return this.textArea.value;
  }

  /** Gets the ParameterInput's index. */
  get position() {
    return this.index;
  }

  /** Gets the parent field of the ParamterInput (Tags, Ingredients, or Steps). */
  get field() {
    return this.parent;
  }

  /** Sets the text in a ParameterInput's text area. */
  set text(value) {
    this.textArea.value = value;
  }

  /** Sets the ParameterInput's index. */
  set position(value)  {
    this.index = parseInt(value);
  }

  /** Sets the parent field of the ParamterInput (Tags, Ingredients, or Steps). */
  set field(value) {
    this.parent = value;
  }
}
customElements.define('parameter-input', ParameterInput);

/** 
 * Creates a ParameterInput.
 * @param {string} name Used for displaying and determining the parent field.
 * @param {string} index The position of the ParameterInput.
 */
function createParameterInput(name, index) {
  var newParameter = document.createElement('parameter-input');
  newParameter.setAttribute('name', name);
  newParameter.setAttribute('index', index);
  newParameter.setAttribute('id', name + index);
  return newParameter;
}

/** 
 * Inserts a ParameterInput.
 * @param {ParameterInput} previous The ParameterInput to insert after.
 * @param {ParameterInput} parameterInput The ParameterInput to insert.
 */
function insertParameterInput(previous, parameterInput) {
  previous.insertAdjacentElement('afterend', parameterInput);
  updateIndices(parameterInput.field, parameterInput.position + 1);
}

/** 
 * Appends an existing ParameterInput.
 * @param {string} fieldName The field to append to.
 * @param {ParameterInput} parameterInput The ParameterInput to append.
 */
function appendParameterInput(fieldName, parameterInput) {
  const field = document.getElementById(fieldName);
  field.appendChild(parameterInput);
}

/** 
 * Appends a new ParameterInput.
 * @param {string} fieldName The field to append to.
 */
function appendNewParameterInput(fieldName) {
  const field = document.getElementById(fieldName);
  field.appendChild(createParameterInput(fieldName.slice(0, -1), field.children.length));
}

/**
 * Updates the indices of ParameterInputs after an insertion or deletion.
 * @param {string} fieldName The field with the ParameterInputs to update.
 * @param {number} startIndex The index of the first ParameterInput to update.
 */
function updateIndices(fieldName, startIndex) {
  var parameters = document.getElementById(fieldName).children;
  for (var i = startIndex; i < parameters.length; i++) {
    parameters[i].position = i;
    parameters[i].setIndexAttributes();
  }
}

/** Gets a parent recipe's data from Datastore. */
function getOriginalRecipe() {
  const key = document.getElementById('key').value;
  if (key) {
    fetch('/new-recipe?key=' + key).then(response => response.json()).then((recipe) => {
      populateRecipeCreationForm(recipe);
    });
  }
}

/** Populates the fields of the recipe editor with a parent recipe's data. */
function populateRecipeCreationForm(recipe) {
  document.getElementById('name').value = recipe.name;
  document.getElementById('description').value = recipe.description;
  populateFormField('Tag', recipe.tags);
  populateFormField('Ingredient', recipe.ingredients);
  populateFormField('Step', recipe.steps);
}

function populateFormField(fieldName, data) {
  for (var i = 0; i < data.length; i++) {
    var parameter = document.getElementById(fieldName + i);
    if (parameter !== null) {
      parameter.text = data[i];
    } else {
      var newParameter = createParameterInput(fieldName, i);
      newParameter.text = data[i];
      appendParameterInput(fieldName + 's', newParameter);
    }
  }
}
