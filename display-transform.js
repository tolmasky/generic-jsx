
module.exports = displayTransform;

function displayTransform(aString)
{
    var result = require("jsx-transform").fromString(aString, { factory: "React.createElement" });

    return  "<div id = \"code\">\
                <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.12.0/codemirror.css\">\
                <script src=\"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.12.0/codemirror.js\"></script>\
                <script src=\"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.12.0/mode/javascript/javascript.js\"></script>\
                <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.12.0/theme/neo.css\">\
                <style type=\"text/css\">body{margin:0} .CodeMirror {font-size:15px; width: 100%,; height: 100%; margin:0}</style>\
                <script type=\"text/javascript\">\
                        window.onload = function() {\
                            var myCodeMirror = CodeMirror(document.getElementById(\"code\"), {\
                                value: \"${require('js-string-escape')(result)}\",\
                                mode:  \"javascript\",\
                                theme: \"neo\",\
                                lineWrapping: true,\
                                lineNumbers: true\
                            });\
              };\
            </script>\
        </div>"
}