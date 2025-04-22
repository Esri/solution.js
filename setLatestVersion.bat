rem Syntax: setLatestVersion.bat.bat <current version; e.g., 5.22.0> <two factor code>
@echo off
if "%1%"=="" goto end
if "%2%"=="" goto end
set latestVersion=%1%
set twoFactorCode=%2%
@echo on
call npm dist-tag add "@esri/solution-common@%latestVersion%" latest -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-creator@%latestVersion%" latest -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-deployer@%latestVersion%" latest -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-feature-layer@%latestVersion%" latest -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-file@%latestVersion%" latest -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-form@%latestVersion%" latest -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-group@%latestVersion%" latest -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-hub-types@%latestVersion%" latest -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-simple-types@%latestVersion%" latest -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-storymap@%latestVersion%" latest -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-velocity@%latestVersion%" latest -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-viewer@%latestVersion%" latest -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-web-experience@%latestVersion%" latest -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-web-tool@%latestVersion%" latest -otp=%twoFactorCode%
call npm dist-tag add "@esri/solution-workflow@%latestVersion%" latest -otp=%twoFactorCode%
:end
