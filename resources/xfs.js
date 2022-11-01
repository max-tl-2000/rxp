/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { promisify } from 'util';
import { readFile, writeFile } from 'fs';
import path from 'path';
import makeDir from 'make-dir'; // eslint-disable-line import/no-extraneous-dependencies

const fsReadFile = promisify(readFile);
const fsWriteFile = promisify(writeFile);

export const read = (file, opts = { encoding: 'utf8' }) => fsReadFile(file, opts);

export const write = async (file, contents, options) => {
  const dir = path.dirname(file);
  await makeDir(dir);
  return fsWriteFile(file, contents, options);
};
