@echo off
setlocal

REM ─── detect branch name ────────────────────────────────────────────────
for /f "delims=" %%B in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%B"
for /f "delims=" %%S in ('git rev-parse --short HEAD')      do set "SHA=%%S"

REM ─── normalize branch (replace any "/" with "-") ─────────────────────────
set "BRANCH_SAFE=%BRANCH:/=-%"

REM ─── choose the tag ────────────────────────────────────────────────────
if /I "%BRANCH_SAFE%"=="main" (
    set "TAG=latest"
) else if /I "%BRANCH_SAFE%"=="dev" (
    set "TAG=beta"
) else (
    set "TAG=dev-%BRANCH_SAFE%-%SHA%"
)

echo On branch "%BRANCH%", tagging images as :"%TAG%".
REM ==== FRONTEND ====
echo Building frontend...
docker build --build-arg REACT_APP_API_URL=http://127.0.0.1:9090/api -t trivify-frontend:%TAG% ./frontend
if %errorlevel% neq 0 goto :error

echo Saving frontend image...
docker save -o trivify-frontend.tar trivify-frontend:%TAG%
if %errorlevel% neq 0 goto :error

echo Tagging and pushing frontend...
docker tag trivify-frontend:%TAG% lesommer2019/trivify-frontend:%TAG%
docker push lesommer2019/trivify-frontend:%TAG%
if %errorlevel% neq 0 goto :error

REM ==== BACKEND ====
echo Building backend...
cd backend
call mvnw clean package
if %errorlevel% neq 0 goto :error
cd ..

docker build -t trivify-backend:%TAG% ./backend
if %errorlevel% neq 0 goto :error

echo Saving backend image...
docker save -o trivify-backend.tar trivify-backend:%TAG%
if %errorlevel% neq 0 goto :error

echo Tagging and pushing backend...
docker tag trivify-backend:%TAG% lesommer2019/trivify-backend:%TAG%
docker push lesommer2019/trivify-backend:%TAG%
if %errorlevel% neq 0 goto :error

echo All done!
goto :eof

:error
echo Build failed! Check logs above.
exit /b 1