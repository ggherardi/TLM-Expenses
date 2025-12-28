import { Constants } from './Constants';
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';

interface INotificationProps {
  id?: string;
  channel?: string;
  title?: string;
  text: string;
  date: Date;
  when?: number;
}

const defaults: Pick<INotificationProps, 'channel' | 'when'> = {
  channel: Constants.Channels.Reminder.id,
  when: Date.now()
}

const NotificationManager = {
  displayNotification: async () => {
    await notifee.requestPermission();
    await notifee.displayNotification({
      title: 'Titolo notifica',
      body: 'Corpo della notifica',
    });
  },

  getScheduledNotifications: (): Promise<string[]> => {
    return new Promise(async (resolve, reject) => {
      const triggerNotificationIds = await notifee.getTriggerNotificationIds();
        resolve(triggerNotificationIds);
    });
  },

  cancelScheduledNotification: (id: string) => {
    console.log("Deleting scheduled notification with id: ", id);
    notifee.cancelTriggerNotification(id);
  },

  cancelAllScheduledNotifications: (ids: string[]) => {
    console.log("Deleting scheduled notifications with ids: ", ...ids);
    for (const id of ids) {      
      // notifee.cancelTriggerNotifications(ids);
    }    
  },

  scheduleNotification: async (props: INotificationProps) => {    
    props = { ...defaults, ...props };
    console.log(`Scheduling notification with id: `, props.id, ` and date: `, props.date)
    const timeTrigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: props.date.getTime()
    };
    const triggerNotification = await notifee.createTriggerNotification({
      title: props.title,
      body: props.text,
      id: props.id
    }, timeTrigger).catch((e) => console.log("Error scheduling a notification: ", e));
  },
}

export default NotificationManager;