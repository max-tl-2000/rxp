/*
 * Copyright (c) 2022 Reva Technology Inc., all rights reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Licensed under the Elastic License 2.0; you may not use this file except
 * in compliance with the Elastic License 2.0.
 */
import { Dimensions, ScaledSize } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

export enum Sizes {
  xsmall1 = 'xsmall1',
  xsmall2 = 'xsmall2',
  small1 = 'small1',
  small2 = 'small2',
  medium = 'medium',
  large = 'large',
  xlarge = 'xlarge',
}

const sizeOrders = {
  xsmall1: 0,
  xsmall2: 1,
  small1: 2,
  small2: 3,
  medium: 4,
  large: 5,
  xlarge: 6,
};

const mediaQueries = [
  {
    min: -Infinity,
    max: 480,
    id: Sizes.xsmall1,
  },
  {
    min: 481,
    max: 600,
    id: Sizes.xsmall2,
  },
  {
    min: 601,
    max: 840,
    id: Sizes.small1,
  },
  {
    min: 841,
    max: 960,
    id: Sizes.small2,
  },
  {
    min: 961,
    max: 1264,
    id: Sizes.medium,
  },
  {
    min: 1265,
    max: 1904,
    id: Sizes.large,
  },
  {
    min: 1905,
    max: Infinity,
    id: Sizes.xlarge,
  },
];

let currentSize: Sizes;
let currentOrientation: ScreenOrientation.Orientation;

interface Breakpoint {
  min: number;
  max: number;
  id: Sizes;
}

const matchBreakpoint = (breakpoint: Breakpoint, window: ScaledSize): boolean => {
  return breakpoint.max > window.width && window.width > breakpoint.min;
};

const createBreakpoints = (breakpoints: Breakpoint[], onChange: Function) => {
  breakpoints.forEach(breakpoint => {
    const handleDimensionChange = ({ window }: { window: ScaledSize }) => {
      if (breakpoint.id !== currentSize && matchBreakpoint(breakpoint, window)) {
        currentSize = breakpoint.id;
        onChange(breakpoint.id);
      }
    };
    Dimensions.addEventListener('change', handleDimensionChange);
    handleDimensionChange({ window: Dimensions.get('window') } as { window: ScaledSize });
  });
};

export const initLayoutHelper = (onChange: Function) => {
  createBreakpoints(mediaQueries as Breakpoint[], onChange);
};

export const getScreenSize = () => currentSize;

export const screenIsAtLeast = (sizeIdToCompare: Sizes, sizeId: Sizes) =>
  sizeOrders[sizeIdToCompare] >= sizeOrders[sizeId];

export const screenIsAtMost = (sizeIdToCompare: Sizes, sizeId: Sizes) =>
  sizeOrders[sizeIdToCompare] <= sizeOrders[sizeId];

export const screenIsShorterThan = (sizeIdToCompare: Sizes, sizeId: Sizes) =>
  sizeOrders[sizeIdToCompare] < sizeOrders[sizeId];

export const screenIsGreaterThan = (sizeIdToCompare: Sizes, sizeId: Sizes) =>
  sizeOrders[sizeIdToCompare] > sizeOrders[sizeId];

export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;

export const screenWidth = Dimensions.get('screen').width;
export const screenHeight = Dimensions.get('screen').height;

export const getDefaultOrientation = () => {
  const dim = Dimensions.get('screen');
  return dim.height >= dim.width
    ? ScreenOrientation.Orientation.PORTRAIT_UP
    : ScreenOrientation.Orientation.LANDSCAPE_LEFT;
};

export const getOrientation = async () => {
  const theOrientation = await ScreenOrientation.getOrientationAsync();
  if (theOrientation === ScreenOrientation.Orientation.UNKNOWN) {
    return getDefaultOrientation();
  }
  return theOrientation;
};

export const initOrientationHelper = async (onChange: Function) => {
  currentOrientation = await getOrientation();
  const onOrientationChange = ({ orientationInfo: { orientation } }: ScreenOrientation.OrientationChangeEvent) => {
    currentOrientation = orientation;
    const breakpoints = mediaQueries as Breakpoint[];
    const window = Dimensions.get('window') as ScaledSize;
    const breakpoint = breakpoints.find(b => matchBreakpoint(b, window));
    if (!breakpoint) return;
    currentSize = breakpoint.id;
    onChange(breakpoint.id, currentOrientation);
  };

  ScreenOrientation.addOrientationChangeListener(onOrientationChange);
};
