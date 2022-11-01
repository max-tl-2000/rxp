#!/bin/bash

# TODO: all of this should be done using a dynamic app.config.ts file like shown here: https://docs.expo.io/workflow/configuration/#app-config

PATH=$(npm bin):$PATH

. ./nvm-load.sh

VERSION="0.0.1"
SCRIPT_NAME=$0

function print_help {
  echo "Usage: $SCRIPT_NAME -p customer_path" ; echo
  echo "Customize the Rxp app with the customer's assets" ; echo
  echo "Usage Example:" ; echo
  echo "$SCRIPT_NAME -p reva" ; echo
  echo "$SCRIPT_NAME -p maximus" ; echo
  exit 0
}

function print_version {
  echo "RxP app customization $VERSION"
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

function get_config_value {
  local readonly config=$1
  local env=${ENVIRONMENT:-local}
  local delimiter="-"

  env=$(echo $env | sed -e 's/[^a-zA-Z0-9\.\_]//g')

  if [[ $config == "APP_ID" ]]; then delimiter="." ; fi
  if [[ $env == "prod" ]] ; then env="" ; delimiter="" ; fi

  local readonly config_val="${delimiter}${env}"

  echo ${!config} | sed -e "s/%%ENVIRONMENT%%/${config_val}/g"
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
    -p|--path)
      CUSTOMER_PATH=$2
      shift
    ;;
    *)
      print_invalid_flag "$1"
    ;;
  esac

  shift
done # end while

# If no customer path is passed, then default to reva
if [ -z "$CUSTOMER_PATH" ]; then
  CUSTOMER_PATH="maximus"
fi

echo "Customizing for customer path: $CUSTOMER_PATH"

CUSTOMER_DIR="./customers/$CUSTOMER_PATH"
INI_FILE="$CUSTOMER_DIR/config.ini"
ASSET_DEST_DIR="./assets/images"
THEME_DEST_DIR="./helpers"
APP_JSON_TEMPLATE="./app_template.json"
APP_JSON="./app.json"

# Load the customer variables
. $INI_FILE

# Replace the variables in the app.json file with the customer data
cp "$APP_JSON_TEMPLATE" "$APP_JSON"
VARS=($(cat $INI_FILE|awk -F '=' '{ print $1 }'))
for i in "${VARS[@]}"
do
  search="s/%%"${i}"%%/$(get_config_value $i)/g"
  $(sed -i'' -e "${search}" $APP_JSON)
done

# Copy the images in the right location
cp $CUSTOMER_DIR/*Icon.png "$ASSET_DEST_DIR"
cp $CUSTOMER_DIR/splash.* "$ASSET_DEST_DIR"
cp "$CUSTOMER_DIR/theme-colors.json" "$THEME_DEST_DIR"

## adding BUILD_NUMBER which is coming from CI(jenkins) env vars
buildSearch="s/%%BUILD_NUMBER%%/${BUILD_NUMBER:=0}/g"
$(sed -i'' -e "${buildSearch}" $APP_JSON)
