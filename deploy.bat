@echo off
echo === D360 Deploy Starting ===
cd /d E:\D360\client
call npm run build
cd /d E:\D360
git add .
git commit -m "deploy update"
git push
echo === Pushed to GitHub! ===
echo.
echo Now run in cPanel Terminal:
echo ~/deploy.sh
pause