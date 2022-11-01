import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { SettingsScreenNavigationProp } from '../types';
import { Screen } from '../components';

const SettingsIcon = () => <Ionicons name="md-settings" size={24} color="black" />;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
  },
});

interface Props {
  navigation: SettingsScreenNavigationProp;
}

export const Settings = ({ navigation }: Props) => (
  <Screen title="Settings" navigation={navigation}>
    <View style={styles.content}>
      <Avatar.Icon icon={SettingsIcon} />
    </View>
  </Screen>
);
