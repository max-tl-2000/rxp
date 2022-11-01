/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { observable, action, computed } from 'mobx';

type AsyncFn = {
  (...args: any[]): Promise<any>;
};

type PromiseStatus = 'initial' | 'success' | 'error' | 'loading';

export type ErrorResponse = {
  token: string;
  data?: any;
  message?: string;
};

export class ObservablePromiseState {
  @observable
  promise?: Promise<any>;

  @observable
  promiseError?: ErrorResponse;

  @observable
  promiseResponse: any;

  @observable
  status: PromiseStatus = 'initial';

  @action
  setStatus = (value: PromiseStatus) => {
    this.status = value;
  };

  @computed
  get loading(): boolean {
    return this.status === 'loading';
  }

  @computed
  get success(): boolean {
    return this.status === 'success';
  }

  @computed
  get failed(): boolean {
    return this.status === 'error';
  }

  @computed
  get error(): any {
    return this.promiseError;
  }

  @computed
  get response(): any {
    return this.promiseResponse;
  }

  @computed
  get responseData(): any {
    // if the response has a data field. Use it
    // if the response does not have it use it
    return (this.promiseResponse as any)?.data ?? this.promiseResponse;
  }

  @action
  setError = (error: any) => {
    this.promiseError = error;
    this.setStatus('error');
  };

  @action
  setResult = (resultData: any) => {
    this.setStatus('success');
    this.promiseResponse = resultData;
  };

  @action
  execCall = async (asyncFn: AsyncFn) => {
    try {
      this.setStatus('loading');
      const p = asyncFn();

      this.promise = p;

      const result = await p;

      if (result.error) {
        this.setError(result.error);
        return;
      }

      const resultData = result;

      if (resultData) {
        this.setResult(resultData);
      }
    } catch (err) {
      this.setError(err);
    }
  };

  constructor(asyncFn: AsyncFn) {
    this.execCall(asyncFn);
  }
}

export const observePromise = (asyncFn: AsyncFn): ObservablePromiseState => {
  const ret = new ObservablePromiseState(asyncFn);
  return ret;
};
