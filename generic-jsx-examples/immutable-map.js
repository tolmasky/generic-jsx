const I = require("immutable");


function Map(...entries)
{
    return new I.Map(entries.map(child => child()));
}

Map.Entry = function(key, value)
{
    return [key, value];
}

module.exports = Map;
