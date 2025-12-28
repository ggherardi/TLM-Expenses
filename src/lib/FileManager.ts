import { PermissionsAndroid, Platform } from 'react-native';
import RNFS, { StatResult, ReadDirItem } from 'react-native-fs';
import { PromiseResult } from './models/PromiseResult';
import ImageResizer, { Response } from '@bam.tech/react-native-image-resizer';


export const FileManager = {
  checkStoragePermissions: async (): Promise<PromiseResult> => {
    return new Promise<PromiseResult>(async (resolve, reject) => {
      // resolve(new PromiseResult(true, ''));
      resolve(new PromiseResult(true, 'Permissions granted'));
    });
  },

  checkCameraPermissions: async (): Promise<PromiseResult> => {
    return new Promise<PromiseResult>(async (resolve, reject) => {
      resolve(new PromiseResult(true, 'Permissions granted'));
    });
  },

  checkStorageReadPermissions: async (): Promise<PromiseResult> => {
    return new Promise<PromiseResult>(async (resolve, reject) => {
      resolve(new PromiseResult(true, 'Permissions granted'));
    });
  },

  checkNotificationPermissions: async (): Promise<PromiseResult> => {
    return new Promise<PromiseResult>(async (resolve, reject) => {
      if (Platform.OS == "android" && Platform.Version >= 33) {
        try {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            resolve(new PromiseResult(true, 'Permissions granted'));
          } else {
            reject(new PromiseResult(false, 'Permissions not granted'));
          }
        } catch (err) {
          reject(new PromiseResult(false, 'Exception'));
        }
      } else {
        resolve(new PromiseResult(true, 'Permissions granted'));
      }
    });
  },

  checkCameraAndStoragePermissions: async (): Promise<PromiseResult> => {
    return new Promise<PromiseResult>(async (resolve, reject) => {
      try {
        const checkStoragePermissionsResult = await FileManager.checkStoragePermissions();
        const checkCameraPermissionsResult = await FileManager.checkCameraPermissions();
        // const checkStoragePermissionsResult = { success: true };
        if (checkStoragePermissionsResult.success && checkCameraPermissionsResult.success) {
          resolve(new PromiseResult(true, 'Permissions granted'));
        } else {
          reject(new PromiseResult(false, 'Permissions not granted'));
        }
      } catch (err) {
        reject(new PromiseResult(false, 'Permissions not granted'));
      }
    });
  },

  createFolder: async (path: string): Promise<string> => {
    return new Promise<string>(async (resolve, reject) => {
      const folderToCreate = `${RNFS.DocumentDirectoryPath}/${path}`;
      console.log("Folder to create:", folderToCreate);
      RNFS.mkdir(folderToCreate)
        .then(() => resolve(folderToCreate))
        .catch(err => {
          console.log('Error creating folder', err);
          reject(err);
        });
    });
  },
  
  deleteFileOrFolder: (path: string) => {
    console.log("Path is: ", path);
    RNFS.unlink(path)
      .then(() => console.log(`Path ${path} deleted`))
      .catch((err) => console.log(`Error deleting path ${path} (${err})`));
  },  

  moveFile: async (sourcePath: string, destinationPath: string) => {
    console.log("Moving file from path: ", sourcePath, " to path: ", destinationPath);
    return new Promise<boolean>((resolve, reject) => {
      RNFS.moveFile(sourcePath, destinationPath)
        .then(() => {
          console.log(`${sourcePath} moved to (${destinationPath})`);
          resolve(true);
        })
        .catch(err => {
          console.log(`Error while moving ${sourcePath} to ${destinationPath} (${err})`);
          reject(false);
        });
    });
  },  

  saveFromBase64: async (path: string, base64: string): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      RNFS.writeFile(path, base64, 'base64')
        .then(() => {
          console.log(`Photo successfully saved in path ${path}`);
          resolve(true);
        })
        .catch(err => {
          console.log(`Error while saving photo in path ${path} (${err})`);
          reject(false);
        });
    });
  },  

  encodeBase64: async (path: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      RNFS.readFile(path, 'base64')
        .then(data => resolve(data))
        .catch(err => reject(err));
    });
  },
  
  resizeImage: async (imagePath: string, outputDirectory: string, width: number, height: number): Promise<Response> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("starting resize for image with imagePath: ", imagePath, " outputDirectory: ", outputDirectory);
        const response = await ImageResizer.createResizedImage(imagePath, width, height, 'JPEG', 100, undefined, outputDirectory);
        console.log("resize done")
        resolve(response);
      } catch (err) {
        console.log(`Could not resize image with path ${imagePath}: `, err);
        reject(false);
      }
    });
  },

  getDocumentDir: async (): Promise<string> => {
    return new Promise((resolve) => {
      resolve(RNFS.DocumentDirectoryPath);
    });
  },

  ls: async (path: string): Promise<ReadDirItem[]> => {
    return new Promise(async (resolve, reject) => {
      try {
        const ls = await RNFS.readDir(path);
        resolve(ls);
      } catch (err) {
        console.log('Error reading dir', err);
        reject(err);
      }
    });
  },
  

  stat: async (path: string): Promise<StatResult> => {
    return new Promise(async (resolve, reject) => {
      try {
        const stat = await RNFS.stat(path);
        resolve(stat);
      } catch (err) {
        console.log('Error getting stat', err);
        reject(err);
      }
    });
  },  

  getFile: async (filePath: string, encoding?: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const file = await RNFS.readFile(filePath, encoding);
        resolve(file);
      } catch (err) {
        console.log('Error getting file ', err);
        reject(err);
      }
    });
  }
}