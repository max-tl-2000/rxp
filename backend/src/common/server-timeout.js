/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { envVal } from './env-val';
/* eslint-disable no-param-reassign */
export const setServerTimeout = server => {
  if (!server || !server.setTimeout) {
    throw new Error('No server instance provided to set the timeout');
  }

  server.keepAliveTimeout = envVal('REVA_SERVER_DEFAULT_KEEP_ALIVE_TIMEOUT', 62 * 1000);
  server.headersTimeout = envVal('REVA_SERVER_HEADER_TIMEOUT', 63 * 1000);

  const serverDefaultTimeout = envVal('REVA_SERVER_DEFAULT_TIMEOUT', 5 * 60 * 1000);
  server.setTimeout(serverDefaultTimeout);

  return server;
};
