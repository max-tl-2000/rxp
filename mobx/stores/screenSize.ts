/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { computed, observable, action } from 'mobx';
import { Orientation } from 'expo-screen-orientation';
import {
  screenIsAtLeast,
  initLayoutHelper,
  initOrientationHelper,
  Sizes,
  getDefaultOrientation,
} from '../../helpers/window-size-tracker';

export class Screen {
  @observable
  size: Sizes = Sizes.small1;

  @observable
  orientation: Orientation = getDefaultOrientation();

  @action
  setSize = (size: Sizes) => {
    this.size = size;
  };

  @action
  setOrientation = (orientation: Orientation) => {
    this.orientation = orientation;
  };

  @computed
  get matchXSmall1() {
    return screenIsAtLeast(this.size, Sizes.xsmall1);
  }

  @computed
  get matchXSmall2() {
    return screenIsAtLeast(this.size, Sizes.xsmall2);
  }

  @computed
  get matchSmall1() {
    return screenIsAtLeast(this.size, Sizes.small1);
  }

  @computed
  get matchSmall2() {
    return screenIsAtLeast(this.size, Sizes.small2);
  }

  @computed
  get matchMedium() {
    return screenIsAtLeast(this.size, Sizes.medium);
  }

  @computed
  get matchLarge() {
    return screenIsAtLeast(this.size, Sizes.large);
  }

  @computed
  get matchXLarge() {
    return screenIsAtLeast(this.size, Sizes.xlarge);
  }

  @computed
  get isLandscape() {
    return this.orientation === Orientation.LANDSCAPE_LEFT || this.orientation === Orientation.LANDSCAPE_RIGHT;
  }
}

export const getScreenSizeStore = () => {
  const screen = new Screen();

  initLayoutHelper((size: Sizes) => {
    screen.setSize(size);
  });

  initOrientationHelper((size: Sizes, orientation: Orientation) => {
    screen.setOrientation(orientation);
    screen.setSize(size);
  });
  return screen;
};
