const AutoMod = require('./database/models/automod'); // AutoMod modelinin models klasöründe olduğu varsayılıyor

module.exports = async (message) => {
  if (message.author.bot) return; // Bot mesajlarını yoksay

  const guildId = message.guild.id;
  const autoModSettings = await AutoMod.findOne({ guildId });

  if (!autoModSettings) return; // Ayarlar yoksa çık

  // Aynı kanalda uyarı mesajı gönderen fonksiyon
  const sendWarning = async (reason) => {
    const warningMessage = `🚫 **Uyarı!** Mesajınız şu nedenle silindi: **${reason}**.`;
    const warning = await message.channel.send(warningMessage); // Uyarı mesajını gönder
    setTimeout(() => warning.delete(), 10000); // Uyarı mesajını 10 saniye sonra sil
  };

  // Davet engelleme kontrolü
  if (autoModSettings.antiInvites && /discord\.gg|discord\.com\/invite/.test(message.content)) {
    await sendWarning('Davet engelleme koruması'); // Uyarı gönder
    return message.delete(); // Orijinal mesajı sil
  }

  // Bağlantı engelleme kontrolü
  if (autoModSettings.antiLinks && /https?:\/\/[^\s]+/.test(message.content)) {
    await sendWarning('Bağlantı engelleme koruması'); // Uyarı gönder
    return message.delete(); // Orijinal mesajı sil
  }

  // Spam engelleme kontrolü (temel mantık)
  if (autoModSettings.antiSpam) {
    const userMessages = message.channel.messages.cache.filter(m => m.author.id === message.author.id);
    
    // Son 10 saniyede gönderilen son 5 mesajla sınırlandır
    if (userMessages.size > 5) {
      await sendWarning('Spam engelleme koruması'); // Uyarı gönder
      return message.delete(); // Çok fazla mesaj gönderildiyse orijinal mesajı sil
    }
  }

  // Beyaz liste kontrolü
  if (autoModSettings.whitelist.includes(message.author.id)) return; // Kullanıcı beyaz listedeyse çık
  if (message.mentions.roles.size > 0) {
    for (const role of message.mentions.roles.values()) {
      if (autoModSettings.whitelist.includes(role.id)) return; // Rol beyaz listedeyse çık
    }
  }
};
