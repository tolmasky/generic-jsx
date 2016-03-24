"use strict";

class BinaryTree
{
    constructor(options)
    {
        var value = options.value;
        var children = options.children;
        var left = children[0];
        var right = children[1];

        this.value = value;
        
        if (left)
            this.left = typeof left === "function" ? left() : left;

        if (right)
            this.right = typeof right === "function" ? right() : right;
    }
}

module.exports = BinaryTree;
