#!/bin/bash

. ./nvm-load.sh

yarn test
cd backend;
yarn test
