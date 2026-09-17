rem Publishes the repo to GitHub and stages the npm packages as the next version
rem Syntax publish-next.bat [ <version> | major | minor | patch | premajor | preminor | prepatch | prerelease ]
setlocal
echo off

rem Stage with the next tag; publish.bat defaults to latest otherwise
set NPM_DIST_TAG=next
call support\publish.bat %1%

endlocal
