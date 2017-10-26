const { inspect } = require("util");

const FromSymbol = Symbol.for("generic-jsx:from");
const ArgumentsSymbol = Symbol.for("generic-jsx:arguments");
const UnmappedArgumentsSymbol = Symbol.for("generic-jsx:unmapped-arguments");
const BaseSymbol = Symbol.for("generic-jsx:base");

const Call = Function.prototype.call.bind(Function.prototype.call);

const ArrayConcat = Array.prototype.concat;
const ArraySlice = Array.prototype.slice;

const FunctionToString = Function.prototype.toString;

const ObjectAssign = Object.assign;
const ObjectDefineProperty = Object.defineProperty;

const EmptyObject = Object.create(null);


function curry(aFunction, newArguments)
{
    const syntacticChildren = Call(ArraySlice, arguments, 2);
    const previousArguments = aFunction[UnmappedArgumentsSymbol] || false;
    const children = syntacticChildren.length > 0 ?
        syntacticChildren :
        copyChildren(newArguments) ||
        copyChildren(previousArguments) || [];

    const baseFunction = base(aFunction);
    const currentArguments = ObjectAssign({ },
        previousArguments, newArguments, { children });
    const curried = function _(attributes)
    {
        const args = resolveFroms(ObjectAssign({ },
            currentArguments, attributes, arguments));

        return Call(baseFunction, this, args);
    }

    ObjectAssign(curried,
    {
        [BaseSymbol]: baseFunction,
        // FIXME: Make this a getter?
        [ArgumentsSymbol]: resolveFroms(currentArguments),
        [UnmappedArgumentsSymbol]: currentArguments,
        toString: curriedToString
    });
    ObjectDefineProperty(curried, "name", { value: baseFunction.name });

    return curried;
}

function curriedToString()
{
    const baseFunction = base(this);
    const args = getArguments(this);

    return Call(FunctionToString, baseFunction) + "/* curried: " + inspect(args) + " */";
}

function copyChildren(args)
{
    if (args && args.children)
        return Call(ArraySlice, args.children, 0);

    return false;
}

function resolveFroms(args)
{
    const keys = Object.keys(args);
    const hasFrom = keys.some(
        key => args[key] && args[key][FromSymbol] !== undefined);

    if (!hasFrom)
        return args;

    const adjusted = { };

    for (const key of keys)
        adjusted[key] = exhaust(key, args);

    return adjusted;
}

function exhaust(key, args)
{
    const value = args[key];

    if (value && value[FromSymbol] !== undefined)
        return exhaust(value[FromSymbol], args);

    return value;
}

function from(aKey)
{
    return { [FromSymbol]: aKey };
}

module.exports.from = from;
module.exports.curry = curry;
module.exports.base = base;
module.exports.getArguments = getArguments;
module.exports.JSXPragma = JSXPragma;

function getArguments(aFunction)
{
    return aFunction[ArgumentsSymbol] || { children:[] };
}

function base(aFunction)
{
    return aFunction[BaseSymbol] || aFunction;
};

function JSXPragma(evalInScope)
{
    return function (_, args)
    {
        var children = ArraySlice.call(arguments, 2);

        return curry(evalInScope(_), Object.assign({ }, args, { children: children || [] }));
    }
}

