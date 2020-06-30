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

package com.google.sps.servlets;

import com.google.sps.data.User;
import java.io.IOException;
import com.google.gson.Gson;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.EntityNotFoundException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


/** Servlet to store and get retrieve user information. */
@WebServlet("/user")
public final class UserServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();

    // Get the key from the query string.
    String keyString = request.getParameter("key");
    Key userKey = KeyFactory.stringToKey(keyString);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    try{
      Entity userEntity = datastore.get(userKey);
      String email = (String) userEntity.getProperty("email");
      String username = (String) userEntity.getProperty("username");
      User user = new User(userKey.getName(), email, username);

      // Convert to JSON and send it as the response.
      Gson gson = new Gson();

      response.setContentType("application/json");
      response.getWriter().println(gson.toJson(user));
    }
    catch(EntityNotFoundException e) {
      throw new IOException("Entity not found.");
    }
  }

  // Create or update a user
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();

    String email = userService.getCurrentUser().getEmail();
    String id = userService.getCurrentUser().getUserId();
    String username = request.getParameter("username-input");

    Key userKey = KeyFactory.createKey("User", id);

    // Create a new User entity with data from the request.
    Entity userEntity = new Entity(userKey);
    userEntity.setProperty("email", email);
    userEntity.setProperty("username", username);

    // Store the User entity in Datastore.
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(userEntity);

    response.sendRedirect("/profile-page-test.html?key=" + KeyFactory.keyToString(userKey));
  }
}
