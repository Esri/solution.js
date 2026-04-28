rem Builds all packages and demos in dev mode (no minification, with source maps, no tests, no lint)
rem Use this for browser debugging. The resulting bundles will be unminified and include source maps.

call node --version
call npm --version

rem Install all demos first so that npm install can symlink the packages
pushd demos\compareJSON
call npm install
popd

pushd demos\compareSolutions
call npm install
popd

pushd demos\copyItemInfo
call npm install
popd

pushd demos\copySolutions
call npm install
popd

pushd demos\createSolution
call npm install
popd

pushd demos\deleteSolution
call npm install
popd

pushd demos\deploySolution
call npm install
popd

pushd demos\getItemInfo
call npm install
popd

pushd demos\implementedTypes
call npm install
popd

pushd demos\recreateSolution
call npm install
popd

pushd demos\reuseDeployedItems
call npm install
popd

pushd demos\verifySolution
call npm install
popd

rem Install root and build all packages with source maps enabled
call npm install

rem Build packages (ESM + CJS) — pass dev-only compiler overrides
call npm run build:esm -- -- --sourceMap --declarationMap
call npm run build:cjs -- -- --sourceMap --declarationMap

call commit-stamp.bat

rem Delete dist package.json files (root, esm, and cjs) so that webpack does not
rem treat the compiled output as strict ESM. The dist/esm/package.json contains
rem {"type":"module"}, which forces webpack to require explicit .js extensions
rem on every relative import — but the TypeScript output uses extensionless
rem paths, so resolution fails. The standard build.bat deletes these for the
rem same reason.
del/q packages\common\dist\package.json 2>nul
del/q packages\common\dist\cjs\package.json 2>nul
del/q packages\common\dist\esm\package.json 2>nul
del/q packages\creator\dist\package.json 2>nul
del/q packages\creator\dist\cjs\package.json 2>nul
del/q packages\creator\dist\esm\package.json 2>nul
del/q packages\deployer\dist\package.json 2>nul
del/q packages\deployer\dist\cjs\package.json 2>nul
del/q packages\deployer\dist\esm\package.json 2>nul
del/q packages\feature-layer\dist\package.json 2>nul
del/q packages\feature-layer\dist\cjs\package.json 2>nul
del/q packages\feature-layer\dist\esm\package.json 2>nul
del/q packages\file\dist\package.json 2>nul
del/q packages\file\dist\cjs\package.json 2>nul
del/q packages\file\dist\esm\package.json 2>nul
del/q packages\form\dist\package.json 2>nul
del/q packages\form\dist\cjs\package.json 2>nul
del/q packages\form\dist\esm\package.json 2>nul
del/q packages\group\dist\package.json 2>nul
del/q packages\group\dist\cjs\package.json 2>nul
del/q packages\group\dist\esm\package.json 2>nul
del/q packages\hub-types\dist\package.json 2>nul
del/q packages\hub-types\dist\cjs\package.json 2>nul
del/q packages\hub-types\dist\esm\package.json 2>nul
del/q packages\simple-types\dist\package.json 2>nul
del/q packages\simple-types\dist\cjs\package.json 2>nul
del/q packages\simple-types\dist\esm\package.json 2>nul
del/q packages\storymap\dist\package.json 2>nul
del/q packages\storymap\dist\cjs\package.json 2>nul
del/q packages\storymap\dist\esm\package.json 2>nul
del/q packages\velocity\dist\package.json 2>nul
del/q packages\velocity\dist\cjs\package.json 2>nul
del/q packages\velocity\dist\esm\package.json 2>nul
del/q packages\viewer\dist\package.json 2>nul
del/q packages\viewer\dist\cjs\package.json 2>nul
del/q packages\viewer\dist\esm\package.json 2>nul
del/q packages\web-experience\dist\package.json 2>nul
del/q packages\web-experience\dist\cjs\package.json 2>nul
del/q packages\web-experience\dist\esm\package.json 2>nul
del/q packages\web-tool\dist\package.json 2>nul
del/q packages\web-tool\dist\cjs\package.json 2>nul
del/q packages\web-tool\dist\esm\package.json 2>nul
del/q packages\workflow\dist\package.json 2>nul
del/q packages\workflow\dist\cjs\package.json 2>nul
del/q packages\workflow\dist\esm\package.json 2>nul

rem Build all demos in development mode (unminified, readable)
pushd demos\compareJSON
call npx webpack --mode=development
popd

pushd demos\compareSolutions
call npx webpack --mode=development
popd

pushd demos\copyItemInfo
call npx webpack --mode=development
popd

pushd demos\copySolutions
call npx webpack --mode=development
popd

pushd demos\createSolution
call npx webpack --mode=development
popd

pushd demos\deleteSolution
call npx webpack --mode=development
popd

pushd demos\deploySolution
call npm run prebuild
call npx webpack --mode=development
popd

pushd demos\getItemInfo
call npx webpack --mode=development
popd

pushd demos\implementedTypes
call npx webpack --mode=development
popd

pushd demos\recreateSolution
call npx webpack --mode=development
popd

pushd demos\reuseDeployedItems
call npx webpack --mode=development
popd

pushd demos\verifySolution
call npx webpack --mode=development
popd

echo.
echo DEV build complete. All demo bundles are unminified with source maps.
