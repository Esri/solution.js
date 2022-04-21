rem Builds the repository and its demos

call volta install node@16.14.0
call volta install npm@bundled
call volta install typescript@4.6.3
call node --version
call npm --version

call npm install

pushd demos
call npm run build
popd

call rmdir/q/s coverage
call npm run test:chrome:ci

