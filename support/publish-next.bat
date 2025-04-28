rem Publishes the repo to GitHub & npm as the next version
rem Syntax publish-next.bat [ <version> | major | minor | patch | premajor | preminor | prepatch | prerelease ]
setlocal
echo off

rem Save latest version number
call npm view @esri/solution-common version >temp.txt
set/p latestVersion=<temp.txt
del/q temp.txt

rem Publish to GitHub & npm
call support\publish.bat %1%

rem Get the published version
call npm view @esri/solution-common version >temp.txt
set/p nextVersion=<temp.txt
del/q temp.txt

rem Restore the latest version number
call support\setLatestVersion.bat %latestVersion%

rem Set the next version number
call support\setNextVersion.bat %nextVersion%

endlocal
