rem Builds the repository and its demos

call node --version
call npm --version

call npm install --force

pushd demos\compareJSON
call npm install
call npm run build
popd

pushd demos\copySolutions
call npm install
call npm run build
popd

pushd demos\createSolution
call npm install
call npm run build
popd

pushd demos\getItemInfo
call npm install
call npm run build
popd

call rmdir/q/s coverage
call npm run test:chrome:ci

