import React from 'react';
import { ViewStyle, StyleSheet, ImageStyle, View } from 'react-native';
import { Button } from 'react-native-paper';

import { FlatList } from './FlatList';
import { t } from '../i18n/trans';
import { ImageAttachment } from '../mobx/forms/maintenanceRequest-form';
import { ImageWithActivityIndicator } from './ImageWithActivityIndicator';
import { isDeviceAndroid, isDeviceIOS } from '../config';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';

interface Styles {
  imageContainer: ViewStyle;
  image: ImageStyle;
  removeButton: ViewStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const removeButtonStyles = StyleSheet.create({
    label: {
      textAlign: 'right',
      marginHorizontal: 0,
      color: themeColors.secondary,
    },
  });

  return removeButtonStyles;
};

const styles: Styles = {
  // don't use Stylesheet.create here, it breaks the image style for web
  imageContainer: {
    marginTop: 18,
    width: '100%',
  },
  image: {
    width: '100%',
    resizeMode: 'contain',
  },
  removeButton: {
    alignSelf: 'flex-end',
    width: 100,
    alignItems: 'flex-end',
  },
};

type ImageAttachmentListPropTypes = {
  images: ImageAttachment[];
  onRemove: (image: ImageAttachment) => void;
};

export const ImageAttachmentList = (props: ImageAttachmentListPropTypes) => {
  const { images, onRemove } = props;

  const { colors: themeColors } = useAppTheme();
  const removeButtonStyles = createStyles(themeColors);

  const renderItem = ({ item }: { item: ImageAttachment }) => {
    return (
      <View style={styles.imageContainer} key={item.uri}>
        <ImageWithActivityIndicator style={styles.image} source={{ uri: item.uri }} />
        <Button style={styles.removeButton} labelStyle={removeButtonStyles.label} onPress={() => onRemove(item)}>
          {t('REMOVE')}
        </Button>
      </View>
    );
  };

  return (
    <>
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item: any, index: number) => item.uri + index}
        scrollEnabled={isDeviceAndroid || isDeviceIOS}
      />
    </>
  );
};
