#!/bin/bash

. ./_common.sh

./configure.sh
. ./nvm-load.sh

npm run build

logBlock 'build done!'
