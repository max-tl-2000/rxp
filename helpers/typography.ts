/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
export const withOpacity = (color: string, opacity: number): string => {
  const alpha = Math.round(opacity * 255);
  const alphaHex = (alpha + 0x10000).toString(16).substr(-2).toUpperCase();
  return color + alphaHex;
};

export const withCondition = (condition: boolean, style: Record<string, any>): Record<string, any> | null => {
  return condition ? style : null;
};
