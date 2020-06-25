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

import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import com.google.sps.data.TestRecipe;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.gson.Gson;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet responsible for creating new comments. */
@WebServlet("/results")
public class ResultsServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String userQuery = request.getParameter("user-query");
    Query query = new Query("Recipe").addSort("timestamp", SortDirection.DESCENDING);

    query.setFilter(generateFiltersFromQuery(formatQueryAsList(userQuery)));

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    List<TestRecipe> testRecipes = new ArrayList<>();
    for (Entity entity : results.asIterable()) {
      long id = entity.getKey().getId();
      ArrayList<String> searchStrings = (ArrayList<String>) entity.getProperty("search-strings");
      long timestamp = (long) entity.getProperty("timestamp");

      TestRecipe testRecipe = new TestRecipe(id, searchStrings, timestamp);
      testRecipes.add(testRecipe);
    }

    Gson gson = new Gson();

    response.setContentType("application/json;");
    response.getWriter().println(gson.toJson(testRecipes));
  }

  public List<String> formatQueryAsList(String query) {
    query = query.toUpperCase();
    List<String> queryList = new ArrayList<String>(Arrays.asList(query.split(",")));
    List<String> formattedQueryList = new ArrayList<String>();
    for (String singleQuery:queryList) {
      formattedQueryList.add(singleQuery.trim());
    }
    return formattedQueryList;
  }

  public Filter generateFiltersFromQuery(List<String> queryList) {
    if (queryList.size() < 2) {
      return new FilterPredicate("search-strings", FilterOperator.IN, queryList);
    }
    List<Filter> filters = new ArrayList<Filter>();
    for (String query:queryList) {
      // A collection of values as the search item is required.
      List<String> queryAsList = new ArrayList<String>();
      queryAsList.add(query);
      filters.add(new FilterPredicate("search-strings", FilterOperator.IN, queryAsList));
    }
    return new CompositeFilter(CompositeFilterOperator.OR, filters);
  }
}
