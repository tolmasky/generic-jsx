const fail = message => { throw Error(message) };

const toCurriedAttributes = (t, attributes, children) =>
    t.ObjectExpression(attributes
        .map(JSXAttributeToObjectProperty(t))
        .concat(
            t.ObjectProperty(
                t.Identifier("children"),
                t.ArrayExpression(children
                    .map(child => toChildValue(t, child))
                    .filter(child => !t.isJSXEmptyExpression(child))))));

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

const JSXAttributeToObjectProperty = t => node =>
    t.isJSXSpreadAttribute(node) ?
        t.SpreadElement(node.argument) :
        t.ObjectProperty(
            t.Identifier(node.name.name),
            toAttributeValue(t, node.value));

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

const toImportStatement = (t, as, source) =>
    t.VariableDeclaration("const",
    [
        t.VariableDeclarator(
            as,
            t.MemberExpression(
                t.CallExpression(
                    t.Identifier("require"),
                    [t.StringLiteral(source)]),
                t.Identifier("curry"))),
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
                    toImportStatement(
                        t,
                        set(
                            state,
                            "curry-identifier",
                            path.scope.generateUidIdentifier("curry")),
                        state.opts.importSource || "generic-jsx"),
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
