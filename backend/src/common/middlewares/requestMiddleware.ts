/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { v4 } from 'uuid';
import { Application, Request, Response, NextFunction } from 'express';
import { IRequest } from './middleware-types';

export const X_REQUEST_ID = 'X-Request-Id';
export const X_SOCKET_ID = 'X-Socket-Id';

export const setRequestMiddleware = ({ app }: { app: Application }) =>
  app.use((request: Request, res: Response, next: NextFunction) => {
    const req = request as IRequest;

    req.reqId = req.reqId || req.get(X_REQUEST_ID) || v4();
    res.setHeader(X_REQUEST_ID, req.reqId);

    next();
  });
