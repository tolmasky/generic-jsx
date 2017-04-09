
var declaration = require("babylon").parse("require(\"generic-jsx\").curry").program.body[0].expression;

var plugin = function plugin(options)
{
    var types = options.types;
    var visitor = require("babel-helper-builder-react-jsx")(
    {
        pre: function(state, { file })
        {
            state.args.push(state.tagExpr);
            state.callee = file.curryID;
            
            if (file.insertDeclaration)
                file.insertDeclaration();
        }
    });

    visitor.Program = function(aPath, aState)
    {
        aPath.hub.file.curryID = aPath.scope.generateUidIdentifierBasedOnNode(types.identifier("curry"));
        aPath.hub.file.insertDeclaration = function ()
        {
            aPath.scope.push({ id: aPath.hub.file.curryID, init: declaration });
            delete aPath.hub.file.insertDeclaration;
        }
    }

    return  {
                inherits: require("babel-plugin-syntax-jsx"),
                visitor: visitor
            };
}

module.exports = plugin;
