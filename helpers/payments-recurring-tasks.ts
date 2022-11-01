/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { AppState } from 'react-native';
import { interval, Subscription } from 'rxjs';

import { mediator } from '../network/helpers';
import { getTransactionsPollingInterval } from '../config';
import { logger } from './logger';

const intervalDuration = getTransactionsPollingInterval();
const scheduledTransactionInterval = interval(intervalDuration);

let transactionSubscription: Subscription;
let isLoggedIn = false;

const subscribeToTransactionInterval = () => {
  if (!isLoggedIn) return;
  logger.info('subscribing to transaction polling interval');
  transactionSubscription = scheduledTransactionInterval.subscribe(() => mediator().next('scheduledTransactions:poll'));
};

const unsubscribeFromTransactionInterval = () => {
  logger.info('unsubscribing from transaction polling interval');
  transactionSubscription?.unsubscribe();
};

export const initTransactionsInterval = () => {
  mediator().subscribe('user:loggedIn', () => {
    isLoggedIn = true;
    subscribeToTransactionInterval();
  });
  mediator().subscribe('user:before-logout', () => {
    isLoggedIn = false;
    unsubscribeFromTransactionInterval();
  });

  AppState.addEventListener('change', state => {
    if (state === 'active') subscribeToTransactionInterval();
    else unsubscribeFromTransactionInterval();
  });
};
