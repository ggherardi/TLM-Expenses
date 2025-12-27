import { SaveConstants } from '../DataStorage';
import { BusinessDataTypeBase } from './BusinessDataTypeBase';
import { VersionFile } from './VersionFile';

export class VersionData extends BusinessDataTypeBase {
  id!: number;
  versionFile: VersionFile = {
    version_schema: 1,
    global_message: null,
    maintenance: { enabled: false, message: '' },
    ios: {
      latest_version: "0",
      min_supported_version: "0",
      force_update: false,
      store_url: '',
      message: '',
      changelog: [],
    },
    android: {
      latest_version: "0",
      min_supported_version: "0",
      force_update: false,
      store_url: '',
      message: '',
      changelog: [],
    }
  }
  
  static getDataContextKey = () => SaveConstants.versionFile.key;

  static primaryKeyWhereCondition = (element: VersionData, id: number) => {
    return element.id == id;
  }
}