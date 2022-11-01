import React, { useRef, useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, ViewStyle, TextStyle, Animated } from 'react-native';
import { Button, Modal, Portal } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';
import { Scope } from 'i18n-js';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { MaintenancePriority } from '../mobx/stores/maintenanceTypes';

import { t } from '../i18n/trans';
import {
  Screen,
  TextInput,
  RadioButton,
  Text,
  LinearGradient,
  Select,
  Title,
  ImageAttachmentList,
} from '../components';
import { MaintenanceScreenNavigationProp } from '../types';
import { useStores } from '../mobx/useStores';
import { formatPhoneToDisplay } from '../helpers/validation/phone';
import { ThemeColors } from '../helpers/theme';
import { Alert } from '../helpers/icons';
import { ImageAttachment } from '../mobx/forms/maintenanceRequest-form';
import { useAppTheme } from '../hooks/use-app-theme';
import { isWeb } from '../config';

interface Styles {
  content: ViewStyle;
  dropdown: ViewStyle;
  inputContainer: ViewStyle;
  labelColor: TextStyle;
  textarea: TextStyle;
  textareaContainer: ViewStyle;
  radioSelectionContainer: ViewStyle;
  radioOptionsContainer: ViewStyle;
  radioOption: ViewStyle;
  submitRequestContainer: ViewStyle;
  submitRequestButton: ViewStyle;
  addPhotosLabel: TextStyle;
  addPhotoButton: ViewStyle;
  addPhotoButtonLabel: TextStyle;
  buttonLabel: TextStyle;
  photoOptionModalContainer: ViewStyle;
  radioLabel: TextStyle;
  warningText: TextStyle;
  helperContainer: ViewStyle;
  iconWrapper: ViewStyle;
  secondaryTextColor: TextStyle;
}

