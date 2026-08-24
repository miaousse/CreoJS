@echo off
chcp 65001 >nul
echo ====================================
echo    Lancement de la mise a jour Git
echo ====================================

:: Affiche l'etat actuel
git status
echo.

:: Demande le message de commit a l'utilisateur
set /p msg="Entre ton message de commit : "

:: Si aucun message n'est saisi, met un message par defaut
if "%msg%"=="" set msg="Mise a jour automatique"

echo.
echo [1/3] Ajout des fichiers...
git add .

echo [2/3] Validation (commit)...
git commit -m "%msg%"

echo [3/3] Envoi sur GitHub (push)...
git push origin main

echo.
echo ====================================
echo    Termine avec succes !
echo ====================================
pause