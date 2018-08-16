@echo off

rem This is set by foreman but it affects create-react-app server, so let's clear it
set "PORT="

cd client
set BROWSER=none
npm start
