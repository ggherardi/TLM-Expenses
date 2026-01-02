import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import GlobalStyles, { ThemeColors } from '../lib/GlobalStyles';
import { Utility } from '../lib/Utility';
import { BusinessEvent } from '../lib/models/BusinessEvent';
import { useCustomHeaderWithButtonAsync } from '../lib/components/CustomHeaderComponent';
import { Constants } from '../lib/Constants';
import { useEffect, useState } from 'react';

const EventSettingsScreen = ({ route, navigation }: any) => {
    const [event, setEvent] = useState<BusinessEvent>(route.params[0]);

    const refreshData = async () => {
        const refreshedEvent = Utility.GetEvent(event.id);
        if (refreshedEvent) {
            setEvent(refreshedEvent);
        }
        useCustomHeaderWithButtonAsync(
            navigation.getParent(),
            Utility.GetEventHeaderTitle(refreshedEvent ?? event),
            () => { navigation.navigate(Constants.Navigation.EditEventScreen, { event: refreshedEvent ?? event }) },
            'pencil',
            'Impostazioni evento'
        );
    };

    useEffect(() => {
        refreshData();
    }, []);

    Utility.OnFocus({ navigation: navigation, onFocusAction: refreshData });

    return (
        <ScrollView contentContainerStyle={[GlobalStyles.container, styles.container]}>
            <Text style={styles.sectionTitle}>Dati relativi all'evento:</Text>
            <View style={[styles.section]}>
                <Text style={[styles.caption]}>Nome evento</Text>
                <Text style={[styles.text]}>{event.name}</Text>
            </View>
            <View style={[styles.section]}>
                <Text style={[styles.caption]}>Destinazione (città)</Text>
                <Text style={[styles.text]}>{event.city}</Text>
            </View>
            <View style={[styles.section]}>
                <Text style={[styles.caption]}>Date evento</Text>
                <Text style={[styles.text]}>{Utility.FormatDateDDMMYYYY(event.startDate as string)} - {Utility.FormatDateDDMMYYYY(event.endDate as string)}</Text>
            </View>
            <View style={[styles.section]}>
                <Text style={[styles.caption]}>Descrizione evento</Text>
                <Text style={[styles.text]}>{event.description || '-'}</Text>
            </View>
            <View style={[styles.section]}>
                <Text style={[styles.caption]}>Fondo cassa</Text>
                <Text style={[styles.text]}>{event.cashFund ? Number(event.cashFund).toFixed(2) : '0.00'} {event.mainCurrency.symbol}</Text>
            </View>
            {event.needCarRefund && (
                <View>
                    <Text style={styles.sectionTitle}>Dati relativi al rimborso chilometrico:</Text>
                    <View style={[styles.section]}>
                        <Text style={[styles.caption]}>Località di partenza</Text>
                        <Text style={[styles.text]}>{event.refundStartingCity}</Text>
                    </View>
                    <View style={[styles.section]}>
                        <Text style={[styles.caption]}>Località di partenza</Text>
                        <Text style={[styles.text]}>{event.refundArrivalCity}</Text>
                    </View>
                    <View style={[styles.section]}>
                        <Text style={[styles.caption]}>KM percorsi</Text>
                        <Text style={[styles.text]}>{Number(event.totalTravelledKms).toFixed(2)}</Text>
                    </View>
                    <View style={[styles.section]}>
                        <Text style={[styles.caption]}>Importo rimborso forfetario</Text>
                        <Text style={[styles.text]}>{Number(event.travelRefundForfait).toFixed(2)} {event.mainCurrency.symbol}</Text>
                    </View>
                </View>
            )}
        </ScrollView>
    )
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 15,
    },
    section: {
        paddingBottom: 15
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 10,
        color: ThemeColors.black,
        fontWeight: '700',
    },
    caption: {
        fontSize: 15,
        fontWeight: 'bold',
        color: ThemeColors.black,
        marginBottom: 2,
    },
    text: {
        fontSize: 15,
        color: ThemeColors.black,
    }
});

export default EventSettingsScreen;
