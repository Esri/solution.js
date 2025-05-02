rmdir/s/q node_modules

dir/ad/b demos >dirs.txt
for /f "tokens=*" %%f in (dirs.txt) do call rmdir/s/q demos\%%f\node_modules

rmdir/s/q packages\common\node_modules

del/q dirs.txt
