var FromSymbol = Symbol("from");
var ArgumentsSymbol = Symbol("arguments");

function curry(resolver)
{
    return function(aFunctionName, boundArguments)
    {
        var aFunction = (typeof aFunctionName === "string") ?
                        resolver(aFunctionName) :
                        aFunctionName;

        boundArguments = Object.assign({}, boundArguments,
                                       { children: Array.prototype.slice.apply(arguments, [2]) });

        return function(args)
        {
            if (args && args[ArgumentsSymbol])
                return call(aFunction, [map(Object.assign({ }, boundArguments, args))]);
        
            return call(aFunction, [map(Object.assign({ [ArgumentsSymbol]: true }, boundArguments, arguments))]);
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

function call(aFunction, args)
{
    try
    {
        return aFunction(...args);
    }
    catch (e)
    {
        if (e.message.indexOf("new") !== -1)
            return new aFunction(...args);

        throw e;
    }
}

module.exports.from = from;
module.exports.curry = curry;