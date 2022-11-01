/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { exists } from './xfs';

const mapCloudEnv = cloudEnv => {
  const envs = {
    'staging-cust': 'staging',
    'staging-blue': 'staging',
    'staging-green': 'staging',
    qa: 'staging',
  };

  const translatedEnv = envs[cloudEnv];

  return translatedEnv || cloudEnv;
};

export const getPathToFavicons = async cloudEnv => {
  let pathToFavicons = `./assets/${mapCloudEnv(cloudEnv)}/favicons`;

  if (!(await exists(pathToFavicons))) {
    pathToFavicons = `./assets/dev/favicons`;
  }

  return pathToFavicons;
};
