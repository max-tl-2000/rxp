#!/bin/bash

VERSION="0.0.1"
SCRIPT_NAME=$0
REQUIRED_GH_VERSION=4.0.0

GH_VERSION=$(command -v prlabels && prlabels -v);

. ./nvm-load.sh

echo "GH_VERSION: $GH_VERSION";

if [[ "${GH_VERSION}" != ${REQUIRED_GH_VERSION} ]]; then
  echo ">> Installing labeler helper"
  npm i -g @redisrupt/gh@${REQUIRED_GH_VERSION}
fi

VERSION_COMMAND="prlabels -v"

echo $VERSION_COMMAND
eval $VERSION_COMMAND

CMD="prlabels --repo rxp --owner Redisrupt --action tagPR --prId ${ghprbPullId}"

echo $CMD
eval $CMD
