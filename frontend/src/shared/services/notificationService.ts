// Browser Web Push & Desktop Notifications Service
export const notificationService = {
  // So‘rov yuborish: Qurilma saytga kirishi bilan ruxsat so‘raydi
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Ushbu brauzerda Web Notification API qo‘llab-quvvatlanmaydi.');
      return 'denied';
    }

    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        return permission;
      } catch (err) {
        console.error('Bildirishnomaga ruxsat so‘rashda xatolik:', err);
        return 'denied';
      }
    }

    return Notification.permission;
  },

  // Qurilma darajasida (OS Desktop / Mobile Push) bildirishnoma chiqarish
  // User tizimni ishlatmayotgan / boshqa oynada bo‘lsa ham ekranda chiqadi
  sendDesktopNotification(title: string, options?: { body?: string; icon?: string; url?: string }) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return null;
    }

    try {
      const notif = new Notification(title, {
        body: options?.body || '',
        icon: options?.icon || 'https://api.iconify.design/lucide:bell.svg?color=%230d9488',
        tag: `bolajon-erp-${Date.now()}`,
      });

      notif.onclick = () => {
        window.focus();
        if (options?.url) {
          window.location.href = options.url;
        }
        notif.close();
      };

      return notif;
    } catch (err) {
      console.error('Desktop bildirishnoma yuborishda xatolik:', err);
      return null;
    }
  },
};
