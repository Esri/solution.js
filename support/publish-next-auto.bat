rem Publishes the repo to npm as the next version
rem Syntax publish-next-auto.bat <root version>
rem e.g, support\publish-next-auto.bat 6.2.0
rem NOTE: This batch file must be run from the root of the repo.
rem NOTE: This batch file does a hard reset of git changes!
rem There will be no working directory or staged changes when it completes.
rem NOTE: The system short-date format must be MM/dd/yyyy (04/06/2010).
setlocal
echo off

set versionRoot=%1%
if not "%versionRoot%"=="" goto checkSignin
echo Syntax publish-next-auto.bat 6.2.0
exit /b

:checkSignin
rem Make sure user is logged in to npm
call npm whoami 2>temp.txt
for /f %%a in ("temp.txt") do set size=%%~za
if %size%==0 goto publish
echo You are not signed into npmjs
exit /b

:publish
rem Remove existing "next" version tags
git tag -l *next* >temp.txt
for /f %%a in (temp.txt) do git push --delete origin %%a
for /f %%a in (temp.txt) do git tag -d %%a
del/q temp.txt

rem Save latest version number
call npm view @esri/solution-common version >temp.txt
set/p latestVersion=<temp.txt
del/q temp.txt

rem Create a version number from a root value suffixed with "-next.<today's date>"
rem MM/dd/yyyy (04/06/2010) --> 20100406
set timestamp=%date:~6,4%%date:~0,2%%date:~3,2%
set nextVersion=%versionRoot%-next.%timestamp%
echo Publishing %nextVersion%

rem Update the version number for all but the top-level package
call npx lerna publish %nextVersion% --no-git-tag-version --no-push --skip-npm --yes

rem Extract the version from lerna.json
call node --eval "console.log(require('./lerna.json').version);" >temp.txt
set/p useVersion=<temp.txt
del/q temp.txt
echo Publishing version %nextVersion%

rem Update the top-level package.json version to the lerna version
call npm version %nextVersion% --allow-same-version --no-git-tag-version
call git add package.json package-lock.json

rem Publish to npm
call npx lerna publish %nextVersion% --yes --force-publish=* --no-push --no-git-tag-version

rem Restore the latest version number
call support\setLatestVersion.bat %latestVersion%

rem Set the next version number
call support\setNextVersion.bat %nextVersion%

rem Discard the package*.json file changes
call git reset --hard HEAD

endlocal
