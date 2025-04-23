@echo off
if "%1%"=="" goto syntax
set nextVersion=%1%
if "%2%"=="" goto token

set twoFactorCode=%2%
@echo on
call npm dist-tag add "@esri/solution-common@%nextVersion%" next -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-creator@%nextVersion%" next -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-deployer@%nextVersion%" next -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-feature-layer@%nextVersion%" next -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-file@%nextVersion%" next -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-form@%nextVersion%" next -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-group@%nextVersion%" next -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-hub-types@%nextVersion%" next -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-simple-types@%nextVersion%" next -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-storymap@%nextVersion%" next -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-velocity@%nextVersion%" next -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-viewer@%nextVersion%" next -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-web-experience@%nextVersion%" next -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-web-tool@%nextVersion%" next -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-workflow@%nextVersion%" next -otp=%twoFactorCode%
goto end

:token
@echo on
call npm dist-tag add "@esri/solution-common@%nextVersion%" next
call npm dist-tag add "@esri/solution-creator@%nextVersion%" next
call npm dist-tag add "@esri/solution-deployer@%nextVersion%" next
call npm dist-tag add "@esri/solution-feature-layer@%nextVersion%" next
call npm dist-tag add "@esri/solution-file@%nextVersion%" next
call npm dist-tag add "@esri/solution-form@%nextVersion%" next
call npm dist-tag add "@esri/solution-group@%nextVersion%" next
call npm dist-tag add "@esri/solution-hub-types@%nextVersion%" next
call npm dist-tag add "@esri/solution-simple-types@%nextVersion%" next
call npm dist-tag add "@esri/solution-storymap@%nextVersion%" next
call npm dist-tag add "@esri/solution-velocity@%nextVersion%" next
call npm dist-tag add "@esri/solution-viewer@%nextVersion%" next
call npm dist-tag add "@esri/solution-web-experience@%nextVersion%" next
call npm dist-tag add "@esri/solution-web-tool@%nextVersion%" next
call npm dist-tag add "@esri/solution-workflow@%nextVersion%" next
goto end

:syntax
@echo on
rem Syntax: setNextVersion.bat <next version; e.g., 6.0.3> [<two factor code if you don't have .npmrc>]
:end
