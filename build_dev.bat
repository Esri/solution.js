rem Builds the repository and its demos

call node --version
call npm --version

call npm install

pushd demos\compareJSON
call npm run build:dev
popd

pushd demos\copyItemInfo
call npm run build:dev
popd

pushd demos\copySolutions
call npm run build:dev
popd

pushd demos\createSolution
call npm run build:dev
popd

pushd demos\deleteSolution
call npm run build:dev
popd

pushd demos\deploySolution
call npm run build:dev
popd

pushd demos\getItemInfo
call npm run build:dev
popd

pushd demos\verifySolution
call npm run build:dev
popd

call rmdir/q/s coverage
call npm run test:chrome:ci

