import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { List } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';
import { t } from '../i18n/trans';
import { useStores } from '../mobx/useStores';
import { AcknowledgementsScreenNavigationProp } from '../types';
import { Screen, Text, FlatList } from '../components';

interface Props {
  navigation: AcknowledgementsScreenNavigationProp;
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
  },
  accordion: {
    paddingHorizontal: 0,
  },
  accordionTitle: {
    paddingHorizontal: 0,
    marginHorizontal: -5,
  },
  groupItemText: {
    marginLeft: 15,
  },
});

type PackageInfo = {
  email?: string;
  licenseText: string;
  licenses?: string;
  name: string;
  publisher?: string;
  repository: string;
  type: string;
  version: string;
};

type GroupInfo = {
  name: string;
  type: 'group';
  deps: PackageInfo[];
};

type DependencyInfo = GroupInfo | PackageInfo;

export const Acknowledgements = ({ navigation }: Props) =>
  useObserver(() => {
    const { settings } = useStores();

    useEffect(() => {
      settings.loadLicensesInfo();
    }, []);

    const renderHeader = () => (
      <View>
        <Text>{t('ACKNOWLEDGEMENT_MESSAGE')}</Text>
      </View>
    );

    const cleanLicenseText = (licenseText: string) =>
      licenseText
        .trim()
        .replace(/[ ]+/g, ' ')
        .replace(/\n /g, '\n')
        .replace(/\n\n|-\n/g, 'BREAK_LINE')
        .replace(/\n/g, '')
        .replace(/BREAK_LINE/g, '\n\n');

    const renderItem = ({ item, index }: { item: DependencyInfo; index: number }) => {
      return (
        <View>
          {index === 0 && renderHeader()}
          <List.Section>
            <List.Accordion title={item.name} style={styles.accordion} titleStyle={styles.accordionTitle}>
              {item.type !== 'group' && <Text>{cleanLicenseText((item as PackageInfo).licenseText)}</Text>}
              {item.type === 'group' &&
                (item as GroupInfo).deps.map(dep => (
                  <View key={dep.name + dep.version}>
                    <List.Section>
                      <List.Accordion title={dep.name}>
                        <Text style={styles.groupItemText}>{cleanLicenseText((dep as PackageInfo).licenseText)}</Text>
                      </List.Accordion>
                    </List.Section>
                  </View>
                ))}
            </List.Accordion>
          </List.Section>
        </View>
      );
    };

    return (
      <Screen title="Acknowledgements" navigation={navigation} mode="modal">
        <FlatList
          data={settings.licensesInfo}
          renderItem={renderItem}
          keyExtractor={dependency => dependency.name}
          contentContainerStyle={styles.content}
        />
      </Screen>
    );
  });
