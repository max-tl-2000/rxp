#!/bin/bash
set -e

. ./_common.sh

logBlock 'Backend build start';

log "cleaning backend-dist"
rm -rf backend-dist

log "creating back backend-dist"
mkdir backend-dist/

PATH=$(npm bin):$PATH

./build-web-assets.sh

# generates the licenses attribution metadata
babel-node --extensions '.ts,.js,.json' resources/gen-licenses-metadata.ts

cd backend

./build.sh

# back to expo root
cd ..

log "creating backend assets"

cd backend-dist/

./configure.sh --production=true

log "backend prod build is ready"

logBlock 'Backend build done!';