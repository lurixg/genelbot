// events/messageDelete.js
const { Events } = require('discord.js');

let lastDeletedMessage = null;

module.exports = {
  name: Events.MessageDelete,
  execute(message) {
    // Mesajın eksik olup olmadığını kontrol et (tamamen yüklenmiş olmalı)
    if (!message.partial && !message.author.bot) {
      lastDeletedMessage = message;
    }
  },
  getLastDeletedMessage() {
    return lastDeletedMessage;
  }
};
