import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { List, Text } from 'react-native-paper';
import { Observer } from 'mobx-react-lite';
import { useStores } from '../mobx/useStores';
import { ThemeColors } from '../helpers/theme';
import { isProd, domain } from '../config';
import { PropertyEntry } from '../mobx/stores/userSettings';
import { getLogoForProperty } from '../helpers/branding-helper';
import { useAppTheme } from '../hooks/use-app-theme';

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    containerBackgroundColor: {
      backgroundColor: themeColors.navDrawerHeader,
      color: themeColors.onPrimary,
    },
    containerMarginBottom: {
      marginBottom: 4,
    },
    containerLayerBackgroundColor: {
      backgroundColor: themeColors.navDrawerOverlay,
    },
    containerLayerPadding: {
      padding: 16,
    },
    title: {
      color: themeColors.onPrimary,
      fontSize: 14,
      lineHeight: 24,
      paddingBottom: 0,
      letterSpacing: 0.01,
    },
    description: {
      color: themeColors.onPrimary,
      lineHeight: 16,
      fontSize: 14,
    },
    propertyImage: {
      height: 40,
      width: 40,
      alignSelf: 'center',
    },
    itemTitle: {
      color: themeColors.placeholder,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.02,
    },
    itemDescription: {
      color: themeColors.text,
      fontSize: 15,
      lineHeight: 24,
      letterSpacing: 0.01,
    },
  });
  return styles;
};

const tenantInfo = (tenantName: string | undefined) => `${tenantName}.${domain}`;

export const PropertyMenuList = (props: any): JSX.Element => {
  const { colors: themeColors, theme } = useAppTheme();
  const styles = createStyles(themeColors);

  const { onItemPress, onTogglePropertyMenu, expanded } = props;

  const { userSettings, auth, messages: messagesStore } = useStores();

  if (!userSettings) {
    return <></>;
  }

  const titleHelper = (propertyName: string | undefined) => `${auth?.user?.fullName}\n${propertyName}`;

  if (userSettings?.data?.properties?.length === 1) {
    return (
      <View style={[styles.containerBackgroundColor, styles.containerMarginBottom]}>
        <View style={[styles.containerLayerBackgroundColor, styles.containerLayerPadding]}>
          <Observer>
            {() => {
              const { propertySelected } = userSettings;

              return (
                <>
                  <Text style={styles.title}>{titleHelper(propertySelected?.propertyName)}</Text>
                  {!isProd && <Text style={styles.description}>{tenantInfo(propertySelected?.tenantName)}</Text>}
                </>
              );
            }}
          </Observer>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.containerBackgroundColor]}>
      <View style={[styles.containerLayerBackgroundColor]}>
        <Observer>
          {() => {
            const { properties = [] } = userSettings.data;
            const { propertySelected } = userSettings;

            const handleItemPress = (property: PropertyEntry) => {
              userSettings.setSelectedPropertyId(property.propertyId);
              messagesStore.setMessagesLoaded(false);
              onItemPress?.();
            };

            return (
              <List.Accordion
                title={titleHelper(propertySelected?.propertyName)}
                titleNumberOfLines={2}
                expanded={expanded}
                titleStyle={styles.title}
                onPress={onTogglePropertyMenu}
                description={!isProd && tenantInfo(propertySelected?.tenantName)}
                descriptionStyle={styles.description}
                theme={{ colors: { text: themeColors.text } }}
              >
                {properties.map((property: PropertyEntry) => {
                  const isActive = property.propertyId === propertySelected?.propertyId;

                  const { propertyId, tenantName } = property;

                  return (
                    <List.Item
                      onPress={() => handleItemPress(property)}
                      key={property.propertyId}
                      title={`${property?.propertyCity}, ${property?.propertyState}`}
                      titleStyle={styles.itemTitle}
                      description={`${property.propertyName}${!isProd ? tenantInfo(`\n${property.tenantName}`) : ''}`}
                      descriptionStyle={styles.itemDescription}
                      style={{ backgroundColor: isActive ? themeColors.background : themeColors.surface }}
                      left={() => (
                        <Image
                          style={styles.propertyImage}
                          source={{ uri: getLogoForProperty({ propertyId, tenantName, theme }) }}
                        />
                      )}
                    />
                  );
                })}
              </List.Accordion>
            );
          }}
        </Observer>
      </View>
    </View>
  );
};
