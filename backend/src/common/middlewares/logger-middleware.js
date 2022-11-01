/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { privateLogEntries } from '../logger-utils';
import { bunyanMiddleware } from '../bunyan-middleware';

export const setLogMiddleware = ({ app, logger }) =>
  app.use(
    bunyanMiddleware({
      headerName: 'X-Request-Id',
      propertyName: 'reqId',
      logName: 'reqId',
      // which headers should be obscured?
      obscureBody: privateLogEntries,
      obscureHeaders: ['x-api-token'],
      logger: logger.child({ type: 'middleware' }),
    }),
  );
