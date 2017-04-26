var FromSymbol = Symbol("from");
var ArgumentsSymbol = Symbol("arguments");
var UnmappedArgumentsSymbol = Symbol("unmappedArguments");
var BaseSymbol = Symbol("base");

var Apply = (Function.prototype.call).bind(Function.prototype.apply);
var Call = Function.prototype.call.bind(Function.prototype.call);

var ArrayConcat = Array.prototype.concat;
var ArraySlice = Array.prototype.slice;

function curry(aFunction, newArguments)
{
    var syntacticChildren = Call(ArraySlice, arguments, 2);

    var previousArguments = aFunction[UnmappedArgumentsSymbol] || { };

    var syntacticChildren = Call(ArraySlice, arguments, 2);
    var children = syntacticChildren.length ? syntacticChildren : newArguments && newArguments.children || previousArguments.children || [];

    var currentArguments = Object.assign({ }, previousArguments, newArguments, { children: children });

    var baseFunction = base(aFunction);

    return Object.defineProperty(
    Object.assign(function _(attributes)
    {
        var args = map(Object.assign({ }, currentArguments, attributes, arguments));

        try
        {
            return baseFunction(args);
        }
        catch (anException)
        {
            if (anException instanceof TypeError &&
                /cannot be invoked without 'new'$/.test(anException.message))
                return new baseFunction(args);

            throw anException;
        }
    },
    {
        [BaseSymbol]: base(aFunction),
        [ArgumentsSymbol]: map(currentArguments),
        [UnmappedArgumentsSymbol]: currentArguments
    }), "name", { value: baseFunction.name });

    function map(args)
    {
        if (!Object.keys(args).some(key => args[key] && args[key][FromSymbol] !== undefined))
            return args;

        var adjusted = { };

        for (var key of Object.keys(args))
            adjusted[key] = exhaust(key, args);

        return adjusted;
    }

    function exhaust(key, args)
    {
        var value = args[key];

        if (value && value[FromSymbol] !== undefined)
            return exhaust(value[FromSymbol], args);

        return args[key];
    }
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
    return aFunction[BaseSymbol] || aFunction
};

function JSXPragma(evalInScope)
{
    return function (_, args)
    {
        var children = ArraySlice.call(arguments, 2);

        return curry(evalInScope(_), Object.assign({ }, args, { children: children || [] }));
    }
}

