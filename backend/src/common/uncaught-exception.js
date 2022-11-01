/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { logger } from './logger';

process.on('uncaughtException', error => {
  logger.error({ error, subType: 'uncaughtException' }, 'uncaught exception found');
  process.exit(7); // eslint-disable-line no-process-exit
});

process.on('unhandledRejection', reason => {
  logger.warn({ reason, subType: 'unhandledRejection' }, 'unhandled rejection found');
});
