import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, ScrollView, Alert, Platform, View, Text, KeyboardAvoidingView, Pressable } from 'react-native';
import { InputSideButton } from '../lib/components/InputSideButtonComponent';
import { ThemeColors } from '../lib/GlobalStyles';
import { BusinessEvent } from '../lib/models/BusinessEvent';
import { Utility } from '../lib/Utility';
import dataContext from '../lib/models/DataContext';
import { useCustomHeaderWithButtonAsync } from '../lib/components/CustomHeaderComponent';
import { Currency, GetCurrencies, GetCurrency } from '../lib/data/Currencies';
import { Constants } from '../lib/Constants';
import { PDFBuilder } from '../lib/PDFBuilder';
import { SaveConstants } from '../lib/DataStorage';
import { InputNumber } from '../lib/components/InputNumberComponent';
import NavigationHelper from '../lib/NavigationHelper';
import ModalLoaderComponent from '../lib/components/ModalWithLoader';
import { FormErrorMessageComponent } from '../lib/components/FormErrorMessageComponent';
import { FileManager } from '../lib/FileManager';
import NotificationManager from '../lib/NotificationManager';
import BaseTextInput from '../lib/base-components/BaseTextInput';

const NewEventScreen = ({ navigation, route }: any) => {
  const [events, setEvents] = useState<BusinessEvent[]>(dataContext.Events.getAllData());
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [showStartDateTimePicker, setShowStartDateTimePicker] = useState(false);
  const [showEndDateTimePicker, setShowEndDateTimePicker] = useState(false);
  const [eventStartDate, setEventStartDate] = useState(new Date());
  const [eventEndDate, setEventEndDate] = useState(new Date());
  const [mainCurrencyCode, setMainCurrencyCode] = useState('EUR');
  const [city, setCity] = useState('')
  const [currenciesCodes, setCurrenciesCodes] = useState<string[]>([]);
  const [cashFund, setCashFund] = useState<number | undefined>();
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const scrollViewRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    useCustomHeaderWithButtonAsync(navigation, "Crea nuovo evento", () => saveEvent(), 'save', undefined, !isFormValid, 'salva');
  }, [navigation, isFormValid]);

  useEffect(() => {
    const valid = !!eventName && !!city && !!eventStartDate && !!eventEndDate && eventStartDate.getTime() <= eventEndDate.getTime();
    setIsFormValid(valid);
  }, [eventName, city, eventStartDate, eventEndDate]);

  const handleEventNameChange = (e: string) => setEventName(e);
  const handleEventDescriptionChange = (e: string) => setEventDescription(e);
  const handleCityChange = (e: string) => setCity(e);
  const handleCashFundChange = (value: number | undefined) => setCashFund(value);

  const saveEvent = async () => {
    setIsLoading(true);
    if (!validate()) {
      setIsLoading(false);
      return;
    }
    let hasPermissions;
    try {
      const promiseResult = await FileManager.checkStoragePermissions();
      hasPermissions = promiseResult.success;
    } catch (err) {
      hasPermissions = false;
    }
    if (!hasPermissions) {
      Alert.alert("Impossibile creare un nuovo evento", "Per il salvataggio dell'evento, è necessario garantire permessi di scrittura sul dispositivo");
      setIsLoading(false);
      return;
    }

    let hasNotificationPermissions;
    try {
      const promiseResult = await FileManager.checkNotificationPermissions();
      hasNotificationPermissions = promiseResult.success;
    } catch (err) {
      hasNotificationPermissions = false;
    }

    let event: BusinessEvent = new BusinessEvent();
    let id = Math.max(...events.map((e: BusinessEvent) => e.id));
    event.id = id >= 0 ? id + 1 : 0;
    event.notificationIds = [((event.id * 1000000) + 1).toString(), ((event.id * 1000000) + 2).toString(), ((event.id * 1000000) + 3).toString()];
    event.name = eventName ? eventName.trim() : '';
    event.mainCurrency = GetCurrency(mainCurrencyCode) as Currency;
    event.currencies = GetCurrencies(currenciesCodes);
    event.city = city ? city.trim() : '';
    event.description = eventDescription.trim();
    event.startDate = eventStartDate.toString();
    event.endDate = eventEndDate.toString();
    event.cashFund = cashFund ? cashFund : 0;
    event.expensesDataContextKey = `event-${event.id}_${event.name}-reports-${SaveConstants.expenseReport.key}`;
    console.log("Adding new event to events list..");
    events.push(event);
    const sanitizedEventName = Utility.SanitizeString(event.name);
    const userProfile = Utility.GetUserProfile();
    const pdfFileName = `nota_spese_${sanitizedEventName}_${Utility.GetYear(event.startDate)}_${userProfile.surname}_${userProfile.name}`;
    const directoryName = `${sanitizedEventName}_${Utility.FormatDateDDMMYYYY(event.startDate, "-")}_${Utility.FormatDateDDMMYYYY(event.endDate, "-")}_${Utility.GenerateRandomGuid("")}`;
    const directory = await FileManager.createFolder(directoryName);
    console.log("Created directory: ", directory);
    const directoryPathLeaf = directory.substring(directory.lastIndexOf("/"), directory.length);
    const pdfFullFilePath = `${directory}/${pdfFileName}.pdf`;
    const pdfLeafFilePath = `${directoryPathLeaf}/${pdfFileName}.pdf`;
    console.log(`Directory Path Leaf: (${directoryPathLeaf})`);
    console.log(`Creating event pdf.. (${pdfLeafFilePath})`);
    const createdFile = await PDFBuilder.createExpensesPdfAsync(event, pdfFileName);
    event.reportFileName = pdfFileName;
    if (createdFile) {
      const createdFilePath = createdFile.filePath as string;
      const moved = await FileManager.moveFile(createdFilePath, pdfFullFilePath);
      if (moved) {
        event.pdfFullFilePath = pdfLeafFilePath;
        event.directoryPath = directoryPathLeaf;
        console.log("Saving all events to memory..");
        dataContext.Events.saveData(events);
        Utility.ShowSuccessMessage("Evento creato correttamente");
      }

      if (hasNotificationPermissions && Utility.GetNumberOfDaysBetweenDates(new Date().toString(), event.endDate) > 1) {
        console.log("Scheduling notifications for event..");
        BusinessEvent.scheduleNotifications(event);
      }

      userProfile.swipeTutorialSeen = false;
      dataContext.UserProfile.saveData([userProfile]);
      NavigationHelper.getHomeTabNavigation().navigate(Constants.Navigation.AllEvents);
    } else {
      console.log("Errore");
    }
    setIsLoading(false);
  };

  const validate = (): boolean => {
    let isValid = true;
    let validationErrorsTemp = {};
    if (!eventName) {
      validationErrorsTemp = { ...validationErrorsTemp, eventName: 'Campo obbligatorio' };
      isValid = false;
    }
    if (!city) {
      validationErrorsTemp = { ...validationErrorsTemp, city: 'Campo obbligatorio' };
      isValid = false;
    }
    if (!eventStartDate) {
      validationErrorsTemp = { ...validationErrorsTemp, eventStartDate: 'Campo obbligatorio' };
      isValid = false;
    }
    if (!eventEndDate) {
      validationErrorsTemp = { ...validationErrorsTemp, eventEndDate: 'Campo obbligatorio' };
      isValid = false;
    }
    if (eventStartDate.getTime() > eventEndDate.getTime()) {
      validationErrorsTemp = {
        ...validationErrorsTemp,
        eventStartDate: 'La Data inizio evento non può essere maggiore della Data fine evento',
        eventEndDate: 'La Data fine evento non può essere maggiore della Data inizio evento'
      };
      isValid = false;
    }
    setValidationErrors(validationErrorsTemp);
    return isValid;
  }

  const refreshData = () => {
    setEvents(dataContext.Events.getAllData());
  }

  const scrollToY = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd();
    }, 100);
  }

  Utility.OnFocus({ navigation: navigation, onFocusAction: refreshData });

  return (
    <>
      <ModalLoaderComponent isLoading={isLoading} text='Creazione evento in corso..' />
      <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
        <ScrollView contentContainerStyle={styles.container} ref={scrollViewRef}>
          <View style={styles.field}>
            <Text style={styles.label}>Nome dell'evento</Text>
            <BaseTextInput placeholder="Nome evento" onChangeText={handleEventNameChange} maxLength={50} hasError={'eventName' in validationErrors} />
            <FormErrorMessageComponent text='Campo obbligatorio' field='eventName' validationArray={validationErrors} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Data di inizio dell'evento</Text>
            <Pressable onPress={() => setShowStartDateTimePicker(true)} style={styles.inputWithIcon}>
              <BaseTextInput
                editable={false}
                value={Utility.FormatDateDDMMYYYY(eventStartDate.toString())}
                placeholder="gg/mm/aaaa"
              />
              <View style={styles.iconWrapper}>
                <InputSideButton
                  icon="calendar-day"
                  iconStyle={styles.iconButton}
                  pressFunction={() => setShowStartDateTimePicker(true)}
                  size={18}
                />
              </View>
            </Pressable>
            {showStartDateTimePicker && (
              <DateTimePicker
                mode="date"
                themeVariant='light'
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                locale="it-IT"
                value={eventStartDate}
                style={{ alignSelf: 'flex-start' }}
                onChange={(event, date) => {
                  setShowStartDateTimePicker(false);
                  if (!date) return;
                  setEventStartDate(date as Date);
                }}
              />
            )}
            <FormErrorMessageComponent text={validationErrors.eventStartDate} field='eventStartDate' validationArray={validationErrors} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Data di fine dell'evento</Text>
            <Pressable onPress={() => setShowEndDateTimePicker(true)} style={styles.inputWithIcon}>
              <BaseTextInput
                editable={false}
                value={Utility.FormatDateDDMMYYYY(eventEndDate.toString())}
                placeholder="gg/mm/aaaa"
              />
              <View style={styles.iconWrapper}>
                <InputSideButton
                  icon="calendar-day"
                  iconStyle={styles.iconButton}
                  pressFunction={() => setShowEndDateTimePicker(true)}
                  size={18}
                />
              </View>
            </Pressable>
            {showEndDateTimePicker && (
              <DateTimePicker
                mode="date"
                themeVariant='light'
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                locale="it-IT"
                value={eventEndDate}
                onChange={(event, date) => {
                  setShowEndDateTimePicker(false);
                  if (!date) return;
                  setEventEndDate(date as Date);
                }}
              />
            )}
            <FormErrorMessageComponent text={validationErrors.eventEndDate} field='eventEndDate' validationArray={validationErrors} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Destinazione (città)</Text>
            <BaseTextInput placeholder="es. Roma" onChangeText={handleCityChange} hasError={'city' in validationErrors} maxLength={200} />
            <FormErrorMessageComponent text='Campo obbligatorio' field='city' validationArray={validationErrors} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Fondo cassa (€)</Text>
            <InputNumber placeholder='es. 10.5' onChange={handleCashFundChange} isRequired={true} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Descrizione dell'evento</Text>
            <BaseTextInput placeholder="Descrizione breve dell'evento" onChangeText={handleEventDescriptionChange} autoComplete="off" onFocus={scrollToY} maxLength={500} multiline numberOfLines={3} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: ThemeColors.white,
  },
  field: {
    marginTop: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: ThemeColors.black,
  },
  inputWithIcon: {
    position: 'relative',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'absolute',
    right: 4,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  iconButton: {
    padding: 0,
  },
});

export default NewEventScreen;
