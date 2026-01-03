import React from 'react';
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Constants } from '../lib/Constants';
import EventScreen from './EventScreen';
import { ThemeColors } from '../lib/GlobalStyles';
import EventSettingsScreen from './EventSettingsScreen';
import { NavigationFakeButtonComponent } from '../lib/components/NavigationFakeButtonComponent';
import PlaceholderScreen from './PlaceholderScreen';
import BaseIcon, { IconName } from '../lib/base-components/BaseIcon';

const Tab = createBottomTabNavigator();

const EventHomeScreen = ({ navigation, route }: any) => {
    // @ts-ignore
    const newExpenseTabOptions = ({ navigation }) => ({
        tabBarButton: () => <NavigationFakeButtonComponent icon={'plus'} pressFunction={() => { navigation.navigate(Constants.Navigation.NewExpenseReport, { event: route.params.event }) }} />
    });
    
    return (
        <Tab.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let tabIcon: IconName = 'table-list';
                switch (route.name) {
                    case Constants.Navigation.Event:
                        tabIcon = 'table-list';
                        break;
                    case Constants.Navigation.NewExpenseReport:
                        tabIcon = 'plus';
                        break;
                    case Constants.Navigation.EventSettingsScreen:
                        tabIcon = 'cog';
                        break;
                }
                return <BaseIcon name={tabIcon} color={focused ? ThemeColors.primary : ThemeColors.inactive} />;
            },
            tabBarActiveTintColor: ThemeColors.primary,
            tabBarInactiveTintColor: 'gray',
        })}>
            <Tab.Screen
                name={Constants.Navigation.Event}
                component={EventScreen}
                initialParams={[route.params.event]}
                options={commonTabOptions}></Tab.Screen>
            <Tab.Screen
                name={Constants.Navigation.NewEvent}
                component={PlaceholderScreen}
                options={newExpenseTabOptions}></Tab.Screen>
            <Tab.Screen
                name={Constants.Navigation.EventSettingsScreen}
                component={EventSettingsScreen}
                initialParams={[route.params.event]}
                options={commonTabOptions}></Tab.Screen>
        </Tab.Navigator>
    )
}

const commonTabOptions: BottomTabNavigationOptions = {
    lazy: true,
    headerShown: false,
}

export default EventHomeScreen;
