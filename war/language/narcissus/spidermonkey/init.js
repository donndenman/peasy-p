/* -*- Mode: JS; tab-width: 4; indent-tabs-mode: nil; -*-
 * vim: set sw=4 ts=4 et tw=78:
 * ***** BEGIN LICENSE BLOCK *****
 *
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the Narcissus JavaScript engine.
 *
 * The Initial Developer of the Original Code is
 * Brendan Eich <brendan@mozilla.org>.
 * Portions created by the Initial Developer are Copyright (C) 2004
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Tom Austin <taustin@ucsc.edu>
 *   Brendan Eich <brendan@mozilla.org>
 *   Shu-Yu Guo <shu@rfrn.org>
 *   Dave Herman <dherman@mozilla.com>
 *   Dimitris Vardoulakis <dimvar@ccs.neu.edu>
 *   Patrick Walton <pcwalton@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*
 * This script is meant to be read and evaluated by a top-level loading script,
 * which provides the modules' source code, an evaluation function, and a global
 * object, all of which depend on the particular host environment.
 */

// (Array[string], Array[string], (string, string, int) -> any, global object) -> Narcissus
(function init(moduleNames, moduleSources, evaluate, global) {
    var Narcissus = {__proto__: null};

    // make the global object available to the interpreter via require("./global")
    Narcissus.global = global;

    moduleNames.forEach(function(name) {
        Narcissus[name] = {};
    });

    function require(path) {
        var name = path.replace(/^\.\//, "").replace(/\.js$/, "");
        if (!(name in Narcissus))
            throw new Error("unknown module: " + path);
        console.log('require ' + name)
        return Narcissus[name];
    }

    moduleNames.forEach(function(name, i) {
        console.log('evaluating module ' + name)
        var exec = evaluate.call(global,
                                 "(function(require, exports) { " + moduleSources[i] + "\n})",
                                 name + ".js",
                                 1);
        var mod = Narcissus[name];
        console.log('initing module ' + mod)
        exec.call(mod, require, mod);
    });

    return Narcissus;
})