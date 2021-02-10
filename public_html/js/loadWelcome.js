/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var lang;

function mystart() {
    
    var editor = CodeMirror(document.body, {
        value: "speed:\n"
               + "- if: road_class == MOTORWAY\n"
               + "  multiply by: 0.8\n"
               + "- else: \n"
               + "  limit to: 0.5\n",
        mode: "yaml",
        hintOptions: {completeSingle: false},
        extraKeys: {"Ctrl-Space": "autocomplete"},
        lineNumbers: true
    });
    
//    editor.showHint({
//        hint: function(token, context) {
//            alert(context.className);
//            return { list: [token, "test", "pest"] };
//        }
//    });
}
