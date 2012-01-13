// Copyright 2011 Google Inc. All Rights Reserved.
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
 * @fileoverview Peasy-p browser host logic.
 * @author Donn Denman
 */

/**
 * Browser UX.
 * @constructor 
 */
pzp.Browser = function() {
	this.category_ = document.getElementById('pzp_category_id');
	this.individual_ = document.getElementById('pzp_individual_id');
  this.workspace_ = document.getElementById('pzp_workspace_id');
  this.selectedCategory_ = this.category_.value;
  this.selectedIndividual_ = this.individual_.value;
	this.workspaceText_ = this.workspace_.value;
	this.storage_ = new pzp.Storage();
	this.lastChangeTime_ = new Date().getTime();
};

pzp.Browser.instance_ = null;

pzp.Browser.getInstance = function() {
  var instance = pzp.Browser.instance_;
  if (!instance) {
    instance = new pzp.Browser();
    pzp.Browser.instance_ = instance;
  }
  return instance;
};

// Initialization
pzp.Browser.initialize = function() {	
	var instance = pzp.Browser.getInstance();
	instance.attachHandlers_();
	instance.setupUx_();
};

pzp.Browser.prototype.attachHandlers_ = function() {
	// Attach handlers to the workspace.
  var self = this;
  var workspaceMethodWrapper = function(event) {
    self.changedWorkspaceHandler_(event);
  };
	this.workspace_.addEventListener('keyup', workspaceMethodWrapper);
  this.workspace_.addEventListener('change', workspaceMethodWrapper);
  this.workspace_.addEventListener('blur', workspaceMethodWrapper);
  
  // Attach handlers to our menus
  this.category_.addEventListener('change', function(event) {
    self.changedCategoryMenuHandler_(event);
  });
  
  this.individual_.addEventListener('change', function(event) {
    self.changedIndividualMenuHandler_(event);
  }); 
};

pzp.Browser.prototype.setupUx_ = function() {
  this.updateWorkspace_();
};

pzp.Browser.prototype.updateWorkspace_ = function() {
  var self = this;
  this.storage_.request(this.individual_.value, this.category_.value, function(result) {
    self.workspaceText_ = result;
    self.workspace_.value = result;
  });
};

pzp.Browser.prototype.saveWorkspace_ = function() {
  this.storage_.update(this.selectedIndividual_, this.selectedCategory_, this.workspace_.value);
};

pzp.Browser.prototype.changedWorkspaceHandler_ = function(event) {
  // Set a timer to save changes after a pause in activity.
  var delayMs = 1000;
  var time = new Date().getTime();
  this.lastChangeTime_ = time;
  var self = this;
  setTimeout(function() {
    // Were there any other changes since this timer was started?
    if (self.lastChangeTime_ == time) {
      // No, we were the last change, call the delayed change handler.
      self.delayedChangedWorkspaceHandler_(
          self.selectedIndividual_, self.selectedCategory_, self.workspace_.value);
    }
  }, delayMs);
};

pzp.Browser.prototype.delayedChangedWorkspaceHandler_ = function(individual, category, workspace) {
  // Send save request
  console.log('saving ' + individual + ' ' + category);
	this.storage_.update(individual, category, workspace);
};

pzp.Browser.prototype.changedIndividualMenuHandler_ = function(event) {
  this.saveWorkspace_();
  
  // Save the new selections
  var oldIndividual = this.individual_.value;
  var category = this.category_.value;
  var individual = this.createNewIfRequested_(oldIndividual);
  if (individual == null) {
    // Canceled the New.  Reselect previous.
    for (var i = 0; i < this.individual_.length; ++i) {
      if (this.individual_[i].value == this.selectedIndividual_) {
        this.individual_.selectedIndex = i;
        break;
      }
    }
  } else {
    this.storage_.update('_selections_', '-', JSON.stringify({
      'individual': individual,
      'category': category,
    }));
    
    // Update the workspace.
    this.updateWorkspace_();
    
    // If we're creating a new individual, add it to the select menu
    if (oldIndividual != individual) {
      this.addMenuItem_(this.individual_, individual);
    }
  
    this.selectedIndividual_ = this.individual_.value;
  }
};

pzp.Browser.prototype.changedCategoryMenuHandler_ = function(event) {
  this.saveWorkspace_();

  var oldCategory = this.category_.value;
  var category = this.createNewIfRequested_(oldCategory);
  if (category == null && this.category_) {
    // Canceled the New.  Reselect previous.
    for (var i = 0; i < this.category_.length; ++i) {
      if (this.category_[i].value == this.selectedCategory_) {
        this.category_.selectedIndex = i;
        break;
      }
    }
  } else if (category != oldCategory) {
    // If we're creating a new category, add it to the category menu
    this.addMenuItem_(this.category_, category);
  }
  this.selectedCategory_ = this.category_.value;

  // Request the individuals in this category and update that menu in a call-back
  var self = this;
  this.storage_.individuals(category, function(individuals) {
    self.updateIndividualsHandler_(individuals, self.selectedIndividual_);
  });
};

pzp.Browser.prototype.updateIndividualsHandler_ = function(individuals, selection) {
  // Stick with the same individual if we can otherwise switch to '-'.
  var menu = this.individual_;
  while (menu.length > 2) {
    menu.remove(2);
  }
  var individual;
  var selectedIndex = 1;
  var index = 1;
  for (var i = 0; i < individuals.length; ++i) {
    individual = individuals[i];
    if (individual != '-') {
      index++;
      var option = document.createElement('option');
      option.text = individual;
      option.value = individual;
      menu.add(option);
      if (individual == selection) {
        selectedIndex = index;
      }
    }
  }
  menu.selectedIndex = selectedIndex;
  individual = menu[selectedIndex].value;
  this.selectedIndividual_ = individual;
  console.log("saving selection with individual " + individual);
    
  // Save the new selections
  this.storage_.update('_selections_', '-', JSON.stringify({
    'individual': individual,
    'category': this.selectedCategory_,
  }));
    
  // Update the workspace.
  this.updateWorkspace_();
};

pzp.Browser.prototype.createNewIfRequested_ = function(name) {
  var result = name;
  if (name == '_new_') {
    result = prompt('New name?');
  }
  return result;
};

pzp.Browser.prototype.addMenuItem_ = function(menu, name) {
  var option = document.createElement('option');
  option.text = name;
  option.value = name;
  menu.add(option, menu[2]);
  menu.selectedIndex = 2;
};


