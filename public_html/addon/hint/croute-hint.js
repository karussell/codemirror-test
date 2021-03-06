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

        var tokens = [];

        var line = editor.getLine(cur.line);
        var start = 0;
        var hasIf = false;
        var token;
        for (var i = 0; i <= line.length; i++) {

            if (i === cur.ch) {
                var lastValue = line.substring(start, i);
                if (lastValue)
                    tokens.push(lastValue);
                token = {start: start, end: cur.ch, string: lastValue, type: (hasIf ? "encoded_value" : null)};
                break;
            }

            if (line.charAt(i) === ":") {
                var tmp = line.substring(start, i);
                hasIf = tmp === "if" || tmp === "else if";
                tokens.push(line.substring(start, i));
                start = i;

            } else if (line.charAt(i) === " ") {
                tokens.push(line.substring(start, i));
                start = i + 1;
            }
        }
        console.log(tokens);
        token.state = innerMode.state;

        return {list: getCompletions(token, tokens),
            from: Pos(cur.line, token.start),
            to: Pos(cur.line, token.end)};
    }

    CodeMirror.registerHelper("hint", "yaml", function (editor, options) {
        return scriptHint(editor);
    });

    var encodedValues = {
        "max_speed": ["<number>"],
        "road_class": ["OTHER", "MOTORWAY", "TRUNK", "PRIMARY", "SECONDARY", "TERTIARY", "RESIDENTIAL", "UNCLASSIFIED", "SERVICE", "ROAD", "TRACK", "BRIDLEWAY", "STEPS", "CYCLEWAY", "PATH", "LIVING_STREET", "FOOTWAY", "PEDESTRIAN", "PLATFORM", "CORRIDOR"],
        "road_class_link": [true, false],
        "road_environment": ["OTHER", "ROAD", "FERRY", "TUNNEL", "BRIDGE", "FORD", "SHUTTLE_TRAIN"],
        "road_access": ["YES", "DESTINATION", "CUSTOMERS", "DELIVERY", "FORESTRY", "AGRICULTURAL", "PRIVATE", "OTHER", "NO"],
        "surface": ["MISSING", "PAVED", "ASPHALT", "CONCRETE", "PAVING_STONES", "COBBLESTONE", "UNPAVED", "COMPACTED", "FINE_GRAVEL", "GRAVEL", "GROUND", "DIRT", "GRASS", "SAND", "OTHER"],
        "toll": ["NO", "ALL", "HGV"]
    };

    function getCompletions(token, tokens) {
        var keywords = ["if", "else", "else if", "multiply by", "limit to"];
        var found = [], start = token.string;
        console.log(token.string);
        function maybeAdd(str) {
            if (str.lastIndexOf(start, 0) == 0 && !arrayContains(found, str))
                found.push(str);
        }

        if (tokens.length > 1) {
            var values = encodedValues[tokens[tokens.length - 2]];
            if(!values && tokens.length > 2)
                values = encodedValues[tokens[tokens.length - 3]];
            if (values && values.length > 0) {
                for (var i = 0; i < values.length; i++) {
                    maybeAdd(values[i]);
                }
                return found;
            }
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
