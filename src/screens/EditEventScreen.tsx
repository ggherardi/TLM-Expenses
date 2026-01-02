import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, ScrollView, View, KeyboardAvoidingView, Platform } from 'react-native';
import { InputSideButton } from '../lib/components/InputSideButtonComponent';
import GlobalStyles from '../lib/GlobalStyles';
import { BusinessEvent } from '../lib/models/BusinessEvent';
import { Utility } from '../lib/Utility';
import dataContext from '../lib/models/DataContext';
import { useCustomHeaderWithButtonAsync } from '../lib/components/CustomHeaderComponent';
import { Currency, GetCurrencies, GetCurrency } from '../lib/data/Currencies';
import { InputNumber } from '../lib/components/InputNumberComponent';
import { FormErrorMessageComponent } from '../lib/components/FormErrorMessageComponent';
import ModalLoaderComponent from '../lib/components/ModalWithLoader';

const EditEventScreen = ({ navigation, route }: any) => {
  const event: BusinessEvent = route.params.event;
  const [events, setEvents] = useState(dataContext.Events.getAllData())
  const [eventName, setEventName] = useState(event.name);
  const [eventDescription, setEventDescription] = useState(event.description);
  const [showStartDateTimePicker, setShowStartDateTimePicker] = useState(false);
  const [showEndDateTimePicker, setShowEndDateTimePicker] = useState(false);
  const [eventStartDate, setEventStartDate] = useState(new Date(event.startDate));
  const [eventEndDate, setEventEndDate] = useState(new Date(event.endDate));
  const [mainCurrencyCode, setMainCurrencyCode] = useState('EUR');
  const [city, setCity] = useState(event.city)
  const [currenciesCodes, setCurrenciesCodes] = useState<string[]>([]);
  const [cashFund, setCashFund] = useState(event.cashFund);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    useCustomHeaderWithButtonAsync(navigation, Utility.GetEventHeaderTitle(event), () => saveEvent(), undefined, 'Modifica evento', !isFormValid, 'salva');
  });

  const handleEventNameChange = (e: any) => setEventName(e);
  const handleEventDescriptionChange = (e: any) => setEventDescription(e);
  const handleCityChange = (e: any) => setCity(e);
  const handleCashFundChange = (e: any) => setCashFund(e);

  const saveEvent = async () => {
    setIsLoading(true);
    if (!validate()) {
      setIsLoading(false);
      return;
    }
    const eventToEdit = events.find(e => e.id == event.id);
    if (eventToEdit) {
      eventToEdit.name = eventName.trim();
      eventToEdit.mainCurrency = GetCurrency(mainCurrencyCode) as Currency;
      eventToEdit.currencies = GetCurrencies(currenciesCodes);
      eventToEdit.city = city ? city.trim() : "";
      eventToEdit.description = eventDescription?.trim();
      eventToEdit.startDate = eventStartDate.toString();
      eventToEdit.endDate = eventEndDate.toString();
      eventToEdit.cashFund = cashFund ? cashFund : 0;
      dataContext.Events.saveData(events);
      Utility.ShowSuccessMessage("Evento modificato correttamente");
      navigation.goBack();
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    let isValid = true;
    let validationErrorsTemp = {};
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

  const scrollToY = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd();
    }, 100);
  }

  return (
    <NativeBaseProvider>
      <ModalLoaderComponent isLoading={isLoading} text='Modifica evento in corso..' />
      <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
        <ScrollView contentContainerStyle={styles.container} ref={scrollViewRef}>
          <FormControl style={GlobalStyles.mt15}>
            <FormControl.Label>Nome dell'evento</FormControl.Label>
            <Input defaultValue={event.name} placeholder="Nome evento" isDisabled onChange={handleEventNameChange} maxLength={50}></Input>
          </FormControl>

          <FormControl style={GlobalStyles.mt15} isRequired isInvalid={'eventStartDate' in validationErrors}>
            <FormControl.Label>Data di inizio dell'evento</FormControl.Label>
            <Input
              caretHidden={true}
              placeholder="gg/mm/aaaa"
              showSoftInputOnFocus={false}
              onPressIn={() => setShowStartDateTimePicker(true)}
              value={Utility.FormatDateDDMMYYYY(eventStartDate.toString())}
              InputLeftElement={
                <InputSideButton
                  icon="calendar-day"
                  iconStyle={GlobalStyles.iconPrimary}
                  pressFunction={() => {
                    setShowStartDateTimePicker(true);
                  }}
                />
              }
            />
            {showStartDateTimePicker && (
              <DateTimePicker
                mode="date"
                themeVariant='light'
                display="inline"
                locale="it-IT"
                value={eventStartDate}
                style={{ alignSelf: 'flex-start' }}
                onChange={(event, date) => {
                  setShowStartDateTimePicker(false);
                  setEventStartDate(date as Date);
                }}
              />
            )}
            <FormErrorMessageComponent text={validationErrors.eventStartDate} field='eventStartDate' validationArray={validationErrors} />
          </FormControl>

          <FormControl style={GlobalStyles.mt15} isRequired isInvalid={'eventEndDate' in validationErrors}>
            <FormControl.Label>Data di fine dell'evento</FormControl.Label>
            <Input
              caretHidden={true}
              placeholder="gg/mm/aaaa"
              showSoftInputOnFocus={false}
              onPressIn={() => setShowEndDateTimePicker(true)}
              value={Utility.FormatDateDDMMYYYY(eventEndDate.toString())}
              InputLeftElement={
                <InputSideButton
                  icon="calendar-day"
                  iconStyle={GlobalStyles.iconPrimary}
                  pressFunction={() => {
                    setShowEndDateTimePicker(true);
                  }}
                />
              }
            />
            {showEndDateTimePicker && (
              <DateTimePicker
                mode="date"
                themeVariant='light'
                display="inline"
                locale="it-IT"
                value={eventEndDate}
                onChange={(event, date) => {
                  setShowEndDateTimePicker(false);
                  setEventEndDate(date as Date);
                }}
              />
            )}
            <FormErrorMessageComponent text={validationErrors.eventEndDate} field='eventEndDate' validationArray={validationErrors} />
          </FormControl>

          <FormControl style={GlobalStyles.mt15} isRequired>
            <FormControl.Label>Destinazione (città)</FormControl.Label>
            <Input defaultValue={event.city} placeholder="es. Roma" onChange={handleCityChange} isInvalid={'city' in validationErrors} maxLength={200}></Input>
            <FormErrorMessageComponent text='Campo obbligatorio' field='city' validationArray={validationErrors} />
          </FormControl>

          <FormControl style={GlobalStyles.mt15}>
            <FormControl.Label>Fondo cassa (€)</FormControl.Label>
            <InputNumber placeholder='es. 10.5' onChange={handleCashFundChange} isRequired={true} defaultValue={cashFund} />
          </FormControl>

          <FormControl style={GlobalStyles.mt15}>
            <FormControl.Label>Descrizione dell'evento</FormControl.Label>
            <TextArea defaultValue={event.description} placeholder="Descrizione breve dell'evento" onChange={handleEventDescriptionChange} autoCompleteType={true} maxLength={500} onFocus={scrollToY}></TextArea>
          </FormControl>
        </ScrollView>
      </KeyboardAvoidingView>
    </NativeBaseProvider>
  );
};

const multiSelectStyle = StyleSheet.create({
  itemText: {
    fontWeight: '100',
    fontSize: 15
  },
  listContainer: {
    backgroundColor: "red"
  },
  selectToggle: {
    borderColor: '#d4d4d4',
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  selectToggleText: {
    color: '#d4d4d4',
    fontSize: 15,
  }
})

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 30,
  }
});

export default EditEventScreen;
