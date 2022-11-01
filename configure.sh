#!/bin/bash

. ./_versions.sh
. ./_common.sh

PROFILE=".bashrc"
CURRENT_OS=$(getOS);

logBlock "Running configure"

export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh" --no-use  # This loads nvm
fi

function ensure_versions {
  local VERSIONS_MISMATCH=false;

  # Check whether nvm exists in this env
  local NVM_VERSION=$(nvm --version);
  if [ "${NVM_VERSION}" != "${REQUIRED_NVM_VERSION}" ]; then
    VERSIONS_MISMATCH=true;
    warn "NVM version mismatch, ${NVM_VERSION} found. Required is ${REQUIRED_NVM_VERSION}";

    # If Mac or Linux, just automatically install
    if [ "${CURRENT_OS}" != "MSWin" ]; then

      # For mac, mac terminal uses the .profile file, while the bash script is using bashrc/zshrc	      # For mac, mac terminal uses the .profile file, while the bash script is using bashrc
      # So ensure that nvm install updates bashrc/zshrc, and that we add bashrc to the .profile file
      touch "${HOME}/${PROFILE}";
      if [ "${CURRENT_OS}" == "Mac" ]; then
        touch "${HOME}/.profile";
        if [ "$(grep '.zshrc\|.bashrc' ${HOME}/.profile)" == "" ]; then
          echo "source ~/.bashrc" >> "${HOME}/.profile";
        fi
      fi

      # The sed command is replacing the appending by a prepending in the profile file of the nvm tools (bashrc on linux system).
      # On linux some default bashrc ignore its content when sourced from a script
      if [ "$(which curl)" != "" ]; then
        curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/v${REQUIRED_NVM_VERSION}/install.sh" | sed -e 's/>> \"\$NVM_PROFILE\"/\| cat - "$NVM_PROFILE" > .nvm_tmp \&\& mv .nvm_tmp "$NVM_PROFILE"/g' | bash;
      elif [ "$(which wget)" != "" ]; then
        wget -qO- "https://raw.githubusercontent.com/nvm-sh/nvm/v${REQUIRED_NVM_VERSION}/install.sh" | sed -e 's/>> \"\$NVM_PROFILE\"/\| cat - "$NVM_PROFILE" > .nvm_tmp \&\& mv .nvm_tmp "$NVM_PROFILE"/g' | bash;
      else
        log "No curl or wget detected!"
        exit 1;
      fi

      source "${HOME}/${PROFILE}"
      NVM_VERSION=$(nvm --version);
    fi
  else
    log "nvm    ==> required version found: ${NVM_VERSION}"
  fi

  local NODE_VERSION=$(node -v);
  if [ "${NODE_VERSION}" != "${REQUIRED_NODE_VERSION}" ]; then
    VERSIONS_MISMATCH=true;
    warn "Node version mismatch, ${NODE_VERSION} found. Required is ${REQUIRED_NODE_VERSION}";

    # Needed because something in the nvm exec is creating an error and the scripts exits
    set +e
    nvm install $REQUIRED_NODE_VERSION
    nvm use $REQUIRED_NODE_VERSION
    set -e

    log "Installed required version: $(node -v)";
  else
    log "node   ==> required version found: ${NODE_VERSION}"
  fi

  local NPM_VERSION=$(npm -v);

  if [ "${NPM_VERSION}" != "${REQUIRED_NPM_VERSION}" ]; then
    VERSIONS_MISMATCH=true;
    warn "npm version mismatch, ${NPM_VERSION} found. Required is ${REQUIRED_NPM_VERSION}";

    echo ""
    log "npm i -sg npm@${REQUIRED_NPM_VERSION}"
    echo ""

    npm i -sg npm@${REQUIRED_NPM_VERSION}
  else
    log "npm    ==> required version found: ${REQUIRED_NPM_VERSION}"
  fi

  # remove the progress bar to increase install speed in npm@3
  npm set progress=false

  local YARN_VERSION=$(yarn --version);

  if [ "${YARN_VERSION}" != "${REQUIRED_YARN_VERSION}" ]; then
    VERSIONS_MISMATCH=true;
    warn "yarn version mismatch, ${YARN_VERSION} found. Required is ${REQUIRED_YARN_VERSION}";
    log "Installing required version: ${REQUIRED_YARN_VERSION}";
    echo ""
    log "npm i -sg yarn@${REQUIRED_YARN_VERSION}"
    echo ""

    npm i -sg yarn@${REQUIRED_YARN_VERSION}
    yarn --version
  else
    log "yarn   ==> required version found: ${REQUIRED_YARN_VERSION}"
  fi

  if [ "{VERSIONS_MISMATCH}" == "true" ]; then
    log "execute 'source ./nvm-load.sh' to load the configured env in your current session"
  fi
}

ensure_versions;

yarn

./customize.sh

logBlock "Configure finished"
echo ""