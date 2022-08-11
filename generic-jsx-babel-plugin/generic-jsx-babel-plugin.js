const fail = message => { throw Error(message) };

const toBoundAttributes = (t, attributes, children) =>
    t.ObjectExpression(attributes
        .map(JSXAttributeToObjectProperty(t)));

const toChildrenArray = (t, children) =>
    t.ArrayExpression(children
        .map(child => toChildValue(t, child))
        .filter(child => !t.isJSXEmptyExpression(child)));

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

const toBoundFunction = (t, bind, { openingElement, children }) =>
    t.CallExpression((bind.used = true) && bind,
    [
        toExpression(t, openingElement.name),
        toBoundAttributes(t, openingElement.attributes, children),
        openingElement.selfClosing ?
            t.BooleanLiteral(false) :
            toChildrenArray(t, children)
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
                t.Identifier("bind"))),
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
            .replaceWith(toBoundFunction(
                t,
                get(state, "bind-identifier"),
                path.node))),

        Program:
        {
            enter: (path, state)  => void(
                !get(state, "bind-identifier") &&
                path.replaceWith(t.Program(
                [
                    toImportStatement(
                        t,
                        set(
                            state,
                            "bind-identifier",
                            path.scope.generateUidIdentifier("bind")),
                        state.opts.importSource || "generic-jsx"),
                    ...path.node.body
                ]))),

            exit: (path, state) => void(
                !get(state, "bind-identifier").used &&
                !get(state, "bind-removed") &&
                set(state, "bind-removed", true) &&
                path.replaceWith(t.Program(path.node.body.slice(1))))
        }
    }
});