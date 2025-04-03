/**
 * Generate a JSON file containing hash of packages and sha384 hashes of minified umd dist files.
 */
const { join } = require("path");
const { mkdir } = require('node:fs/promises');
const { readFile, writeFileSync } = require("fs");
const { generate } = require("sri-toolbox");
const OUTPUTDIR = join(process.cwd(), "docs", "src");
const OUTPUT = join(process.cwd(), "docs", "src", `srihashes.json`);
const version = require(join(process.cwd(), "lerna.json")).version;

const packages = [
  "common",
  "creator",
  "deployer",
  "feature-layer",
  "file",
  "group",
  "simple-types",
  "storymap",
  "viewer"
];

const promises = [];

packages.forEach(pkg => {
  const package = `@esri/solution-${pkg}`;
  const promise = new Promise((resolve, reject) => {
    readFile(`packages/${pkg}/dist/umd/${pkg}.umd.min.js`, (err, data) => {
      err ? resolve({
        package,
        hash: false
      }) : resolve({
        package,
        hash: generate({
          algorithms: ["sha384"]
        }, data)
      });
    });
  });
  promises.push(promise);
});

Promise.all(promises).then((res) => {
  const json = {
    version,
    packages: {}
  };
  res.forEach((r) => {
    if (r.hash) json.packages[r.package] = r.hash;
  });

  mkdir(OUTPUTDIR, { recursive: true }).then(
    () => {
      writeFileSync(OUTPUT, JSON.stringify(json, null, '  '), { encoding: 'utf8', flag: 'w' });
      console.log('File ' + OUTPUT + ' written successfully');
    }
  );
}).catch((err) => {
  console.error(err)
});
