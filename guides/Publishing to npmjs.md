## Publishing solution.js to npmjs

#### Checklist

* \[ \] Stop automatic recompilation software
* \[ \] Switch to `master` branch
* \[ \] Merge in--but don't commit--the current `release/X.X.X` branch
* \[ \] Run `npm run clean` in a bash shell
* \[ \] Run `npm run release:prepare1` in a bash shell
* \[ \] Run `npm run release:prepare2` in a Windows shell and pick new version number
* \[ \] Run `npm run release:review`
* \[ \] Run `npm run release:publish-git` in a bash shell
* \[ \] Run `npm run release:publish-npm` in a Windows shell
* \[ \] Check that publishing worked using `check_npm_package_versions.html` in a browser
* \[ \] Push `master` branch to GitHub
* \[ \] Merge `master` into the `develop` branch and push it to GitHub
* \[ \] Create as release from the build's tag in GitHub
* \[ \] Update documentation via `npm run docs:build`
* \[ \] Deploy documentation via `npm run docs:deploy`

#### Versioning

"...increment the:

1. MAJOR version when you make incompatible API changes,
2. MINOR version when you add functionality in a backwards compatible manner, and
3. PATCH version when you make backwards compatible bug fixes."

*[source](https://semver.org/#summary)*

#### Details

1. Stop any code-change watchers that automatically recompile TypeScript, e.g., the watch task in Visual Studio Code.

2. Create a branch off of `develop` called `release/X.X.X`, where "X.X.X" is the version to be created. (For hotfixes off of an existing release, one works in a branch `hotfix/X.X.Y` off of the major version to be patched.)

3. Launch a Windows command-prompt window and a git-bash window (e.g., C:\Program Files\Git\git-bash.exe on a Windows computer or using the "Git bash" icon in the Git Extensions program). The current state of the npm tools appear to require us to use both of these windows to create a build: the command prompt window for selecting the build version and for entering the OTP for pushing the build to npm; the git-bash window for pre-publish cleaning and for running a useful script. When a step does not specify the window to use, either is OK.

4. Log in to npmjs.
*Note: the computer remembers for a long time that you're logged in; you can check that you are logged in by typing `npm whoami`*
```
npm login
Username: <npm username>
Password: <npm password>
Email: (this IS public) <Esri email address>
Enter one-time password from your authenticator app: <e.g., from Okta Verify>
Logged in as <npm username> on https://registry.npmjs.org/
```

5. Ensure you have access to the zip command.
```
zip -?
Copyright (c) 1990-2008 Info-ZIP...
```

 If the command is missing:
 ```
 Navigate to https://sourceforge.net/projects/gnuwin32/files/zip/3.0/
 Download zip-3.0-bin.zip
 Copy\paste zip.exe from .\bin to to your "mingw64" bin folder (example: C:\Program Files\Git\mingw64\bin)
 Navigate to https://sourceforge.net/projects/gnuwin32/files/bzip2/1.0.5/
 Download bzip2-1.0.5-bin.zip
 Copy\paste the bzip2.dll from .\bin to your "mingw64" bin folder
 ```

6. Prepare the release.
  * `release:prepare1` (git-bash) removes build products and creates a fresh build
  * `release:prepare2` (Windows) gives you the opportunity to select the new version number. The default choice increments the patch version (i.e., the third number in the [*major.minor.patch* version numbering scheme](https://semver.org/)). If a different version is desired, use the keyboard arrow keys to select the desired version. There doesn't seem to be a way to type in a custom version.
  * `npm run release:review` shows the list of changes in the release

7. Publish the release.
  * `npm run release:publish-git` (git-bash) commits the release, bundles it into a zip file, and sends it to GitHub
  * `npm run release:publish-npm` (Windows) sends the release's packages to npm. Once the command is ready to send the packages to npm, you should see "? This operation requires a one-time password:". The "password" is an Okta Verify two-factor code. Because codes expire after around 30 seconds, use the freshest possible code: pick it right after it updates in the two-factor app.

 Note that you won't see the new version in your GitHub client until the next time that you refresh the repository.

 It's OK to push the version to GitHub even if not all packages appear to have been published. "Publishing" is sending them to npm and is a separate process that we can patch below.

8. Check that publishing worked using the repository's web page `check_npm_package_versions.html`; sometimes, only some of the packages show up in npm. It may take ten or more minutes for a general request such as `https://unpkg.com/@esri/solution-simple-types/dist/umd/simple-types.umd.js` to 302 resolve to the latest version.

9. Merge `release/X.X.X` into `develop` and push the latter to GitHub.

10. Create as release from the build's tag in GitHub (the push to GitHub task only creates a tagged entry).

11. Update the repository's API documentation (see "Publishing API documentation to GitHub" section below).

---

## Adding a package

1. Launch a git-bash window

2. Log in to npmjs

3. Create package, commit, and push

4. Publish package
```
$ npm publish --access public --otp=<2-factor-code>
```

5. Add package to the repository's web page `check_npm_package_versions.html`

---

## Publishing API documentation to GitHub

1. Launch a git-bash window

2. Log in to npmjs

3. Build the documentation
```
npm run docs:build
```

4. Test generated HTML with a local server

5. Publish to GitHub site https://esri.github.io/solution.js/
```
npm run docs:deploy
```

---

## Deprecating older versions on npmjs

One can mark a version or versions deprecated using the `npm deprecate` command. *Note: If you deprecate your highest version, the whole package will appear as deprecated in npm. This can be reversed.*

For example:

1. Launch a git-bash window

2. Log in to npmjs

3. Get a two-factor code. Because one deprecates one package at a time, you might want to wait until the next code change in your two-factor code app so that the code lasts through all of the deprecation calls.

4. Deprecate packages using two-factor code; this example deprecates version 0.20.0 using the deprecation message "obsolete".
```
set twoFactorCode=<2-factor-code>
set obsoleteVersion=0.20.0
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
```

---

## Setup issues

### Publishing to npm

* Create an account on npmjs.com that's part of the esri organization ([npm instructions](https://docs.npmjs.com/creating-a-new-npm-user-account))
* Set up npm in Okta Verify ([npm instructions](https://docs.npmjs.com/configuring-two-factor-authentication))
* On your computer, run `npm login`, which asks you for your npm username, password, email, and a two-factor code
* Use `npm whoami` to verify that you're logged in

A token is created in your npm account.
