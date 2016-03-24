/* @jsx (curry(_=>eval(_))) */
var { curry, from } = require("generic-jsx");
var BinaryTree = require("generic-jsx/binary-tree");

// BinaryTree is an ES6 class that we can curry using JSX:
var Division = <BinaryTree value = "/"/>;
var Addition = <BinaryTree value = "+"/>;
var Number = <BinaryTree value = { from(0) }/>;


<Division>
    { Number(5) }
    <Addition>
        { Number(4) }
        { Number(6) }
    </Addition>
</Division>()
