## npm Scripts

Key:

* (win): requires Windows command shell
* (git): requires git command shell

### Installation

* npm **install** (win)

### Useful

* npm run **clean** (git) -- removes .d.ts, .js, .js.map files from src, test, and dist folders
* npm run **prettify** (win) -- formats TypeScript files
* npm run **lint** (win) -- checks for common errors in TypeScript files
* npm run **lint:fix** (win) -- checks for common errors in TypeScript files and fixes them
* npm run **coveralls** (win) -- publishes test coverage from test:chrome or test:chrome:ci to coveralls.io

### Testing

##### Basic test commands

* npm run **test:chrome** (win) -- runs tests in Chrome browser window using Karma
* npm run **test:chrome:ci** (win) -- runs tests in headless Chrome browser using Karma
* npm run **test:firefox** (win) -- runs tests in Firefox browser window using Karma
* npm run **test:node** (win) -- runs tests using Jasmine
 
##### Combination test commands

* npm **test** (win) -- combines lint, test:node, test:chrome
* npm run **test:ci** (win) -- combines lint, test:node, test:chrome:ci, coveralls
* npm run **test:all** (win) -- combines test:node, test:chrome 

### Publish

1. npm run **release:prepare** (git)
    * type in new version (arrowing tends to fail)
	* updates versions
2. npm run **release:publish** (git) -- commits new version and publishes to github
