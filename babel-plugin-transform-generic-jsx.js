
module.exports = function plugin({ types: t })
{
    const visitor = require("babel-helper-builder-react-jsx")(
    {
        pre: function(state, { file })
        {
            state.args.push(state.tagExpr);
            state.callee = file.curryID;
            
            if (file.insertDeclaration)
                file.insertDeclaration();
        }
    });
    const declaration = t.memberExpression(
        t.callExpression(
            t.identifier("require"),
            [t.stringLiteral("generic-jsx")]),
        t.identifier("curry"));

    visitor.Program = function(aPath, aState)
    {
        aPath.hub.file.curryID = aPath.scope.generateUidIdentifierBasedOnNode(t.identifier("curry"));
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
