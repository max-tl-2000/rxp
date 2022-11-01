/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
module.exports = api => {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [["@babel/plugin-proposal-decorators", { "legacy": true }], 'inline-dotenv'],
    env: {
      production: {
        plugins: ['react-native-paper/babel'],
      },
    },
  };
};
