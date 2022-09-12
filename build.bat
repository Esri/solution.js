rem Builds the repository and its demos

call node --version
call npm --version

pushd demos
call npm install
call npm run build
popd

call npm install

call rmdir/q/s coverage
call npm run test:chrome:ci

