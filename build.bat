@echo off
setlocal

REM ==== FRONTEND ====
echo Building frontend...
docker build --build-arg REACT_APP_API_URL=http://quizapp-backend:9090/api -t quiz-frontend ./frontend
if %errorlevel% neq 0 goto :error

echo Saving frontend image...
docker save -o quiz-frontend.tar quiz-frontend:latest

echo Tagging and pushing frontend...
docker tag quiz-frontend lesommer2019/quizapp-frontend:latest
docker push lesommer2019/quizapp-frontend:latest

REM ==== BACKEND ====
echo Building backend...
cd backend
call mvnw clean package
if %errorlevel% neq 0 goto :error
cd ..

docker build -t quiz-backend:latest ./backend
if %errorlevel% neq 0 goto :error

echo Saving backend image...
docker save -o quiz-backend.tar quiz-backend:latest

echo Tagging and pushing backend...
docker tag quiz-backend lesommer2019/quizapp-backend:latest
docker push lesommer2019/quizapp-backend:latest

echo All done!
goto :eof

:error
echo Build failed! Check logs above.
exit /b 1
