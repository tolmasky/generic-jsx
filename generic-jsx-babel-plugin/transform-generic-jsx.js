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
                    t.ArrayExpression(children
                        .map(child => toChildValue(t, child))))));

const toExpression = (t, node) =>
    t.isJSXIdentifier(node) ?
        t.Identifier(node.name) :
    t.isJSXMemberExpression(node) ?
        t.MemberExpression(
            toExpression(t, node.object),
            toExpression(t, node.property)) :
    t.isJSXExpressionContainer(node) ?
        node.expression :
    fail(`Unexpected ${node.type} in JSX element`);

const toChildValue = (t, child) =>
    t.isJSXText(child) ? t.StringLiteral(child.extra.raw) :
    t.isJSXExpressionContainer(child) ? child.expression :
    child;

const toAttributeValue = (t, value) =>
    value === null ? t.BooleanLiteral(true) :
    t.isStringLiteral(value) ? value :
    t.isJSXExpressionContainer(value) ? value.expression :
    fail(`Unexpected ${value.type} in JSX element`);

const toCurriedFunction = (t, curry, { openingElement, children }) =>
    t.CallExpression((curry.used = true) && curry,
    [
        toExpression(t, openingElement.name),
        toCurriedAttributes(t, openingElement.attributes, children)
    ]);

const get = (state, name) =>
  state.get(`@generic-jsx/plugin-generic-jsx/${name}`);
const set = (state, name, value) =>
  (state.set(`@generic-jsx/plugin-generic-jsx/${name}`, value), value);

module.exports = ({ types: t }) =>
({
    manipulateOptions: (_, parserOptions) =>
        parserOptions.plugins.push("jsx"),

    visitor:
    {
        JSXElement: (path, state) => void(path
            .replaceWith(toCurriedFunction(
                t,
                get(state, "curry-identifier"),
                path.node))),

        Program:
        {
            enter: (path, state)  => void(
                !get(state, "curry-identifier") &&
                path.replaceWith(t.Program(
                [
                    t.VariableDeclaration("const",
                    [
                        t.VariableDeclarator(
                            set(
                                state,
                                "curry-identifier",
                                path.scope.generateUidIdentifier("curry")),
                            t.MemberExpression(
                                t.CallExpression(
                                    t.Identifier("require"),
                                    [t.StringLiteral("generic-jsx")]),
                                t.Identifier("curry"))),
                    ]),
                    ...path.node.body
                ]))),

            exit: (path, state) => void(
                !get(state, "curry-identifier").used &&
                !get(state, "curry-removed") &&
                set(state, "curry-removed", true) &&
                path.replaceWith(t.Program(path.node.body.slice(1))))
        }
    }
});
