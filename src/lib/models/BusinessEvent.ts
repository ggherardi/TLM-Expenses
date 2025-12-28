import { Alert } from 'react-native';
import { SaveConstants } from '../DataStorage';
import { FileManager } from '../FileManager';
import NotificationManager from '../NotificationManager';
import { Utility } from '../Utility';
import { Currency } from '../data/Currencies';
import { BusinessDataTypeBase } from './BusinessDataTypeBase';

export class BusinessEvent extends BusinessDataTypeBase {
  id!: number;
  name!: string;
  description?: string;
  startDate!: string;
  endDate!: string;
  city?: string;
  currencies?: (Currency | undefined)[];
  mainCurrency!: Currency;
  cashFund: number = 0;
  sentToCompany: boolean = false;

  // km refund properties
  needCarRefund?: boolean;
  refundStartingCity?: string;
  refundArrivalCity?: string;
  totalTravelledKms: number = 0;
  travelRefundForfait: number = 0.2;  
  travelDate!: string;

  // File properties
  directoryName!: string;
  directoryPath!: string;
  pdfFullFilePath!: string;
  reportFileName!: string;
  expensesDataContextKey!: string;

  // Notification properties
  notificationIds!: string[];

  static getDataContextKey = () => SaveConstants.events.key;

  static primaryKeyWhereCondition = (element: BusinessEvent, id: number) => {
    return element.id == id;
  }

  static async extraDeleteSteps(element: BusinessEvent): Promise<void> {
    FileManager.deleteFileOrFolder(`${await FileManager.getDocumentDir()}/${element.directoryPath}`);
    NotificationManager.cancelAllScheduledNotifications(element.notificationIds);
  }

  static scheduleNotifications = (event: BusinessEvent) => {
    // GG: I'm scheduling 3 different notifications here, because iOS does not support the property "repeat" of react-native-push-notification        
    try {
      const endDate = new Date(event.endDate);
      endDate.setHours(10, 0, 0);
      const today = new Date(Date.now());
      today.setHours(10, 0, 0);
      const daysUntilEventEnd = Utility.GetNumberOfDaysBetweenDates(today.toString(), endDate.toString());
      console.log("daysUntilEventEnd: ", daysUntilEventEnd);
      console.log(event.notificationIds);      
      for (let i = 0; i < 3 && i < daysUntilEventEnd; i++) {       
        const notificationId = event.notificationIds[i];
        NotificationManager.scheduleNotification({
          id: notificationId,
          // GG: Production line
          date: new Date(Utility.AddDays(endDate, -i)),
          // GG: Debug line
          // date: new Date(Date.now() + ((i + 1)* 10) * 1000),
          title: `Evento ${event.name} in scadenza`,
          text: `L'evento ${event.name} scadrà in data ${Utility.FormatDateDDMMYYYY(event.endDate)}. Ricordati di inviare la nota spese!`,        
        });
      }
    } catch (ex: any) {
      Alert.alert(ex);
    }    
  }

  static deleteNotifications = (event: BusinessEvent) => {
    NotificationManager.cancelAllScheduledNotifications(event.notificationIds);
  }
}