import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { colors } from '../constants/colors';
import splash from '../assets/images/splash.png';
import { screenWidth, screenHeight } from '../helpers/window-size-tracker';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splash: {
    width: screenWidth,
    height: screenHeight,
  },
  activityIndicatorContainer: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
  },
});

export const SplashScreen = ({ showActivityIndicator }: { showActivityIndicator: boolean }) => {
  return (
    <View style={styles.container}>
      <Image source={splash} style={styles.splash} resizeMode="cover" />
      {showActivityIndicator && (
        <View style={styles.activityIndicatorContainer}>
          <ActivityIndicator color={colors.white} />
        </View>
      )}
    </View>
  );
};
