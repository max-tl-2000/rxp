/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
/* eslint-disable no-console */

const addTimeToMethods = () => {
  const methods = ['log', 'info', 'error', 'debug'];

  methods.forEach(method => {
    const oldMethod = console[method];

    console[method] = (...args) => oldMethod(`[${new Date().toJSON()}]`, ...args);
  });
};

addTimeToMethods();
