/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import io from 'socket.io-client';
import { EventTypes } from '../constants/eventTypes';
import { socketServer } from '../config';
import { initEventBuffer, IEventBuffer } from './helpers/eventBuffering';
import { mediator } from './helpers/mediator';
import { User } from '../mobx/stores/authTypes';
import { logger } from '../helpers/logger';

interface Subscription {
  event: string;
  callback: Function;
}

let socket: SocketIOClient.Socket;
let eventBuffer: IEventBuffer;

const subscriptions = [
  {
    event: EventTypes.DIRECT_MESSAGE_TO_RXP,
    callback: (data: any) => mediator().next('messages:new', data),
  },
  {
    event: EventTypes.POST_TO_RXP,
    callback: (data: any) => mediator().next('posts:new', data),
  },
  {
    event: EventTypes.NEW_PAYMENT_METHOD,
    callback: (data: any) => mediator().next('paymentMethod:new', data),
  },
  {
    event: EventTypes.NEW_SCHEDULED_PAYMENT,
    callback: (data: any) => mediator().next('scheduledPayment:new', data),
  },
];

const socketSubscriptions: Subscription[] = [];

const unsubscribe = (event: string, callback: Function) => {
  socket.removeListener(event, callback);
};

const doSubscribe = (event: string, callback: Function) => {
  socketSubscriptions.push({ event, callback });
  socket.on(event, callback);
};

const removeAllSubscriptions = () => {
  if (!socket) return;
  socketSubscriptions.forEach(({ event, callback }) => unsubscribe(event, callback));
};

export const disconnect = () => {
  if (!socket) {
    logger.info('[WS]: Web Socket. socket is not defined');
    return;
  }

  const { id = 'unknown' } = socket;

  removeAllSubscriptions();

  if (socket.disconnected) {
    logger.info(`[WS]: Web Socket '${id}' socket is already disconnected!`);
    return;
  }

  socket.disconnect();
  logger.info(`[WS]: Web Socket '${id}' disconnected`);
};

export const connect = async (user?: User) => {
  const { authToken: token } = user || {};
  if (!token) {
    disconnect();
    return;
  }
  socket = io.connect(socketServer, { transports: ['websocket'] });

  eventBuffer = initEventBuffer();

  subscriptions.forEach(({ event, callback }) => {
    const fn = (data: any) =>
      eventBuffer.next({
        event,
        data,
        handler: (args: any) => {
          logger.info(`[WS]: Handling event "${args.event}" with payload`, { data: args.data, date: new Date() });
          callback(args.data);
        },
      });

    doSubscribe(event, fn);
  });

  socket.on('authenticated', () => {
    logger.info(`[WS]:'${socket.id}' authenticated`);
  });

  socket.on('connect', () => {
    logger.info(`[WS]:'${socket.id}' connected`);
    socket.emit('authenticate', { token });
  });

  socket.on('reconnecting', (attempts: number) => logger.trace(`reconnecting: attempt #${attempts}`));

  socket.on('reconnect', () => mediator().next('socket:reconnect'));

  socket.on('unauthorized', (msg: any) => {
    logger.info(`[WS]:'${socket.id}' unauthorized`, { msg });
    mediator().next('user:unauthorized');
  });
};
