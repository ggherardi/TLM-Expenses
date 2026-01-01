import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ThemeColors } from '../GlobalStyles';
import { BusinessEvent } from '../models/BusinessEvent';
import { Utility } from '../Utility';

interface IStatusTextProps {
  event: BusinessEvent;
}

export const StatusTextComponent = (props: IStatusTextProps) => {
  let backgroundColor = ThemeColors.info;
  let textColor = ThemeColors.white;
  let text = 'evento in corso';  

  const todayDate = new Date();
  const daysToEventEnd = Math.floor(Utility.GetNumberOfDaysBetweenDates(todayDate.toString(), props.event.endDate));
  let remainingDaysText = `${daysToEventEnd == 1 ? 'giorno rimanente' : 'giorni rimanenti'}`;

  if (props.event.sentToCompany) {
    text = 'nota spese inviata';
    backgroundColor = ThemeColors.green;
  } else {
    if (daysToEventEnd > 1 && daysToEventEnd <= 3) {
      text = 'evento in conclusione';
      backgroundColor = ThemeColors.warning;
      textColor = ThemeColors.black;
    }
    if (daysToEventEnd <= 1) {
      text = 'nota spese da inviare';
      backgroundColor = ThemeColors.danger;
    }
    if (new Date(props.event.startDate) > todayDate) {
      text = 'evento non iniziato';
      textColor = ThemeColors.black;
      backgroundColor = ThemeColors.white;
    }
  }
  return (
    <>
      <Text style={[styles.container, { backgroundColor: backgroundColor, color: textColor, borderWidth: backgroundColor == ThemeColors.white ? 0.5 : 0 }]}>{text.toUpperCase()}</Text>
      {!props.event.sentToCompany ? (
        <Text style={[styles.remaingDaysText]}>{daysToEventEnd >= 0 ? daysToEventEnd : 0} {remainingDaysText}</Text>) 
        : (<></>)}
    </>);
};

const styles = StyleSheet.create({
  container: {
    fontSize: 11,
    padding: 5,
    borderRadius: 5,
    marginLeft: 20
  },
  remaingDaysText: {
    fontSize: 10,
    padding: 5,
    textAlignVertical: 'center',
    marginLeft: 10
  }
});
