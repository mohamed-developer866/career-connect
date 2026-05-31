var service = require('./message.service');

exports.getConversations = async function(req, res) {
  try {
    var conversations = await service.getConversations(req.user.id);
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async function(req, res) {
  try {
    var messages = await service.getMessages(req.user.id, req.params.userId);
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// FIXED: Support both 'content' and 'text' from frontend
exports.sendMessage = async function(req, res) {
  try {
    // Support both field names
    var messageContent = req.body.content || req.body.text;
    
    if (!messageContent) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    console.log('Sending message:', { 
      from: req.user.id, 
      to: req.body.receiverId, 
      content: messageContent 
    });
    
    var msg = await service.sendMessage(req.user.id, req.body.receiverId, messageContent);
    
    // Emit to BOTH sender and receiver for true real-time
    var io = req.app.get('io');
    if (io) {
      io.to(req.body.receiverId).emit('newMessage', msg);
      io.to(req.user.id).emit('newMessage', msg);
    }
    
    res.status(201).json(msg);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMessage = async function(req, res) {
  try {
    var result = await service.deleteMessage(req.params.messageId, req.user.id);
    if (!result) return res.status(403).json({ error: 'Not authorized' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteConversation = async function(req, res) {
  try {
    await service.deleteConversation(req.user.id, req.params.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};