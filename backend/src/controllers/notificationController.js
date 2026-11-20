import { store } from '../services/dataStore.js';
import { notificationService } from '../services/notificationService.js';

export const getNotifications = (req, res) => {
  const userId = req.user.id;
  const all = store.getCollection('notifications');
  const userNotifs = all.filter((n) => n.userId === userId);

  // Sort newest first
  userNotifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const unreadCount = userNotifs.filter((n) => !n.read).length;

  res.json({
    notifications: userNotifs,
    unreadCount,
    total: userNotifs.length
  });
};

export const markAsRead = (req, res) => {
  const { id } = req.params;
  const notif = store.findById('notifications', id);
  if (!notif) {
    return res.status(404).json({ error: 'Notification not found.' });
  }

  const updated = store.updateById('notifications', id, { read: true });
  res.json({ success: true, notification: updated });
};

export const markAllAsRead = (req, res) => {
  const userId = req.user.id;
  const all = store.getCollection('notifications');
  all.forEach((n) => {
    if (n.userId === userId) {
      n.read = true;
    }
  });
  store.save();
  res.json({ success: true, message: 'All notifications marked as read.' });
};

export const getDispatchLogs = (req, res) => {
  const logs = notificationService.getDispatchLogs();
  res.json({ logs });
};

