/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
/**
 * focus-fix.
 *
 * Buttons gain focus when they are clicked, this makes some interactions to
 * look weird since the styles for focus/hover are pretty close to each other. So the fix
 * for this issue is to listen to which was the last input method used, if the last one was
 * the mouse, then the focus effects are not rendered. Focus effects are only rendered if the
 * attribute `data-input-method` in the body element is set to `keyboard`. Then we can use
 * some css to show the focus effect only when the keyboard is used.
 *
 * ```
 * [data-input-method="keyboard"] {
 *   button:focus {
 *     background: #eee;
 *   }
 * }
 * ```
 */
import { observable, autorun, action } from 'mobx';
import debounce from 'lodash/debounce';
import { injectStyles } from './inject-styles';
import { isWeb } from '../config';

let fixAdded = false;

export const initFocusFix = () => {
  if (!isWeb || fixAdded) return;
  // create an observable to keep track of the last input method
  const state = observable({ lastInputMethod: 'mouse' });

  const THRESHOLD_TO_SET_INPUT_METHOD = 300;

  // set the value of lastInputMethod
  const handler = debounce(
    action((e: Event) => {
      const eventType = e.type === 'keydown';
      state.lastInputMethod = eventType ? 'keyboard' : 'mouse';
    }),
    THRESHOLD_TO_SET_INPUT_METHOD,
    { leading: true },
  );

  // if lastInputMethod changes change the attribute in the body element
  // autorun is only executed when the value changes so setting lastInputMethod
  // to the same value won't cause the DOM to be modified
  autorun(() => {
    const { lastInputMethod } = state;
    const { body } = document;
    if (!body) return;
    body.setAttribute('data-input-method', lastInputMethod);
  });

  // listen to keydown and mousedown using capture to make sure that
  // we always get the event even when something might interfere with it
  document.addEventListener('keydown', handler, true);
  document.addEventListener('mousedown', handler, true);

  injectStyles({
    id: 'global-focus-fix',
    styles: `
  [data-input-method="mouse"] textarea:focus,
  [data-input-method="mouse"] select:focus,
  [data-input-method="mouse"] input:focus,
  [data-input-method="mouse"] button:focus {
      outline: none;
    }
  `,
  });

  fixAdded = true;
};
