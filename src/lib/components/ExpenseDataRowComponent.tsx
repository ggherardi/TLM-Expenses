import React, { useEffect, useRef, useState } from 'react';
import { ExpenseReport } from '../models/ExpenseReport';
import { Pressable, StyleSheet, Text, Alert, Animated, View, TouchableOpacity, TouchableHighlight, I18nManager } from 'react-native';
import { Utility } from '../Utility';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import dataContext from '../models/DataContext';
import GlobalStyles, { ThemeColors } from '../GlobalStyles';
import { BusinessEvent } from '../models/BusinessEvent';
import { renderRightAction } from './SwipableActionsComponent';
import { FileManager } from '../FileManager';

interface IExpenseDataRow {
    expense: ExpenseReport;
    event: BusinessEvent;
    onDelete: Function;
    index: number;
    navigation: any;
}

export const ExpenseDataRowComponent = ({ expense: expense, event, onDelete, index, navigation }: IExpenseDataRow) => {
    const [imageUri, setImageUri] = useState<string>();

    const goToExpense = () => {
        // navigation.navigate(Constants.Navigation.EventHome, { expense: expense });
    };
    const swipableRef = useRef<Swipeable>(null);

    const getDocumentDir = async () => {
        const documentDir = await FileManager.getDocumentDir();
        setImageUri(`file:///${documentDir}/${expense.photoFilePath}`);
        console.log(`DocumentDir: ${documentDir}`);
        console.log(`DocumentDir ls: ${(await FileManager.ls(documentDir)).map(a => a.name)}`);
        console.log(`ExpensephotoFilePath: ${expense.photoFilePath}`);
    }

    useEffect(() => {
        const userProfile = Utility.GetUserProfile();
        getDocumentDir();
        if (!userProfile.swipeExpenseTutorialSeen && index == 0) {
            console.log("hinting");
            setTimeout(() => Utility.SwipableHint(swipableRef), 400);
            userProfile.swipeExpenseTutorialSeen = true;
            dataContext.UserProfile.saveData([userProfile]);
        }
    }, []);

    const renderRightActions = () => (
        <View style={{ width: 80, flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }}>
            {renderRightAction("Cancellare la spesa?", 'trash', '#dd2c00', deleteExpense, swipableRef)}
        </View>
    );

    const deleteExpense = (swipableRef: any) => {
        const onDeleteConfirm = () => {
            dataContext.ExpenseReports.deleteWhere(expense.id);
            onDelete();
            Utility.ShowSuccessMessage("Spesa eliminata correttamente");
            swipableRef?.current?.close();
        }
        Alert.alert("Conferma cancellazione", "Tutti i dati legati alla spesa verranno rimossi dal dispositivo.", [
            { text: "Ok", onPress: onDeleteConfirm },
            { text: "Annulla", style: "cancel" }
        ]);
    };

    console.log("imageUri: ", imageUri);

    return (
        <GestureHandlerRootView>
            <Swipeable ref={swipableRef} key={`swipable_${expense.name}_${index}_${Utility.GenerateRandomGuid()}`} renderRightActions={renderRightActions} overshootRight={false}>
                <Pressable key={`${index}`} onPress={goToExpense} style={({ pressed }) => [
                    styles.container, { opacity: pressed ? 1 : 1, borderBottomWidth: 1, borderTopWidth: index == 0 ? 1 : 0, borderColor: ThemeColors.lightGray }]}>
                    <Row>
                        <Text style={[styles.day]}>{Utility.FormatDateDDMMYYYY(expense.date)}</Text>
                    </Row>
                    <Row style={[GlobalStyles.pt5]}>
                        <View style={[styles.expenseImageContainer]}>
                            {Utility.IsNotNullOrUndefined(expense.photoFilePath) && Utility.IsNotNullOrUndefined(imageUri) && (
                                <Image alt='noimage' source={{ uri: imageUri }} style={[styles.image]} />
                            )}
                        </View>
                        <View style={[styles.expenseNameContainer]}>
                            {expense.description != undefined && expense.description.length ? (
                                <VStack style={styles.expenseNameContainer}>
                                    <Text style={[styles.expenseName]}>{expense.name}</Text>
                                    <Text style={[styles.expenseDescription]} numberOfLines={1}>{expense.description}</Text>
                                </VStack>
                            ) : (
                                <Text style={[styles.expenseName]}>{expense.name}</Text>
                            )}
                        </View>
                        <View style={[styles.expenseAmountContainer]}>
                            <Text style={{ fontSize: 15 }}>{expense.amount.toFixed(2)} {event.mainCurrency?.symbol}</Text>
                        </View>
                    </Row>
                </Pressable>
            </Swipeable>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexWrap: 'wrap',
        maxWidth: '100%',
        paddingHorizontal: 5,
        paddingVertical: 10,
        backgroundColor: ThemeColors.white
    },
    expenseDateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    expenseImageContainer: {
        flex: 3,
        justifyContent: 'center'
    },
    expenseNameContainer: {
        flex: 8,
        justifyContent: 'center',
    },
    expenseAmountContainer: {
        flex: 3,
        justifyContent: 'center'
    },
    day: {
        alignSelf: 'center',
        fontSize: 10
    },
    expenseName: {
        fontSize: 17,
        fontWeight: 'bold'
    },
    expenseDescription: {
        maxWidth: '100%',
        flex: 1
    },
    swipedRow: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        paddingLeft: 5,
        backgroundColor: '#d0342c',
        minHeight: 50,
    },
    deleteConfirmationText: {
        color: '#fcfcfc',
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    deleteButton: {
        backgroundColor: '#b60000',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
    },
    deleteButtonText: {
        color: '#fcfcfc',
        fontWeight: 'bold',
        padding: 3,
    },
    swipedConfirmationContainer: {
        flex: 1,
    },
    image: {
        height: 40,
        width: 40,
        marginRight: 10,
        borderRadius: 5,
    },
});