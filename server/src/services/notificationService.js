const { Notification } = require('../models');

async function createNotification({ userId, role = 'ALL', title, message, link = '', metadata = {} }) {
  try {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const notification = await Notification.create({
      id,
      userId: userId || null,
      role: role || 'ALL',
      title,
      message,
      link,
      metadata,
      isRead: false
    });
    return notification;
  } catch (err) {
    console.error('[NotificationService] Failed to create notification:', err.message);
  }
}

async function getUserNotifications(userId, role) {
  try {
    const query = {
      $or: [
        { userId: userId },
        { role: role, userId: null },
        { role: 'ALL' }
      ]
    };
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return notifications;
  } catch (err) {
    console.error('[NotificationService] Failed to get notifications:', err.message);
    return [];
  }
}

async function markNotificationAsRead(notificationId, userId) {
  try {
    const query = { id: notificationId };
    if (userId) {
      query.$or = [{ userId: userId }, { userId: null }];
    }
    const res = await Notification.updateOne(query, { $set: { isRead: true } });
    return res.modifiedCount > 0;
  } catch (err) {
    console.error('[NotificationService] Failed to mark read:', err.message);
    return false;
  }
}

async function markAllNotificationsAsRead(userId, role) {
  try {
    const query = {
      $or: [
        { userId: userId },
        { role: role, userId: null },
        { role: 'ALL' }
      ]
    };
    await Notification.updateMany(query, { $set: { isRead: true } });
    return true;
  } catch (err) {
    console.error('[NotificationService] Failed to mark all read:', err.message);
    return false;
  }
}

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};
