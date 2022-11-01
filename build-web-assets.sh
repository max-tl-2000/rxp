#!/bin/bash

set -e

. ./_common.sh
. ./nvm-load.sh

logBlock 'Build web assets prod start';

PATH=$(npm bin):$PATH

log "cleaning web-build"
log "cleaning backend/web-build"
rm -rf web-build
rm -rf backend/web-build

expo build:web --no-pwa

log "move created assets into backend"
mv web-build/index.html web-build/_app.html
mv -fv web-build backend/web-build

logBlock 'Build web assets prod done!';