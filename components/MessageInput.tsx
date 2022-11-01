import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-paper';
import { AutoGrowTextInput } from 'react-native-auto-grow-textinput';

import { Send } from '../helpers/icons';
import { withOpacity } from '../helpers/typography';
import { colors } from '../constants/colors';
import { injectStyles } from '../helpers/inject-styles';
import { isWeb } from '../config';
import { t } from '../i18n/trans';

if (isWeb) {
  injectStyles({
    id: 'textarea-fix',
    styles: `
      [data-c="textarea"]:focus { outline: none }
    `,
  });
}

const baseStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 50,
    borderTopWidth: 1,
    borderTopColor: withOpacity(colors.black, 0.12),
    paddingLeft: 16,
    backgroundColor: colors.white,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    marginBottom: 10,
    marginTop: 10,
    maxHeight: 80,
    paddingHorizontal: 5,
  },
  icon: {
    backgroundColor: colors.transparent,
    marginRight: 15,
    marginLeft: 15,
  },
  btnSend: {
    height: 50,
    width: 50,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

if (isWeb) {
  baseStyles.textInput = {
    ...baseStyles.textInput,
    ...{
      marginTop: 10,
      marginBottom: 3,
      paddingBottom: 10,
      maxHeight: 75,
    },
  };
}

const styles = StyleSheet.create(baseStyles as StyleSheet.NamedStyles<any>);

interface MessageInputProps {
  onSendMessage(message: string): void;
}

export const MessageInput = ({ onSendMessage }: MessageInputProps): JSX.Element => {
  const [message, setMessage] = useState('');
  const handleSendMessage = () => {
    if (!message) {
      return;
    }
    onSendMessage(message.trim());
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <AutoGrowTextInput
        data-c="textarea"
        style={styles.textInput}
        numberOfLines={5}
        placeholder={t('MESSAGE')}
        keyboardType="default"
        value={message}
        onChangeText={setMessage}
      />
      <View style={styles.btnSend}>
        <TouchableOpacity onPress={handleSendMessage}>
          <Avatar.Icon size={24} icon={() => Send({ fill: colors.messengerBlue })} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
