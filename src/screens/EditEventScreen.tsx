import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, ScrollView, View, KeyboardAvoidingView, Platform, Text, Pressable } from 'react-native';
import { ThemeColors } from '../lib/GlobalStyles';
import BaseIcon from '../lib/base-components/BaseIcon';
import { BusinessEvent } from '../lib/models/BusinessEvent';
import { Utility } from '../lib/Utility';
import dataContext from '../lib/models/DataContext';
import { useCustomHeaderWithButtonAsync } from '../lib/components/CustomHeaderComponent';
import { Currency, GetCurrencies, GetCurrency } from '../lib/data/Currencies';
import { InputNumber } from '../lib/components/InputNumberComponent';
import { FormErrorMessageComponent } from '../lib/components/FormErrorMessageComponent';
import ModalLoaderComponent from '../lib/components/ModalWithLoader';
import BaseTextInput from '../lib/base-components/BaseTextInput';

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
  const scrollViewRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    useCustomHeaderWithButtonAsync(navigation, Utility.GetEventHeaderTitle(event), () => saveEvent(), undefined, 'Modifica evento', !isFormValid, 'salva');
  }, [navigation, event, isFormValid]);

  const handleEventNameChange = (e: any) => setEventName(e);
  const handleEventDescriptionChange = (e: any) => setEventDescription(e);
  const handleCityChange = (e: any) => setCity(e);
  const handleCashFundChange = (value: number | undefined) => setCashFund(value || 0);

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
    setIsFormValid(isValid);
    return isValid;
  }

  const scrollToY = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd();
    }, 100);
  }

  return (
    <>
      <ModalLoaderComponent isLoading={isLoading} text='Modifica evento in corso..' />
      <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
        <ScrollView contentContainerStyle={styles.container} ref={scrollViewRef}>
          <View style={styles.field}>
            <Text style={styles.label}>Nome dell'evento</Text>
            <BaseTextInput value={event.name} placeholder="Nome evento" editable={false} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Data di inizio dell'evento</Text>
            <Pressable onPress={() => setShowStartDateTimePicker(true)} style={styles.inputWithIcon}>
              <BaseTextInput
                editable={false}
                value={Utility.FormatDateDDMMYYYY(eventStartDate.toString())}
                placeholder="gg/mm/aaaa"
              />
              <Pressable style={styles.iconWrapper} onPress={() => setShowStartDateTimePicker(true)}>
                <BaseIcon name="calendar-day" size={18} color={ThemeColors.primary} />
              </Pressable>
            </Pressable>
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
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Data di fine dell'evento</Text>
            <Pressable onPress={() => setShowEndDateTimePicker(true)} style={styles.inputWithIcon}>
              <BaseTextInput
                editable={false}
                value={Utility.FormatDateDDMMYYYY(eventEndDate.toString())}
                placeholder="gg/mm/aaaa"
              />
              <Pressable style={styles.iconWrapper} onPress={() => setShowEndDateTimePicker(true)}>
                <BaseIcon name="calendar-day" size={18} color={ThemeColors.primary} />
              </Pressable>
            </Pressable>
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
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Destinazione (città)</Text>
            <BaseTextInput defaultValue={event.city} placeholder="es. Roma" onChangeText={handleCityChange} hasError={'city' in validationErrors} maxLength={200} />
            <FormErrorMessageComponent text='Campo obbligatorio' field='city' validationArray={validationErrors} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Fondo cassa (€)</Text>
            <InputNumber placeholder='es. 10.5' onChange={handleCashFundChange} isRequired={true} defaultValue={cashFund} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Descrizione dell'evento</Text>
            <BaseTextInput
              defaultValue={event.description}
              placeholder="Descrizione breve dell'evento"
              onChangeText={handleEventDescriptionChange}
              multiline
              numberOfLines={4}
              style={styles.textArea}
              onFocus={scrollToY}
              maxLength={500}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingBottom: 30,
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
    right: 5,
    top: '50%',
    transform: [{ translateY: -14 }],
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default EditEventScreen;
