import com.google.sps.servlets.FetchOptionsServlet;
import static org.mockito.Mockito.*;
import org.mockito.junit.MockitoJUnitRunner;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import java.util.ArrayList;
import java.util.List;

@RunWith(JUnit4.class)
public class FetchOptionsServletTest {

  /** Ensures that the substring splitting works for just one letter. */
  @Test
  public void titleCaseItemsTest_oneLetter() {
    ArrayList<String> expectedList = new ArrayList<String>();
    expectedList.add("E");

    ArrayList<String> testList = new ArrayList<String>();
    testList.add("e");
    ArrayList<String> actualList = FetchOptionsServlet.titleCaseItems(testList);

    Assert.assertEquals(expectedList, actualList);
  }

  @Test
  public void titleCaseItemsTest_allCaps() {
    ArrayList<String> expectedList = new ArrayList<String>();
    expectedList.add("Egg");

    ArrayList<String> testList = new ArrayList<String>();
    testList.add("EGG");
    ArrayList<String> actualList = FetchOptionsServlet.titleCaseItems(testList);

    Assert.assertEquals(expectedList, actualList);
  }

  @Test
  public void titleCaseItemsTest_noCaps() {
    ArrayList<String> expectedList = new ArrayList<String>();
    expectedList.add("Egg");

    ArrayList<String> testList = new ArrayList<String>();
    testList.add("egg");
    ArrayList<String> actualList = FetchOptionsServlet.titleCaseItems(testList);

    Assert.assertEquals(expectedList, actualList);
  }

  @Test
  public void titleCaseItemsTest_erraticCaps() {
    ArrayList<String> expectedList = new ArrayList<String>();
    expectedList.add("Bread");

    ArrayList<String> testList = new ArrayList<String>();
    testList.add("bReAD");
    ArrayList<String> actualList = FetchOptionsServlet.titleCaseItems(testList);

    Assert.assertEquals(expectedList, actualList);
  }
}
