rem Publishes the repo to GitHub & npm as the latest version
rem Syntax publish.bat [ <version> | major | minor | patch | premajor | preminor | prepatch | prerelease ]
setlocal
echo off

rem Make sure user is logged in to npm
call npm whoami 2>err.out
for /f %%a in ("err.out") do set size=%%~za
if %size%==0 goto publish
echo You are not signed into npmjs
exit /b

:publish
del/q err.out

rem Publish to GitHub & npm
set useVersion=%1%
if not "%useVersion%"=="" echo Publishing version %useVersion%
call npx lerna publish %useVersion% --yes --force-publish=*

endlocal
