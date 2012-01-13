package com.google.pzp;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.json.simple.parser.ContainerFactory;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class Json {
  private static final JSONParser PARSER = new JSONParser();
  
  private static final ContainerFactory CONTAINER_FACTORY = new ContainerFactory(){
    
    public List creatArrayContainer() {
      return new LinkedList();
    }

    public Map createObjectContainer() {
      return new LinkedHashMap();
    }
  };

  @SuppressWarnings("unchecked")
  public static List<String> getList(String jsonText) throws ParseException {
    return (List<String>)PARSER.parse(jsonText, CONTAINER_FACTORY);
  }
  
  @SuppressWarnings("unchecked")
  public static Map<String, String> xgetMap(String jsonText) throws ParseException {
    HashMap<String, String> map = new HashMap<String, String>();
    Map json = (Map)PARSER.parse(jsonText, CONTAINER_FACTORY);
    Iterator iter = json.entrySet().iterator();
    while(iter.hasNext()){
      Map.Entry<String, Object> entry = (Map.Entry<String, Object>)iter.next();
      map.put(entry.getKey(), entry.getValue().toString());
    }
    return map;
  }
  
  public static Object getObject(String jsonText) throws ParseException {
    return PARSER.parse(jsonText, CONTAINER_FACTORY);
  }

  public static Map<String, String> getMap(String jsonText) {
    JSONParser parser = new JSONParser();
    ContainerFactory containerFactory = new ContainerFactory(){
      public List creatArrayContainer() {
        return new LinkedList();
      }

      public Map createObjectContainer() {
        return new LinkedHashMap();
      }
    };
                  
    try{
      Map<String, String> map = new LinkedHashMap<String, String>();
      Map json = (Map)parser.parse(jsonText, containerFactory);
      Iterator iter = json.entrySet().iterator();
      while(iter.hasNext()){
        Map.Entry entry = (Map.Entry)iter.next();
        Object value = entry.getValue();
        String stringValue = value == null ? "" : value.toString();
        map.put(entry.getKey().toString(), stringValue);
      }
      return map;
    }
    catch(ParseException pe){
      System.out.println(pe);
    }
    return null;
  }
}
