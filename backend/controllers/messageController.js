const Message = require('../models/Message');
const Property = require('../models/Property');
const { createNotification } = require('./notificationController');

// @desc    Send a message in a property conversation
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, propertyId, text } = req.body;

    if (!receiverId || !propertyId || !text) {
      return res.status(400).json({
        status: 'fail',
        message: 'receiverId, propertyId, and text are required',
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        status: 'fail',
        message: 'Property not found',
      });
    }

    const message = await Message.create({
      senderId: req.user._id,
      receiverId,
      propertyId,
      text: text.trim(),
    });

    const populated = await message.populate([
      { path: 'senderId', select: 'name profileImage' },
      { path: 'receiverId', select: 'name profileImage' },
      { path: 'propertyId', select: 'title address images type' },
    ]);

    // Send notification to message receiver
    await createNotification({
      userId: receiverId,
      type: 'new_message',
      title: `New message from ${req.user.name}`,
      body: text.length > 60 ? `${text.substring(0, 60)}...` : text,
      relatedId: message._id,
      relatedModel: 'Message',
    });

    res.status(201).json({
      status: 'success',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages in a conversation (property + other user)
// @route   GET /api/messages/conversation/:propertyId/:otherUserId
// @access  Private
const getConversation = async (req, res, next) => {
  try {
    const { propertyId, otherUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      propertyId,
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    })
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage')
      .sort({ createdAt: 1 });

    // Mark unread messages from the other user as read
    await Message.updateMany(
      { propertyId, senderId: otherUserId, receiverId: myId, read: false },
      { read: true }
    );

    res.status(200).json({
      status: 'success',
      results: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations (inbox) for logged-in user
// @route   GET /api/messages/inbox
// @access  Private
const getInbox = async (req, res, next) => {
  try {
    const myId = req.user._id;

    // Get the latest message per unique (propertyId + otherUser) conversation
    const messages = await Message.find({
      $or: [{ senderId: myId }, { receiverId: myId }],
    })
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage')
      .populate('propertyId', 'title address images type')
      .sort({ createdAt: -1 });

    // Deduplicate: one card per (propertyId + otherUserId) pair
    const seen = new Set();
    const conversations = [];

    for (const msg of messages) {
      if (!msg.propertyId) continue;
      const otherId =
        msg.senderId._id.toString() === myId.toString()
          ? msg.receiverId._id.toString()
          : msg.senderId._id.toString();

      const key = `${msg.propertyId._id}_${otherId}`;
      if (!seen.has(key)) {
        seen.add(key);
        conversations.push({
          _id: key,
          propertyId: msg.propertyId,
          otherUser:
            msg.senderId._id.toString() === myId.toString()
              ? msg.receiverId
              : msg.senderId,
          lastMessage: msg.text,
          lastMessageAt: msg.createdAt,
          unread: !msg.read && msg.receiverId._id.toString() === myId.toString(),
        });
      }
    }

    res.status(200).json({
      status: 'success',
      results: conversations.length,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread message count for badge
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      read: false,
    });

    res.status(200).json({
      status: 'success',
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getInbox,
  getUnreadCount,
};
