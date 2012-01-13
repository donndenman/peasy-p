package com.google.pzp;

import java.io.IOException;
import java.net.URLDecoder;

import javax.servlet.http.*;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import java.util.logging.Logger;


import org.json.simple.JSONObject;

public class Storage_Servlet extends HttpServlet {
  private static final long serialVersionUID = -6839718463130161683L;
  private static final Logger LOGGER = Logger.getLogger(Storage_Servlet.class.getName());
  private static final Storage STORAGE = Storage.getInstance();

	@SuppressWarnings("unchecked")
  public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		LOGGER.info("get");
    UserService userService = UserServiceFactory.getUserService();
    User user = userService.getCurrentUser();
    
    String name = req.getParameter("name");
    String category = req.getParameter("category");
    String payload = req.getParameter("payload");
    String operation = req.getParameter("op");

    Individual individual = null;
    if ("save".equals(operation) || "load".equals(operation)) {
      individual = STORAGE.get(name, category);
      if (individual != null && "save".equals(operation) && (payload.length() == 0)) {
        System.out.println("deleting " + individual.toString());
        STORAGE.delete(individual);
        individual = null;
      } else if (individual == null) {
      	individual = new Individual(name, category, payload);
      }
    }
        
    JSONObject obj = new JSONObject();
    if ("save".equals(operation)) {
      if (individual != null) {
      	individual.payload = payload;
      	STORAGE.put(individual);
        obj.put("name", individual.name);
      }
    } else if ("load".equals(operation)) {
      obj.put("payload", individual.payload);
    } else if ("individuals".equals(operation)) {
      obj.put("payload", STORAGE.individuals(category));
    } else if ("categories".equals(operation)) {
      obj.put("payload", STORAGE.categories());
    } else {
      System.err.println("Unknown operation: " + operation);
    	obj.put("other", operation);
    }
        
  	if (user != null) {
      resp.setContentType("text/json");
      resp.getWriter().println(obj.toString());
    } else {
      resp.sendRedirect(userService.createLoginURL(req.getRequestURI()));
    }
  }
}
