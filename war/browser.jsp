<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="java.io.StringBufferInputStream" %>
<%@ page import="com.google.pzp.Storage" %>
<%@ page import="com.google.pzp.JspHelper" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.HashMap" %>
<%@ page import="java.util.ArrayList" %>


<html>
    <meta http-equiv="cache-control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">  <head>
    <title>Peasy-p Browser</title>
    <script src="utils/requirejs.2.1.4.js"></script>
    <script src="pzp.js"></script>
    <script src="storage.js"></script>
    <script src="browser.js"></script>
  </head>
  <body onload="pzp.Browser.initialize();">

<%
  Storage storage = Storage.getInstance();
  System.out.println("Set up Storage");
  Map<String, String> selections = storage.getMap("_selections_");
  System.out.println("Selections is " + selections);
  List<String> categories = storage.categories();
  System.out.println("categories: " + categories.toString());
  String currentIndividual = null;
  if (selections != null) {
    currentIndividual = selections.get("individual");
  }
  if (currentIndividual == null) {
    currentIndividual = "-";
  }
  System.out.println("currentIndividual: " + currentIndividual.toString());
  String currentCategory = null;
  if (selections != null) { 
    currentCategory = selections.get("category");
  }
  if (currentCategory == null) {
    currentCategory = "-";
  }
  System.out.println("currentCategory: " + currentCategory.toString());
  
  List<String> individuals = storage.individuals(currentCategory);
  System.out.println("individuals: " + individuals.toString());

  UserService userService = UserServiceFactory.getUserService();
  User user = userService.getCurrentUser();
  boolean debug = false;
  if (debug) {
    System.out.println("Checking user: " + user.toString());
    if (selections != null) {
      System.out.println("selections: " + selections.toString());
    }
    System.out.println("categories: " + categories.toString());
    System.out.println("individuals: " + individuals.toString());
    System.out.println("currentCategory: " + currentCategory.toString());
    System.out.println("currentIndividual: " + currentIndividual.toString());
  }
  if (user != null) {
%>
<p>Ready to <i>browse</i>, <%= user.getNickname() %>? (You can
<a href="<%= userService.createLogoutURL(request.getRequestURI()) %>">sign out</a>.)</p>

<%
  if (debug) {
%>
<p>selections is <%= selections != null ? selections.toString(): "null" %> !</p>
<p>categories is <%= categories.toString() %> !</p>
<p>individuals is <%= individuals.toString() %> !</p>
<p>currentCategory is <%= currentCategory.toString() %> !</p>
<p>currentIndividual is <%= currentIndividual.toString() %> !</p>
<%
    }
%>

<%
    } else {
%>
<p>Hello!
<a href="<%= userService.createLoginURL(request.getRequestURI()) %>">Sign in</a>
to include your name with greetings you post.</p>
<%
    }
%>

<h1>Categories</h1>
Browse
<select id="pzp_category_id">
  <option value="_new_">New Category...</option>
  <option value="-"<%=JspHelper.selectedDefault(currentCategory)%>>-</option>
  <!-- options based on DB contents -->
  <% for (String category: Storage.filterDefault(categories)) { %>
      <option value=<%=category%><%=JspHelper.selectedHtml(category, currentCategory)%>><%=category%></option>
  <% } %>
</select>
Show
<select id="pzp_individual_id">
  <option value="_new_">New Individual...</option>
  <option value="-"<%=JspHelper.selectedDefault(currentIndividual)%>>-</option> <!-- the default for this category -->
  <!-- options based on DB contents -->
  <% for (String individual: Storage.filterDefault(individuals)) { %>
      <option value=<%=individual%><%=JspHelper.selectedHtml(individual, currentIndividual)%>><%=individual%></option>
  <% } %>
 </select>
 <br>
 <textarea rows=20 cols=100 id="pzp_workspace_id"></textarea>
 <br>
 <input type="button" id="pzp_go_id" value="Go">
 <br>
 <textarea rows=20 cols=100 id="pzp_output_id"></textarea>
  </body>
</html>
