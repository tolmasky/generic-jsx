"use strict";


module.exports = function BinaryTree(value, ...[left, right])
{
    if (!(this instanceof BinaryTree))
        return new BinaryTree(value, left, right);

    this.value = value;

    if (left)
        this.left = typeof left === "function" ? left() : left;

    if (right)
        this.right = typeof right === "function" ? right() : right;
}
