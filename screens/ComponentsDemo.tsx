/* eslint-disable no-console */
import * as React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  Portal,
  Dialog,
  FAB,
  IconButton,
  List,
  Menu,
  Divider,
  Modal,
  ProgressBar,
  Colors,
  RadioButton,
  Searchbar,
  Snackbar,
  Surface,
  Switch,
  TextInput,
  ToggleButton,
  Subheading,
  Title,
  Paragraph,
  Headline,
  Caption,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreenNavigationProp } from '../types';
import { Screen } from '../components';
import { ThemeColors } from '../helpers/theme';

import { Select } from '../components/Select';
import { Text } from '../components/Typography';
import { countries } from '../resources/mock-data/countries';
import { useAppTheme } from '../hooks/use-app-theme';
import { t } from '../i18n/trans';

const HomeIcon = () => <Ionicons name="md-home" size={24} color="black" />;

const createStyles = (themeColors: ThemeColors) => {
  const styles = StyleSheet.create({
    scrollView: {
      width: '100%',
    },
    content: {
      padding: 10,
      minWidth: 300,
      alignItems: 'center',
    },
    label: {
      paddingTop: 40,
      paddingBottom: 10,
    },
    space: {
      height: 20,
    },
    card: {
      width: 300,
    },
    list: {
      width: 300,
    },
    modalContentContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: 300,
      height: 400,
      backgroundColor: themeColors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressBar: {
      width: 300,
    },
    surface: {
      padding: 30,
    },
    textInput: {
      width: 300,
    },
    dropdown: {
      width: 300,
    },
  });
  return styles;
};

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const ComponentsDemo = ({ navigation }: Props) => {
  const [isDialogVisible, setIsDialogVisible] = React.useState(false);
  const [isChecked, setIsChecked] = React.useState(true);
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = React.useState(false);
  const [isListExpanded, setIsListExpanded] = React.useState(false);
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [checkedRadionButton, setCheckedRadioButton] = React.useState('first');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSnackbarVisible, setIsSnackbarVisible] = React.useState(false);
  const [isSwitchOn, setIsSwitchOn] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [isToggleButtonChecked, setIsToggleButtonChecked] = React.useState(false);
  const [toggleButtonValue, setToggleButtonValue] = React.useState('left');

  const { colors: themeColors } = useAppTheme();

  const styles = createStyles(themeColors);

  const [selectedValue, setSelectedValue] = React.useState<string>();

  return (
    <Screen title="Components Demo" navigation={navigation} hasInputs>
      <ScrollView contentContainerStyle={styles.content} style={styles.scrollView}>
        <Text style={styles.label}>Custom React Dropdown</Text>

        <Select
          style={styles.dropdown}
          value={selectedValue}
          onChangeText={(value: string) => setSelectedValue(value)}
          label="Select a country"
          data={countries}
        />

        <Text style={styles.label}>{`Selected "${selectedValue}"`}</Text>

        <Text style={styles.label}>Avatar</Text>
        <Avatar.Icon icon={HomeIcon} />

        <Text style={styles.label}>Buttons</Text>
        <Button icon="camera" mode="contained" onPress={() => console.log('Pressed')}>
          Press me
        </Button>
        <View style={styles.space} />
        <Button icon="pen" mode="outlined" onPress={() => console.log('Pressed')}>
          Outlined Button
        </Button>
        <View style={styles.space} />
        <Button mode="text" onPress={() => console.log('Pressed')}>
          Text Button
        </Button>
        <View style={styles.space} />
        <Button mode="text" loading onPress={() => console.log('Pressed')}>
          Button in loading state
        </Button>
        <View style={styles.space} />
        <Button mode="contained" onPress={() => console.log('Pressed')}>
          Contained Button
        </Button>

        <Text style={styles.label}>Badge of size 20</Text>
        <Badge visible size={20}>
          3
        </Badge>

        <Text style={styles.label}>Card</Text>
        <Card style={styles.card}>
          <Card.Title title="Card Title" subtitle="Card Subtitle" />
          <Card.Content>
            <Title>Card title</Title>
            <Paragraph>Card content</Paragraph>
          </Card.Content>
          <Card.Cover source={{ uri: 'https://picsum.photos/700' }} />
          <Card.Actions>
            <Button>Cancel</Button>
            <Button>Ok</Button>
          </Card.Actions>
        </Card>
        <Text style={styles.label}>Checkbox</Text>
        <Checkbox status={isChecked ? 'checked' : 'unchecked'} onPress={() => setIsChecked(!isChecked)} />
        <Text style={styles.label}>Chip</Text>
        <Chip icon="information" onPress={() => console.log('Pressed')}>
          Example Chip
        </Chip>
        <Text style={styles.label}>Dialog</Text>
        <Button onPress={() => setIsDialogVisible(true)}>Show Dialog</Button>
        <Portal>
          <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
            <Dialog.Title>Alert</Dialog.Title>
            <Dialog.Content>
              <Paragraph>This is simple dialog</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setIsDialogVisible(false)}>Done</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <Text style={styles.label}>Floating action button</Text>
        <FAB small icon="plus" onPress={() => console.log('Pressed')} />
        <View style={styles.space} />
        <Portal>
          <FAB.Group
            visible
            open={isFloatingMenuOpen}
            icon={isFloatingMenuOpen ? 'calendar-today' : 'plus'}
            actions={[
              { icon: 'plus', onPress: () => console.log('Pressed add') },
              { icon: 'star', label: 'Star', onPress: () => console.log('Pressed star') },
              { icon: 'email', label: 'Email', onPress: () => console.log('Pressed email') },
              { icon: 'bell', label: 'Remind', onPress: () => console.log('Pressed notification') },
            ]}
            onStateChange={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
            onPress={() => {
              if (isFloatingMenuOpen) {
                // do something if the speed dial is open
              }
            }}
          />
        </Portal>
        <Text style={styles.label}>IconButton</Text>
        <IconButton icon="camera" color={themeColors.primary} size={50} onPress={() => console.log('Pressed')} />
        <List.Section title="Lists" style={styles.list}>
          <List.Accordion
            title="Accordion"
            left={props => <List.Icon {...props} icon="folder" />}
            expanded={isListExpanded}
            onPress={() => setIsListExpanded(!isListExpanded)}
          >
            <List.Item title="First item" />
            <List.Item title="Second item" />
          </List.Accordion>
        </List.Section>
        <List.Section title="Simple List" style={styles.list}>
          <List.Item title="First item" left={props => <List.Icon {...props} icon="camera" />} />
          <List.Item title="Second item" left={props => <List.Icon {...props} icon="file" />} />
        </List.Section>

        <Text style={styles.label}>Menu</Text>
        <Menu
          visible={isMenuVisible}
          onDismiss={() => setIsMenuVisible(false)}
          anchor={<Button onPress={() => setIsMenuVisible(true)}>Show menu</Button>}
        >
          <Menu.Item onPress={() => console.log('pressed')} title="Item 1" />
          <Menu.Item onPress={() => console.log('pressed')} title="Item 2" />
          <Divider />
          <Menu.Item onPress={() => console.log('pressed')} title="Item 3" />
        </Menu>

        <Text style={styles.label}>Modal</Text>
        <Button onPress={() => setIsModalVisible(true)}>Show Modal</Button>
        <Portal>
          <Modal
            visible={isModalVisible}
            onDismiss={() => setIsModalVisible(false)}
            contentContainerStyle={styles.modalContentContainer}
          >
            <View style={styles.modalContent}>
              <Text>Example Modal</Text>
            </View>
          </Modal>
        </Portal>

        <Text style={styles.label}>Progress bar</Text>
        <ProgressBar progress={0.42} color={Colors.red600} style={styles.progressBar} />

        <Text style={styles.label}>Radio Buttons</Text>
        <View>
          <RadioButton
            value="first"
            status={checkedRadionButton === 'first' ? 'checked' : 'unchecked'}
            onPress={() => setCheckedRadioButton('first')}
          />
          <RadioButton
            value="second"
            status={checkedRadionButton === 'second' ? 'checked' : 'unchecked'}
            onPress={() => setCheckedRadioButton('second')}
          />
        </View>

        <Text style={styles.label}>Search Bar</Text>
        <Searchbar placeholder={t('SEARCH')} onChangeText={setSearchQuery} value={searchQuery} />

        <Text style={styles.label}>Snackbar</Text>
        <Button onPress={() => setIsSnackbarVisible(true)}>
          {isSnackbarVisible ? 'Hide Snackbar' : 'Show Snackbar'}
        </Button>
        <Portal>
          <Snackbar
            visible={isSnackbarVisible}
            onDismiss={() => setIsSnackbarVisible(false)}
            action={{
              label: 'Undo',
              onPress: () => console.log('undone!'),
            }}
          >
            Hey there! This is a Snackbar.
          </Snackbar>
        </Portal>

        <Text style={styles.label}>Surface (for depth/dropshadow)</Text>
        <Surface style={styles.surface}>
          <Text>Surface</Text>
        </Surface>

        <Text style={styles.label}>Text Inputs</Text>
        <TextInput
          mode="flat"
          label="Flat input"
          value={email}
          onChangeText={setEmail}
          style={styles.textInput}
          error
        />
        <View style={styles.space} />
        <TextInput mode="outlined" label="Flat input" value={name} onChangeText={setName} style={styles.textInput} />
        <Text style={styles.label}>Switch</Text>
        <Switch value={isSwitchOn} onValueChange={() => setIsSwitchOn(!isSwitchOn)} />

        <Text style={styles.label}>Text Inputs</Text>
        <TextInput mode="flat" label="Flat input" value={email} onChangeText={setEmail} style={styles.textInput} />
        <View style={styles.space} />
        <TextInput mode="outlined" label="Flat input" value={name} onChangeText={setName} style={styles.textInput} />

        <Text style={styles.label}>Toggle Button</Text>
        <ToggleButton
          icon="bluetooth"
          value="bluetooth"
          status={isToggleButtonChecked ? 'checked' : 'unchecked'}
          onPress={() => setIsToggleButtonChecked(!isToggleButtonChecked)}
        />
        <Text style={styles.label}>Toggle Button Row</Text>
        <ToggleButton.Row onValueChange={setToggleButtonValue} value={toggleButtonValue}>
          <ToggleButton icon="format-align-left" value="left" />
          <ToggleButton icon="format-align-right" value="right" />
        </ToggleButton.Row>

        <Text style={styles.label}>Toggle Button Group</Text>
        <ToggleButton.Group onValueChange={setToggleButtonValue} value={toggleButtonValue}>
          <ToggleButton icon="format-align-left" value="left" />
          <ToggleButton icon="format-align-right" value="right" />
        </ToggleButton.Group>

        <Text style={styles.label}>Typography</Text>
        <Text>Text</Text>
        <View style={styles.space} />
        <Subheading>Subheading</Subheading>
        <View style={styles.space} />
        <Title>Title</Title>
        <View style={styles.space} />
        <Paragraph>Paragraph</Paragraph>
        <View style={styles.space} />
        <Headline>Headline</Headline>
        <View style={styles.space} />
        <Caption>Caption</Caption>
        <View style={styles.space} />
      </ScrollView>
    </Screen>
  );
};
