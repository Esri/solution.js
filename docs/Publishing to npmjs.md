## Publishing solution.js to npmjs

#### Checklist

* \[ \] Stop automatic recompilation software
* \[ \] Switch to branch to contain release, e.g., `master` or `release/X.X.X`
* \[ \] Remove node_modules and run `npm install`
* \[ \] Run `npm run release:prepare` and pick new version number
* \[ \] Run `npm run release:review`
* \[ \] Check and fix CHANGELOG.md
* \[ \] Run `npm run release:publish`
* \[ \] Check that publishing worked using `check_npm_package_versions.html`
* \[ \] Run `npm run release:publish-retry` as needed until all packages are published
* \[ \] Push release branch to GitHub
* \[ \] Merge release into the `develop` branch and push it to GitHub
* \[ \] Update documentation via `npm run docs:deploy`

#### Versioning

"...increment the:
1. MAJOR version when you make incompatible API changes,
2. MINOR version when you add functionality in a backwards compatible manner, and
3. PATCH version when you make backwards compatible bug fixes."

*[source](https://semver.org/#summary)*

#### Details

1. Stop any code-change watchers that automatically recompile TypeScript, e.g., the watch task in Visual Studio Code

2. Create a branch off of `develop` called `release/X.X.X`, where "X.X.X" is the version to be created. (For hotfixes off of an existing release, one works in a branch `hotfix/X.X.Y` off of the major version to be patched.)

3. Remove the node_modules directories.

4. Launch a git-bash window (e.g., C:\Program Files\Git\git-bash.exe on a Windows computer or using the "Git bash" icon in the Git Extensions program)

5. From the repo's root folder install a fresh copy of the node modules using npm install.

5. Log in to npmjs
*Note: the computer remembers for a long time that you're logged in; you can check that you are logged in by typing `npm whoami`*
```
npm login
Username: <npm username>
Password: <npm password>
Email: (this IS public) <Esri email address>
Enter one-time password from your authenticator app: <e.g., from Okta Verify>
Logged in as <npm username> on https://registry.npmjs.org/
```

7. Ensure you have access to the zip command
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

8. Prepare the release.
`release:prepare` gives you the opportunity to select the new version number. The default choice increments the patch version (i.e., the third number in the [*major.minor.patch* version numbering scheme](https://semver.org/)). If a different version is desired, use the keyboard arrow keys to select the desired version. There doesn't seem to be a way to type in a custom version.
```
npm run release:prepare
npm run release:review
```

9. Check, and fix if necessary, CHANGELOG.md by removing any link lines (the ones that begin with, e.g., `[0.5.0]: https://github.com`) except the set at the end of the file. (The set at the end is a full set; if there are any under the previous version(s), they are redundant and don't display properly because their definitions are overwritten by the set at the end.) Also, for some reason, in CHANGELOG.md, the unreleased section appears below the new release. So please move it to the top.
*Note: To confirm the expected set at the end of this file visit the repos webpage and navigate to releases > tags. If you see additional tags in the CHANGELOG.md you can remove them. To remove them permanently from your local repo use:*
```
git tag -d tagName
```

10. Test the CHANGELOG.md file using `npx changelog-parser CHANGELOG.md`. You should see a result beginning with
```
{"versions":[{"version":null,"title":"[Unreleased]"
```
If the `versions` array is empty (e.g.,
```
{"versions":[],"title":"Changelog
```
), then CHANGELOG.md needs to be re-saved as an ASCII file: the GitHub publishing tool cannot read UTF-8 files.

11. Commit changes without using version number.

12. Publish the release, supplying a two-factor code (e.g., from Okta Verify) when prompted. (While `release:publish` accepts a two-factor command-line parameter, the code expires by the time that publishing get around to using it and the release will not be uploaded to npmjs.) Use the freshest possible code: pick it right after it updates in the two-factor app.

 ```
 npm run release:publish
     :        :
 ? Enter OTP: <2-factor-code>
 ? publish release to github? (y/N)
 ```

 The publish step
 1. commits the publishing changes
 2. tags the commit with the new version number that you chose in `release:prepare`
 3. pushes the version to npmjs and unpkg

 Note that you won't see the new version in your GitHub client until the next time that you refresh the repository.

 It's OK to push the version to GitHub even if not all packages appear to have been published. "Publishing" is sending them to npm and is a separate process that we can patch below.

13. Check that publishing worked using the repository's web page `check_npm_package_versions.html`; sometimes, only some of the packages show up in npm. It may take ten or more minutes for a general request such as `https://unpkg.com/@esri/solution-simple-types/dist/umd/simple-types.umd.js` to 302 resolve to the latest version.

14. Due to the large number of packages and the very short validity window of the two-factor code, not all packages may get published. In this case, repeat `npm run release:publish-retry` until it reports "lerna notice from-package No unpublished release found; lerna success No changed packages to publish".

15. Push your `release/X.X.X` branch to GitHub.

16. Merge `release/X.X.X` into `master` and `develop` and push them to GitHub.

17. Update the repository's API documentation (see "Publishing API documentation to GitHub" section below).

---

## Adding a package

1. Launch a git-bash window

2. Log in to npmjs

3. Create package, commit, and push

4. Publish package
```
$ npm publish --access public --otp=<2-factor-code>
```

---

## Publishing API documentation to GitHub

1. Launch a git-bash window

2. Log in to npmjs

3. Build the documentation
```
npm run docs:build
```

4. Test with a local server
```
npm run docs:serve
```

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
call npm deprecate "@esri/solution-viewer@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
call npm deprecate "@esri/solution-web-experience@%obsoleteVersion%" "obsolete" --otp=%twoFactorCode%
```

