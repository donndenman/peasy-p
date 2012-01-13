package com.google.pzp;

import javax.persistence.Id;

public class Individual {
  @Id String id;
  String name;
  String category;
  String payload;

  @SuppressWarnings("unused")
  private Individual() {}
  
  public Individual(String name, String category, String payload)
  {
    this.id = key(name, category);
    this.name = name;
    this.category = category;
    this.payload = payload;
  }
  
  public String toString() {
    String result = "Individual id " + id;
    if (category != null && category.length() > 0) {
      result = "Category " + category + ", ";
    }
    if (name != null && name.length() > 0) {
      result += "Name " + name + ", ";
    }
    result += "Payload '" + payload +"'";
    return result;
  }
  
  public static String key(String name, String category) {
    return category + "," + name;
  }
}
