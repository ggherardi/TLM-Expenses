import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { InputSideButton } from '../lib/components/InputSideButtonComponent';
import { ThemeColors } from '../lib/GlobalStyles';
import { BusinessEvent } from '../lib/models/BusinessEvent';
import { Utility } from '../lib/Utility';
import dataContext from '../lib/models/DataContext';
import { useCustomHeaderWithButtonAsync } from '../lib/components/CustomHeaderComponent';
import { InputNumber } from '../lib/components/InputNumberComponent';
import { FormErrorMessageComponent } from '../lib/components/FormErrorMessageComponent';
import ModalLoaderComponent from '../lib/components/ModalWithLoader';
import { Constants } from '../lib/Constants';
import BaseTextInput from '../lib/base-components/BaseTextInput';
import BaseIcon from '../lib/base-components/BaseIcon';

const RefundKmScreen = ({ navigation, route }: any) => {
  const event: BusinessEvent = route.params.event;
  const [events, setEvents] = useState(dataContext.Events.getAllData())
  const [needCarRefund, setNeedCarRefund] = useState(event.needCarRefund);
  const [startingCity, setStartingCity] = useState<string>(event.refundStartingCity || "");
  const [arrivalCity, setArrivalCity] = useState<string>(event.refundArrivalCity || "");
  const [totalTravelledKms, setTotalTravelledKms] = useState<number | undefined>(event.totalTravelledKms);
  const [travelDate, setTravelDate] = useState<Date | undefined>(event.travelDate ? new Date(event.travelDate) : new Date());
  const [refundForfait, setRefundForfait] = useState<number | undefined>(event.travelRefundForfait);
  const [isFormValid, setIsFormValid] = useState(true);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);

  useEffect(() => {
    useCustomHeaderWithButtonAsync(navigation, Utility.GetEventHeaderTitle(event), () => saveEvent(), 'save', 'Rimborso chilometrico', !isFormValid, 'salva');
  }, [navigation, event, isFormValid]);

  useEffect(() => {
    const valid =
      !needCarRefund ||
      (!!startingCity && !!arrivalCity && totalTravelledKms !== undefined && !isNaN(totalTravelledKms) && !!travelDate && !!refundForfait && refundForfait !== 0);
    setIsFormValid(valid);
  }, [needCarRefund, startingCity, arrivalCity, totalTravelledKms, travelDate, refundForfait]);

  const saveEvent = async () => {
    setIsLoading(true);
    if (!validate()) {
      setIsLoading(false);
      return;
    }
    const eventToEdit = events.find(e => e.id == event.id);
    if (eventToEdit) {
      console.log("TRAVEL DATE: ", travelDate);
      eventToEdit.needCarRefund = needCarRefund;
      eventToEdit.refundStartingCity = startingCity;
      eventToEdit.refundArrivalCity = arrivalCity;
      eventToEdit.totalTravelledKms = totalTravelledKms || 0;
      eventToEdit.travelDate = (travelDate as Date).toString();
      eventToEdit.travelRefundForfait = refundForfait || 0;
      dataContext.Events.saveData(events);
      Utility.ShowSuccessMessage("Rimborso chilometrico modificato correttamente");
      navigation.navigate(Constants.Navigation.EventHome, { event: eventToEdit });
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    let isValid = true;
    let validationErrorsTemp = {};

    if (needCarRefund) {
      if (!startingCity) {
        validationErrorsTemp = { ...validationErrorsTemp, startingCity: 'Campo obbligatorio' };
        isValid = false;
      }
      if (!arrivalCity) {
        validationErrorsTemp = { ...validationErrorsTemp, arrivalCity: 'Campo obbligatorio' };
        isValid = false;
      }
      if (totalTravelledKms === undefined || isNaN(totalTravelledKms)) {
        validationErrorsTemp = { ...validationErrorsTemp, totalTravelledKms: 'Campo obbligatorio' };
        isValid = false;
      }
      if (!travelDate) {
        validationErrorsTemp = { ...validationErrorsTemp, travelDate: 'Campo obbligatorio' };
        isValid = false;
      }
      if (refundForfait === undefined || refundForfait === 0 || isNaN(refundForfait)) {
        validationErrorsTemp = { ...validationErrorsTemp, refundForfait: 'Campo obbligatorio' };
        isValid = false;
      }
    }

    setValidationErrors(validationErrorsTemp);
    return isValid;
  }

  return (
    <>
      <ModalLoaderComponent isLoading={isLoading} text='Modifica evento in corso..' />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
        <ScrollView contentContainerStyle={styles.container}>
          <Pressable style={styles.checkboxRow} onPress={() => setNeedCarRefund(!needCarRefund)}>
            <View style={[styles.checkbox, needCarRefund && styles.checkboxChecked]}>
              {needCarRefund && <BaseIcon name="check" size={14} color={ThemeColors.white} />}
            </View>
            <Text style={styles.checkboxLabel}>Rimborso chilometrico</Text>
          </Pressable>
          {needCarRefund && (
            <View>
              <View style={styles.field}>
                <Text style={styles.label}>Località di partenza (città)</Text>
                <BaseTextInput defaultValue={event.refundStartingCity} placeholder="es. Roma" onChangeText={setStartingCity} hasError={'startingCity' in validationErrors} />
                <FormErrorMessageComponent text='Campo obbligatorio' field='startingCity' validationArray={validationErrors} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Località di arrivo (città)</Text>
                <BaseTextInput defaultValue={event.refundArrivalCity} placeholder="es. Firenze" onChangeText={setArrivalCity} hasError={'arrivalCity' in validationErrors} />
                <FormErrorMessageComponent text='Campo obbligatorio' field='arrivalCity' validationArray={validationErrors} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Totale KM percorsi</Text>
                <InputNumber defaultValue={event.totalTravelledKms} placeholder="es. 35.8" onChange={setTotalTravelledKms} isRequired />
                <FormErrorMessageComponent text='Campo obbligatorio' field='totalTravelledKms' validationArray={validationErrors} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Data della spesa</Text>
                <Pressable onPress={() => setShowDateTimePicker(true)} style={styles.inputWithIcon}>
                  <BaseTextInput
                    editable={false}
                    value={travelDate ? Utility.FormatDateDDMMYYYY(travelDate.toString()) : ''}
                    placeholder="gg/mm/aaaa"
                  />
                  <View style={styles.iconWrapper}>
                    <InputSideButton
                      icon="calendar-day"
                      iconStyle={styles.iconButton}
                      pressFunction={() => setShowDateTimePicker(true)}
                      size={18}
                    />
                  </View>
                </Pressable>
                {showDateTimePicker && (
                  <DateTimePicker
                    mode="date"
                    themeVariant='light'
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    locale="it-IT"
                    value={travelDate ? travelDate : new Date()}
                    onChange={(event, date) => {
                      setShowDateTimePicker(false);
                      if (!date) return;
                      setTravelDate(date as Date);
                    }}
                  />
                )}
                <FormErrorMessageComponent text='Campo obbligatorio' field='travelDate' validationArray={validationErrors} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Importo rimborso forfetario (€)</Text>
                <InputNumber defaultValue={event.travelRefundForfait} placeholder="es. 0.20" onChange={setRefundForfait} isRequired />
                <FormErrorMessageComponent text='Campo obbligatorio' field='refundForfait' validationArray={validationErrors} />
              </View>
            </View>
          )}
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: ThemeColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: ThemeColors.primary,
    borderColor: ThemeColors.primary,
  },
  checkboxLabel: {
    fontSize: 15,
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
  }
});

export default RefundKmScreen;
