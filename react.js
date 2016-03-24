

function CSSToString(style)
{
    return "\"" + Object.keys(style).reduce(function (a,b)
    {
        return (a + b + ":" + style[b] + ";")
    }, "") + "\"";
}

exports.CSSToString = CSSToString;

function element(name)
{
    return function(options)
    {
        var style = options.style;
        var children = options.children;

        return "<" + name + (style ? " style = " + CSSToString(style) : "") + ">" + children.map(render).join("") + "</" + name + ">";
    }
}

exports.div = element("div");
exports.h1 = element("h1");
exports.p = element("p");

function render(element)
{
    if (typeof element === "string")
        return element;

    return render(element());
}

exports.render = render;
