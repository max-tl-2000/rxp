import React, { useEffect } from 'react';
import { TextStyle, StyleProp, Animated, StyleSheet, ViewStyle, View } from 'react-native';
import { Surface, Text, Button, shadow, withTheme } from 'react-native-paper';
import { ThemeColors } from '../helpers/theme';
import { withCondition } from '../helpers/typography';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    container: {
      elevation: 4,
      marginBottom: 12,
    },
    wrapper: {
      overflow: 'hidden',
      alignSelf: 'center',
      width: '100%',
    },
    absolute: {
      position: 'absolute',
      top: 0,
      width: '100%',
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 0,
    },
    noActionsContent: {
      marginBottom: 15,
    },
    message: {
      flex: 1,
      lineHeight: 20,
      letterSpacing: 0.13,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginHorizontal: 4,
    },
    button: {
      margin: 8,
    },
    invisible: {
      opacity: 0,
    },
    buttonLabelStyle: {
      color: themeColors.text,
    },
  });

  return styles;
};

type Props = {
  visible: boolean;
  children: string;
  actions?: {
    label: string;
    onPress: () => void;
  }[];
  textStyle?: StyleProp<TextStyle>;
  theme: ReactNativePaper.Theme;
};

type NativeEvent = {
  nativeEvent: {
    layout: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
};

export const Banner = withTheme(({ visible, children, actions, textStyle, theme }: Props) => {
  const { current: position } = React.useRef<Animated.Value>(new Animated.Value(visible ? 1 : 0));
  const [layout, setLayout] = React.useState<{
    height: number;
    measured: boolean;
  }>({
    height: 0,
    measured: false,
  });

  const { scale } = theme.animation;

  const styles = createStyles(theme.colors as ThemeColors);
  const noActionsContentStyles = withCondition(!actions, styles.noActionsContent);

  useEffect(() => {
    if (visible) {
      // show
      Animated.timing(position, {
        duration: 250 * scale,
        toValue: 1,
        useNativeDriver: false,
      }).start();
    } else {
      // hide
      Animated.timing(position, {
        duration: 200 * scale,
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [visible, position, scale]);

  const handleLayout = ({ nativeEvent }: NativeEvent) => {
    const { height } = nativeEvent.layout;
    setLayout({ height, measured: true });
  };

  // The banner animation has 2 parts:
  // 1. Blank spacer element which animates its height to move the content
  // 2. Actual banner which animates its translateY
  // In initial render, we position everything normally and measure the height of the banner
  // Once we have the height, we apply the height to the spacer and switch the banner to position: absolute
  // We need this because we need to move the content below as if banner's height was being animated
  // However we can't animated banner's height directly as it'll also resize the content inside
  const height = Animated.multiply(position, layout.height);

  const translateY = Animated.multiply(Animated.add(position, -1), layout.height);
  return (
    <Surface style={[visible && styles.container, shadow(4) as ViewStyle]}>
      <View style={styles.wrapper}>
        <Animated.View style={{ height }} />
        <Animated.View
          onLayout={handleLayout}
          style={[
            layout.measured || !visible
              ? // If we have measured banner's height or it's invisible,
                // Position it absolutely, the layout will be taken care of the spacer
                [styles.absolute, { transform: [{ translateY }] }]
              : // Otherwise position it normally
                null,
            !layout.measured && !visible
              ? // If we haven't measured banner's height yet and it's invisible,
                // hide it with opacity: 0 so user doesn't see it
                styles.invisible
              : null,
          ]}
        >
          <View style={[styles.content, noActionsContentStyles]}>
            <Text style={[styles.message, textStyle]}>{children}</Text>
          </View>
          <View style={styles.actions}>
            {!!actions &&
              actions.map(({ label, onPress }) => (
                <Button
                  key={label}
                  compact
                  mode="text"
                  style={styles.button}
                  onPress={onPress}
                  labelStyle={styles.buttonLabelStyle}
                >
                  {label}
                </Button>
              ))}
          </View>
        </Animated.View>
      </View>
    </Surface>
  );
});
