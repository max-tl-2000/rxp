import React, { Component, CSSProperties } from 'react';
import {
  StyleSheet,
  Image,
  ImageStyle,
  ImageResizeMode,
  ImageSourcePropType,
  View,
  ViewStyle,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  ImageErrorEventData,
  ImageURISource,
} from 'react-native';
import { observable, action, computed, reaction, IReactionDisposer } from 'mobx';
import { Observer } from 'mobx-react-lite';
import { ActivityIndicator } from 'react-native-paper';
import { getImageFromCloudinary } from '../helpers/cloudinary';
import { Text } from './Typography';
import { useAppTheme } from '../hooks/use-app-theme';
import { ThemeColors } from '../helpers/theme';
import { colors as constantColors } from '../constants/colors';

import { isWeb } from '../config';

interface Styles {
  picture: ImageStyle;
  loadingIndicator: ViewStyle;
  wrapper: ViewStyle;
  wrapperLoaded: ViewStyle;
  errorWrapper: ViewStyle;
}

type CssNum = string | number | undefined;

const getImageSize = (src: string) => {
  return new Promise((resolve, reject) => {
    Image.getSize(src, (width, height) => resolve({ width, height }), reject);
  });
};

const webImageStyles = { width: '100%', resizeMode: 'contain' };

const createStyles = (width: CssNum, height: CssNum, resizeMode: ImageResizeMode, colors?: ThemeColors) => {
  const baseStyles: Styles = {
    picture: {
      width,
      height,
      resizeMode,
    },
    loadingIndicator: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    wrapper: {
      position: 'relative',
      backgroundColor: colors?.backgroundSecondary ?? '#eee',
      minHeight: 50,
      minWidth: 60,
      width: '100%',
    },
    wrapperLoaded: {
      backgroundColor: constantColors.transparent,
    },
    errorWrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

interface PictureProps {
  src: string;
  style?: ImageStyle;
  width?: string | number | undefined;
  height?: string | number | undefined;
  aspectRatio?: number | undefined;
  wrapperStyle?: ViewStyle;
  resizeMode?: ImageResizeMode;
  resizeMethod?: 'auto' | 'resize' | 'scale';
  sizeScale?: string;
  errorText?: string;
  colors?: ThemeColors;
  shouldFit?: boolean;
  autoCrop?: string;
}

class PictureComp extends Component<PictureProps> {
  @observable
  loading = false;

  @observable
  imageWidth: number | undefined;

  @observable
  imageHeight: number | undefined;

  @observable
  calculatedWidth: number | undefined;

  @observable
  observableAspectRatio?: number | undefined;

  stopReaction: IReactionDisposer | undefined;

  sizesCache: any = {};

  @observable
  observableSrc?: string;

  @observable
  skipCloudinary = false;

  @observable
  error: any;

  @observable
  observableFit?: boolean;

  @observable
  observableAutoCrop?: string;

  static defaultProps = {
    errorText: 'Image failed to load',
  };

  constructor(props: PictureProps) {
    super(props);

    this.syncProps(props);

    // IMPORTANT!!
    // this should had been a computed
    // but since we need to get the previous calculated width to
    // check if we need to update the calculatedWidth or not
    // doing it as a reaction we avoid having to add intermediate
    // variable to have the previous calculated widths
    this.stopReaction = reaction(
      () => {
        const { imageWidth: width } = this;
        return { width };
      },
      ({ width }) => {
        const cWidth = width ?? 320;

        if ((this?.calculatedWidth ?? 0) > cWidth) return;

        if (cWidth < 320) {
          this.setCalculatedWidth(320);
          return;
        }

        if (cWidth < 480) {
          this.setCalculatedWidth(480);
          return;
        }

        this.setCalculatedWidth(640);
      },
    );
  }

  componentDidUpdate(prevProps: Partial<PictureProps>) {
    const { src } = this.props;
    const { src: prevSrc } = prevProps;
    if (src !== prevSrc) {
      this.syncProps(this.props);
    }
  }

  componentWillUnmount() {
    this.sizesCache = {}; // make sure to avoid leaks
    this.stopReaction?.();
  }

  @action
  setCalculatedWidth = (value: number) => {
    if (value === this.calculatedWidth) return;
    this.calculatedWidth = value;
  };

  @computed
  get width() {
    return this.imageWidth;
  }

  @computed
  get height() {
    const { observableAspectRatio, width } = this;

    if (observableAspectRatio && width) {
      return width / observableAspectRatio;
    }

    return this.imageHeight;
  }

  @computed
  get source() {
    const src = this.observableSrc;

    if (!src) {
      return { uri: '' };
    }

    if (src.match(/^data:/)) {
      // do not transform data:image sources
      return { uri: src };
    }

    const { skipCloudinary } = this;
    return {
      uri: skipCloudinary
        ? src
        : getImageFromCloudinary(src, {
            width: this.calculatedWidth,
            aspectRatio: this.observableAspectRatio,
            fit: this.observableFit,
            gravity: this.observableAutoCrop,
          }),
    };
  }

  @action
  syncProps = (props: Partial<PictureProps>) => {
    this.observableSrc = props.src;
    this.skipCloudinary = false; // attempt to load again using cloudinary
    this.observableAspectRatio = props.aspectRatio;
    this.observableFit = props.shouldFit;
    this.observableAutoCrop = props.autoCrop;
  };

  @action
  startLoading = () => {
    this.loading = true;
  };

  @action
  stopLoading = () => {
    this.loading = false;
  };

  @action
  handleLayoutChange = (e: LayoutChangeEvent) => {
    const { nativeEvent } = e;
    const { layout } = nativeEvent;
    const { width, height } = layout;

    this.imageWidth = width;
    this.imageHeight = height;

    this.checkImageSize();
  };

  @action
  setDimensions = (width: number, height: number) => {
    if (!this.imageWidth) return;

    const { sizeScale = '100%' } = this.props;
    const sizeScaleNumber = Math.min(parseInt(sizeScale, 10) / 100, 1.0);

    const ratio = this.imageWidth / width;
    this.imageHeight = height * ratio * sizeScaleNumber;
  };

  loadImageDimensions = (src: string) => {
    const p = this.sizesCache[src];

    if (p) {
      return p;
    }

    const promise = getImageSize(src);

    this.sizesCache[src] = promise;

    promise.catch(() => {
      this.sizesCache[src] = null; // remove the cached promise in case of failure
    });

    return promise;
  };

  @action
  checkImageSize = async () => {
    if (this.source.uri) {
      const { width, height } = await this.loadImageDimensions(this.source.uri);

      this.setDimensions(width, height);
    }
  };

  @action
  tryWithoutCloudinary = (error: NativeSyntheticEvent<ImageErrorEventData>) => {
    if (this.skipCloudinary) {
      this.error = error;
      return;
    }
    this.skipCloudinary = true;
  };

  renderError = (styles: Styles) => {
    const { errorText } = this.props;
    return (
      <View style={styles.errorWrapper}>
        <Text>{errorText}</Text>
      </View>
    );
  };

  render() {
    const {
      style,
      wrapperStyle,
      width: propWidth,
      height: propHeight,
      resizeMethod,
      resizeMode = 'contain',
      colors,
    } = this.props;

    const getWebStyle = () => ({ ...webImageStyles, ...style } as CSSProperties);

    return (
      <Observer>
        {() => {
          const { colors: themeColors } = useAppTheme();
          const { width, height } = this;
          const styles = createStyles(propWidth ?? width, propHeight ?? height, resizeMode, colors);
          const { loading, error } = this;
          return (
            <View
              style={[styles.wrapper, wrapperStyle, !loading && styles.wrapperLoaded]}
              onLayout={this.handleLayoutChange}
            >
              {isWeb ? (
                <img
                  src={(this.source as ImageURISource)?.uri}
                  style={getWebStyle()}
                  alt=""
                  onLoadStart={() => this.startLoading}
                  onLoad={() => this.stopLoading}
                  onError={() => this.tryWithoutCloudinary}
                />
              ) : (
                <Image
                  resizeMethod={resizeMethod}
                  style={[styles.picture, style]}
                  onLoadStart={this.startLoading}
                  onError={this.tryWithoutCloudinary}
                  onLoadEnd={this.stopLoading}
                  source={this.source as ImageSourcePropType}
                />
              )}
              {error && this.renderError(styles)}
              {loading && (
                <ActivityIndicator
                  style={styles.loadingIndicator}
                  color={themeColors.loadingImageCircle}
                  size="small"
                  animating={loading}
                />
              )}
            </View>
          );
        }}
      </Observer>
    );
  }
}

export const Picture = (props: PictureProps) => {
  const { colors } = useAppTheme();

  return <PictureComp {...props} colors={colors} />;
};
