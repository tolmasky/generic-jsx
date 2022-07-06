const fail = message => { throw Error(message) };

const toCurriedAttributes = (t, attributes, children) =>
    t.ObjectExpression(attributes
            .map(({ name, value }) =>
                t.ObjectProperty(
                    t.Identifier(name.name),
                    toAttributeValue(t, value)))
            .concat(
                t.ObjectProperty(
                    t.Identifier("children"),
                    t.ArrayExpression(children))));

const toAttributeValue = (t, value) =>
    value === null ? t.BooleanLiteral(true) :
    t.isStringLiteral(value) ? value :
    t.isJSXExpressionContainer(value) ? value.expression :
    fail(`Unexpected ${value.type} in JSX element`);

const toCurriedFunction = (t, curry, { openingElement, children }) =>
    t.CallExpression((curry.used = true) && curry,
    [
        t.Identifier(openingElement.name.name),
        toCurriedAttributes(t, openingElement.attributes, children)
    ]);

module.exports = ({ Plugin, types: t }) =>
({
    visitor:
    {
        JSXElement: (path, { curry }) => void(path
            .replaceWith(toCurriedFunction(t, curry, path.node))),

        Program:
        {
            enter: (path, file)  => void(
                !file.curry &&
                path.replaceWith(t.Program(
                [
                    t.VariableDeclaration("const",
                    [
                        t.VariableDeclarator(
                            file.curry =
                                path.scope.generateUidIdentifier("curry"),
                            t.MemberExpression(
                                t.CallExpression(
                                    t.Identifier("require"),
                                    [t.StringLiteral("generic-jsx")]),
                                t.Identifier("curry"))),
                    ]),
                    ...path.node.body
                ]))),

            exit: (path, file) => void(
                !file.curry.used &&
                !file.removed &&
                (file.removed = true) &&
                path.replaceWith(t.Program(path.node.body.slice(1))))
        }
    }
})