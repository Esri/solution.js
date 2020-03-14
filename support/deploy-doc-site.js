const ghpages = require("gh-pages");

ghpages.publish(
  "docs/build/solution.js",
  {
    branch: "gh-pages",
    repo: "https://github.com/Esri/solution.js.git"
  },
  function(err) {
    if (err) {
      console.log("uh oh", err);
    } else {
      console.log("Deployed docs site!");
    }
  }
);
