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

function storeLiveStreamInfo() {
  const liveStreamLink = document.getElementById('live-stream-link').value;
  const liveStreamId = getIdFromUrl(liveStreamLink);
  const recipeSelection = document.getElementById('recipe-selection-input');
  const recipeKey = recipeSelection.options[recipeSelection.selectedIndex].text;
  return false;
}

/** Get the ID of a YouTube video from its URL.
    Will work only for a URL of a certain format
    (i.e. youtube.com/watch?v=). */
function getIdFromUrl(url) {
  return url.substring(url.lastIndexOf('=') + 1);
}
