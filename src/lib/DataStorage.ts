import { createMMKV, MMKV } from 'react-native-mmkv';

export default class DataStorage {
  storage = createMMKV({
    id: 'TLM-storage',
    // path: `Documents`
  });

  getAll = () => {
    return this.storage.getAllKeys();
  }

  clearAll = () => {
    this.storage.clearAll();
  }

  deleteWithKey = (key: string) => {
    console.log("Deleting ", key);
    this.storage.remove(key);
  }

  save = (key: string, dataContextKey: string, value: any) => {    
    const saveConstant = (SaveConstants as any)[dataContextKey];
    if (saveConstant) {
      switch (saveConstant.dataType) {
        case 'array':
          value = JSON.stringify(value);
          break;
        case 'json':
          value = JSON.stringify(value);
          break;
        default:
          break;
      }
      console.log("SAVING Key: ", key, " Value: ", value);
      this.storage.set(key, value);
    }
  };

  load = (key: string, dataContextKey: string): any => {
    let returnValue;
    let json;
    const saveConstant = (SaveConstants as any)[dataContextKey];
    if (saveConstant) {
      switch (saveConstant.dataType) {
        case 'string':
          returnValue = this.storage.getString(key);
          break;
        case 'json':
          json = this.storage.getString(key);                    
          returnValue = json ? JSON.parse(json) : {};
          break;
        case 'array':          
          json = this.storage.getString(key);                    
          returnValue = json ? JSON.parse(json) : [];
          break;
        case 'buffer':
          returnValue = this.storage.getBuffer(key);
          break;
        case 'boolean':
          returnValue = this.storage.getBoolean(key);
          break;
        case 'number':
          returnValue = this.storage.getNumber(key);
          break;
      }      
    }
    return returnValue;
  };
}

export const Storage = new DataStorage();

export const SaveConstants = {
  events: {
    key: 'events',
    dataType: 'array',
  },
  expenseReport: {
    key: 'expenseReport',
    dataType: 'array'
  },
  userProfile: {
    key: 'userProfile',
    dataType: 'array'
  },
  versionFile: {
    key: 'versionFile',
    dataType: 'json'
  }
};
