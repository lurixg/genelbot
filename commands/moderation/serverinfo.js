const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Sunucu hakkında bilgi gösterir.'),

  async execute(interaction) {
    const guild = interaction.guild;

    // Okunabilir doğrulama seviyeleri ve açık içerik filtreleme seviyelerini tanımlama
    const verificationLevels = {
      0: 'Yok',
      1: 'Düşük',
      2: 'Orta',
      3: 'Yüksek',
      4: 'Çok Yüksek',
    };

    const explicitContentFilterLevels = {
      0: 'Devre Dışı',
      1: 'Rolü Olmayan Üyeler',
      2: 'Tüm Üyeler',
    };

    // Sunucu bilgileri için bir embed oluşturma
    const serverInfoEmbed = new EmbedBuilder()
      .setColor('#0099ff') // Embed rengi
      .setTitle(`${guild.name} Sunucu Bilgisi`)
      .setThumbnail(guild.iconURL()) // Sunucu simgesini küçük resim olarak ayarla
      .addFields(
        { name: 'Sunucu Adı', value: guild.name, inline: true },
        { name: 'Bölge', value: guild.preferredLocale, inline: true },
        { name: 'Üye Sayısı', value: `${guild.memberCount}`, inline: true },
        { name: 'Kurulma Tarihi', value: `${guild.createdAt.toDateString()}`, inline: true },
        { name: 'Sahip', value: `${guild.ownerId ? `<@${guild.ownerId}>` : 'Bilinmiyor'}`, inline: true },
        { name: 'Açıklama', value: guild.description || 'Açıklama mevcut değil.', inline: true },
        { name: 'Doğrulama Seviyesi', value: verificationLevels[guild.verificationLevel], inline: true },
        { name: 'Boost Seviyesi', value: guild.premiumTier.toString(), inline: true },
        { name: 'Toplam Boost', value: `${guild.premiumSubscriptionCount}`, inline: true },
        { name: 'AFK Kanalı', value: guild.afkChannel ? guild.afkChannel.name : 'Yok', inline: true },
        { name: 'AFK Zaman Aşımı', value: `${guild.afkTimeout / 60} dakika`, inline: true },
        { name: 'Açık İçerik Filtreleme', value: explicitContentFilterLevels[guild.explicitContentFilter], inline: true },
        { name: 'Rol Sayısı', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Emoji Sayısı', value: `${guild.emojis.cache.size}`, inline: true },
        { name: 'Çıkartma Sayısı', value: `${guild.stickers.cache.size}`, inline: true }
      )
      .setFooter({ text: `ID: ${guild.id}` })
      .setTimestamp();

    return interaction.reply({ embeds: [serverInfoEmbed], ephemeral: false });
  }
};
