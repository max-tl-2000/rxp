/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
const counters: { [key: string]: number } = {};

export const generateId = (instance: any): string => {
  const name = instance.name || instance.displayName || instance.constructor.name || 'unnamed';

  const counterForName = counters[name] || 0;
  counters[name] = counterForName + 1;

  return `${name}_${counterForName}`;
};
