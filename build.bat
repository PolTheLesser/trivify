@echo off
setlocal

REM ─── detect branch name ────────────────────────────────────────────────
for /f "delims=" %%B in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%B"
for /f "delims=" %%S in ('git rev-parse --short HEAD')      do set "SHA=%%S"

REM ─── choose the tag ────────────────────────────────────────────────────
if /I "%BRANCH%"=="main" (
    set "TAG=latest"
) else if /I "%BRANCH%"=="dev" (
    set "TAG=beta"
) else (
    set "TAG=dev-%BRANCH%-%SHA%"
)

echo On branch "%BRANCH%", tagging images as :"%TAG%".
REM ==== FRONTEND ====
echo Building frontend...
docker build --build-arg REACT_APP_API_URL=http://127.0.0.1:9090/api -t quiz-frontend ./frontend
if %errorlevel% neq 0 goto :error

echo Saving frontend image...
docker save -o quiz-frontend.tar quiz-frontend:%TAG%

echo Tagging and pushing frontend...
docker tag quiz-frontend lesommer2019/quizapp-frontend:%TAG%
docker push lesommer2019/quizapp-frontend:%TAG%

REM ==== BACKEND ====
echo Building backend...
cd backend
call mvnw clean package
if %errorlevel% neq 0 goto :error
cd ..

docker build -t quiz-backend:beta ./backend
if %errorlevel% neq 0 goto :error

echo Saving backend image...
docker save -o quiz-backend.tar quiz-backend:%TAG%

echo Tagging and pushing backend...
docker tag quiz-backend lesommer2019/quizapp-backend:%TAG%
docker push lesommer2019/quizapp-backend:%TAG%

echo All done!
goto :eof

:error
echo Build failed! Check logs above.
exit /b 1
