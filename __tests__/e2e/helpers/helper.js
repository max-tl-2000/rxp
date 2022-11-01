/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
export const waitForElement = async (t, selector, timeout) => {
  const elementToWaitFor = await t.$(selector);
  const waitTime = timeout || 5000;
  const elementExists = await elementToWaitFor.waitForExist({ timeout: waitTime });

  if (elementExists) {
    return elementToWaitFor;
  }
  throw new Error(
    `After waiting a total of ${
      waitTime / 1000
    } seconds, no element identified with the selector '${selector}' could be found`,
  );
};

export const elementIsDisplayed = async (t, selector) => {
  const elementToWaitFor = await waitForElement(t, selector, 5000);

  return elementToWaitFor.isDisplayed();
};
