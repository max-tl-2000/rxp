/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { Subject } from 'rxjs';

const subjects: { [key: string]: Subject<any> } = {};

const createSubject = (eventName: string) => {
  if (!subjects[eventName]) {
    subjects[eventName] = new Subject();
  }
};

const next = (eventName: string, value?: any) => {
  createSubject(eventName);
  subjects[eventName].next(value);
};

const subscribe = (
  eventName: string,
  onValue: (value: any) => void,
  onError: (error: any) => void = () => {},
  onComplete: () => void = () => {},
) => {
  createSubject(eventName);
  const observer = { next: onValue, error: onError, complete: onComplete };
  return subjects[eventName].subscribe(observer);
};

export const mediator = () => {
  return {
    next,
    subscribe,
  };
};
