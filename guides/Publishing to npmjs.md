## Publishing solution.js to npmjs & GitHub

#### Checklist

* \[ \] Stop any code-change watchers that automatically recompile the project
* \[ \] Open a Windows shell and go to the top level of the repo
* \[ \] Run `npm run clean:dist`
* \[ \] Run `build.bat`
* \[ \] Create a .npmrc file if you don't want to have to enter a one-time password during publishing
* \[ \] Pick and run a publishing option:
  - Run `npm run publish` and pick new version number for the current AGO release
  - Run `npm run publish:next` and pick new version number for the next AGO release (sample: versionroot"-next.yyyymmdd" such as 6.5.0-next.20251001)
  - Run `npm run publish patch` to automatically bump patch version number for the current AGO release
  - Run `npm run publish:next patch` to automatically bump patch version number for the next AGO release
  - (One can replace "patch" with "major" | "minor" | "premajor" | "preminor" | "prepatch" | "prerelease")
* \[ \] Check that publishing to the current AGO release worked using `check_npm_package_versions.html` in a browser
* \[ \] Create a release from the build's tag in GitHub  (tags > release > draft a new release > type changes in this version)
* \[ \] Update documentation via `npm run docs:build`
* \[ \] Deploy documentation via `npm run docs:deploy`

#### Versioning

__Major:__ Significant changes in solution.js (e.g., when the repo moved from ArcGIS REST JS v3 (solution.js v5.x) to v4 (solution.js v6.x))
__Minor:__ 3 times a year coinciding with our ArcGIS Online releases. For example, starting at 6.2 for 2025.R2, we continue with 6.3 for 2025.R3, 6.4 2026.R1, etc.
__Patch:__ Incremental fixes and enhancements

In npmjs.com, the current ArcGIS Online release will be labeled as "latest", and the versions for the next ArcGIS Online release will be labeled as "next".

#### Notes

##### Log in to npmjs
*Note: the computer remembers for a long time that you're logged in; you can check that you are logged in by typing `npm whoami`*
```
npm login
Username: <npm username>
Password: <npm password>
Email: (this IS public) <Esri email address>
Enter one-time password from your authenticator app: <e.g., from Okta Verify>
Logged in as <npm username> on https://registry.npmjs.org/
```

##### Batch files for managing versions on npmjs

* support\deprecateVersion.bat deprecates a version in npmjs
* support\setLatestVersion.bat sets the "latest" version tag in npmjs
* support\setNextVersion.bat sets the "next" version tag in npmjs

##### Lerna tag issue
If you run publish and you selected a version and some error occurred, and lerna already used the tag.  Here is how to delete it.
Check if it is used
for local
git tag -l v6.5.0

if on remote
git ls-remote --tags origin | findstr v6.5.0

then delete
Local
git tag -d v6.5.0

remote
git push origin :refs/tags/v6.5.0
