pushd packages\common
rmdir/s/q node_modules\@esri\hub-common
xcopy/s/c/r/v/y ..\..\hub4\hub-common node_modules\@esri\hub-common\
rmdir/s/q node_modules\@esri\hub-initiatives
xcopy/s/c/r/v/y ..\..\hub4\hub-initiatives node_modules\@esri\hub-initiaives\
rmdir/s/q node_modules\@esri\hub-sites
xcopy/s/c/r/v/y ..\..\hub4\hub-sites node_modules\@esri\hub-sites\
rmdir/s/q node_modules\@esri\hub-teams
xcopy/s/c/r/v/y ..\..\hub4\hub-teams node_modules\@esri\hub-teams\
popd

pushd packages\creator
rmdir/s/q node_modules\@esri\hub-common
xcopy/s/c/r/v/y ..\..\hub4\hub-common node_modules\@esri\hub-common\
popd

pushd packages\deployer
rmdir/s/q node_modules\@esri\hub-common
xcopy/s/c/r/v/y ..\..\hub4\hub-common node_modules\@esri\hub-common\
popd

pushd packages\hub-types
rmdir/s/q node_modules\@esri\hub-common
xcopy/s/c/r/v/y ..\..\hub4\hub-common node_modules\@esri\hub-common\
rmdir/s/q node_modules\@esri\hub-initiatives
xcopy/s/c/r/v/y ..\..\hub4\hub-initiatives node_modules\@esri\hub-initiaives\
rmdir/s/q node_modules\@esri\hub-sites
xcopy/s/c/r/v/y ..\..\hub4\hub-sites node_modules\@esri\hub-sites\
rmdir/s/q node_modules\@esri\hub-teams
xcopy/s/c/r/v/y ..\..\hub4\hub-teams node_modules\@esri\hub-teams\
popd

pushd packages\storymap
rmdir/s/q node_modules\@esri\hub-common
xcopy/s/c/r/v/y ..\..\hub4\hub-common node_modules\@esri\hub-common\
popd

pushd packages\web-experience
rmdir/s/q node_modules\@esri\hub-common
xcopy/s/c/r/v/y ..\..\hub4\hub-common node_modules\@esri\hub-common\
popd

