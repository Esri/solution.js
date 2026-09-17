rem Publishes the repo to GitHub and stages the npm packages
rem Syntax publish.bat [semver bump: major | minor | patch | premajor | preminor | prepatch | prerelease ]
setlocal

rem Staged publishing requires npm 11.15.0 or later
call npm stage --help >nul 2>&1
if not %errorlevel%==0 (
	echo Staged publishing requires npm 11.15.0 or later
	exit /b
)

rem Make sure user is logged in to npm
call npm whoami 2>temp.txt
for /f %%a in ("temp.txt") do set size=%%~za
if %size%==0 goto publish
echo You are not signed into npmjs
exit /b

:publish
set useVersion=%1%
if not "%useVersion%"=="" echo Staging version %useVersion%
if "%NPM_DIST_TAG%"=="" set NPM_DIST_TAG=latest

rem Update the version number for all but the top-level package
call npx lerna publish %useVersion% --no-git-tag-version --no-push --skip-npm --yes

rem Extract the version from lerna.json
call node --eval "console.log(require('./lerna.json').version);" >temp.txt
set/p useVersion=<temp.txt
del/q temp.txt
echo Staging version %useVersion% with the %NPM_DIST_TAG% tag

rem Update the top-level package.json version to the lerna version
call npm version %useVersion% --allow-same-version --no-git-tag-version
call git add package.json package-lock.json

rem Publish the version commit and tag to GitHub without publishing to npm
call npx lerna publish %useVersion% --yes --force-publish=* --skip-npm

rem Stage workspace versions that are not already published
call node support\stage-from-package.mjs --tag %NPM_DIST_TAG%

echo Packages staged with the %NPM_DIST_TAG% tag on npmjs.com.

endlocal
