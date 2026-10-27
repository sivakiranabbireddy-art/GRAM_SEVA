const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = require('../services/notificationService');

async function getMyNotifications(req, res, next) {
  try {
    const list = await getUserNotifications(req.user.id, req.user.role);
    return res.status(200).json({
      success: true,
      notifications: list
    });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const { id } = req.params;
    await markNotificationAsRead(id, req.user.id);
    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await markAllNotificationsAsRead(req.user.id, req.user.role);
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyNotifications,
  markRead,
  markAllRead
};
