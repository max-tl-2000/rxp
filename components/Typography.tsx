import React, { ReactNode } from 'react';
import { StyleSheet, TextStyle, TextProps } from 'react-native';
import {
  Text as PaperText,
  Title as PaperTitle,
  Subheading as PaperSubheading,
  Paragraph as PaperParagraph,
  Headline as PaperHeadline,
  Caption as PaperCaption,
} from 'react-native-paper';
import { fontDefinition } from '../helpers/fonts';

const styles = StyleSheet.create({
  /* eslint-disable react-native/no-unused-styles */
  thin: {
    ...(fontDefinition.thin as TextStyle),
  },
  light: {
    ...(fontDefinition.light as TextStyle),
  },
  regular: {
    ...(fontDefinition.regular as TextStyle),
  },
  medium: {
    ...(fontDefinition.medium as TextStyle),
  },
  bold: {
    ...(fontDefinition.bold as TextStyle),
  },
  italic: {
    ...(fontDefinition.italic as TextStyle),
  },
  /* eslint-enable react-native/no-unused-styles */
});

type FontWeight = 'thin' | 'light' | 'regular' | 'medium' | 'bold';

type FontStyle = 'italic';

export interface TypographyProps extends TextProps {
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  children: ReactNode;
}

const getWeightStyle = (weight?: FontWeight) => {
  if (!weight) return {};
  return styles[weight];
};

const getFontStyle = (style?: FontStyle) => {
  if (!style) return {};
  return styles[style];
};

export const Text = ({ children, style, fontWeight, fontStyle, ...props }: TypographyProps) => (
  <PaperText style={[style, getWeightStyle(fontWeight), getFontStyle(fontStyle)]} {...props}>
    {children}
  </PaperText>
);

export const Title = ({ children, style, fontWeight, fontStyle, ...props }: TypographyProps) => (
  <PaperTitle style={[style, getWeightStyle(fontWeight), getFontStyle(fontStyle)]} {...props}>
    {children}
  </PaperTitle>
);

export const Subheading = ({ children, style, fontWeight, fontStyle, ...props }: TypographyProps) => (
  <PaperSubheading style={[style, getWeightStyle(fontWeight), getFontStyle(fontStyle)]} {...props}>
    {children}
  </PaperSubheading>
);

export const Headline = ({ children, style, fontWeight, fontStyle, ...props }: TypographyProps) => (
  <PaperHeadline style={[style, getWeightStyle(fontWeight), getFontStyle(fontStyle)]} {...props}>
    {children}
  </PaperHeadline>
);

export const Caption = ({ children, style, fontWeight, fontStyle, ...props }: TypographyProps) => (
  <PaperCaption style={[style, getWeightStyle(fontWeight), getFontStyle(fontStyle)]} {...props}>
    {children}
  </PaperCaption>
);

export const Paragraph = ({ children, style, fontWeight, fontStyle, ...props }: TypographyProps) => (
  <PaperParagraph style={[style, getWeightStyle(fontWeight), getFontStyle(fontStyle)]} {...props}>
    {children}
  </PaperParagraph>
);
