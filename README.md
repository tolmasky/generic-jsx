
You can find a full explanation of the ideas behind this [here](http://tolmasky.com/2016/03/24/generalizing-jsx/).

Or, try it on [Tonic](https://tonicdev.com/npm/generic-jsx)!

# Generic JSX

This is a version of JSX for general purpose programming. Why would you want that? Well, it gives
us the ability to have curried named parameters in JavaScript.

# How Do I use It?

If you are using Babel, then all you should need to do is the following:

```JavaScript
/* @jsx curry(_=>eval(_)) */
var { curry } = require("generic-jsx");
```

Now you'll be able make functions with named parameters that you can curry:

```JavaScript
var fs = require("fs");
var readFileSync = ({ name, encoding }) => fs.readFileSync(name, encoding);

// ...
var readString = <readFileSync encode = "utf8"/>;

<readString name = "package.json"/>();
```

Or, use with data structures!

```JavaScript
/* @jsx (curry(_=>eval(_))) */
var { curry, from } = require("generic-jsx");
var BinaryTree = require("generic-jsx/binary-tree");

// This represents 5 / ( 4 + 6)
<BinaryTree value = "/">
    <BinaryTree value = { 5 } />
    <BinaryTree value = "+">
        <BinaryTree value = { 4 } />
        <BinaryTree value = { 6 } />
    </BinaryTree>
</BinaryTree>()
```

