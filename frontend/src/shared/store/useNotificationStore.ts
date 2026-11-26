import { create } from 'zustand';
import { http } from '@/shared/api/http';
import { notificationService } from '@/shared/services/notificationService';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  isRead: boolean;
  link?: string;
  createdAt: string;
  timeAgo: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fetchNotifications: (role?: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  pushLocalAlert: (title: string, message: string, type?: 'info' | 'warning' | 'success' | 'danger', link?: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isOpen: false,

  setIsOpen: (isOpen) => set({ isOpen }),

  fetchNotifications: async (role?: string) => {
    try {
      const res = await http.get(`/notifications${role ? `?role=${role}` : ''}`);
      const list: AppNotification[] = res.data.data || [];
      const prevIds = new Set(get().notifications.map((n) => n.id));

      // Trigger desktop notification for any brand-new unread items
      if (get().notifications.length > 0) {
        list.forEach((item) => {
          if (!prevIds.has(item.id) && !item.isRead) {
            notificationService.sendDesktopNotification(item.title, {
              body: item.message,
              url: item.link,
            });
          }
        });
      }

      const unreadCount = list.filter((n) => !n.isRead).length;
      set({ notifications: list, unreadCount });
    } catch {
      // ignore
    }
  },

  markAsRead: async (id: string) => {
    try {
      await http.patch(`/notifications/${id}/read`);
      set((state) => {
        const nextList = state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        return {
          notifications: nextList,
          unreadCount: nextList.filter((n) => !n.isRead).length,
        };
      });
    } catch {
      // ignore
    }
  },

  markAllAsRead: async () => {
    try {
      await http.patch('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch {
      // ignore
    }
  },

  pushLocalAlert: (title, message, type = 'info', link) => {
    const newItem: AppNotification = {
      id: `local-${Date.now()}`,
      title,
      message,
      type,
      isRead: false,
      link,
      createdAt: new Date().toISOString(),
      timeAgo: 'Hozirgina',
    };

    notificationService.sendDesktopNotification(title, { body: message, url: link });

    set((state) => {
      const nextList = [newItem, ...state.notifications];
      return {
        notifications: nextList,
        unreadCount: nextList.filter((n) => !n.isRead).length,
      };
    });
  },
}));
