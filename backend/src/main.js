/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import 'dotenv/config';
import Express from 'express';
import cheerio from 'cheerio';
import path from 'path';
import { logger, initLogger } from './common/logger';
import { createServer } from './common/server';
import { envVal } from './common/env-val';
import { read } from './common/xfs';
import { detectBrowserFromUserAgent } from './common/browser-detector';

const cloudEnv = envVal('CLOUD_ENV');
const serviceName = envVal('RED_PROCESS_NAME', 'RxP');
const port = envVal('PROCESS_PORT', 3535);

const getTemplateForApp = async () => {
  const appHTML = await read('./web-build/_app.html');

  const $ = cheerio.load(appHTML);

  // TODO: pass here other variables to the web version
  const appData = {
    cloudEnv,
  };

  $('head').prepend(`<script>window.__appData = ${JSON.stringify(appData)}</script>`);

  return $.html();
};

const main = async () => {
  await initLogger();

  if (!cloudEnv) {
    throw new Error('Refusing to start as cloudEnv is not set');
  }

  const app = new Express();

  const server = await createServer(app, {
    serviceName,
    port,
    logger,
    cloudEnv,
    setHeadersForStaticAssets: (res, assetPath) => {
      if (assetPath.match(/service-worker|precache-manifest\./)) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    },
    includeWSURLInConfigResponse: true,
    staticFolders: [
      './web-build',
      './assets/pkgs-metadata',
      // using __dirname ensures the path will be resolved correctly both in dev and prod modes
      path.resolve(__dirname, './common/templates/images'),
    ],
  });

  // all urls will reply with the template for get requests
  server.registerMiddleware(async (req, res) => {
    const userAgent = req.get('User-Agent');
    const { olderVersion, supported, unknownBrowser } = detectBrowserFromUserAgent(userAgent);

    let template;
    if (supported || unknownBrowser) {
      template = await getTemplateForApp();
    } else {
      const templateName = olderVersion ? 'older-browser-version-page.html' : 'not-supported-browser-page.html';
      logger.warn({ ctx: req, olderVersion, userAgent }, 'Browser not supported!');
      // using __dirname ensures the path will be resolved correctly both in dev and prod modes
      template = await read(path.resolve(__dirname, `./common/templates/${templateName}`));
    }

    res.status(200);

    res.send(template);
  });

  await server.start();
};

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error('>>> error starting server', err);
});
