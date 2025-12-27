import { SaveConstants } from '../DataStorage';
import { BusinessDataTypeBase } from './BusinessDataTypeBase';

export class UserProfile extends BusinessDataTypeBase {
  id!: number;
  name!: string;
  surname!: string;
  email!: string;
  swipeTutorialSeen!: boolean;
  swipeExpenseTutorialSeen!: boolean;
  
  static getDataContextKey = () => SaveConstants.userProfile.key;

  static primaryKeyWhereCondition = (element: UserProfile, id: number) => {
    return element.id == id;
  }
}