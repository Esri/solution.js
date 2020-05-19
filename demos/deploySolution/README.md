# Deploy Solution Example Application

This application is a simple harness used to deploy Solutions during develpment.

## Running the App

### Install all Dependencies and Build
- in the root, run `npm run install` 

When this is complete, there will be a `node_modules` folder in /demos/deploySolution. Lerna will have linked the `@esri/solution-*` packages so that this demo app will be pointing at the latest built files from the individual packages. Learna++

### Start the App
- in /demosdeploySolution run `npm start`
- open `http://127.0.0.1:8080` in a browser

We added `http-server` as a dependency of this application, and `npm start` fires that up on `:8080`

## Seeing code changes
To get the latest code changes from the `packages`. you can either:
- run `npm run build:umd` from the root if you have changes in multiple packages and/or the demo app
- run `npm run build:umd` from inside a package if your changes are just in one
- run `npm run build:umd` in the `/demo/deploySolution` if your changes are only to files in the demo app
