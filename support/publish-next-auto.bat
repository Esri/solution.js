rem Publishes the repo to npm as the next version
rem Syntax publish-next-auto.bat <root version>
rem e.g, publish-next-auto.bat 6.2.0
setlocal
echo off

set versionRoot=%1%
if not "%versionRoot%"=="" goto checkSignin
echo Syntax publish-next-auto.bat 6.2.0
exit /b

:checkSignin
rem Make sure user is logged in to npm
call npm whoami 2>err.out
for /f %%a in ("err.out") do set size=%%~za
if %size%==0 goto publish
echo You are not signed into npmjs
exit /b

:publish
del/q err.out

rem Save latest version
call npm view @esri/solution-common version >temp.txt
set/p latestVersion=<temp.txt
del/q temp.txt

rem Create a version number from a root value suffixed with "-next.<today's date>"
rem MM/dd/yyyy (04/06/2010) --> 20100406
set timestamp=%date:~6,4%%date:~0,2%%date:~3,2%
set nextVersion=%versionRoot%-next.%timestamp%
echo Publishing %nextVersion%

rem Publish to npm
call npx lerna publish %nextVersion% --yes --force-publish=* --no-push --no-git-tag-version

rem Restore the latest version
call support\setLatestVersion.bat %latestVersion%

rem Set the next version
call support\setNextVersion.bat %nextVersion%

rem Discard the package*.json file changes
call git reset --hard HEAD

endlocal
