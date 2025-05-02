rem Publishes the repo to GitHub & npm as the latest version
rem Syntax publish.bat [semver bump: major | minor | patch | premajor | preminor | prepatch | prerelease ]
setlocal

rem Make sure user is logged in to npm
call npm whoami 2>temp.txt
for /f %%a in ("temp.txt") do set size=%%~za
if %size%==0 goto publish
echo You are not signed into npmjs
exit /b

:publish
set useVersion=%1%
if not "%useVersion%"=="" echo Publishing version %useVersion%

rem Update the version number for all but the top-level package
call npx lerna publish %useVersion% --no-git-tag-version --no-push --skip-npm --yes

rem Extract the version from lerna.json
call node --eval "console.log(require('./lerna.json').version);" >temp.txt
set/p useVersion=<temp.txt
del/q temp.txt
echo Publishing version %useVersion%

rem Update the top-level package.json version to the lerna version
call npm version %useVersion% --allow-same-version --no-git-tag-version
call git add package.json package-lock.json

rem Publish to GitHub & npm
call npx lerna publish %useVersion% --yes --force-publish=*

endlocal
