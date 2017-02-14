var curry = "(require(\"generic-jsx\").curry)";
var insertion = require("babylon").parse(curry).program.body[0].expression;

var plugin = function plugin(options)
{
    var types = options.types;
    var visitor = require("babel-helper-builder-react-jsx")(
    {
        pre: function(state)
        {
            state.args.push(state.tagExpr);
            state.callee = insertion;
        }
    });

    return  {
                inherits: require("babel-plugin-syntax-jsx"),
                visitor: visitor
            };
}

module.exports = plugin;
