#!/bin/bash

if [ ! -d "/angular-maplibre/node_modules" ]; then
    echo "Directory /angular-maplibre/node_modules not exists. Installing..."
    (cd /angular-maplibre && npm i)
fi
echo "Running tests..."
(cd /angular-maplibre && ng test)