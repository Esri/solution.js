rem Builds the repository and its demos

call node --version
call npm --version

call npm install

pushd demos
call npm run build
popd

call rmdir/q/s coverage
call npm run test:chrome:ci