const createStyles = (themeColors: ThemeColors) => {
  const baseStyles: Styles = {
    content: {
      padding: 16,
    },
    dropdown: {
      width: '100%',
    },
    inputContainer: {
      maxWidth: '100%',
      marginVertical: 0,
    },
    labelColor: {
      color: themeColors.placeholder,
    },
    textarea: {
      height: 65,
      padding: 0,
      paddingLeft: 0,
      paddingVertical: 0,
    },
    textareaContainer: {
      padding: 0,
      paddingLeft: 0,
      paddingHorizontal: 0,
      backgroundColor: themeColors.background,
    },
    radioSelectionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    radioOptionsContainer: {
      flexDirection: 'row',
    },
    radioOption: {
      marginRight: 20,
    },
    radioLabel: {
      marginBottom: 8,
      color: themeColors.onSurface,
    },
    submitRequestContainer: {
      width: '100%',
      paddingHorizontal: 16,
      paddingBottom: 18,
    },
    submitRequestButton: {
      width: '100%',
    },
    buttonLabel: {
      color: themeColors.onPrimary,
    },
    addPhotosLabel: {
      marginTop: 28,
      marginBottom: 16,
    },
    addPhotoButton: {
      width: 130,
      alignItems: 'flex-start',
    },
    addPhotoButtonLabel: {
      textAlign: 'left',
      marginHorizontal: 0,
      color: themeColors.secondary,
    },
    photoOptionModalContainer: {
      width: '100%',
      maxWidth: 330,
      alignSelf: 'center',
      height: 170,
      backgroundColor: themeColors.background,
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    warningText: {
      textAlign: 'left',
      width: '100%',
      color: themeColors.error,
      lineHeight: 20,
      letterSpacing: 0.01,
    },
    helperContainer: {
      flexDirection: 'row',
      height: 24,
      marginTop: 10,
      marginBottom: 15,
    },
    iconWrapper: {
      paddingTop: 3,
      paddingRight: 3,
    },
    secondaryTextColor: {
      color: themeColors.secondary,
    },
  };
  return StyleSheet.create({ ...baseStyles });
};

interface Props {
  navigation: MaintenanceScreenNavigationProp;
  route: { params: any };
}

interface FormFieldHeight {
  fieldName: string;
  height: number;
}

export const CreateMaintenanceRequest = ({ navigation, route }: Props) =>
  useObserver(() => {
    const { colors: themeColors } = useAppTheme();
    const styles = createStyles(themeColors);
    const { maintenance, units, notification, auth } = useStores();
    const scrollViewRef = useRef<ScrollView>(null);
    const [showPhotoOptionsModal, setShowPhotoOptionsModal] = useState(false);
    const [showMaxPhotoNumberWarning, setShowMaxPhotoNumberWarning] = useState(false);
    const formFields = useRef<FormFieldHeight[]>([]);
    const { maintenanceRequestForm: form, isImageUploadInProgress } = maintenance;
    const {
      inventoryId,
      location,
      priority,
      type,
      phone,
      description,
      hasPermissionToEnter,
      hasPets,
      attachments,
    } = form.fields;
    const onlyOneUnit = units.activeUnits.length === 1;

    const resetMaintenanceForm = useRef(() => maintenance.resetForm());
    const loadPreviousMaintenanceForm = useRef(() => maintenance.loadPreviousForm());

    const { shouldLoadPreviousFormData } = route.params || {};

    useEffect(() => {
      if (onlyOneUnit) inventoryId.setValue(units.activeUnits[0].id);
    }, [units.activeUnits]);

    useFocusEffect(
      useCallback(() => {
        if (shouldLoadPreviousFormData) loadPreviousMaintenanceForm.current();

        return () => {
          resetMaintenanceForm.current();
        };
      }, []),
    );

    useEffect(() => {
      if (attachments.value.length === 10) setShowMaxPhotoNumberWarning(true);
    }, [attachments.value.length]);

    useEffect(() => {
      if (scrollViewRef?.current && !isImageUploadInProgress) {
        setTimeout(() => {
          scrollViewRef?.current?.scrollToEnd({ animated: true });
        }, 1);
      }
    }, [isImageUploadInProgress]);

    const scrollToError = () => {
      const errorFieldIndex = Object.values(form.fields).findIndex(field => field?.errorMessage);

      const offsetTop = formFields?.current?.reduce((sum, current, index) => {
        if (index >= errorFieldIndex) return sum;

        return current.height + sum;
      }, 0);

      if (scrollViewRef?.current) {
        scrollViewRef?.current?.scrollTo({ x: 0, y: offsetTop, animated: true });
      }
    };

    const onSubmitMaintenanceRequest = async () => {
      await form.validate();
      maintenance.setIsMaintenanceTypeRequestFinished(false);
      if (form.valid) {
        navigation.replace('CreateMaintenanceRequestInProgress');
        const userId = auth.user?.id;
        maintenance.createMaintenanceRequest(form.serializedData, userId);
        return;
      }

      scrollToError();
    };

    const normalizeAttachment = (attachment: ImageAttachment) => {
      if (isWeb) {
        /*
          example on web:
          {
             base64: ""
             height: 1854
             uri: "data:image/png;base64,iVBO...",
              width: 858
          }
        */
        return {
          ...attachment,
          base64: attachment.uri.substring(attachment.uri.lastIndexOf(',') + 1),
          contentType: attachment.uri.substring(attachment.uri.lastIndexOf(':') + 1, attachment.uri.lastIndexOf(';')),
        };
      }

      /*
        example on mobile:
        {
          "base64": "/9j/4AAQSkZJRgABAQEASABIAAD/4SrHRX...",
          "height": 2848,
          "type": "image",
          "uri": "file:///Users/.../ImagePicker/DCBD15EC-9466-4365-99D1-06B943C506EA.jpg",
          "width": 4288
        }
      */
      return {
        ...attachment,
        contentType: `image/${attachment.uri.substring(attachment.uri.lastIndexOf('.') + 1)}`,
      };
    };

    const addAttachment = (imageAttachment: ImageAttachment) => {
      const normalizedAttachment = normalizeAttachment(imageAttachment);
      normalizedAttachment.timestamp = new Date().getTime();

      attachments.setValue([...attachments.value, normalizedAttachment]);
    };

    const removeAttachment = (imageAttachment: ImageAttachment) => {
      attachments.setValue(
        attachments.value.filter(
          a =>
            a.uri !== imageAttachment.uri ||
            (a.uri === imageAttachment.uri && a.timestamp !== imageAttachment.timestamp),
        ),
      );
      setShowMaxPhotoNumberWarning(false);
    };

    const takePhoto = async () => {
      setShowPhotoOptionsModal(false);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        notification.enqueue({ userMessage: t('CAMERA_PERMISSION_REQUIRED') });
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
      });

      if (!result.cancelled) addAttachment(result as ImageAttachment);
    };

    const pickFromGallery = async () => {
      setShowPhotoOptionsModal(false);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        notification.enqueue({ userMessage: t('CAMERA_ROLL_PERMISSION_REQUIRED') });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
      });

      if (!result.cancelled) addAttachment(result as ImageAttachment);
    };

    const addPhotoPressed = async () => {
      if (showMaxPhotoNumberWarning) return;
      if (isWeb) await pickFromGallery();
      else setShowPhotoOptionsModal(true);
    };

    const handleElementLoaded = (fieldName: string, ref: any) => {
      ref?.current?.measure((fx: number, fy: number, width: number, height: number) => {
        formFields?.current?.push({ fieldName, height });
      });
    };

    const inventoryRef = useRef<View>(null);
    const locationRef = useRef<View>(null);
    const priorityRef = useRef<View>(null);
    const typeRef = useRef<View>(null);
    const phoneRef = useRef<View>(null);
    const descriptionRef = useRef<View>(null);

    return (
      <Screen title={t('CREATE_REQUEST')} navigation={navigation} mode="detail" hasInputs>
        <Animated.ScrollView contentContainerStyle={styles.content} ref={scrollViewRef}>
          <Select
            label={t('UNIT')}
            data={units.activeUnits.map(u => ({ label: u.unitDisplayName, value: u.id }))}
            style={styles.dropdown}
            value={inventoryId.value}
            viewRef={inventoryRef}
            onLayout={() => handleElementLoaded(inventoryId.name, inventoryRef)}
            onChangeText={(v: string) => inventoryId.setValue(v)}
            errorVisible={!!inventoryId.errorMessage}
            errorMessage={t(inventoryId.errorMessage as Scope)}
            disabled={units.activeUnits.length <= 1}
          />
          <Select
            label={t('LOCATION')}
            data={(maintenance?.maintenanceLocation || []).map(mL => ({
              label: mL.name,
              value: mL.name,
            }))}
            style={styles.dropdown}
            value={location.value}
            viewRef={locationRef}
            onLayout={() => handleElementLoaded(location.name, locationRef)}
            onChangeText={(v: string) => location.setValue(v)}
            errorVisible={!!location.errorMessage}
            errorMessage={t(location.errorMessage as Scope)}
          />
          <Select
            label={t('MAINTENANCE_TYPE')}
            data={(maintenance?.maintenanceType || []).map(mT => ({
              label: mT.type,
              value: mT.type,
            }))}
            style={styles.dropdown}
            value={type.value}
            viewRef={typeRef}
            onLayout={() => handleElementLoaded(type.name, typeRef)}
            onChangeText={(v: string) => type.setValue(v)}
            errorVisible={!!type.errorMessage}
            errorMessage={t(type.errorMessage as Scope)}
          />
          <TextInput
            placeholder={t('CALLBACK_PHONE_NUMBER')}
            value={phone?.value}
            onChangeText={val => phone.setValue(val)}
            onBlur={() => {
              const formattedPhoneNumber = formatPhoneToDisplay(phone?.value);

              !!formattedPhoneNumber && phone.setValue(formattedPhoneNumber);
            }}
            viewRef={phoneRef}
            onLayout={() => handleElementLoaded(phone.name, phoneRef)}
            autoCompleteType="tel"
            autoCorrect={false}
            returnKeyType="next"
            textContentType="telephoneNumber"
            keyboardType="phone-pad"
            disableFullscreenUI
            maxLength={20}
            errorVisible={!!phone.errorMessage}
            errorMessage={t(phone.errorMessage as Scope)}
            containerStyle={styles.inputContainer}
          />
          <View ref={descriptionRef} onLayout={() => handleElementLoaded(description.name, descriptionRef)}>
            <Text style={[styles.radioLabel, styles.labelColor]}>{t('DESCRIBE_YOUR_ISSUE')}</Text>
            <TextInput
              value={description?.value}
              onChangeText={val => description.setValue(val)}
              returnKeyType="next"
              errorVisible={description.blurred && !!description.errorMessage}
              errorMessage={t(description.errorMessage as Scope)}
              multiline
              containerStyle={styles.inputContainer}
              inputStyle={styles.textarea}
              numberOfLines={3}
              style={styles.textareaContainer}
            />
          </View>
          <Select
            label={t('PRIORITY')}
            data={Object.values(MaintenancePriority).map(mP => ({ label: t(mP.toUpperCase()), value: mP }))}
            style={styles.dropdown}
            value={priority.value}
            viewRef={priorityRef}
            onLayout={() => handleElementLoaded(priority.name, priorityRef)}
            onChangeText={(v: string) => priority.setValue(v)}
          />

          <View style={styles.radioSelectionContainer}>
            <Text style={styles.radioLabel}>{t('PERMISSION_TO_ENTER')}</Text>
            <View style={styles.radioOptionsContainer}>
              <RadioButton
                contentContainerStyle={styles.radioOption}
                checked={hasPermissionToEnter.value}
                onPress={() => hasPermissionToEnter.setValue(true)}
                label={t('YES')}
              />
              <RadioButton
                checked={!hasPermissionToEnter.value}
                onPress={() => hasPermissionToEnter.setValue(false)}
                label={t('NO')}
              />
            </View>
          </View>
          <View style={styles.radioSelectionContainer}>
            <Text style={styles.radioLabel}>{t('PETS_ON_PREMISES')}</Text>
            <View style={styles.radioOptionsContainer}>
              <RadioButton
                contentContainerStyle={styles.radioOption}
                checked={hasPets.value}
                onPress={() => hasPets.setValue(true)}
                label={t('YES')}
              />
              <RadioButton checked={!hasPets.value} onPress={() => hasPets.setValue(false)} label={t('NO')} />
            </View>
          </View>
          <Text style={styles.addPhotosLabel}>{t('ADD_PHOTOS_OPTIONAL')}</Text>
          <ImageAttachmentList
            images={attachments.value}
            onRemove={(image: ImageAttachment) => removeAttachment(image)}
          />
          {showMaxPhotoNumberWarning && (
            <View style={styles.helperContainer}>
              <View style={styles.iconWrapper}>
                <Alert fill={themeColors.error} width={15} height={15} />
              </View>
              <Text style={styles.warningText}>{t('MAX_LIMIT_PHOTO_WARNING_TEXT')}</Text>
            </View>
          )}
          <Button
            disabled={showMaxPhotoNumberWarning}
            style={styles.addPhotoButton}
            labelStyle={styles.addPhotoButtonLabel}
            onPress={addPhotoPressed}
          >
            {t('ADD_PHOTO')}
          </Button>
          <Portal>
            <Modal
              visible={showPhotoOptionsModal}
              onDismiss={() => setShowPhotoOptionsModal(false)}
              contentContainerStyle={styles.photoOptionModalContainer}
            >
              <Title>{t('ADD_PHOTO')}</Title>
              <Button labelStyle={styles.secondaryTextColor} onPress={takePhoto}>
                {t('TAKE_A_PHOTO')}
              </Button>
              <Button labelStyle={styles.secondaryTextColor} onPress={pickFromGallery}>
                {t('CHOOSE_FROM_GALLERY')}
              </Button>
            </Modal>
          </Portal>
        </Animated.ScrollView>
        <View style={styles.submitRequestContainer}>
          <LinearGradient />
          <Button
            disabled={false}
            mode="contained"
            style={styles.submitRequestButton}
            labelStyle={styles.buttonLabel}
            onPress={onSubmitMaintenanceRequest}
          >
            {t('SUBMIT')}
          </Button>
        </View>
      </Screen>
    );
  });
