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

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EmbeddedEntity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.gson.Gson;
import java.util.Collection;
import java.util.List;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.ArrayList;
import java.util.LinkedList;
import com.google.sps.data.Recipe;
import com.google.sps.data.Step;

/** POST adds new recipes to Datastore, and GET returns a Recipe to the client to create a spin-off from. */
@WebServlet("/new-recipe")
public class NewRecipeServlet extends HttpServlet {

  private DatastoreService datastore;
  private final String TAG = "tag";
  private final String INGREDIENT = "ingredient";
  private final String STEP = "step";

  @Override
  public void init() {
    datastore = DatastoreServiceFactory.getDatastoreService();
  }

  /*
   * When a spin-off is created, this GET method gets the original recipe's data.
   * stringToKey() may throw an IllegalArgumentException if keyString is not a parsable string.
   * datastore.get() may throw an EntityNotFoundException if no entity exists for the given key.
   * Both exceptions result in the same behavior: no response from the servlet.
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String keyString = request.getParameter("key");
    Entity recipeEntity = null;
    try {
      recipeEntity = datastore.get(KeyFactory.stringToKey(keyString));
    } catch (Exception e) {
      e.printStackTrace();
      response.setStatus(response.SC_NO_CONTENT);
      return;
    }
    Recipe original = entityToRecipe(recipeEntity);
    response.setContentType("application/json;");
    Gson gson = new Gson();
    response.getWriter().println(gson.toJson(original););  
  }

  /**
   * Posts a new recipe or spin-off to Datastore.
   * Each POST request contains a recipe name, description, and lists of tags, ingredients, and steps.
   * Because the number of tags, ingredients, and steps can vary from recipe to recipe,
   * the method getParameters() is used to ensure that all of each are retrieved for each new recipe.
   */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Collection<String> searchStrings = new HashSet<>();
    String name = request.getParameter("name");
    searchStrings.add(name.toUpperCase());
    String description = request.getParameter("description");
    Collection<EmbeddedEntity> tags = getParameters(request, TAG, searchStrings);
    Collection<EmbeddedEntity> ingredients = getParameters(request, INGREDIENT, searchStrings);
    Collection<EmbeddedEntity> steps = getParameters(request, STEP, null);

    Entity recipe = new Entity("Recipe");
    recipe.setProperty("name", name);
    recipe.setProperty("description", description);
    recipe.setProperty("tags", tags);
    recipe.setProperty("ingredients", ingredients);
    recipe.setProperty("steps", steps);
    recipe.setProperty("search-strings", new ArrayList<String>(searchStrings));
    datastore.put(recipe);

    response.sendRedirect("/edit-recipe.html");
  }

  /**
   * Gets the parameters for fields that have different numbers of parameters from recipe to recipe.
   * For example, one recipe may have 2 ingredients, while another may have 20.
   * This method ensures that all tags, ingredients, and steps are recorded, no matter how many of each a recipe has.
   */
  private Collection<EmbeddedEntity> getParameters(HttpServletRequest request, String type, Collection<String> searchStrings) {
    Collection<EmbeddedEntity> parameters = new LinkedList<>();
    int parameterNum = 0;

    String parameterName = type + parameterNum;
    String parameter = request.getParameter(parameterName);
    while (parameter != null) {
      EmbeddedEntity parameterEntity = new EmbeddedEntity();
      parameterEntity.setProperty(type, parameter);
      addToSearchStrings(searchStrings, parameter);
      parameterName = type + (++parameterNum);
      parameter = request.getParameter(parameterName);
      parameters.add(parameterEntity);
    }
    return parameters;
  }

  /**
   * Adds a formatted search string to the set of search strings.
   * Search strings include a recipe's name, tags, and ingredients, all in upper-case.
   * @param searchStrings The set of search strings to add to, or null if the string shouldn't be added.
   * @param stringToAdd The string to be added.
   */
  private void addToSearchStrings(Collection<String> searchStrings, String stringToAdd) {
    if (searchStrings == null) {
      return;
    }
    searchStrings.add(stringToAdd.toUpperCase());
  }

  private Recipe entityToRecipe(Entity recipeEntity) {
    String name = (String) recipeEntity.getProperty("name");
    String description = (String) recipeEntity.getProperty("description");
    LinkedHashSet<String> tags = new LinkedHashSet<>((LinkedList<String>) (LinkedList<?>) getDataAsList(recipeEntity.getProperty("tags"), TAG));
    LinkedHashSet<String> ingredients = new LinkedHashSet<>((LinkedList<String>) (LinkedList<?>) getDataAsList(recipeEntity.getProperty("ingredients"), INGREDIENT));
    LinkedList<Step> steps = (LinkedList<Step>) (LinkedList<?>) getDataAsList(recipeEntity.getProperty("steps"), STEP);
    return new Recipe(name, description, tags, ingredients, steps);
  }

  private Collection<Object> getDataAsList(Object propertiesObject, String type) {
    Collection<EmbeddedEntity> properties = (Collection<EmbeddedEntity>) propertiesObject;
    LinkedList<Object> dataAsList = new LinkedList<>();
    for (EmbeddedEntity property : properties) {
      dataAsList.add(property.getProperty(type));
    }
    return dataAsList;
  }
}
