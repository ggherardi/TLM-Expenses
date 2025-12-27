import { StyleSheet } from 'react-native';

export const ThemeColors = {
  primary: '#660000',
  secondary: 'blue',
  white: '#fff',
  black: '#000',
  selected: '#fafafa',
  inactive: 'gray',
  success: '#5cb85c',
  green: '#4a934a',
  info: "#5bc0de", //0d6efd
  warning: "#f0ad4e",
  danger: "#d9534f",
  lightGray: '#a2a5a0'
};

export const SelectDropdownStyle = StyleSheet.create({
  button: {
    backgroundColor: 'white', 
    borderColor: 'gray', 
    width: '100%', 
    borderWidth: 1,
    borderRadius: 5
  }
});

const GlobalStyles = StyleSheet.create({
  // Common components styles
  container: {
    padding: 10
  },
  // Colors
  colorPrimary: {
    color: ThemeColors.primary
  },
  colorBgPrimary: {
    backgroundColor: ThemeColors.primary
  },
  colorWhite: {
    color: '#fff'
  },
  // Icons
  iconPrimary: {
    // color: ThemeColors.primary,
    padding: 10
  },
  // Positioning
  selfCenter: {
    alignSelf: 'center',
  },  
  flexRow: {
    flexDirection: 'row'
  },
  // Padding
  pl5: {
    paddingLeft: 5
  },
  pl10: {
    paddingLeft: 10
  },
  pl15: {
    paddingLeft: 15
  },
  pl20: {
    paddingLeft: 20
  },
  pl25: {
    paddingLeft: 25
  },
  pr5: {
    paddingRight: 5
  },
  pr10: {
    paddingRight: 10
  },
  pr15: {
    paddingRight: 15
  },
  pr20: {
    paddingRight: 20
  },
  pr25: {
    paddingRight: 25
  },
  pt5: {
    paddingTop: 5
  },
  pt10: {
    paddingTop: 10
  },
  pt15: {
    paddingTop: 15
  },
  pt20: {
    paddingTop: 20
  },
  pt25: {
    paddingTop: 25
  },
  mt5: {
    marginTop: 5
  },
  mt10: {
    marginTop: 10
  },
  mt15: {
    marginTop: 15
  },
  mt20: {
    marginTop: 20
  },
  mt25: {
    marginTop: 25
  },
  ml1: {
    marginLeft: 1
  },
  ml2: {
    marginLeft: 2
  },
  ml3: {
    marginLeft: 3
  },
  ml4: {
    marginLeft: 4
  },
  ml5: {
    marginLeft: 5
  },
});

export default GlobalStyles;