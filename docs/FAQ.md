## Is this a _supported_ Esri product?

It is not. We offer no guarantees, SLAs, nor a product lifecycle to support planning.

This project is an open source collaboration between developers from a variety of teams at Esri that was initially developed to scratch an itch of our own. That said, we are actively recruiting outside contributors and fully expect that the tools here will be useful to a subset of our customers.

## Why TypeScript

Using TypeScript allows us to add type information to request params and response structures. This vastly simplifies development. TypeScript also has excellent support for newer `async`/`await` patterns and for generating API documentation with [TypeDoc](http://typedoc.org/).

TypeScript compiles to JavaScript so you can use @esri/solution.js in any JavaScript project. However if you use TypeScript you will get the benefits of type checking for free.

We also _really_ like TypeScript because it supports exporting to both [ES 2015 modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) (use `import`/`export`) and [UMD](http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/) modules. This allows us to support a wide variety of module loaders and bundlers, including Browserify, Webpack, RequireJS, and Dojo 1 and 2.

We include [`tslib`](https://www.npmjs.com/package/tslib) as a dependency of individual npm packages to make usage of `_extends` and `_assign` in our compiled code more concise.