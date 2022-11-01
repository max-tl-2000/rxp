/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { Observable, Observer } from 'rxjs';
import { bufferTime } from 'rxjs/operators';
import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';

export interface IEventBuffer {
  next: (data: Event) => void;
  unsubscribe: () => void;
}

export interface EventData {
  event: string;
  data: any;
}

export interface Event extends EventData {
  handler: (param: EventData) => void;
}

export interface EventMap {
  [key: string]: Event;
}

const defaultDuration = 2000;

const defaultComparer = (a: Event, b: Event) => {
  const equal = a.event === b.event && isEqual(a.data, b.data);
  return equal;
};

export const initEventBuffer = ({ duration = defaultDuration, comparer = defaultComparer } = {}) => {
  let observer: Observer<Event>;

  const subscription = Observable.create((o: Observer<Event>) => {
    observer = o;
  })
    .pipe(bufferTime(duration))
    .subscribe((bufferedEvents: Event[]) => {
      const eventMap = uniqWith(bufferedEvents, comparer).reduce((acc, bufferedEvent): EventMap => {
        const eventName = bufferedEvent.event;
        if (!acc[eventName]) {
          acc[eventName] = { event: eventName, data: [], handler: bufferedEvent.handler };
        }
        acc[eventName].data.unshift(bufferedEvent.data);
        return acc;
      }, {} as EventMap);
      Object.entries(eventMap).forEach(([key, event]) => event.handler({ event: key, data: event.data }));
    });

  return {
    next: (data: Event) => observer.next(data),
    unsubscribe: () => subscription && subscription.unsubscribe && subscription.unsubscribe(),
  };
};
