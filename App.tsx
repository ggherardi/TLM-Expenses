/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { Constants } from './src/lib/Constants';
import LoginScreen from './src/screens/LoginScreen';
import { ThemeColors } from './src/lib/GlobalStyles';
import HomeScreen from './src/screens/HomeScreen';
import AllEventsScreen from './src/screens/AllEventsScreen';
import EventHomeScreen from './src/screens/EventHomeScreen';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={Constants.Navigation.LoginScreen}>
          <Stack.Screen name={Constants.Navigation.LoginScreen} component={LoginScreen} options={loginScreenOptions} />
          <Stack.Screen name={Constants.Navigation.Home} component={HomeScreen} options={commonOptions} />
          <Stack.Screen name={Constants.Navigation.AllEvents} component={AllEventsScreen} options={commonOptions} />
          {/* <Stack.Screen name={Constants.Navigation.NewEvent} component={NewEventScreen} options={commonOptions} /> */}
          <Stack.Screen name={Constants.Navigation.EventHome} component={EventHomeScreen} options={commonOptions} />
          {/* <Stack.Screen name={Constants.Navigation.ViewPdf} component={ViewPdfScreen} options={commonOptions} /> */}
          {/* <Stack.Screen name={Constants.Navigation.EditEventScreen} component={EditEventScreen} options={commonOptions} /> */}
          {/* <Stack.Screen name={Constants.Navigation.RefundKmScreen} component={RefundKmScreen} options={commonOptions} /> */}
          {/* <Stack.Screen name={Constants.Navigation.NewExpenseReport} component={NewExpenseReportScreen} options={commonOptions} /> */}
          {/* <Stack.Screen name={Constants.Navigation.UpdateApp} component={UpdateApp} options={commonOptions} /> */}
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
    </SafeAreaProvider>
  );
}

const loginScreenOptions = {
  headerShown: false,
  statusBarColor: ThemeColors.white
}

const commonOptions = {
  headerStyle: {
    backgroundColor: ThemeColors.primary
  },
  backgroundColor: ThemeColors.primary,
  statusBarColor: ThemeColors.primary,
  headerTintColor: ThemeColors.white
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
