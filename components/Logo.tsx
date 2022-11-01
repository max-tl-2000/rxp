import React, { Component } from 'react';
import { StyleSheet, Image, ImageStyle, ImageSourcePropType } from 'react-native';
import { observable, action } from 'mobx';
import { Observer } from 'mobx-react-lite';
import ImageLogo from '../assets/images/appLoginIcon.png';

interface Styles {
  logo: ImageStyle;
}

const createStyles = ({ width, height }: { width: number | undefined; height: number | undefined }) => {
  const h = height ?? 86;
  const w = width ?? 86;
  const baseStyles: Styles = {
    logo: {
      resizeMode: 'contain',
      height: h > 256 ? 256 : h,
      width: w > 256 ? 256 : w,
      marginBottom: 16,
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

interface LogoProps {
  source: string;
}

export class Logo extends Component<LogoProps> {
  @observable
  imageWidth: number | undefined;

  @observable
  imageHeight: number | undefined;

  constructor(props: LogoProps) {
    super(props);

    this.checkImageSize();
  }

  componentDidUpdate(prevProps: LogoProps) {
    const { source } = this.props;
    if (source !== prevProps.source) {
      this.checkImageSize();
    }
  }

  get source() {
    const { source } = this.props;
    return source ? { uri: source } : ImageLogo;
  }

  checkImageSize = () => {
    if (this.source.uri) {
      Image.getSize(this.source.uri, this.setDimensions, this.handleError);
    }
  };

  handleError = () => {
    this.setDimensions(86, 86);
  };

  @action
  setDimensions = (width: number, height: number) => {
    this.imageWidth = width;
    this.imageHeight = height;
  };

  render() {
    return (
      <Observer>
        {() => {
          const styles = createStyles({ width: this.imageWidth, height: this.imageWidth });
          return <Image style={styles.logo} source={this.source as ImageSourcePropType} resizeMode="contain" />;
        }}
      </Observer>
    );
  }
}
