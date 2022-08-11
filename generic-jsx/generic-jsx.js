const given = f => f();

const
{
    isArrayPattern,
    isAssignmentPattern,
    isIdentifier,
    isObjectPattern,
    isObjectProperty,
    isRestElement
} = require("@babel/types");
const { parseExpression } = require("@babel/parser");

const ArrayIsArray = Array.isArray;

const FunctionPrototypeToString = Function.prototype.toString;

const ObjectAssign = Object.assign;
const ObjectGetOwnPropertyNames = Object.getOwnPropertyNames;
const ObjectHasOwn = Object.hasOwn;

const ObjectMerge = (lhs, rhs) => ObjectAssign(lhs, rhs);
const ObjectDefinePropertyValue =
    (object, key, value) => Object.defineProperty(object, key, { value });

const fNamed = (name, f) => ObjectDefinePropertyValue(f, "name", name);

const isPrimitive = value =>
    value === null || typeof value !== "object" && typeof value !== "function";

const fCached = f => given((
    cache = new WeakMap(),
    set = (arguments, value) => (cache.set(arguments[0], value), value),
    getset = (arguments, deferred) => cache.has(arguments[0]) ?
        cache.get(arguments[0]) :
        set(arguments, deferred(...arguments))) =>
        fNamed(`${f.name}-cached`, (...arguments) => isPrimitive(arguments[0]) ?
            f(arguments) :
            getset(arguments, f)));

const BindingOfs = new WeakMap();

const FunctionGetBindingOf = f => BindingOfs.get(f) || false;
const FunctionGetBaseBindingOf = (f, fPrevious = f) =>
    f ? FunctionGetBaseBindingOf(FunctionGetBindingOf(f), f) : fPrevious;

Function.getBindingOf = FunctionGetBindingOf;

exports.getBindingOf = FunctionGetBindingOf;

const fParseBindingOf = f => given((
    bindingOf = FunctionGetBindingOf(f)) =>
        bindingOf ? fParse(bindingOf) : fParseBindingOf(bindingOf));

const fParse = fCached(f => given((
    fString = FunctionPrototypeToString.call(f),
    { type, params } = parseExpression(`(${fString})`),
    lastParameter = params.length > 0 && params[params.length - 1],
    restParameter = lastParameter && isRestElement(lastParameter) && lastParameter) =>
({
    stringified: fString,
    toUnmergedArguments: toToArguments(params),
    isArrowFunction: type === "ArrowFunctionExpression",
    restParameterName: restParameter && restParameter.argument.name
})));

const MISSING = { missing: true };

const toToArguments = node =>
    !node ?
        () => void(0) :
    ArrayIsArray(node) ?
        given((
            last = node.length >= 1 && node[node.length - 1],
            rest = last && last.type === "RestElement" && last,
            nonRest = rest ? node.slice(0, -1) : node,
            toRestArguments = rest ? toToArguments(rest) : () => [],
            toNonRestArguments = nonRest.map(toToArguments)) =>
            named => toNonRestArguments
                .map(f => f(named))
                .concat(toRestArguments(named, []))) :
    isArrayPattern(node) ?
        toToArguments(node.elements) :
    isObjectPattern(node) ?
        given((toArguments = toToArguments(node.properties)) =>
            named => ObjectAssign({}, ...toArguments(named))) :
    isObjectProperty(node) ?
        given((
            { key, value } = node,
            computedKey = isIdentifier(key) ? key.name : key.value,
            toArguments = toToArguments(node.value)) =>
            named => given((value = toArguments(named, MISSING)) =>
                value !== MISSING && ({ [computedKey]: value }))) :
    isIdentifier(node) ?
        given(({ name } = node) =>
            (named, fallback) =>
                ObjectHasOwn(named, name) ? named[name] : fallback) :
    isAssignmentPattern(node) ?
        toToArguments(node.left) :
    isRestElement(node) ?
        toToArguments(node.argument) :
    () => void(0);

function fBind(f, attributes, children)
{
    if (children.length === 0 &&
        ObjectGetOwnPropertyNames(attributes).length === 0)
        return f;

    const baseBindingOf = FunctionGetBaseBindingOf(f);
    const
    {
        stringified,
        toUnmergedArguments,
        isArrowFunction,
        restParameterName
    } = fParse(baseBindingOf);

    const mergedAttributes = ObjectAssign(
        { },
        f.attributes,
        attributes,
        restParameterName && { [restParameterName]: children });
    const toArguments = arguments =>
        ObjectMerge(toUnmergedArguments(mergedAttributes), arguments);

    const fBound = isArrowFunction ?
        (...arguments) => baseBindingOf(...toArguments(arguments)) :
        function (...arguments)
        {
            return baseBindingOf.apply(this, toArguments(arguments));
        };

    BindingOfs.set(fBound, f);

    return ObjectAssign(fNamed(baseBindingOf.name, fBound),
    {
        attributes: mergedAttributes,
        toString() { return stringified; }
    });
}

exports.JSXPragma = function JSXPragma(evalInScope)
{
    return function JSXPragma(f, attributes, ...children)
    {
        return (f, attributes, ...children) =>
        fBind(typeof f === "string" ? resolve(f) : f, attributes, children);
    }
}
