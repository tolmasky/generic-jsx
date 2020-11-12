"use strict";

function BinaryTree(options)
{
    if (!(this instanceof BinaryTree))
        return new BinaryTree(options);

    const [left, right] = options.children || [];

    this.value = options.value;

    if (left)
        this.left = typeof left === "function" ? left() : left;

    if (right)
        this.right = typeof right === "function" ? right() : right;
}

module.exports = BinaryTree;
