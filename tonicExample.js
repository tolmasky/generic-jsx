/* @jsx (curry(_=>eval(_))) */
var { curry, from } = require("generic-jsx");
var BinaryTree = require("generic-jsx/binary-tree");

// BinaryTree is a normal JavaScript class, but thanks to generic JSX we can make it in a more natural way!
<BinaryTree value = "/">
    <BinaryTree value = { 5 } />
    <BinaryTree value = "+">
        <BinaryTree value = { 4 } />
        <BinaryTree value = { 6 } />
    </BinaryTree>
</BinaryTree>()
