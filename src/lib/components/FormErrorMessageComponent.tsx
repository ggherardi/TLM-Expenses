import { StyleSheet, Text } from 'react-native';
import { View } from 'react-native'
import { ThemeColors } from '../GlobalStyles';

interface IFormErrorMessage {
  field: string;
  validationArray: any;
  text: string;
}

export const FormErrorMessageComponent = (props: IFormErrorMessage) => {  
  return (    
    <View>
      {props.field in props.validationArray ? (<Text style={[styles.text]}>{props.text}</Text>) : <></>}
    </View>)
}

const styles = StyleSheet.create({
  text: {
    color: ThemeColors.danger,
    fontSize: 10
  }
})