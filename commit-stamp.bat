echo off
echo Built %date% %time% >packages\common\dist\solution.js_commit.txt
git rev-parse --abbrev-ref HEAD >>packages\common\dist\solution.js_commit.txt
git log -1>>packages\common\dist\solution.js_commit.txt

