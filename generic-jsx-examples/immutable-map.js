
var I = require("immutable");

function Map(options)
{
    var children = options.children;

    return new I.Map(options.children.map(aChild => aChild()));
}

Map.Entry = function(options)
{
    return [options.key, options.value];
}

module.exports = Map;
