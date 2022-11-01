/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
const createExpoWebpackConfigAsync = require('@expo/webpack-config'); // eslint-disable-line

module.exports = async (env, argv) => {
  // disable service worker
  return createExpoWebpackConfigAsync({ ...env, offline: false }, argv);
};
