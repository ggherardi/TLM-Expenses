import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeColors } from '../lib/GlobalStyles';
import { Utility } from '../lib/Utility';
import { InputSideButton } from '../lib/components/InputSideButtonComponent';
import { launchImageLibrary } from 'react-native-image-picker';
import { ExpenseReport } from '../lib/models/ExpenseReport';
import dataContext from '../lib/models/DataContext';
import { InputNumber } from '../lib/components/InputNumberComponent';
import { BusinessEvent } from '../lib/models/BusinessEvent';
import { Constants } from '../lib/Constants';
import { useCustomHeaderWithButtonAsync } from '../lib/components/CustomHeaderComponent';
import { FileManager } from '../lib/FileManager';
import ModalLoaderComponent from '../lib/components/ModalWithLoader';
import { FormErrorMessageComponent } from '../lib/components/FormErrorMessageComponent';
import DocumentScanner, { ResponseType } from 'react-native-document-scanner-plugin'
import MlkitOcr from 'react-native-mlkit-ocr';
import BaseTextInput from '../lib/base-components/BaseTextInput';
const NewExpenseReportScreen = ({ route, navigation }: any) => {
    const [expenses, setExpenses] = useState(dataContext.ExpenseReports.getAllData())
    const [expenseName, setExpenseName] = useState('');
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseDate, setExpenseDate] = useState<Date | undefined>(new Date());
    const [expenseAmount, setExpenseAmount] = useState<number | undefined>();
    const [showDateTimePicker, setShowDateTimePicker] = useState(false);
    const [photo, setPhoto] = useState<any>();
    const [scannedImageToDelete, setScannedImageToDelete] = useState<any>();
    const [guessedTotalAmount, setGuessedTotalAmount] = useState<number>();
    const [isFormValid, setIsFormValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [pickerOpen, setPickerOpen] = useState(false);
    const scrollViewRef = useRef<ScrollView | null>(null);

    const event: BusinessEvent = route.params.event;
    const imagePickerCommonOptions = { mediaType: "photo", maxWidth: 800, maxHeight: 600, includeBase64: true };

    useEffect(() => {
        useCustomHeaderWithButtonAsync(navigation, Utility.GetEventHeaderTitle(event), () => saveExpenseReport(), 'save', 'Crea nuova spesa', !isFormValid, 'salva');
    }, [navigation, event, isFormValid]);

    useEffect(() => {
        const valid = !!photo && !!expenseName && !!expenseDate && expenseAmount !== undefined && (expenseName !== 'altro' || !!expenseDescription);
        setIsFormValid(valid);
    }, [photo, expenseName, expenseDate, expenseAmount, expenseDescription]);

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

    const handleExpenseDescriptionChange = (e: string) => setExpenseDescription(e);
    const handleExpenseAmount = (value: number | undefined) => setExpenseAmount(value);

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
            setExpenseAmount(guessedAmount);
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
                expense.amount = expenseAmount ?? 0;
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

                    navigation.getParent()?.navigate(Constants.Navigation.Event);
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
        if (expenseAmount === undefined || isNaN(expenseAmount)) {
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
        <>
            <ModalLoaderComponent isLoading={isLoading} text='Creazione spesa in corso..' />
            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
                <ScrollView ref={scrollViewRef} style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Foto</Text>
                        <View style={[styles.row, { paddingTop: 12 }]}>
                            {photo ? (
                                <View style={[styles.row]}>
                                    <Image source={{ uri: `${photo.uri ? photo.uri : photo.base64}` }} style={styles.image} resizeMode="contain" />
                                    <View style={styles.buttonSpacing}>
                                        <InputSideButton icon={"x"} iconColor={ThemeColors.black} pressFunction={deletePhoto} />
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.row}>
                                    <View style={styles.buttonSpacing}>
                                        <InputSideButton icon={"camera"} iconColor={ThemeColors.black} pressFunction={onTakePhoto} />
                                    </View>
                                    <View style={styles.buttonSpacing}>
                                        <InputSideButton icon={"image"} iconColor={ThemeColors.black} pressFunction={onSelectImagePress} />
                                    </View>
                                    <View style={styles.buttonSpacing}>
                                        <InputSideButton icon={"car"} iconColor={ThemeColors.black} pressFunction={() => navigation.navigate(Constants.Navigation.RefundKmScreen, { event: event })} />
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {photo ? (
                        <View style={{ width: "100%" }}>
                            <View style={styles.field}>
                                <Text style={styles.label}>Titolo spesa</Text>
                                <Pressable
                                    onPress={() => setPickerOpen(true)}
                                    style={[
                                        styles.pickerContainer,
                                        { borderColor: 'expenseName' in validationErrors ? ThemeColors.danger : '#d1d5db' }
                                    ]}
                                >
                                    <Text style={[styles.pickerText, { color: expenseName ? '#000' : '#9ca3af' }]}>
                                        {expenseName || 'Selezionare una voce'}
                                    </Text>
                                </Pressable>
                                <Modal transparent visible={pickerOpen} animationType="fade" onRequestClose={() => setPickerOpen(false)}>
                                    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPressOut={() => setPickerOpen(false)}>
                                        <View style={styles.modalSheet}>
                                            <ScrollView>
                                                {expenseItems && expenseItems.length > 0 && expenseItems.map((item) => (
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
                            </View>

                            <View style={styles.field}>
                                <Text style={styles.label}>Importo della spesa ({event.mainCurrency.symbol})</Text>
                                <InputNumber defaultValue={guessedTotalAmount} placeholder='es. 50.5' onChange={handleExpenseAmount} isRequired={true} />
                                <FormErrorMessageComponent text='Campo obbligatorio' field='expenseAmount' validationArray={validationErrors} />
                            </View>

                            <View style={styles.field}>
                                <Text style={styles.label}>Data della spesa</Text>
                                <Pressable onPress={() => setShowDateTimePicker(true)} style={styles.inputWithIcon}>
                                    <BaseTextInput
                                        editable={false}
                                        value={expenseDate ? Utility.FormatDateDDMMYYYY(expenseDate.toString()) : ""}
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
                            </View>

                            <View style={styles.field}>
                                <Text style={styles.label}>Descrizione della spesa</Text>
                                <BaseTextInput
                                    placeholder="es. Taxi per trasferimento aeroporto"
                                    onChangeText={handleExpenseDescriptionChange}
                                    multiline
                                    numberOfLines={4}
                                    hasError={'expenseDescription' in validationErrors}
                                    onFocus={scrollToY}
                                    style={styles.textArea}
                                />
                                <FormErrorMessageComponent text='Campo obbligatorio con voce \"altro\" selezionata' field='expenseDescription' validationArray={validationErrors} />
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.helper}>Aggiungi una foto per creare una spesa</Text>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    )
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
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
    image: {
        height: 50,
        width: 50,
        marginRight: 10
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
    helper: {
        marginTop: 10,
        color: ThemeColors.inactive,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonSpacing: {
        marginRight: 12,
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
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
});

export default NewExpenseReportScreen;
