rem Syntax: setNextVersion.bat <next version; e.g., 6.0.3> <two factor code>
@echo off
if "%1%"=="" goto end
if "%2%"=="" goto end
set nextVersion=%1%
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
:end
