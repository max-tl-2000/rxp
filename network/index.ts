/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { mediator } from './helpers';
import { connect, disconnect } from './socket';
import { User } from '../mobx/stores/authTypes';

export const initNetworkServices = () => {
  mediator().subscribe('user:loggedIn', (user: User) => connect(user));
  mediator().subscribe('user:before-logout', disconnect);
};
