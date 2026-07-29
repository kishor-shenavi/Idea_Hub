const notificationRepository = require('../repositories/notification.repository');
const asyncHandler = require('../middlewares/async');

exports.getUnread = asyncHandler(async (req, res) => {
  const notifications = await notificationRepository.findUnread(req.user.id);
  res.status(200).json({ success: true, data: notifications });
});

exports.markRead = asyncHandler(async (req, res) => {
  await notificationRepository.markRead(req.params.id, req.user.id);
  res.status(200).json({ success: true });
});