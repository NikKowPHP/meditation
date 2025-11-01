import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationService {
  async requestPermissions(): Promise<boolean> {
    const status = await LocalNotifications.requestPermissions();
    return status.display === 'granted';
  }

  async scheduleReminder(hours: number = 24): Promise<void> {
    const scheduleTime = new Date();
    scheduleTime.setHours(scheduleTime.getHours() + hours);

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Time for Meditation',
          body: 'Take a moment to meditate and maintain your streak!',
          id: 1,
          schedule: { at: scheduleTime },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  }

  async cancelAll(): Promise<void> {
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
