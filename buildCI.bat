rem Builds the repository the way that it's done during PRs
call node --version
call npm --version

rem clear out older builds
rmdir/s/q node_modules 2>nul
rmdir/s/q packages\common\dist 2>nul
rmdir/s/q packages\common\node_modules 2>nul
rmdir/s/q packages\creator\dist 2>nul
rmdir/s/q packages\creator\node_modules 2>nul
rmdir/s/q packages\deployer\dist 2>nul
rmdir/s/q packages\deployer\node_modules 2>nul
rmdir/s/q packages\feature-layer\dist 2>nul
rmdir/s/q packages\feature-layer\node_modules 2>nul
rmdir/s/q packages\file\dist 2>nul
rmdir/s/q packages\file\node_modules 2>nul
rmdir/s/q packages\form\dist 2>nul
rmdir/s/q packages\form\node_modules 2>nul
rmdir/s/q packages\group\dist 2>nul
rmdir/s/q packages\group\node_modules 2>nul
rmdir/s/q packages\hub-types\dist 2>nul
rmdir/s/q packages\hub-types\node_modules 2>nul
rmdir/s/q packages\simple-types\dist 2>nul
rmdir/s/q packages\simple-types\node_modules 2>nul
rmdir/s/q packages\storymap\dist 2>nul
rmdir/s/q packages\storymap\node_modules 2>nul
rmdir/s/q packages\velocity\dist 2>nul
rmdir/s/q packages\velocity\node_modules 2>nul
rmdir/s/q packages\viewer\dist 2>nul
rmdir/s/q packages\viewer\node_modules 2>nul
rmdir/s/q packages\web-experience\dist 2>nul
rmdir/s/q packages\web-experience\node_modules 2>nul

del/q package-lock.json 2>nul
del/q packages\common\package-lock.json 2>nul
del/q packages\creator\package-lock.json 2>nul
del/q packages\deployer\package-lock.json 2>nul
del/q packages\feature-layer\package-lock.json 2>nul
del/q packages\file\package-lock.json 2>nul
del/q packages\form\package-lock.json 2>nul
del/q packages\group\package-lock.json 2>nul
del/q packages\hub-types\package-lock.json 2>nul
del/q packages\simple-types\package-lock.json 2>nul
del/q packages\storymap\package-lock.json 2>nul
del/q packages\velocity\package-lock.json 2>nul
del/q packages\viewer\package-lock.json 2>nul
del/q packages\web-experience\package-lock.json 2>nul

rmdir/q/s coverage 2>nul

rem install and build the packages
call npm install
call npm run build
call npm run test:chrome:ci
