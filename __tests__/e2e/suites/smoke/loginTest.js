/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { newBrowser } from '../../helpers/driver';
import {
  openLoginPage,
  typeEmail,
  clickOnContinue,
  typePassword,
  clickOnSignIn,
  homeFeedIsDisplayed,
} from '../../pages/loginPage';
import { USER_EMAIL, USER_PASSWORD } from '../../helpers/config';

let t;

beforeAll(async () => {
  t = await newBrowser;
  await openLoginPage(t);
});

afterAll(async () => {
  await t.deleteSession();
});

describe('TEST-1670 Login Page Tests', () => {
  it(`A user can log in with correct credentials`, async () => {
    await typeEmail(t, USER_EMAIL);
    await clickOnContinue(t);
    await typePassword(t, USER_PASSWORD);
    await clickOnSignIn(t);

    expect(await homeFeedIsDisplayed(t)).toBeTruthy();
  }, 10000);
});
