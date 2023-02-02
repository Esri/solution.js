## What browsers are supported?

Supported browsers are the latest versions of Google Chrome, Apple Safari, Mozilla Firefox, and Microsoft Edge (Chromium).

## What is the development workflow?

We use the [Atlassian Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow). To quote from that article,

> The overall flow of Gitflow is:
> 
> 1. A develop branch is created from master
> 2. A release branch is created from develop
> 3. Feature branches are created from develop
> 4. When a feature is complete it is merged into the develop branch
> 5. When the release branch is done it is merged into... master
> 6. If an issue in master is detected a hotfix branch is created from master
> 7. Once the hotfix is complete it is merged to both develop and master

One variation is that after a point release is created in `master`, it is merged into `develop` to maintain the two-way connectivity between them. (Gitflow merges from the release branch into `master` and `develop` in line 5, above.) 

Two main constraints:

* The `master` branch has client-ready software
* The `develop` branch has demo-ready software


## Why TypeScript

Using TypeScript allows us to add type information to request params and response structures. This vastly simplifies development. TypeScript also has excellent support for newer `async`/`await` patterns and for generating API documentation with [TypeDoc](http://typedoc.org/).

TypeScript compiles to JavaScript so you can use @esri/solution.js in any JavaScript project. However if you use TypeScript you will get the benefits of type checking for free.

We also _really_ like TypeScript because it supports exporting to both [ES 2015 modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) (use `import`/`export`) and [UMD](http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/) modules. This allows us to support a wide variety of module loaders and bundlers, including Browserify, Webpack, RequireJS, and Dojo 1 and 2.

We include [`tslib`](https://www.npmjs.com/package/tslib) as a dependency of individual npm packages to make usage of `_extends` and `_assign` in our compiled code more concise.
