var FromSymbol = Symbol("from");
var ArgumentsSymbol = Symbol("arguments");

var ArrayConcat = Array.prototype.concat;
var ArraySlice = Array.prototype.slice;

function curry(resolver)
{
    return function(aFunctionName, boundArguments)
    {
        var aFunction = (typeof aFunctionName === "string") ?
                        resolver(aFunctionName) :
                        aFunctionName;
        var mergedChildren = ArrayConcat.call(boundArguments && boundArguments.children || [], ArraySlice.apply(arguments, [2]));

        boundArguments = Object.assign({}, boundArguments, { children: mergedChildren });

        return function(args)
        {
            if (args && args[ArgumentsSymbol])
            {
                var mergedChildren = ArrayConcat.call(boundArguments.children || [], args.children || []);
                return call(aFunction, map(Object.assign({ }, boundArguments, args, { children: mergedChildren })));
            }

            return call(aFunction, map(Object.assign({ [ArgumentsSymbol]: true }, boundArguments, arguments)));
        }

        function map(args)
        {
            if (!Object.keys(args).some(key => args[key][FromSymbol] !== undefined))
                return args;

            var adjusted = { [ArgumentsSymbol]: true };

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
}

function from(aKey)
{
    return { [FromSymbol]: aKey };
}

function call(aFunction, properties)
{
    try
    {
        return aFunction(properties);
    }
    catch (e)
    {
        if (e.message.indexOf("new") !== -1)
            return new aFunction(properties);

        throw e;
    }
}

module.exports.from = from;
module.exports.curry = curry;