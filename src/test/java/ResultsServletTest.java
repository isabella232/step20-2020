import com.google.sps.servlets.ResultsServlet;
import com.google.sps.data.TestRecipe;
import static org.mockito.Mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import java.io.PrintWriter;
import java.io.StringWriter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.junit.Assert;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import static com.google.appengine.api.datastore.FetchOptions.Builder.withLimit;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.tools.development.testing.LocalDatastoreServiceTestConfig;
import com.google.appengine.tools.development.testing.LocalServiceTestHelper;
import java.util.ArrayList;
import java.util.List;
import java.util.Arrays;
import com.google.gson.Gson;

@RunWith(JUnit4.class)
public class ResultsServletTest {

  private final LocalServiceTestHelper helper =
      new LocalServiceTestHelper(new LocalDatastoreServiceTestConfig());
  private DatastoreService testDatastore;

  @Before
  public void setUp() {
    helper.setUp();

    testDatastore = DatastoreServiceFactory.getDatastoreService();

    Entity recipeEntity1 = new Entity("Recipe");
    List<String> searchStrings1 = new ArrayList<String>();
    searchStrings1.add("EGG");
    searchStrings1.add("FLOUR");
    recipeEntity1.setProperty("search-strings", searchStrings1);

    Entity recipeEntity2 = new Entity("Recipe");
    List<String> searchStrings2 = new ArrayList<String>();
    searchStrings2.add("EGG");
    searchStrings2.add("BUTTER");
    recipeEntity2.setProperty("search-strings", searchStrings2);

    Entity recipeEntity3 = new Entity("Recipe");
    List<String> searchStrings3 = new ArrayList<String>();
    searchStrings3.add("AVOCADO");
    searchStrings3.add("TOMATO");
    recipeEntity3.setProperty("search-strings", searchStrings3);

    testDatastore.put(recipeEntity1);
    testDatastore.put(recipeEntity2);
    testDatastore.put(recipeEntity3);
  }

  @After
  public void tearDown() {
    helper.tearDown();
  }

  /** Tests that doGet actually utilizes the user-query. */
  @Test
  public void doGetTest() throws Exception {
    HttpServletRequest request = mock(HttpServletRequest.class);       
    HttpServletResponse response = mock(HttpServletResponse.class);    

    when(request.getParameter("user-query")).thenReturn("");

    StringWriter stringWriter = new StringWriter();
    PrintWriter writer = new PrintWriter(stringWriter);
    when(response.getWriter()).thenReturn(writer);

    new ResultsServlet().doGet(request, response);

    verify(request, atLeast(1)).getParameter("user-query"); // Verify that user-query was called.
    writer.flush();
  }

  /** Tests the basic functionality of doGet (i.e. logic of retrieving
      results from Datastore based on user keyword input).
      Not directly mocking the object because 1) Datastore is a final class
      and 2) The following test ensures the same logic holds while using
      the existing mocked Datastore service (testDatastore). */
  @Test
  public void doGetContentTest_singleKeyword() throws Exception {
    List<String> eggQuery = new ArrayList<String>();
    eggQuery.add("EGG");
    Filter containsEgg = new FilterPredicate("search-strings", FilterOperator.IN, eggQuery);

    Assert.assertEquals(2, testDatastore.prepare(new Query("Recipe").setFilter(containsEgg)).countEntities(withLimit(10)));
  }

  @Test
  public void doGetContentTest_multipleKeywords() throws Exception {
    List<String> eggQuery = new ArrayList<String>();
    eggQuery.add("EGG");
    List<String> butterQuery = new ArrayList<String>();
    butterQuery.add("BUTTER");
    Filter containsEggAndButter = new CompositeFilter(CompositeFilterOperator.AND, Arrays.<Filter>asList(
                                      new FilterPredicate("search-strings", FilterOperator.IN, eggQuery),
                                      new FilterPredicate("search-strings", FilterOperator.IN, butterQuery)));

    Assert.assertEquals(1, testDatastore.prepare(new Query("Recipe").setFilter(containsEggAndButter)).countEntities(withLimit(10)));
  }

  @Test
  public void formatQueryAsListTest_multipleKeywords() {
    List<String> expectedList = new ArrayList<String>();
    expectedList.add("EGG");
    expectedList.add("FLOUR");
    expectedList.add("BREAD");
    expectedList.add("BUTTER");

    // formatQueryAsList should be able to correctly separate keywords
    // despite capitalization and whitespace quirks, so long as the keywords
    // are separated in some way by commas.
    String query = "EGG, Flour,bread,BUtter";
    List<String> actualList = ResultsServlet.formatQueryAsList(query);

    Assert.assertEquals(expectedList, actualList);
  }

  @Test
  public void generateFiltersFromQueryTest_noKeywords() {
    List<String> queryList = new ArrayList<String>();
    queryList.add("");
    Filter expectedFilter = new FilterPredicate("search-strings", FilterOperator.IN, queryList);

    Filter actualFilter = ResultsServlet.generateFiltersFromQuery(queryList);

    Assert.assertEquals(expectedFilter, actualFilter);
  }

  @Test
  public void generateFiltersFromQueryTest_singleKeyword() {
    List<String> queryList = new ArrayList<String>();
    queryList.add("BREAD");
    Filter expectedFilter = new FilterPredicate("search-strings", FilterOperator.IN, queryList);

    Filter actualFilter = ResultsServlet.generateFiltersFromQuery(queryList);
    
    Assert.assertEquals(expectedFilter, actualFilter);
  }

  @Test
  public void generateFiltersFromQueryTest_multipleKeywords() {
    List<String> breadQuery = new ArrayList<String>();
    breadQuery.add("BREAD");
    List<String> eggQuery = new ArrayList<String>();
    eggQuery.add("EGGS");
    List<String> butterQuery = new ArrayList<String>();
    butterQuery.add("BUTTER");
    Filter expectedFilter = new CompositeFilter(CompositeFilterOperator.AND, Arrays.<Filter>asList(
                                new FilterPredicate("search-strings", FilterOperator.IN, breadQuery),
                                new FilterPredicate("search-strings", FilterOperator.IN, eggQuery),
                                new FilterPredicate("search-strings", FilterOperator.IN, butterQuery)));

    List<String> queryList = new ArrayList<String>();
    queryList.add("BREAD");
    queryList.add("EGGS");
    queryList.add("BUTTER");
    Filter actualFilter = ResultsServlet.generateFiltersFromQuery(queryList);

    Assert.assertEquals(expectedFilter, actualFilter);
  }
}
