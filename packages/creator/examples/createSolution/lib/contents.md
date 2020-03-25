### Libraries

* [require.js](https://requirejs.org/docs/release/2.3.6/minified/require.js) version 2.3.6
* [solution.js](https://github.com/esri/solution.js)
  * for each package `common`, `creator`, `feature-layer`, `file`, `group`, `simple-types`, `storymap`, `viewer`
    * copy *&lt;package-name&gt;*.umd.js and *&lt;package-name&gt;*.umd.js.map from package's umd distribution (or *&lt;package-name&gt;*.umd.min.js and *&lt;package-name&gt;*.umd.min.js.map from package's umd distribution)
    * create *&lt;package-name&gt;*.umd folder containing *&lt;package-name&gt;*.d.ts files from package's umd distribution
