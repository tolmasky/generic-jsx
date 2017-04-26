/* @jsx (JSXPragma(_=>eval(_))) */

const { JSXPragma, from } = require("generic-jsx");

function reduce({ initial, items, reducer })
{
    var result = initial;

    for (const item of items)
        result = reducer(initial, item);

    return result;
}

const sum = <reduce initial = { 0 }
                    items = { from("numbers") }
                    reducer = { (a, b) => a + b } />;