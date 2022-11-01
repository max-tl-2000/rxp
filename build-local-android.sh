#!/bin/bash

VERSION="0.0.1"
SCRIPT_NAME=$0

function print_help {
  echo "Usage: $SCRIPT_NAME -t HOST -s SCHEME -p PORT" ; echo
  echo "Build an apk locally" ; echo
  echo "Usage Example:" ; echo
  echo "$SCRIPT_NAME -t 127.0.0.1 -s http -p 8888" ; echo
  exit 0
}

function print_version {
  echo "$SCRIP_NAME $VERSION"
  exit 0
}

function print_help_hint {
  echo "See '$SCRIPT_NAME --help'."
}

function print_invalid_flag {
  echo "flag provided but not defined: $1"
  print_help_hint
  exit 2
}

# Script execution starts here
while [[ $# > 0 ]]; do
  key="$1"

  case $key in
    -v|--version)
      print_version
    ;;
    -h|--help)
      print_help
    ;;
    -p|--port)
      PORT_ARG=$2
      shift
    ;;
    -t|--host)
      HOST_ARG=$2
      shift
    ;;
    -s|--scheme)
      SCHEME_ARG=$2
      shift
    ;;
    -k|--ks-password)
      KEYSTORE_PASSWORD=$2
      shift
    ;;
    -y|--keystore-path)
      KEYSTORE_PATH_ARG=$2
      shift
    ;;
    -a|--keystore-alias)
      KEYSTORE_ALIAS_ARG=$2
      shift
    ;;
    -o|--apk-output)
      APK_OUTPUT_NAME_ARG=$2
      shift
    ;;
    *)
      print_invalid_flag "$1"
    ;;
  esac

  shift
done # end while

if [ -z "${KEYSTORE_PASSWORD}" ]; then
  echo "KEYSTORE_PASSWORD not set"
  exit 1
fi

PATH=$(npm bin):$PATH
set -e
source ./nvm-load.sh
set +e

PORT="${PORT_ARG:-8000}"
SCHEME="${SCHEME_ARG:-http}"
HOST=${HOST_ARG:-127.0.0.1}

APK_OUTPUT_NAME=${APK_OUTPUT_NAME_ARG:-reva-rxp-local.apk}

KEYSTORE_ALIAS=${KEYSTORE_ALIAS_ARG:-keystore}
KEYSTORE_PATH=${KEYSTORE_PATH_ARG:-./keystore/keystore.jks}

RUNNING_SERVER_PID=$(lsof -t -i:${PORT})

if [ ! -z "${RUNNING_SERVER_PID}" ]; then
  CMD="kill -9 ${RUNNING_SERVER_PID}"

  echo $CMD
  eval $CMD
fi

PUBLIC_URL="${SCHEME}://${HOST}:${PORT}"

rm -rf dist
rm -rf dist-apks

export NODE_ENV=production
CMD="expo export --dev --public-url ${PUBLIC_URL}"

echo $CMD
eval $CMD

cd dist
python -m SimpleHTTPServer $PORT &

cd ..

EXPO_ANDROID_KEYSTORE_PASSWORD="${KEYSTORE_PASSWORD}" \
EXPO_ANDROID_KEY_PASSWORD="${KEYSTORE_PASSWORD}" \
turtle build:android \
  --type apk \
  --keystore-path ${KEYSTORE_PATH} \
  --keystore-alias ${KEYSTORE_ALIAS} \
  --allow-non-https-public-url \
  --public-url ${PUBLIC_URL}/android-index.json \
  --output dist-apks/${APK_OUTPUT_NAME}

echo "# Important"
echo "# Use this command to stop the server if no longer testing the apk"
echo "# "
echo "#   kill $(lsof -t -i:${PORT})"
echo "# "