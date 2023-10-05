#!/bin/bash

if [ ! -d "/angular-maplibre/node_modules" ]; then
    echo "Directory /angular-maplibre/node_modules not exists. Installing..."
    (cd /angular-maplibre && npm i)
fi
echo "Running developer server..."
(cd /angular-maplibre && ng serve --host=0.0.0.0 --disable-host-check)