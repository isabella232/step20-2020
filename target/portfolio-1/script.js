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
      loginEl.innerHTML = 'You are currently logged in with your Google account. Log out <a href=\"' + loginInfo.url + '\">here</a>.';
      document.getElementById('signup-form').classList.remove('hidden');
    }
    else {
      loginEl.innerHTML = 'Login <a href=\"' + loginInfo.url + '\">here</a> to create your account.';
    }
  });
}

function getUserData(id) {
  fetch('/user?id=' + id).then(response => response.json()).then(userInfo => {
    document.getElementById('info').innerHTML = 'id = ' + userInfo.id + ', email = ' + userInfo.email + ', username = ' + userInfo.username;
  });
}
