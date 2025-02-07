const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  suggestions: [{
    messageId: { type: String, required: true },
    content: { type: String, required: true },
    
  }],
});

module.exports = mongoose.model('Suggestion', suggestionSchema);
