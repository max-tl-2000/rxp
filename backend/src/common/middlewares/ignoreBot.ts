/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { Request, Response, NextFunction } from 'express';
import { isRequestFromABot } from '../browser-detector';

export const ignoreBot = (req: Request, res: Response, next: NextFunction) => {
  const isABot = isRequestFromABot(req);
  if (isABot) {
    res.set('X-Robots-Tag', 'noindex, nofollow');
    res.status(200);
    res.end();
    return;
  }

  next();
};
