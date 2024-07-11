@echo off
echo Starting server...
node server.js
if %errorlevel%==0 (
    echo Server started successfully!
) else (
    echo Failed to start server.
)
pause