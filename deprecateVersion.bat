@echo off
if "%1%"=="" goto syntax
if "%2%"=="" goto syntax
set obsoleteVersion=%1%
set twoFactorCode=%2%
@echo on
call npm deprecate "@esri/solution-common@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
call npm deprecate "@esri/solution-creator@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
call npm deprecate "@esri/solution-deployer@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
call npm deprecate "@esri/solution-feature-layer@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
call npm deprecate "@esri/solution-file@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
call npm deprecate "@esri/solution-form@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
call npm deprecate "@esri/solution-group@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
call npm deprecate "@esri/solution-hub-types@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
call npm deprecate "@esri/solution-simple-types@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
call npm deprecate "@esri/solution-storymap@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
call npm deprecate "@esri/solution-velocity@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
call npm deprecate "@esri/solution-viewer@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
call npm deprecate "@esri/solution-web-experience@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
call npm deprecate "@esri/solution-web-tool@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
call npm deprecate "@esri/solution-workflow@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
goto end
:syntax
@echo on
rem Syntax: deprecateVersion.bat <obsolete version; e.g., 6.0.3> <two factor code>
:end
