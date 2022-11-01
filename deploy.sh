#!/bin/bash

. ./nvm-load.sh

yarn expo login -u $EXPO_CREDS_USR -p $EXPO_CREDS_PSW --non-interactive
yarn expo publish $@
