module.exports = function reduce(options)
{
    var array = options.array;
    var initial = options.initial;
    var result = initial;
    var func = options.func;

    var index = 0;
    var count = array.length;
    
    for (; index < count; ++index)
        result = func(result, array[index]);

    return result;
}
