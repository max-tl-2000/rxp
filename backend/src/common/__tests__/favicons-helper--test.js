/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { getPathToFavicons } from '../favicons-helper';

describe('getPathToFavicons', () => {
  describe('when the cloudEnv is provided', () => {
    it('should return the path to a favicons folder', async () => {
      const pathToFavicons = await getPathToFavicons('dev');
      expect(pathToFavicons).toEqual('./assets/dev/favicons');
    });
  });

  describe('staging cloud envs should be mapped to staging (including qa)', () => {
    it('should return the path to a favicons folder', async () => {
      let pathToFavicons = await getPathToFavicons('qa');
      expect(pathToFavicons).toEqual('./assets/staging/favicons');

      pathToFavicons = await getPathToFavicons('staging');
      expect(pathToFavicons).toEqual('./assets/staging/favicons');

      pathToFavicons = await getPathToFavicons('staging-green');
      expect(pathToFavicons).toEqual('./assets/staging/favicons');

      pathToFavicons = await getPathToFavicons('staging-blue');
      expect(pathToFavicons).toEqual('./assets/staging/favicons');
    });
  });

  describe('when the provided env is not mapped it should return dev', () => {
    it('should return the path to a favicons folder', async () => {
      let pathToFavicons = await getPathToFavicons('qa1');
      expect(pathToFavicons).toEqual('./assets/dev/favicons');

      pathToFavicons = await getPathToFavicons('staging2');
      expect(pathToFavicons).toEqual('./assets/dev/favicons');

      pathToFavicons = await getPathToFavicons('staging-green1');
      expect(pathToFavicons).toEqual('./assets/dev/favicons');

      pathToFavicons = await getPathToFavicons('staging-blue2');
      expect(pathToFavicons).toEqual('./assets/dev/favicons');
    });
  });
});
