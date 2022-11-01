import React, { CSSProperties, useState, useEffect } from 'react';
import { StyleSheet, View, Image, ImageProps, ImageURISource } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';

import { isWeb } from '../config';
import { useStores } from '../mobx/useStores';

const INITIAL_ASPECT_RATIO = 4 / 3;

const createStyles = () => {
  const styles = StyleSheet.create({
    loadingIndicator: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    image: {
      width: '100%',
      marginBottom: 16,
    },
  });

  return styles;
};

export const ImageWithActivityIndicator = (props: ImageProps): JSX.Element =>
  useObserver(() => {
    const styles = createStyles();
    const { maintenance } = useStores();
    const [isLoading, setIsLoading] = useState(false);
    const [aspectRatio, setAspectRatio] = useState(INITIAL_ASPECT_RATIO);

    const imageUrl = (props.source as ImageURISource)?.uri;
    useEffect(() => {
      aspectRatio === INITIAL_ASPECT_RATIO && maintenance.setIsImageUploadInProgress(true);
      if (imageUrl) {
        Image.getSize(imageUrl, (width: number, height: number) => {
          setAspectRatio(width / height);
        });
        aspectRatio !== INITIAL_ASPECT_RATIO && maintenance.setIsImageUploadInProgress(false);
      }
    }, [isLoading, aspectRatio]);

    const getWebStyle = () => {
      const styleObj = props.style as { [key: string]: any };
      return { ...styleObj } as CSSProperties;
    };

    return (
      <View>
        {isWeb ? (
          <img
            src={(props.source as ImageURISource)?.uri}
            style={getWebStyle()}
            alt=""
            onLoadStart={() => setIsLoading(true)}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        ) : (
          <Image
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            {...props}
            style={{ ...styles.image, aspectRatio }}
          />
        )}
        <ActivityIndicator style={styles.loadingIndicator} size="large" animating={isLoading} />
      </View>
    );
  });
