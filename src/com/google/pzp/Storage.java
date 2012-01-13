package com.google.pzp;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.googlecode.objectify.NotFoundException;
import com.googlecode.objectify.Objectify;
import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.Query;
import org.json.simple.parser.ParseException;
import java.util.logging.Logger;

public class Storage {
  public static final String DEFAULT_NAME = "-";  // The name of our default category or individual.
  private static final Logger LOGGER = Logger.getLogger(Storage.class.getName());
  private static final Objectify OFY = ObjectifyService.begin();
  private static Storage instance = null; 
  
  static {
    ObjectifyService.register(Individual.class);
  }
  
  private Storage() {
  }

  public static Storage getInstance() {
    if (instance == null) {
       instance = new Storage();
    }
    return instance;
 }

  public Individual get(String name, String category) {
    try {
      Individual result = OFY.get(Individual.class, Individual.key(name, category));
      System.out.println("got " + result.toString());
      return result;
    } catch (NotFoundException e) {
      System.out.println("get failed on " + Individual.key(name, category));
      return null;
    }
  }
  
  public String getPayload(String name, String category) {
    Individual individual = get(name, category);
    if (individual == null) {
      return "";
    } else {
      return individual.payload;
    }
  }
  
  public String getPayload(String name) {
    return getPayload(name, DEFAULT_NAME);
  }
  
  public void put(Individual individual) {
    System.out.println("put: " + individual.toString());
    OFY.put(individual);
    System.out.println("now: " + individual.toString());
  }

  public List<String> getList(String name, String category) throws ParseException {
    return Json.getList(getPayload(name, category));
  }
  
  public Map<String, String> getMap(String name) throws ParseException {
    return Json.getMap(getPayload(name));
  }
  
  public List<String> individuals(String category) {
    Query<Individual> query = makeQuery(null, category);
    return listFromQuery(query);
  }
  
  public List<String> xcategories() {
    Query<Individual> query = makeQuery(DEFAULT_NAME, null);
    return listFromQuery(query);
  }
  
  public List<String> categories() {
    int c = 0;
    Map<String, String> map = new HashMap<String, String>();
    Query<Individual> query = makeQuery(null, null);  // query everything
    for (Individual item: query) {
      c++;
      map.put(item.category, item.name);
    }
    System.out.println("scanned " + c + " items counting categories.");
    return new ArrayList<String>(map.keySet());
  }
  
  private List<String> listFromQuery(Query<Individual> query) {
    List<String> result = new ArrayList<String>();
    // TODO: is there an easier way to gather up the elements from the query?
    for (Individual individual: query) {
      result.add(individual.name);
    }
    return result;
  }
  
  public String currentCategory() {
    Map<String, String> map = Json.getMap(getPayload("_selection_", DEFAULT_NAME));
    return map.get("category");
  }
  
//  private Key<Individual> makeKey(String name, String category) {
//    Key<Individual> instanceKey;
//    if (category != null) {
//      Key<String> parentKey = new Key<String>(category);
//      instanceKey = new Key<Individual>(parentKey, Individual.class, name);
//    } else {
//      instanceKey = new Key<Individual>(Individual.class, name);
//    }
//    return instanceKey;
//  }

  private Query<Individual> makeQuery(String name, String category) {
    Query<Individual> query = OFY.query(Individual.class);
    if (name != null && name.length() > 0) {
        query.filter("name", name);
    }
    if (category != null && category.length() > 0) {
      query.filter("category", category);
    }
    return query;
  }
  
  public void delete(Individual individual) {
    OFY.delete(individual);
  }
  
  public static List<String> filterDefault(List<String> collection) {
    List<String> result = new ArrayList<String>();
    for (String item: collection) {
      if (!item.equals(DEFAULT_NAME)) {
        result.add(item);
      }
    }
    return result;
  }
}
