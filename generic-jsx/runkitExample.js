/* @jsx (JSXPragma(_=>eval(_))) */

const { JSXPragma } = require("generic-jsx");
const BinaryTree = require("@generic-jsx/examples/binary-tree");

// BinaryTree is an ES6 class that we can curry using JSX:
const Division = <BinaryTree value = "/" />;
const Addition = <BinaryTree value = "+" />;
const Number = BinaryTree;


<Division>
    { Number(5) }
    <Addition>
        { Number(4) }
        { Number(6) }
    </Addition>
</Division>()
