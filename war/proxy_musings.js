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
 * @fileoverview Peasy-p Proxy Musings -- notes and experiments regarding proxy
 * implementation.  Non-functional!
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
        console.log('Proxy.create()');
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

// A user function proxy object: looks like a function and can be
// called either as method or a constructor?
function makeUserFunction2(handler, callTrap, constructTrap, proto) {
  console.log('make user function.');
  // Save the traps in an info object, available in a closure
  var ufProxy = new UserFunction(handler, callTrap, constructTrap);
  // The user function itself
  function F() {
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
  }
  F.prototype = proto;
  return new F();
}

function UserFunction(handler, callTrap, constructTrap) {
  this.handler = handler;
  this.callTrap = callTrap;
  this.constructTrap = constructTrap;
}

UserFunction.prototype.toString = function() {
  return '[object UserFunction]';
};

// Returns a new function wrapped with a Proxy.
// TODO(donnd): unused.  Remove?  Also remove "definitions"?
function newFunction(n, x) {
    var fint = new FunctionInternals(n, x.scope);
    var props = Object.create(Fp);
//    definitions.defineProperty(props, "length", fint.length, false, false, true);
//    definitions.defineProperty(props, "toString", function() {
//        return fint.toString();
//    }, false, false, true);
    var handler = definitions.makePassthruHandler(props);
    handler.fint = fint;
//    console.log('newFunction');
    var p = Proxy.createFunction(handler,
                                 function() {
                                   console.log('calling function fint p: ' + p);
                                   return fint.call(p, this, arguments, x);
                                 },
                                 function() {
                                   console.log('constructing function fint p: ' + p);
                                   return fint.construct(p, arguments, x);
                                 },
                                 fint);
    // TODO(donnd): reread this part -- I don't understand it!
//    functionInternals.set(p, fint);
    var proto = {};
    console.log('Setting definitions prototype and constructor.');

    // TODO(donnd): Figure out how to make this work with my version of a Proxy!
//    definitions.defineProperty(p, "prototype", proto, true);
    p.prototype = proto;

    definitions.defineProperty(proto, "constructor", p, false, false, true);
    return p;
}



// Object.defineProperty('__previouslyConstructedByX', { value : true, writeable : false, enumerable : false})
// This makes the extra property much less likely to be found accidentally, and guarantees it will never change.
// I'm working in node.js so I can be sure the implementation will support it, but in the browser
// you'd have to feature test to use this. – Nathan MacInnes Jul 20 '12

// from http://wiki.ecmascript.org/doku.php?id=harmony:proxies&s=proxy%20object#examplea_no-op_forwarding_proxy
var derivedProxy = {
  has: function(name) { return !!this.getPropertyDescriptor(name); },
  hasOwn: function(name) { return !!this.getOwnPropertyDescriptor(name); },
  get: function(receiver, name) {
    var desc = this.getPropertyDescriptor(name);
    desc = normalizeAndCompletePropertyDescriptor(desc);
    if (desc === undefined) { return undefined; }
    if ('value' in desc) {
      return desc.value;
    } else { // accessor
      var getter = desc.get;
      if (getter === undefined) { return undefined; }
      return getter.call(receiver); // assumes Function.prototype.call
    }
  },
  set: function(receiver, name, val) {
    var desc = this.getOwnPropertyDescriptor(name);
    desc = normalizeAndCompletePropertyDescriptor(desc);
    var setter;
    if (desc) {
      if ('writable' in desc) {
        if (desc.writable) {
          this.defineProperty(name, {value: val});
          return true;
        } else {
          return false;
        }
      } else { // accessor
        setter = desc.set;
        if (setter) {
          setter.call(receiver, val); // assumes Function.prototype.call
          return true;
        } else {
          return false;
        }
      }
    }
    desc = this.getPropertyDescriptor(name);
    desc = normalizeAndCompletePropertyDescriptor(desc);
    if (desc) {
      if ('writable' in desc) {
        if (desc.writable) {
          // fall through
        } else {
          return false;
        }
      } else { // accessor
        var setter = desc.set;
        if (setter) {
          setter.call(receiver, val); // assumes Function.prototype.call
          return true;
        } else {
          return false;
        }
      }
    }
    if (!Object.isExtensible(receiver)) return false;
    this.defineProperty(name, {
      value: val,
      writable: true,
      enumerable: true,
      configurable: true});
    return true;
  },
  enumerate: function() {
    var trapResult = this.getPropertyNames();
    var l = +trapResult.length;
    var result = [];
    for (var i = 0; i < l; i++) {
      var name = String(trapResult[i]);
      var desc = this.getPropertyDescriptor(name);
      desc = normalizeAndCompletePropertyDescriptor(desc);
      if (desc !== undefined && desc.enumerable) {
        result.push(name);
      }
    }
    return result;
  },
  keys: function() {
    var trapResult = this.getOwnPropertyNames();
    var l = +trapResult.length;
    var result = [];
    for (var i = 0; i < l; i++) {
      var name = String(trapResult[i]);
      var desc = this.getOwnPropertyDescriptor(name);
      desc = normalizeAndCompletePropertyDescriptor(desc);
      if (desc !== undefined && desc.enumerable) {
        result.push(name);
      }
    }
    return result;
  }
}

exports.Proxy = Proxy;
exports.newFunction = newFunction;
});
