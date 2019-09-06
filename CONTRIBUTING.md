Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

### Before filing an issue

If something isn't working the way you expected, please take a look at [previously logged issues](https://github.com/Esri/solution.js/issues) first.  Have you found a new bug?  Want to request a new feature?  We'd [love](https://github.com/Esri/solution.js/issues/new) to hear from you.

If you're looking for help you can also post issues on [GIS Stackexchange](http://gis.stackexchange.com/questions/ask?tags=esri-oss).

**Please include the following information in your issue:**
* Browser (or Node.js) version
* a snippet of code
* an explanation of
  * what you saw
  * what you expected to see

### I want to contribute, what should I work on?

We're just getting started so even just telling us what you want to see would be extremely helpful!

### Getting a development environment set up

You don't _have to_ but we recommend installing TypeScript, TSLint, Prettier and EditorConfig extensions for your editor of choice.

* https://atom.io/packages/atom-typescript
* https://github.com/Microsoft/TypeScript-Sublime-Plugin
* etc...

### Building the documentation site locally

We use TypeDoc and acetate to turn the inline documentation into a snazzy website.

* `npm run docs:serve` > http://localhost:3000/solution.js/

### Watching local source for changes

you can run the command below in the root of the repo to automatically recompile when the raw TypeScript source changes

```
# watch 'request' and rebuild a UMD for the browser
npm run dev -- umd @esri/arcgis-rest-request

# rebuild ES6 files
npm run dev -- esm @esri/arcgis-rest-request

# rebuild CommonJS
npm run dev -- node @esri/arcgis-rest-request

# watch all the packages
npm run dev -- umd @esri/*
```