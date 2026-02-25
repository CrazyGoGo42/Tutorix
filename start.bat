@echo off

cd /d "%~dp0\..\Tutorix-bot\Bot"

start http://localhost:3000

node server.js