#!/bin/bash

# Make sure user is logged in to npm
npm whoami || exit 1

# Extract the version from lerna.json (this was updated by `npm run release:prepare`)
VERSION=$(node --eval "console.log(require('./lerna.json').version);")

# publish each package on npm
lerna publish --skip-git --yes --repo-version $VERSION --force-publish=*

# generate `docs/src/srihashes.json` after release and before committing
npm run docs:srihash

# commit the changes from `npm run release:prepare`
git add --all
git commit -am "v$VERSION" --no-verify

# increment the package.json version to the lerna version so gh-release works
npm version $VERSION --allow-same-version --no-git-tag-version

# amend the changes from `npm version` to the release commit
git add --all
git commit -am "v$VERSION" --no-verify --amend

# tag this version
git tag v$VERSION

# push everything up to this point to master
git push https://github.com/Esri/solution.js.git master

# push the new tag, not the old tags
git push https://github.com/Esri/solution.js.git v$VERSION


# create a ZIP archive of the dist files
TEMP_FOLDER=solution.js-v$VERSION;
mkdir $TEMP_FOLDER

mkdir $TEMP_FOLDER/common
cp -r packages/common/dist/umd/* $TEMP_FOLDER/common/
mkdir $TEMP_FOLDER/creator
cp -r packages/creator/dist/umd/* $TEMP_FOLDER/creator/
mkdir $TEMP_FOLDER/deployer
cp -r packages/deployer/dist/umd/* $TEMP_FOLDER/deployer/
mkdir $TEMP_FOLDER/feature-layer
cp -r packages/feature-layer/dist/umd/* $TEMP_FOLDER/feature-layer/
mkdir $TEMP_FOLDER/file
cp -r packages/file/dist/umd/* $TEMP_FOLDER/file/
mkdir $TEMP_FOLDER/form
cp -r packages/form/dist/umd/* $TEMP_FOLDER/form/
mkdir $TEMP_FOLDER/group
cp -r packages/group/dist/umd/* $TEMP_FOLDER/group/
mkdir $TEMP_FOLDER/hub-types
cp -r packages/hub-types/dist/umd/* $TEMP_FOLDER/hub-types/
mkdir $TEMP_FOLDER/simple-types
cp -r packages/simple-types/dist/umd/* $TEMP_FOLDER/simple-types/
mkdir $TEMP_FOLDER/storymap
cp -r packages/storymap/dist/umd/* $TEMP_FOLDER/storymap/
mkdir $TEMP_FOLDER/viewer
cp -r packages/viewer/dist/umd/* $TEMP_FOLDER/viewer/

zip -r $TEMP_FOLDER.zip $TEMP_FOLDER
rm -rf $TEMP_FOLDER

# Run gh-release to create a new release with our changelog changes and ZIP archive
npx gh-release -t v$VERSION -b v$VERSION -r solution.js -o Esri -a $TEMP_FOLDER.zip

# Delete the ZIP archive
rm $TEMP_FOLDER.zip
