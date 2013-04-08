// Copyright 2013 Google Inc. All Rights Reserved.
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
 * @fileoverview Peasy-p Proxy replacement, for use in Narcissus only.
 *
 * This implementation is a work-in-progress, and doesn't even work right
 * with Narcissus yet.
 *
 * For example, the following code fails:
 * function Car(color) {
 *   this.color = color;
 * }
 * Car.prototype.go = function() {
 *   return 'See that ' + this.color + ' car go!';
 * }
 *
 * // fails: go not a function
 * var c = new Car('blue');
 * c.go;
 *
 * @author Donn Denman
 */


// Useful links:
// https://github.com/mozilla/narcissus/wiki/Narcissus-internals
// https://developer.mozilla.org/en-US/docs/JavaScript/Old_Proxy_API
// http://wiki.ecmascript.org/doku.php?id=harmony:proxies_semantics
// http://wiki.ecmascript.org/doku.php?id=harmony:proxies

define(function(require, exports, module) {
definitions = require('./definitions');

// TODO(donnd): fix this proxy object!
if (!Proxy) {
  const Proxy = {
      create: function(handler, proto) {
        if (proto === undefined) {
          return handler;
        } else {
          return proto;
        }
      },
      createFunction: function(handler, f1, f2, pt) {
        return makeUserFunction(handler, f1, f2, pt);
      }
  };
}


// A user function proxy object: looks like a function and can be
// called either as method or a constructor?
function makeUserFunction(handler, callTrap, constructTrap) {
  console.log('make user function.');
  // Save the traps in an info object, available in a closure
  var ufProxy = new UserFunction(handler, callTrap, constructTrap);
  // The user function itself
  return function(self, args, x) {
    // Check if being called from "new".
    var isConstructing = false;
    if (this instanceof arguments.callee && !this.__constructedByUserFunction) {
      isConstructing = true;
      this.__constructedByUserFunction = true;
    }
    console.log('!!!invoking user function.  isConstructing: ' + isConstructing);

    if (isConstructing) {
      ufProxy.constructTrap.call();
    } else {
      ufProxy.callTrap.call()
    }
  };
}


function UserFunction(handler, callTrap, constructTrap) {
  this.handler = handler;
  this.callTrap = callTrap;
  this.constructTrap = constructTrap;
}

UserFunction.prototype.toString = function() {
  return '[object UserFunction]';
};


exports.Proxy = Proxy;
});
