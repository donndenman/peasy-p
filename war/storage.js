// Copyright 2012 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Peasy-p storage class.
 * @author Donn Denman
 */

pzp.Storage = function() {
};


/**
 * Requests some data from storage.
 */
pzp.Storage.prototype.request = function(individual, category, handler) {
  this.requestInternal_(individual, category, null, handler, 'load');
};
  
/**
 * Update some data in storage.
 */
pzp.Storage.prototype.update = function(individual, category, newValue) {
  this.requestInternal_(individual, category, newValue, null, 'save');
};

/**
 * Get list of individuals in a category.
 */
pzp.Storage.prototype.individuals = function(category, handler) {
  this.requestInternal_(null, category, null, handler, 'individuals');
};

/**
 * Get list of all categories.
 */
pzp.Storage.prototype.categories = function(handler) {
  this.requestInternal_(null, null, null, handler, 'categories');
};

pzp.Storage.prototype.requestInternal_ = function(individual, category, payload, handler, operation) {
  var params = {};
  if (category != null) {
    params.category = category;
  }
  if (individual != null) {
    params.name = individual;
  }
  if (payload != null) {
    params.payload = payload;
  }
  var request = this.makeRequest_('storage', operation, params);
  this.sendRequest_(request, function(response) {
    var result = JSON.parse(response);
    if (handler) {
      if (result && result.payload) {
        handler(result.payload);
      } else {
        console.log('Warning: missing result!');
        handler('');
      }
    }
  });
};

pzp.Storage.prototype.makeRequest_ = function(address, query, params) {
  var url = address + '?op=' + encodeURIComponent(query);
  for (var param in params) {
    url += '&' + param + '=' + encodeURIComponent(params[param]);
  }
  return url;
};

pzp.Storage.prototype.sendRequest_ = function(request, handler, opt_requestType) {
  var requestType = opt_requestType || 'GET';
  var xhr = new XMLHttpRequest();
  xhr.open(requestType, request, true);

  // Note that 'this' is the xhr request inside 'onload'.
  xhr.onload = function(e) {
    if (this.status == 200) {
      handler(this.response);
    } else {
    console.log('Error response: ' + this.status);
    }
  };

  xhr.send();
};
