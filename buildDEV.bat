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

rem DO NOT delete package.json files from dist directories - they are needed for webpack module resolution
rem Only delete the root package.json if needed for lerna, but keep esm/cjs ones
del/q packages\common\dist\package.json 2>nul
del/q packages\creator\dist\package.json 2>nul
del/q packages\deployer\dist\package.json 2>nul
del/q packages\feature-layer\dist\package.json 2>nul
del/q packages\file\dist\package.json 2>nul
del/q packages\form\dist\package.json 2>nul
del/q packages\group\dist\package.json 2>nul
del/q packages\hub-types\dist\package.json 2>nul
del/q packages\simple-types\dist\package.json 2>nul
del/q packages\storymap\dist\package.json 2>nul
del/q packages\velocity\dist\package.json 2>nul
del/q packages\viewer\dist\package.json 2>nul
del/q packages\web-experience\dist\package.json 2>nul
del/q packages\web-tool\dist\package.json 2>nul
del/q packages\workflow\dist\package.json 2>nul

rem Build all demos in development mode (unminified, readable)
pushd demos\compareJSON
call npm run prebuild
call npx webpack --mode=development
popd

pushd demos\compareSolutions
call npm run prebuild
call npx webpack --mode=development
popd

pushd demos\copyItemInfo
call npm run prebuild
call npx webpack --mode=development
popd

pushd demos\copySolutions
call npm run prebuild
call npx webpack --mode=development
popd

pushd demos\createSolution
call npm run prebuild
call npx webpack --mode=development
popd

pushd demos\deleteSolution
call npm run prebuild
call npx webpack --mode=development
popd

pushd demos\deploySolution
call npm run prebuild
call npx webpack --mode=development
popd

pushd demos\getItemInfo
call npm run prebuild
call npx webpack --mode=development
popd

pushd demos\implementedTypes
call npm run prebuild
call npx webpack --mode=development
popd

pushd demos\recreateSolution
call npm run prebuild
call npx webpack --mode=development
popd

pushd demos\reuseDeployedItems
call npm run prebuild
call npx webpack --mode=development
popd

pushd demos\verifySolution
call npm run prebuild
call npx webpack --mode=development
popd

echo.
echo DEV build complete. All demo bundles are unminified with source maps.
