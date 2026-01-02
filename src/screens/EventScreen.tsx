import React from 'react';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useCustomHeaderWithButtonAsync } from '../lib/components/CustomHeaderComponent';
import dataContext from '../lib/models/DataContext';
import { useEffect, useState } from 'react';
import { ExpenseDataRowComponent } from '../lib/components/ExpenseDataRowComponent';
import { Utility } from '../lib/Utility';
import { ExpenseReport } from '../lib/models/ExpenseReport';
import GlobalStyles from '../lib/GlobalStyles';
import { Constants } from '../lib/Constants';
import { PDFBuilder } from '../lib/PDFBuilder';
import NavigationHelper from '../lib/NavigationHelper';
import { Images } from '../assets/Images';
import { Dimensions, Image, StyleSheet, Text } from 'react-native';
import LoaderComponent from '../lib/components/LoaderComponent';
import { BusinessEvent } from '../lib/models/BusinessEvent';
import { FileManager } from '../lib/FileManager';

const EventScreen = ({ route, navigation }: any) => {
    const [reports, setReports] = useState<ExpenseReport[]>();
    const [event, setEvent] = useState<BusinessEvent>(route.params[0]);
    const [appHeight, setAppHeight] = useState(Dimensions.get('window').height);
    const [isLoading, setIsLoading] = useState(false);

    // @ts-ignore
    const Context = React.createContext();
    let refundKmAmount = 0;
    if (event.needCarRefund) {
        refundKmAmount = Utility.CalculateKmRefund(event);
    }
    let totalAmount = reports && Utility.CalculateTotalAmount(reports, 'amount') + refundKmAmount;

    useEffect(() => {
        dataContext.setExpenseReportsKey(event.expensesDataContextKey);
        NavigationHelper.setEventTabNavigation(navigation);
    }, []);

    useEffect(() => {
        useCustomHeaderWithButtonAsync(navigation.getParent(), Utility.GetEventHeaderTitle(event), () => viewPdf(), undefined, 'Nota spese', event.sentToCompany, event.sentToCompany ? 'inviato' : 'inviare');
    });

    const refreshData = async () => {
        setIsLoading(true);
        let data = dataContext.ExpenseReports.getAllData();
        Utility.SortByDate(data, 'date', false);
        setReports(data);
        setEvent(Utility.GetEvent(event.id) as BusinessEvent);
        setIsLoading(false);
    };
    Utility.OnFocus({ navigation: navigation, onFocusAction: refreshData });

    const viewPdf = async () => {
        setIsLoading(true);
        try {
            const regeneratedPdfFile = await PDFBuilder.createExpensesPdfAsync(event, event.reportFileName);
            let documentDir;
            if (regeneratedPdfFile) {
                documentDir = await FileManager.getDocumentDir();
                FileManager.deleteFileOrFolder(`${documentDir}/${event.pdfFullFilePath}`);
                const pdfFullFilePath = `${documentDir}/${event.directoryPath}/${event.reportFileName}.pdf`;
                await FileManager.moveFile(regeneratedPdfFile.filePath as string, pdfFullFilePath);
            }
            navigation.navigate(Constants.Navigation.ViewPdf, { event: event, documentPath: documentDir });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <NativeBaseProvider>
            <GestureHandlerRootView>
                {reports && reports.length ? (
                    <ScrollView contentContainerStyle={[GlobalStyles.container]}>
                        <View style={[GlobalStyles.container]}>
                            {isLoading && (<LoaderComponent />)}
                            <View style={[GlobalStyles.flexRow, { paddingHorizontal: 5, paddingBottom: 10 }]}>
                                <Text style={{ flex: 5, fontSize: 20 }}>Importo totale:</Text>
                                <Text style={{ flex: 2, fontSize: 20, fontWeight: 'bold', textAlign: 'right' }}>{totalAmount?.toFixed(2)} {event.mainCurrency.symbol}</Text>
                            </View>
                            {event.needCarRefund && (
                                <View style={[GlobalStyles.flexRow, { paddingHorizontal: 5, paddingBottom: 10 }]}>
                                    <Text style={{ flex: 5, fontSize: 12 }}>Rimborso chilometrico:</Text>
                                    <Text style={{ flex: 2, fontSize: 12, textAlign: 'right' }}>{refundKmAmount?.toFixed(2)} {event.mainCurrency.symbol}</Text>
                                </View>
                            )}
                        </View>
                        {reports && reports.length ? (
                            <>
                                {reports != undefined && reports.length > 0 && reports.map((report: ExpenseReport, index: number) => (
                                    <View key={Utility.GenerateRandomGuid()}>
                                        <ExpenseDataRowComponent expense={report} event={event} onDelete={refreshData} navigation={navigation} index={index} />
                                    </View>
                                ))}
                            </>
                        ) : (
                            <></>
                        )}
                    </ScrollView>
                ) : (
                    <Context.Provider value={appHeight}>
                        <View style={{ flex: 1, padding: 10 }} onLayout={(e: any) => setAppHeight(e.nativeEvent.layout.height)}>
                            <Image source={Images.empty_list_2.rnSource} style={{ alignSelf: 'center', height: 200, resizeMode: 'contain' }} />
                            <Text style={[styles.text]}>Non sono state trovate spese per l'evento!</Text>
                        </View>
                        <View style={{ justifyContent: 'flex-end' }}>
                            <Text style={[styles.text]}>Inserisci una nuova spesa</Text>
                            <FontAwesomeIcon icon={'arrow-down-long'} size={20} color={"gray"} style={{ alignSelf: 'center', marginVertical: 10 }} />
                        </View>
                    </Context.Provider>
                )}
            </GestureHandlerRootView>
        </NativeBaseProvider >
    )
}

const styles = StyleSheet.create({
    text: {
        verticalAlign: 'middle',
        textAlign: 'center',
        fontSize: 15,
    },
    headerView: {
        fontSize: 30,
        justifyContent: 'center',
        // marginHorizontal: 1
    },
    headerText: {
        fontSize: 10,
    }
});

export default EventScreen;
