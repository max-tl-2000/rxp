/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
/* eslint-disable no-console */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readJSON, write } from '../src/common/xfs';

const execp = promisify(exec);

const doExec = cmd => {
  console.log('>>> cmd: ', cmd);
  return execp(cmd);
};

const main = async () => {
  const outputDir = '../backend-dist';

  await doExec(`mkdir -p ${outputDir}`);
  await doExec(`cp -rv dist ${outputDir}/`);
  await doExec(`cp -rv assets ${outputDir}/`);
  await doExec(`cp -rv *.sh ${outputDir}/`);
  await doExec(`chmod +x ${outputDir}/*.sh`);
  await doExec(`cp -rv web-build ${outputDir}/`);
  await doExec(`cp -rv yarn.lock ${outputDir}/`);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { devDependencies, scripts, ...restOfPkg } = await readJSON('./package.json');
  await write(`${outputDir}/package.json`, JSON.stringify(restOfPkg, null, 2));
};

main().catch(err => {
  console.error('>>> err', err);
});
