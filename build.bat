@echo off

REM Parse command line arguments
set START_LOCAL=false
set CREATE_BACKUP=false

REM Check for start flags
if "%1"=="--start" set START_LOCAL=true
if "%1"=="-s" set START_LOCAL=true
if "%2"=="--start" set START_LOCAL=true
if "%2"=="-s" set START_LOCAL=true

REM Check for backup flags
if "%1"=="--backup" set CREATE_BACKUP=true
if "%1"=="-b" set CREATE_BACKUP=true
if "%2"=="--backup" set CREATE_BACKUP=true
if "%2"=="-b" set CREATE_BACKUP=true

echo ====================================
echo Building SoundHex Application
echo ====================================
echo Usage: build.bat [options]
echo Options:
echo   --start, -s  : Start local development environment after build
echo   --backup, -b : Create backup before building new image
echo   
echo Examples:
echo   build.bat                    (build and push only)
echo   build.bat --start            (build, push and start local)
echo   build.bat --backup           (create backup, build and push)
echo   build.bat --start --backup   (full process with backup and start)
echo ====================================

echo.
echo [1/4] Building Docker image...
docker compose -f docker-compose.dev.yml build

if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
if "%CREATE_BACKUP%"=="true" goto do_backup
echo [2/4] Skipping backup (use --backup flag to create backup)...
goto tag_image

:do_backup
echo [2/4] Creating backup from existing image...
REM Tạo timestamp với format YYYYMMDD_HHMM
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "BACKUP_TAG=backup"

echo Checking for existing local image...
docker images ghcr.io/vtdocker/soundhex_app:latest --format "{{.Repository}}:{{.Tag}}" | findstr "latest" >nul 2>&1
if %errorlevel% equ 0 (
    echo Creating backup tag from local image: %BACKUP_TAG%
    docker tag ghcr.io/vtdocker/soundhex_app:latest ghcr.io/vtdocker/soundhex_app:%BACKUP_TAG%
    docker push ghcr.io/vtdocker/soundhex_app:%BACKUP_TAG%
    echo Backup created successfully!
) else (
    echo No existing local latest tag found, checking remote...
    docker pull ghcr.io/vtdocker/soundhex_app:latest 2>nul
    if %errorlevel% equ 0 (
        echo Creating backup tag from remote image: %BACKUP_TAG%
        docker tag ghcr.io/vtdocker/soundhex_app:latest ghcr.io/vtdocker/soundhex_app:%BACKUP_TAG%
        docker push ghcr.io/vtdocker/soundhex_app:%BACKUP_TAG%
        echo Backup created successfully!
    ) else (
        echo No existing image found, this is the first build. Skipping backup...
    )
)

:tag_image

echo.
echo [3/4] Tagging new image...
docker tag soundhex-nextjs-app ghcr.io/vtdocker/soundhex_app:latest

if %errorlevel% neq 0 (
    echo ERROR: Tagging failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Pushing to GitHub Container Registry...
echo Pushing latest tag...
docker push ghcr.io/vtdocker/soundhex_app:latest

if %errorlevel% neq 0 (
    echo ERROR: Push failed! Make sure you are logged in to ghcr.io
    echo Run: docker login ghcr.io
    pause
    exit /b 1
)

if "%START_LOCAL%"=="true" (
    echo.
    echo [5/5] Starting local development environment...
    docker compose -f docker-compose.dev.yml up -d

    if %errorlevel% neq 0 (
        echo ERROR: Failed to start containers!
        pause
        exit /b 1
    )

    echo.
    echo ====================================
    echo Build and Deploy completed successfully!
    echo Application is running at: http://localhost:8501
    echo ====================================
) else (
    echo.
    echo ====================================
    echo Build and Push completed successfully!
    echo Local development environment was not started.
    echo To start manually: docker compose -f docker-compose.dev.yml up -d
    echo ====================================
)

echo.
echo Summary of actions performed:
echo - Built Docker image: YES
echo - Created backup: %CREATE_BACKUP%
echo - Pushed to registry: YES
echo - Started local environment: %START_LOCAL%
echo.
echo Press any key to exit...
pause >nul