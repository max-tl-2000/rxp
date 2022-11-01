/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
type IInjectStylesArguments = {
  id: string;
  styles: string;
};

export const injectStyles = ({ id, styles }: IInjectStylesArguments): void => {
  if (!id) throw new Error('missing id parameter');

  let style: HTMLElement | null = document.getElementById(id);

  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('id', id);

    document.head.appendChild(style);
  }

  style.innerHTML = styles;
};
