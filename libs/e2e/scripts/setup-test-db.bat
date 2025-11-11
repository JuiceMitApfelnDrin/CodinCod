@echo off
REM Database seeding script for E2E tests (Windows)
REM This script resets the test database and runs seeds

echo === E2E Test Database Setup ===

REM Configuration
set BACKEND_DIR=..\..\backend\codincod_api
set DB_NAME=codincod_api_test
if defined POSTGRES_DB set DB_NAME=%POSTGRES_DB%
set DB_USER=postgres
if defined POSTGRES_USER set DB_USER=%POSTGRES_USER%
set DB_PASSWORD=postgres
if defined POSTGRES_PASSWORD set DB_PASSWORD=%POSTGRES_PASSWORD%
set DB_HOST=localhost
if defined POSTGRES_HOST set DB_HOST=%POSTGRES_HOST%

echo Database: %DB_NAME%
echo Host: %DB_HOST%
echo User: %DB_USER%

REM Navigate to backend directory
cd %BACKEND_DIR%

REM Drop database
echo.
echo Dropping test database if exists...
set PGPASSWORD=%DB_PASSWORD%
dropdb -h %DB_HOST% -U %DB_USER% %DB_NAME% --if-exists 2>nul

REM Create database
echo Creating fresh test database...
createdb -h %DB_HOST% -U %DB_USER% %DB_NAME%

REM Run migrations
echo.
echo Running migrations...
set MIX_ENV=test
call mix ecto.migrate

REM Run seeds
echo.
echo Running seeds...
call mix run priv/repo/seeds.exs

echo.
echo ✓ Test database setup complete!
echo Database '%DB_NAME%' is ready for E2E tests

cd ..\..\e2e
