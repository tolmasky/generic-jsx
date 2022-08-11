const doublequote = string => `"${string.replace(/"/g, `\\"`)}"`;
const CSSToString = style => doublequote(Object
    .entries(style)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; "));

exports.CSSToString = CSSToString;

const element = name => (style, ...children) =>
    `<${name}${ style ? ` style = ${CSSToString(style)} ` : "" }>` +
        children.map(render).join("") +
    `</${name}>`;

exports.div = element("div");
exports.h1 = element("h1");
exports.p = element("p");

const render = element =>
    typeof element === "string" ?
        element :
        render(element());

exports.render = render;
