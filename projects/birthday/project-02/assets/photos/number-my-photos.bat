@echo off
rem Renames every picture in this folder to 1, 2, 3 ... keeping its file type,
rem so the birthday-room photo frame can find them.
setlocal enabledelayedexpansion
cd /d "%~dp0"

set count=0
for /f "delims=" %%F in ('dir /b /a-d /o:n *.jpg *.jpeg *.png *.webp *.gif 2^>nul') do (
  set /a count+=1
  ren "%%F" "__tmp_!count!%%~xF"
)

if %count%==0 (
  echo No pictures found in this folder.
  pause
  exit /b
)

set n=0
for /l %%I in (1,1,%count%) do (
  for %%T in ("__tmp_%%I.*") do (
    set /a n+=1
    ren "%%~nxT" "!n!%%~xT"
  )
)

echo Done. %count% picture(s) are now numbered 1 to %count%.
pause
