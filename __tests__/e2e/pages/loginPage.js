/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { waitForElement, elementIsDisplayed } from '../helpers/helper';

const SELECTOR = '//div[contains(text(), "Click here and we’ll help")]';
const EMAIL_INPUT_FIELD_SELECTOR = '//input[@type="email"]';
const CONTINUE_SELECTOR = '//div[text()="Continue"]';
const PASSWORD_INPUT_FIELD_SELECTOR = '//input[@type="password"]';
const SIGN_IN_SELECTOR = '//div[text()="Sign in"]';
const WELCOME_TO_HOME_FEED_SELECTOR = '//div[text()="Welcome to your home feed"]';

export const openLoginPage = async t => {
  await t.navigateTo('http://localhost:19006/');
  await waitForElement(t, SELECTOR);
};

export const typeEmail = async (t, email) => {
  const emailInputField = await t.$(EMAIL_INPUT_FIELD_SELECTOR);
  await emailInputField.click();
  await emailInputField.clearValue();
  await emailInputField.setValue(email);
};

export const typePassword = async (t, password) => {
  const passwordInputField = await t.$(PASSWORD_INPUT_FIELD_SELECTOR);
  await passwordInputField.click();
  await passwordInputField.clearValue();
  await passwordInputField.setValue(password);
};

export const clickOnContinue = async t => {
  const continueButton = await t.$(CONTINUE_SELECTOR);
  await continueButton.click();
};

export const clickOnSignIn = async t => {
  const signInButton = await t.$(SIGN_IN_SELECTOR);
  await signInButton.click();
};

export const homeFeedIsDisplayed = t => {
  return elementIsDisplayed(t, WELCOME_TO_HOME_FEED_SELECTOR);
};
