# Adding a Demo

Each demo is a separate app built using [webpack](https://webpack.js.org/). The build files are essentially the same in each demo.

Other than the build files, the demo contains
* `index.html` for the HTML and any CSS includes from a CDN.
* `src\index.ts` for the script code. It is here that one includes code from the demo's `node_modules` and any supplementary files, such as `compare-json-main` for the `compareJSON` demo.
* `src\style.css` for the demo's own CSS.

Webpack bundles the demo script and CSS code files into `dist\main.js`. It also minimizes a copy of `index.html`, adds a `<script>` statement to include `dist\main.js`, and writes the result into `dist\index.html`.

#### Steps

* [ ] Copy a simple demo such as "compareJSON" into a folder for the demo, skipping the `dist` and `node_modules` folders and the `package-lock.json` file if they exist.

In the new folder,
* [ ] Edit `package.json` as desired, e.g., the `name`, `description`, `author` properties.
* [ ] Edit `README.md` as desired.
* [ ] Run `npm install`.
* [ ] Modify `index.html`, `src\index.ts`, and `src\style.css` for your demo. `src\compare-json-main.ts` is an example showing how you can use additional source files if desired.
* [ ] Run `npm run build` to build your demo into the demo's `dist` folder.

If your demo includes images,
* [ ] Create an "images" folder in the `src` folder and add your images to it.
* [ ] Replace the `webpack.config.js` file with the one in demo `copySolutions`.
* [ ] Run `npm install -D copy-webpack-plugin`

To incorporate the demo with the other demos in the repository,
* [ ] Edit the command file `build.bat` in the main repository folder and add your demo so that it is built along with the repository.
* [ ] Edit `demos\index.html` and add your demo.

