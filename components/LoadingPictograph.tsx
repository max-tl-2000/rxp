import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Pictograph } from './Pictograph';
import { Loading } from './Loading';

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  row: {
    position: 'absolute',
    left: '50%',
    marginLeft: 44,
    top: '50%',
    marginTop: -139,
  },
});

interface LoadingProps {
  message?: string;
}

export const LoadingPictograph = ({ message }: LoadingProps) => {
  return (
    <View style={styles.content}>
      <Loading message={message} />
      <View style={styles.row}>
        <Pictograph type="bored" />
      </View>
    </View>
  );
};
