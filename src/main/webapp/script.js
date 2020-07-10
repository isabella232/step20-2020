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

function getLoginLink() {
  fetch('/login').then(response => response.json()).then(loginInfo => {
    const loginEl = document.getElementById('login-link');
    if(loginInfo.status) {
      document.getElementById('signup-form').classList.remove('hidden');
      loginEl.innerHTML = 'You are currently logged in with your Google account. <a href=\"' + loginInfo.url + '\">Log out</a>.';
    } else {
      loginEl.innerHTML = '<a href=\"' + loginInfo.url + '\">Login</a> to create your account.';
    }
  });
}

function getUserData() {
  var url = window.location.href;
  var key = url.split('?')[1];

  fetch('/user?' + key).then(response => response.json()).then(userInfo => {
    document.getElementById('info').innerHTML = 'id = ' + userInfo.id + ', email = ' + userInfo.email + ', username = ' + userInfo.username;
  });
}

/** Fetches tasks from the server and adds them to the DOM. */
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
  const commentElement = document.createElement('li');
  commentElement.className = 'comment';

  const userComment = document.createElement('span');
  userComment.innerText = comment.comment;

  commentElement.appendChild(userComment);
  return commentElement;
}
