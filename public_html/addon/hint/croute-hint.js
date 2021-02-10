// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function (mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function (CodeMirror) {
    var Pos = CodeMirror.Pos;
    var mode = CodeMirror.getMode({}, "text/yaml");

    function forEach(arr, f) {
        for (var i = 0, e = arr.length; i < e; ++i)
            f(arr[i]);
    }

    function arrayContains(arr, item) {
        if (!Array.prototype.indexOf) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === item) {
                    return true;
                }
            }
            return false;
        }
        return arr.indexOf(item) != -1;
    }

    function scriptHint(editor) {
        // Find the token at the cursor
        var cur = editor.getCursor(), token = editor.getTokenAt(cur);
        var innerMode = CodeMirror.innerMode(editor.getMode(), token.state);

        var tokens = [], context = {};
        // TODO build yaml tree from lines until cursor
        for (var lineNo = 0; lineNo <= cur.line; lineNo++) {
            var lineStr;
            if (lineNo == cur.line) {
                lineStr = editor.getLine(lineNo).substring(0, cur.ch);
            } else {
                lineStr = editor.getLine(lineNo);
            }

            var stream = new CodeMirror.StringStream(lineStr, 1, {});
            var state = {};
            while (true) {
                var start = stream.pos;
                var res = mode.token(stream, state);
                // do not trim value as whitespace is significant in YAML
                if (res == null) {
                    var value = lineStr.substring(start, cur.ch);
                    tokens.push({type: "newline", value: value});
                    break;
                }
                var value = lineStr.substring(start, stream.pos);
                tokens.push({type: res, value: value});
            }
        }
        console.log(tokens);
        // console.log(parseObject(tokens, 0));

        var line = editor.getLine(cur.line);
        var start = 0;
        var hasIf = false;
        for (var i = 0; i < line.length; i++) {
            if (i === cur.ch) {
                token = {start: start, end: cur.ch, string: line.substring(start, i), type: (hasIf ? "encoded_value" : null)};
                break;
            }

            if (line.charAt(i) === ":") {
                var token = line.substring(start, i);
                hasIf = token === "if" || token === "else if";
            }

            if (line.charAt(i) === " ")
                start = i + 1;
        }

        token.state = innerMode.state;
        console.log(token);

        // If it's not a 'word-style' token, ignore the token.
//        if (!/^[\w$_]*$/.test(token.string)) {
//            token = {start: cur.ch, end: cur.ch, string: "", state: token.state,
//                type: token.string == "." ? "property" : null};
//        } else if (token.end > cur.ch) {
//            token.end = cur.ch;
//            token.string = token.string.slice(0, cur.ch - token.start);
//        }

//        var tprop = token;

        return {list: getCompletions(token, context),
            from: Pos(cur.line, token.start),
            to: Pos(cur.line, token.end)};
    }

    CodeMirror.registerHelper("hint", "yaml", function (editor, options) {
        return scriptHint(editor);
    });

    // TODO
    var hierarchicalHints = {
        "_type": "object",
        /* + priority */
        "speed": {"_type": "array",
            "inner_type": {
                "_type": "object",
                "if": {
                    "_type": "string"
                },
                "else if": {
                    "_type": "string"
                },
                "else": {
                    "_type": "string"
                },
                "limit to": {
                    "_type": "number"
                },
                "multiply by": {
                    "_type": "number"
                }
            }
        }
    };
    var encodedValues = {
        "max_speed": ["<number>"],
        "road_class": ["OTHER", "MOTORWAY", "TRUNK", "PRIMARY", "SECONDARY", "TERTIARY", "RESIDENTIAL", "UNCLASSIFIED", "SERVICE", "ROAD", "TRACK", "BRIDLEWAY", "STEPS", "CYCLEWAY", "PATH", "LIVING_STREET", "FOOTWAY", "PEDESTRIAN", "PLATFORM", "CORRIDOR"],
        "road_class_link": [true, false],
        "road_environment": ["OTHER", "ROAD", "FERRY", "TUNNEL", "BRIDGE", "FORD", "SHUTTLE_TRAIN"],
        "road_access": ["YES", "DESTINATION", "CUSTOMERS", "DELIVERY", "FORESTRY", "AGRICULTURAL", "PRIVATE", "OTHER", "NO"],
        "surface": ["MISSING", "PAVED", "ASPHALT", "CONCRETE", "PAVING_STONES", "COBBLESTONE", "UNPAVED", "COMPACTED", "FINE_GRAVEL", "GRAVEL", "GROUND", "DIRT", "GRASS", "SAND", "OTHER"],
        "toll": ["NO", "ALL", "HGV"]
    };

    function getCompletions(token, context) {
        var keywords = ["if", "else", "else if", "multiply by", "limit to"];
        var found = [], start = token.string;
        function maybeAdd(str) {
            if (str.lastIndexOf(start, 0) == 0 && !arrayContains(found, str))
                found.push(str);
        }

        if (context && context.length) {

        }

        if (token.type === "encoded_value") {
            var keys = Object.keys(encodedValues);
            for (var i = 0; i < keys.length; i++) {
                maybeAdd(keys[i]);
            }

        } else {
            forEach(keywords, maybeAdd);
        }

        return found;
    }
});
