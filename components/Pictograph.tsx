import React from 'react';

import { useAppTheme } from '../hooks/use-app-theme';
import { Icons } from '../helpers/icons';
import * as icons from '../helpers/icons';
import { isWeb } from '../config';

interface PictographProps {
  type?: PictographType;
}

type PictographType = 'bored' | 'exhausted' | 'question' | 'envelope' | 'speech-bubble';

const getPictographByType = (dark: boolean, type?: PictographType) => {
  switch (type) {
    case 'bored':
      return dark ? 'CharBoredDark' : 'CharBoredLight';
    case 'exhausted':
      return dark ? 'CharExhaustedDark' : 'CharExhaustedLight';
    case 'question':
      return dark ? 'CharQuestionDark' : 'CharQuestionLight';
    case 'envelope':
      return dark ? 'CharEnvelopeDark' : 'CharEnvelopeLight';
    case 'speech-bubble':
      return dark ? 'CharSpeechBubbleDark' : 'CharSpeechBubbleLight';
    default:
      return '';
  }
};

export const Pictograph = ({ type }: PictographProps) => {
  const { dark } = useAppTheme();

  const basePictographName = getPictographByType(dark, type);

  const pictographName = isWeb ? basePictographName : `${basePictographName}Native`;
  const Icon = (icons as Icons)[pictographName as keyof Icons] as Function;

  return <Icon />;
};
