/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
/* eslint-disable no-unused-expressions */
import http from 'http';
import compression from 'compression';
import serveStatic from 'serve-static';
import { setServerTimeout } from './server-timeout';
import { setRequestMiddleware } from './middlewares/requestMiddleware';
import { setSecureMiddleware } from './middlewares/security';
import { setLogMiddleware } from './middlewares/logger-middleware';
import { ignoreBot } from './middlewares/ignoreBot';
import { getPathToFavicons } from './favicons-helper';

export const createServer = async (app, options = {}) => {
  const {
    logger,
    serviceName = 'Unknown service',
    errorHandler,
    port,
    setHeadersForStaticContent,
    staticFolders = [],
    cloudEnv,
  } = options;

  const setHeaders = (res, path_) => {
    // this is needed to be able to load webfonts from
    // static.reva.tech in development.
    // and to be able to capture errors that happen in the client code
    // from scripts served from static.reva.tech
    if (path_.match(/libs\/font\//) || path_.match(/\.js$/) || path_.match(/\.css$/)) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }

    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

    setHeadersForStaticContent?.(res, path_);
  };

  const pathToFavicons = await getPathToFavicons(cloudEnv);

  app.use(serveStatic(pathToFavicons, { setHeaders }));

  staticFolders.forEach(pathToStaticAssets => {
    app.use(serveStatic(pathToStaticAssets, { setHeaders }));
  });

  // this will add the reqId to every request
  setRequestMiddleware({ app });

  app.use(ignoreBot);

  // this will force all request that come to the server to be redirected to https
  setSecureMiddleware({ app, logger });

  // this will configure the logger middleware for requests
  // this will log incoming requests and outgoing responses
  setLogMiddleware({ app, logger });

  app.use(compression());

  app.get('/ping', async (req, res) => res.send('ok'));

  return {
    registerMiddleware: middlewareFn => {
      app.use(async (req, res, next) => {
        try {
          await middlewareFn(req, res);
        } catch (err) {
          next(err);
        }
      });
    },

    registerRoute: (path, middlewareFn, { method } = {}) => {
      const appMethod = method || 'use';

      const fn = app[appMethod];

      if (!fn) {
        throw new Error(`method does not exists in app ${appMethod}`);
      }

      app[appMethod](path, async (req, res, next) => {
        try {
          await middlewareFn(req, res);
        } catch (err) {
          next(err);
        }
      });
    },
    start: () => {
      app.use((error, req, res, next) => {
        logger.error({ error, ctx: req }, `${serviceName} error processing request`);
        if (errorHandler) {
          errorHandler(error, req, res, next);
          return;
        }
        next(error);
      });

      const server = new http.Server(app);

      setServerTimeout(server);

      server.listen(port, error => {
        if (error) {
          logger.error({ error }, `${serviceName} listener caught error`);
          return;
        }
        logger.info(`✅ ${serviceName} is running at port: ${port}`);
      });
    },
  };
};
