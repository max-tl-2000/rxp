import React, { useState } from 'react';
import { FlatList as RNFlatList, FlatListProps as RNFlatListProps } from 'react-native';

interface FlatListProps<ItemT> extends RNFlatListProps<ItemT> {
  onVerticalScroll?(scrolledDown: boolean): void;
}

const scrollThrottleDuration = 200;
const offsetBuffer = 100;

export const FlatList = ({ onVerticalScroll, ...props }: FlatListProps<any>) => {
  const [verticalOffset, setVerticalOffset] = useState(0);

  const onScroll = ({ nativeEvent }: any) => {
    const newOffset = nativeEvent.contentOffset.y;

    const isOutsideOfBounds = newOffset > nativeEvent.contentSize.height || newOffset < 0;
    if (isOutsideOfBounds) return;

    const isRelevantScroll =
      newOffset > verticalOffset + offsetBuffer || newOffset < verticalOffset - offsetBuffer || newOffset === 0;

    const scrolledDown = newOffset > verticalOffset;

    if (isRelevantScroll && onVerticalScroll) onVerticalScroll(scrolledDown);

    setVerticalOffset(newOffset);
  };

  return <RNFlatList {...props} onScroll={onScroll} scrollEventThrottle={scrollThrottleDuration} />;
};
