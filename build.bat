rem Builds the repository and its demos

call node --version
call npm --version

rem install the demos first because the overall install will perform symlinking of the solution.js libraries into the demos
pushd demos\compareJSON
call npm install
popd

pushd demos\copyItemInfo
call npm install
popd

pushd demos\copySolutions
call npm install
popd

pushd demos\createSolution
call npm install
popd

pushd demos\deleteSolution
call npm install
popd

pushd demos\deploySolution
call npm install
popd

pushd demos\getItemInfo
call npm install
popd

pushd demos\implementedTypes
call npm install
popd

pushd demos\verifySolution
call npm install
popd

rem install and build the packages
call npm install

rem build the demos
pushd demos\compareJSON
call npm run build
popd

pushd demos\copyItemInfo
call npm run build
popd

pushd demos\copySolutions
call npm run build
popd

pushd demos\createSolution
call npm run build
popd

pushd demos\deleteSolution
call npm run build
popd

pushd demos\deploySolution
call npm run build
popd

pushd demos\getItemInfo
call npm run build
popd

pushd demos\implementedTypes
call npm run build
popd

pushd demos\verifySolution
call npm run build
popd

call rmdir/q/s coverage
call npm run test:chrome:ci

