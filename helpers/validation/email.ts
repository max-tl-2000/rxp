/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { EMAIL_ADDRESS, EMAIL_REGEX_VALIDATOR } from '../regex';

export const isEmailValid = (email: string, strict = true) => {
  if (!email) return false;

  if (email.length > 254) return false;

  let valid = EMAIL_ADDRESS.test(email);

  if (strict) {
    valid = valid && EMAIL_REGEX_VALIDATOR.test(email);
  }

  if (!valid) return false;

  const parts = email.split('@');
  if (parts[0].length > 64) return false;

  const domainParts = parts[1].split('.');
  if (domainParts.some(part => part.length > 63)) return false;

  return true;
};
