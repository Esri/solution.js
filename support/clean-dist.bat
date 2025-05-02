dir/ad/b demos >dirs.txt
for /f "tokens=*" %%f in (dirs.txt) do call rmdir/s/q demos\%%f\dist

dir/ad/b packages >dirs.txt
for /f "tokens=*" %%f in (dirs.txt) do call rmdir/s/q packages\%%f\dist

del/q dirs.txt
