/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
export const EMAIL_REGEX_VALIDATOR = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-?\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/; // eslint-disable-line no-useless-escape
export const EMAIL_ADDRESS = /[a-z0-9](\.?[a-z0-9+_-]){0,}@([a-z0-9_-]+\.){1,}([a-z]{2,4})/i;
export const HTML_BREAK_LINES = /(\r\n|\n|\r)/gm;
