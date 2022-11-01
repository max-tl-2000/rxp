import React, { ReactNode, useEffect } from 'react';
import { ViewProps, Animated, Easing, StyleSheet } from 'react-native';

import { duration } from '../constants/duration';

interface ExpandableViewProps extends ViewProps {
  expanded: boolean;
  children: ReactNode[] | ReactNode;
  height?: number;
}

const styles = StyleSheet.create({
  view: {
    overflow: 'hidden',
  },
});

const defaultHeight = 100;

export const ExpandableView = ({ expanded, style, height, ...props }: ExpandableViewProps) => {
  const expandedHeight = (height || defaultHeight) as number;
  const animatedHeight = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const toValue = expanded ? expandedHeight : 0;
    const animation = Animated.timing(animatedHeight, {
      toValue,
      duration: duration.animation,
      easing: Easing.ease,
      useNativeDriver: false,
    });

    animation.start();
    return () => animation.stop();
  }, [expanded]);

  return <Animated.View {...props} style={[style, styles.view, { height: animatedHeight }]} />;
};
