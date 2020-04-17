## Publishing solution.js to npmjs

#### Checklist

* \[ \] Stop automatic recompilation software
* \[ \] Create `release` branch
* \[ \] Remove node_modules and run `npm install`
* \[ \] Run `npm run prerelease:prepare`
* \[ \] Run `npm run release:prepare` and pick new version number
* \[ \] Run `npm run release:review`
* \[ \] Fix CHANGELOG.md
* \[ \] Commit changes as a release prep
* \[ \] Switch to `master` branch
* \[ \] Merge `release` branch into `master` branch but don't commit
* \[ \] Run `npm run release:publish`
* \[ \] Push `master` branch to GitHub
* \[ \] Delete `release` branch
* \[ \] Switch to `develop` branch
* \[ \] Merge `master` branch into `develop` branch
* \[ \] Push `develop` branch to GitHub

#### Versioning

"...increment the:
1. MAJOR version when you make incompatible API changes,
2. MINOR version when you add functionality in a backwards compatible manner, and
3. PATCH version when you make backwards compatible bug fixes."

*[source](https://semver.org/#summary)*

#### Details

1. Stop any code-change watchers that automatically recompile TypeScript, e.g., the watch task in Visual Studio Code

2. Create a branch off of `develop` called `release`.

3. Remove the node_modules directories.
```
  ..\solution.js\node_modules
  ..\solution.js\packages\common\node_modules
  ..\solution.js\packages\creator\node_modules
  ..\solution.js\packages\deployer\node_modules
  ..\solution.js\packages\feature-layer\node_modules
  ..\solution.js\packages\file\node_modules
  ..\solution.js\packages\group\node_modules
  ..\solution.js\packages\simple-types\node_modules
  ..\solution.js\packages\storymap\node_modules
  ..\solution.js\packages\viewer\node_modules
 ```

4. Launch a git-bash window (e.g., C:\Program Files\Git\git-bash.exe on a Windows computer or using the "Git bash" icon in the Git Extensions program)

5. From the repo's root folder install a fresh copy of the node modules
```
npm install
```

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
The second command, `release:prepare`, gives you the opportunity to select the new version number. The default choice increments the patch version (i.e., the third number in the [*major.minor.patch* version numbering scheme](https://semver.org/)). If a different version is desired, use the keyboard arrow keys to select the line ***above*** the desired version.
```
npm run prerelease:prepare
npm run release:prepare
npm run release:review
```

9. Check, and fix if necessary, CHANGELOG.md by removing any link lines (the ones that begin with, e.g., `[0.5.0]: https://github.com`) except the set at the end of the file. (The set at the end is a full set; if there are any under the previous version(s), they are redundant and don't display properly because their definitions are overwritten by the set at the end.) Also, for some reason, in CHANGELOG.md, the unreleased section appears below the new release. So please move it to the top.
*Note: To confirm the expected set at the end of this file visit the repos webpage and navigate to releases > tags. If you see additional tags in the CHANGELOG.md you can remove them. To remove them permanently from your local repo use:*
```
git tag -d tagName
```

10. Commit the changed files in the repo: CHANGELOG.md, lerna.json, package.json files, package-lock.json files. (While the publishing step will do the commit for you, lerna doesn't notice the package.json changes and doesn't publish correctly.) This is just an intermediate publishing step and should not be labeled or tagged for the release. It is not necessary to push the commit to GitHub.

11. Switch to the `master` branch and merge in the `release` branch, but without committing it.
```
git merge --no-ff --no-commit release
```

12. Publish the release, supplying a two-factor code (e.g., from Okta Verify) when prompted. (While `release:publish` accepts a two-factor command-line parameter, the code expires by the time that publishing get around to using it and the release will not be uploaded to npmjs.)

 *Note: The last message in this step shows the error message "Error: missing required options: body", which appears to be wrong and ignorable.*
 ```
 npm run release:publish
     :        :
 ? Enter OTP: <2-factor-code>
 ? publish release to github? (y/N)
 ```

 The publish step
 1. commits and pushes the publishing changes to GitHub
 2. tags the commit with the new version number that you chose in `release:prepare`
 3. pushes the version to npmjs and unpkg

 Note that you won't see the new version in your GitHub client until the next time that you pull from the repository.

13. Push your `master` branch to GitHub.

14. Delete the `release` branch locally and in GitHub.

15. Merge `master` into `develop` and push `develop` to GitHub.

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

One can mark a version or versions deprecated using the `npm deprecate` command. For example, to deprecate all versions before 0.5.1,

1. Launch a git-bash window

2. Log in to npmjs

3. Get a two-factor code. Because one deprecates one package at a time, you might want to wait until the next code change in your two-factor code app so that the code lasts through all of the deprecation calls.

4. Deprecate packages using two-factor code; this example uses the deprecation message "obsolete" and deprecates every version below 0.5.4
```
twoFactorCode=<2-factor-code>
newVersion=<new-version-number>
npm deprecate @esri/solution-common@"<$newVersion" "obsolete" --otp=$twoFactorCode
npm deprecate @esri/solution-creator@"<$newVersion" "obsolete" --otp=$twoFactorCode
npm deprecate @esri/solution-deployer@"<$newVersion" "obsolete" --otp=$twoFactorCode
npm deprecate @esri/solution-feature-layer@"<$newVersion" "obsolete" --otp=$twoFactorCode
npm deprecate @esri/solution-file@"<$newVersion" "obsolete" --otp=$twoFactorCode
npm deprecate @esri/solution-group@"<$newVersion" "obsolete" --otp=$twoFactorCode
npm deprecate @esri/solution-simple-types@"<$newVersion" "obsolete" --otp=$twoFactorCode
npm deprecate @esri/solution-storymap@"<$newVersion" "obsolete" --otp=$twoFactorCode
npm deprecate @esri/solution-viewer@"<$newVersion" "obsolete" --otp=$twoFactorCode
echo done
```

---

## Removing older versions on npmjs

Within 72 hours, one can unpublish a version; beyond 72 hours, a request must be made to npmjs support by one of the Esri npmjs account owners.

Note that if you unpublish a version, you may have to patch the links in the CHANGELOG.md file because npmjs doesn't accept the re-use of version numbers.

One can mark a version or versions deprecated using the `npm deprecate` command. For example, to unpublish version 0.5.1,

1. Launch a git-bash window

2. Log in to npmjs

3. Get a two-factor code. Because one unpublishes one package at a time, you might want to wait until the next code change in your two-factor code app so that the code lasts through all unpublish calls.

4. Unpublish package(s) using two-factor code; this example unpublishes version 0.5.1
```
twoFactorCode=<2-factor-code>
newVersion=<new-version-number>
npm unpublish @esri/solution-common@$newVersion --otp=$twoFactorCode
npm unpublish @esri/solution-creator@$newVersion --otp=$twoFactorCode
npm unpublish @esri/solution-deployer@$newVersion --otp=$twoFactorCode
npm unpublish @esri/solution-feature-layer@$newVersion --otp=$twoFactorCode
npm unpublish @esri/solution-file@$newVersion --otp=$twoFactorCode
npm unpublish @esri/solution-group@$newVersion --otp=$twoFactorCode
npm unpublish @esri/solution-simple-types@$newVersion --otp=$twoFactorCode
npm unpublish @esri/solution-storymap@$newVersion --otp=$twoFactorCode
npm unpublish @esri/solution-viewer@$newVersion --otp=$twoFactorCode
```

---
4/14/20 mkt
