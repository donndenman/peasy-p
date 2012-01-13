package com.google.pzp;

import java.util.List;

public class JspHelper {
  private static final String SELECTED_HTML = " selected=\"selected\"";
  private static final String NOT_SELECTED_HTML = "";
  
  /**
   * Returns HTML marking the default option selected or not, based on the current selection and collection.
   * @param collection A collection to check if the selection is present.
   * @param selection The current selection, which may or may not be present in the collection.
   * @return HTML marking the default selected iff the selection is not in the collection.
   */
  public static String selectedDefault(String selection) {
    if (selection.equals(Storage.DEFAULT_NAME)) {
      return SELECTED_HTML;
    } else {
      return NOT_SELECTED_HTML;
    }
  }
  
  /**
   * Returns HTML marking the current option selected or not, based on the current item and the selection.
   * @param key The current item.
   * @param selection The current selection.
   * @return HTML marking the item as selected iff the current item matches the current selection.
   */
  public static String selectedHtml(String key, String selection) {
    if (key.equals(selection)) {
      return SELECTED_HTML;
    } else {
      return NOT_SELECTED_HTML;
    }
  }
}
