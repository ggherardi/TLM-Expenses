import DateTimePicker from '@react-native-community/datetimepicker';
import { FormControl, HStack, Input, NativeBaseProvider, TextArea } from '@gluestack-ui/themed-native-base';
import { useEffect, useRef, useState } from 'react';
import React, { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import GlobalStyles, { ThemeColors } from '../lib/GlobalStyles';
import { Utility } from '../lib/Utility';
import { InputSideButton } from '../lib/components/InputSideButtonComponent';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ExpenseReport } from '../lib/models/ExpenseReport';
import dataContext from '../lib/models/DataContext';
import { InputNumber } from '../lib/components/InputNumberComponent';
import { BusinessEvent } from '../lib/models/BusinessEvent';
import { Currency } from '../lib/data/Currencies';
import { Constants } from '../lib/Constants';
import { useCustomHeaderWithButtonAsync } from '../lib/components/CustomHeaderComponent';
import { FileManager } from '../lib/FileManager';
import { PDFBuilder } from '../lib/PDFBuilder';
import NavigationHelper from '../lib/NavigationHelper';
import ModalLoaderComponent from '../lib/components/ModalWithLoader';
import { FormErrorMessageComponent } from '../lib/components/FormErrorMessageComponent';
import DocumentScanner, { ResponseType } from 'react-native-document-scanner-plugin'
import MlkitOcr from 'react-native-mlkit-ocr';
const NewExpenseReportScreen = ({ route, navigation }: any) => {
    const [expenses, setExpenses] = useState(dataContext.ExpenseReports.getAllData())
    const [expenseName, setExpenseName] = useState('');
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseDate, setExpenseDate] = useState<Date | undefined>(new Date());
    const [expenseAmount, setExpenseAmount] = useState('');
    const [showDateTimePicker, setShowDateTimePicker] = useState(false);
    const [photo, setPhoto] = useState<any>();
    const [scannedImageToDelete, setScannedImageToDelete] = useState<any>();
    const [amountCurrencyCode, setAmountCurrencyCode] = useState('EUR');
    const [guessedTotalAmount, setGuessedTotalAmount] = useState<number>();
    const [isFormValid, setIsFormValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [pickerOpen, setPickerOpen] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const event: BusinessEvent = route.params.event;
    const extraCurrencies: any[] = event.currencies ? event.currencies : [];
    const imagePickerCommonOptions = { mediaType: "photo", maxWidth: 800, maxHeight: 600, includeBase64: true };

    useEffect(() => {
        useCustomHeaderWithButtonAsync(navigation, Utility.GetEventHeaderTitle(event), () => saveExpenseReport(), undefined, 'Crea nuova spesa', isFormValid, 'salva');
    });

    const expenseItems = [
        "cena",
        "pagamento servizi per ospiti",
        "parcheggio",
        "pedaggi",
        "pranzo",
        "taxi",
        "ticket mezzi pubblici",
        "altro"
    ];

    const handleExpenseDescriptionChange = (e: any) => setExpenseDescription(e);
    const handleExpenseAmount = (e: any) => setExpenseAmount(e);

    const deletePhoto = () => setPhoto(undefined);

    const onSelectImagePress = async () => {
        let hasPermissions: boolean = false;
        try {
            const permissions = await FileManager.checkStorageReadPermissions();
            hasPermissions = permissions.success;
        } catch (err) {
            hasPermissions = false;
            Alert.alert("Impossibile creare la nota spesa", "Per poter proseguire, è necessario fornire all'applicazione i permessi di lettura sulla memoria del dispositivo");
        }
        if (!hasPermissions) {
            return;
        }
        //@ts-ignore
        launchImageLibrary(imagePickerCommonOptions, onImageSelect);
    }

    const onImageSelect = async (media: any) => {
        if (!media.didCancel && media.assets[0]) {
            const photo = media.assets[0];
            setPhoto(photo);
            startOCR(photo);
        }
    };

    const onTakePhoto = async () => {
        let hasPermissions: boolean = false;
        try {
            const permissions = await FileManager.checkCameraAndStoragePermissions();
            hasPermissions = permissions.success;
        } catch (err) {
            hasPermissions = false;
            Alert.alert("Impossibile creare la nota spesa", "Per poter proseguire, è necessario fornire all'applicazione i permessi di accesso alla fotocamera e di scrittura sulla memoria del dispositivo");
            console.log(hasPermissions);
        }
        if (!hasPermissions) {
            return;
        }
        //@ts-ignore
        try {
            const { scannedImages } = await DocumentScanner.scanDocument({
                responseType: ResponseType.ImageFilePath
            });
            if (scannedImages && scannedImages.length > 0) {
                // const base64Image = scannedImages[0];
                const scannedImage = scannedImages[0];
                const tempPhoto = {
                    uri: `${scannedImage}`,
                    type: 'image/jpg'
                }
                setScannedImageToDelete(tempPhoto);
                setPhoto(tempPhoto);
                startOCR(tempPhoto);
            }
        } catch (err) {
            console.log(err);
        }

    }

    const startOCR = async (picture: any) => {
        const resultFromUri = await MlkitOcr.detectFromUri(picture.uri);
        console.log("resultFromUri: ", resultFromUri);

        /* GG: The logic I applied is the following: I take all the text from the picture (they are an array of texts). From this array, I create a new array containing numbers with decimals, which should be currencies.
        From this array I take the highest value, which should be the total amount */
        let allValuesWithDecimalsInPicture: any[] = [];
        resultFromUri.map(a => {
            const splittedText = a.text.replace(',', '.').split(' ');
            splittedText.map(st => {
                if (st.indexOf('.') > -1 && !isNaN(Number(st))) {
                    allValuesWithDecimalsInPicture = [...allValuesWithDecimalsInPicture, Number(st)];
                }
            });
            return splittedText;
        })
        console.log("allValueallValuesWithDecimalsInPicture: ", allValuesWithDecimalsInPicture);
        const guessedAmount = Math.max(...allValuesWithDecimalsInPicture);
        if (guessedAmount && guessedAmount > 0) {
            setGuessedTotalAmount(guessedAmount);
            setExpenseAmount(guessedAmount.toString());
        }
    }

    const saveExpenseReport = async () => {
        let hasPermissions = false;
        setIsLoading(true);
        if (!validate()) {
            setIsLoading(false);
            return;
        }
        try {
            const promiseResult = await FileManager.checkStoragePermissions();
            hasPermissions = promiseResult.success;
        } catch (err) {
            hasPermissions = false;
        }
        // if (!hasPermissions) {
        //     Alert.alert("Impossibile creare la nota spesa", "Per il salvataggio della nota spesa, è necessario garantire permessi di scrittura sul dispositivo");
        //     setIsLoading(false);
        //     return;
        // }
        let expense: ExpenseReport = new ExpenseReport();
        if (expenses && expenses.map) {
            try {
                let id = Math.max(...expenses.map((e: ExpenseReport) => e.id));
                expense.id = id >= 0 ? id + 1 : 0;
                expense.name = expenseName.trim();
                expense.description = expenseDescription.trim();
                expense.amount = Number(expenseAmount);
                expense.date = (expenseDate as Date).toString();
                expense.timeStamp = new Date().toString();
                const documentDir = await FileManager.getDocumentDir();
                const photoFileName = `${Utility.SanitizeString(event.name)}-${Utility.SanitizeString(expense.name)}-${Utility.FormatDateDDMMYYYY(expense.date, '-')}-${Utility.GenerateRandomGuid("")}.${Utility.GetExtensionFromType(photo.type)}`;
                const photoLeafFilePath = `${event.directoryPath}/${photoFileName}`;
                const photoFullFilePath = `${documentDir}/${photoLeafFilePath}`;
                let operationResult;
                if (photo.base64) {
                    operationResult = await FileManager.saveFromBase64(photoFullFilePath, photo.base64);
                } else {
                    // GG: If there is no base64, it means that DocumentScanner was used, hence we need to resize the image first
                    let resizeOperation;
                    try {
                        console.log(scannedImageToDelete.uri, event.directoryPath);
                        const scannedImagePath = scannedImageToDelete.uri.startsWith("file://") ? scannedImageToDelete.uri.replace("file://", "") : scannedImageToDelete.uri;
                        const resizeOutputDirectory = `${documentDir}${event.directoryPath}`;
                        resizeOperation = await FileManager.resizeImage(scannedImagePath, resizeOutputDirectory, 800, 600);
                        console.log("Resize operation successful: ", resizeOperation);
                    } catch (err) {
                        console.log("error");
                        setIsLoading(false);
                        return;
                    }
                    // GG: If the resize was successful, we now need to move the resized image to the event folder while renaming it
                    if (resizeOperation) {
                        const resizedImagePath = resizeOperation.path.startsWith("file://") ? resizeOperation.path.replace("file://", "") : resizeOperation.path;
                        console.log("Moving and renaming image from resizeOperation.path: ", resizedImagePath, " to photoFileFullPath: ", photoFullFilePath);
                        operationResult = await FileManager.moveFile(resizedImagePath, photoFullFilePath);
                    }
                }
                if (operationResult) {
                    const userProfile = Utility.GetUserProfile();
                    userProfile.swipeExpenseTutorialSeen = false;
                    dataContext.UserProfile.saveData([userProfile]);

                    expense.photoFilePath = photoLeafFilePath;
                    expenses.push(expense);

                    if (scannedImageToDelete) {
                        // GG: If we used DocumentScanner, we delete the original saved image from the pictures folder
                        console.log("Deleting image created with DocumentScanner with uri: ", scannedImageToDelete.uri);
                        await FileManager.deleteFileOrFolder(scannedImageToDelete.uri.replace("file://", ""));
                    }
                    dataContext.ExpenseReports.saveData(expenses);
                    const allExpenses = dataContext.ExpenseReports.getAllData();
                    setExpenses(allExpenses);
                    Utility.ShowSuccessMessage("Nota spesa creata correttamente");

                    NavigationHelper.getEventTabNavigation().navigate(Constants.Navigation.Event);
                } else {
                    console.log("Cannot save the expense report because the photo could not be added to external storage");
                }
            } catch {
                setIsLoading(false);
            }
        }
        setIsLoading(false);
    };

    const validate = (): boolean => {
        let isValid = true;
        let validationErrorsTemp = {};
        if (!expenseName) {
            validationErrorsTemp = { ...validationErrorsTemp, expenseName: 'Campo obbligatorio' };
            isValid = false;
        }
        if (!expenseDate) {
            validationErrorsTemp = { ...validationErrorsTemp, expenseDate: 'Campo obbligatorio' };
            isValid = false;
        }
        if (!expenseAmount) {
            validationErrorsTemp = { ...validationErrorsTemp, expenseAmount: 'Campo obbligatorio' };
            isValid = false;
        }
        if (expenseName == "altro" && !expenseDescription) {
            validationErrorsTemp = { ...validationErrorsTemp, expenseDescription: 'Campo obbligatorio' };
            isValid = false;
        }
        setValidationErrors(validationErrorsTemp);
        return isValid;
    }

    const refreshData = () => {
        setExpenses(dataContext.ExpenseReports.getAllData());
    }

    const scrollToY = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd();
        }, 100);
    }

    Utility.OnFocus({ navigation: navigation, onFocusAction: refreshData });

    return (
        <NativeBaseProvider>
            <ModalLoaderComponent isLoading={isLoading} text='Creazione spesa in corso..' />
            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
                <ScrollView ref={scrollViewRef} style={styles.container}>
                    <FormControl style={GlobalStyles.mt15} isRequired isDisabled>
                        <FormControl.Label>Foto</FormControl.Label>
                        <HStack style={[GlobalStyles.pt15]}>
                            {photo != undefined && photo != null ? (
                                <HStack>
                                    <Image source={{ uri: `${photo.uri ? photo.uri : photo.base64}` }} style={styles.image} resizeMode="contain"></Image>
                                    <InputSideButton icon={"x"} iconColor={ThemeColors.black} pressFunction={deletePhoto} />
                                </HStack>
                            ) : (
                                <>
                                    <InputSideButton icon={"camera-retro"} iconColor={ThemeColors.black} pressFunction={onTakePhoto} />
                                    <InputSideButton icon={"images"} iconColor={ThemeColors.black} pressFunction={onSelectImagePress} />
                                    <InputSideButton icon={"car-side"} iconColor={ThemeColors.black} pressFunction={() => navigation.navigate(Constants.Navigation.RefundKmScreen, { event: event })} />
                                </>
                            )}
                        </HStack>
                    </FormControl>

                    {photo ? (
                        <View style={{ width: "100%" }}>
                            <FormControl style={GlobalStyles.mt15} isRequired isInvalid={'expenseName' in validationErrors}>
                                <FormControl.Label>Titolo spesa</FormControl.Label>
                            </FormControl>
                            <View style={{ width: '100%' }}>
                                <Pressable
                                    onPress={() => setPickerOpen(true)}
                                    style={[
                                        styles.pickerContainer,
                                        { borderColor: 'expenseName' in validationErrors ? 'red' : '#d1d5db' }
                                    ]}
                                >
                                    <Text style={[styles.pickerText, { color: expenseName ? '#000' : '#9ca3af' }]}>
                                        {expenseName || 'Selezionare una voce'}
                                    </Text>
                                </Pressable>
                            </View>
                            <Modal transparent visible={pickerOpen} animationType="fade" onRequestClose={() => setPickerOpen(false)}>
                                <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPressOut={() => setPickerOpen(false)}>
                                    <View style={styles.modalSheet}>
                                        <ScrollView>
                                            {expenseItems !== undefined && expenseItems.length > 0 && expenseItems.map((item) => (
                                                <Pressable
                                                    key={item}
                                                    style={styles.modalItem}
                                                    onPress={() => {
                                                        setExpenseName(item);
                                                        setPickerOpen(false);
                                                    }}
                                                >
                                                    <Text style={styles.modalItemText}>{item}</Text>
                                                </Pressable>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </TouchableOpacity>
                            </Modal>
                            <FormErrorMessageComponent text='Campo obbligatorio' field='expenseName' validationArray={validationErrors} />

                            <FormControl style={GlobalStyles.mt15} isRequired isInvalid={'expenseAmount' in validationErrors}>
                                <FormControl.Label>Importo della spesa ({event.mainCurrency.symbol})</FormControl.Label>
                                <InputNumber defaultValue={guessedTotalAmount} placeholder='es. 50.5' onChange={handleExpenseAmount} isRequired={true} />
                                <FormErrorMessageComponent text='Campo obbligatorio' field='expenseAmount' validationArray={validationErrors} />
                            </FormControl>

                            <FormControl style={GlobalStyles.mt15} isRequired isInvalid={'expenseDate' in validationErrors}>
                                <FormControl.Label>Data della spesa</FormControl.Label>
                                <Input
                                    caretHidden={true}
                                    showSoftInputOnFocus={false}
                                    placeholder="gg/mm/aaaa"
                                    onPressIn={() => setShowDateTimePicker(true)}
                                    value={expenseDate ? Utility.FormatDateDDMMYYYY(expenseDate.toString()) : ""}
                                    InputLeftElement={
                                        <InputSideButton
                                            icon="calendar-day"
                                            iconStyle={GlobalStyles.iconPrimary}
                                            pressFunction={() => {
                                                setShowDateTimePicker(true);
                                            }}
                                        />
                                    }
                                />
                                {showDateTimePicker && (
                                    <DateTimePicker
                                        mode="date"
                                        themeVariant='light'
                                        display="inline"
                                        locale="it-IT"
                                        value={expenseDate ? expenseDate : new Date()}
                                        onChange={(event, date) => {
                                            setShowDateTimePicker(false);
                                            setExpenseDate(date as Date);
                                        }}
                                    />
                                )}
                                <FormErrorMessageComponent text='Campo obbligatorio' field='expenseDate' validationArray={validationErrors} />
                            </FormControl>
                            <FormControl style={GlobalStyles.mt15} isRequired={expenseName == "altro"} isInvalid={'expenseDescription' in validationErrors}>
                                <FormControl.Label>Descrizione della spesa</FormControl.Label>
                                <TextArea placeholder="es. Taxi per trasferimento aeroporto" onChange={handleExpenseDescriptionChange} autoCompleteType={true} isInvalid={'expenseDescription' in validationErrors} onFocus={scrollToY} tvParallaxProperties={undefined} onTextInput={undefined}></TextArea>
                                <FormErrorMessageComponent text='Campo obbligatorio con voce "altro" selezionata' field='expenseDescription' validationArray={validationErrors} />
                            </FormControl>
                        </View>
                    ) : (
                        <Text></Text>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </NativeBaseProvider>
    )
};

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        // justifyContent: 'flex-start',
        // alignItems: 'center',
        height: '100%',
        padding: 20,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 30,
    },
    image: {
        height: 50,
        width: 50,
        marginRight: 10
        // marginTop: 30,
        // borderRadius: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderRadius: 6,
        height: 48,
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12
    },
    pickerText: {
        fontSize: 16
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end'
    },
    modalSheet: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        maxHeight: '50%'
    },
    modalItem: {
        paddingVertical: 12,
        paddingHorizontal: 16
    },
    modalItemText: {
        fontSize: 16
    },
});

export default NewExpenseReportScreen;
