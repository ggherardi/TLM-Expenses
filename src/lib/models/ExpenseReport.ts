import { BusinessDataTypeBase } from './BusinessDataTypeBase';
import { SaveConstants } from '../DataStorage';
import { FileManager } from '../FileManager';
import { BusinessEvent } from './BusinessEvent';
import { Constants } from '../Constants';
import { Utility } from '../Utility';

export class ExpenseReport extends BusinessDataTypeBase {  
  id!: number;
  name!: string;
  date!: string;
  timeStamp!: string;
  amount: number = 0;
  description?: string;
  photoFilePath!: string;
  photoDataType!: string;

  static getDataContextKey = () => SaveConstants.expenseReport.key;

  static primaryKeyWhereCondition = (element: ExpenseReport, id: number) => {
    return element.id == id;
  }

  static extraDeleteSteps(element: ExpenseReport): void {
    FileManager.deleteFileOrFolder(element.photoFilePath);
  }

  static generateKmRefund(event: BusinessEvent): ExpenseReport {
    const expense = new ExpenseReport();
    if (event.needCarRefund && Utility.IsNotNullOrUndefined(event.refundStartingCity) && Utility.IsNotNullOrUndefined(event.refundArrivalCity) && event.totalTravelledKms > 0 && event.travelRefundForfait > 0) {      
      const travelledKmsRefund = event.totalTravelledKms * event.travelRefundForfait;      
      expense.amount = travelledKmsRefund;
      expense.name = Constants.Generic.TravelRefundExpenseName;
      expense.description = '';
      expense.date = event.travelDate;    
    }
    return expense;
  }
}