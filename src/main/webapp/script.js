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

/** Fetches results from the server and adds them to the DOM. */
function getResults(param) {
  var userQuery = getURLParamVal(param);
  // Search string is in all caps, so the userQuery should also be in all caps for querying purposes.
  fetch('/results?user-query=' + userQuery.toUpperCase()).then(response => response.json()).then((results) => {
    const resultListElement = document.getElementById('result-list');
    results.forEach((result) => {
      console.log("Result found!");
      resultListElement.appendChild(createResultElement(result));
    })
  });
}

function storeInfo(sel) {
  const liveStreamLink = document.getElementById('live-stream-link').value;
  const recipeKey = sel.options[sel.selectedIndex].text;
}