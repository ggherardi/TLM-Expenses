import { SaveConstants, Storage } from "../DataStorage";
import { BusinessDataTypeBase } from "./BusinessDataTypeBase";
import { BusinessEvent } from "./BusinessEvent";
import { ExpenseReport } from "./ExpenseReport";
import { UserProfile } from './UserProfile';
import { VersionData } from "./VersionData";

class DataContext {
    Events: DataSet<BusinessEvent> = new DataSet<BusinessEvent>(SaveConstants.events.key, BusinessEvent);
    UserProfile: DataSet<UserProfile> = new DataSet<UserProfile>(SaveConstants.userProfile.key, UserProfile);
    ExpenseReports!: DataSet<ExpenseReport>;
    Version: DataSet<VersionData> = new DataSet<VersionData>(SaveConstants.versionFile.key, VersionData);

    setExpenseReportsKey = (storageKey: string) => {
        this.ExpenseReports = new DataSet<ExpenseReport>(storageKey, ExpenseReport);
    }

    deleteEntryWithKey = (storageKey: string) => {
        Storage.deleteWithKey(storageKey);
    }
}

class DataSet<T extends BusinessDataTypeBase> {
    public storageKey: string;
    private allData: T[] = [];

    constructor(storageKey: string, private classRef: typeof BusinessDataTypeBase) {
        this.storageKey = storageKey;
        this.allData = Storage.load(storageKey, this.classRef.getDataContextKey());
    }

    refreshData = () => {
        this.allData = Storage.load(this.storageKey, this.classRef.getDataContextKey());
    }

    deleteWhere = (primaryKeyValue: any) => {
        const indexToDelete = this.allData.findIndex((element: T) => this.classRef.primaryKeyWhereCondition(element, primaryKeyValue));        
        let element;
        if (indexToDelete > -1) {
            element = this.allData.splice(indexToDelete, 1);            
        }
        Storage.save(this.storageKey, this.classRef.getDataContextKey(), this.allData);
        if (element && element.length) {
            this.classRef.extraDeleteSteps(element[0]);
        }
        this.refreshData();
    }    

    getAllData = (): T[] => { 
        this.refreshData();
        return this.allData ?? [];
    }

    saveData = (value: any) => {
        Storage.save(this.storageKey, this.classRef.getDataContextKey(), value)
    }
}

const dataContext = new DataContext();
export default dataContext;