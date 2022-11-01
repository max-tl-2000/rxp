/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import orderBy from 'lodash/orderBy';
import { PaymentMethod } from '../mobx/stores/paymentTypes';

export const sortPaymentMethods = (paymentMethods: PaymentMethod[]) =>
  orderBy(
    paymentMethods.map(p => p),
    ['isExpired', 'createdAt'],
    ['asc', 'desc'],
  );
