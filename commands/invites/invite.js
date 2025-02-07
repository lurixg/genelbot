const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const Invite = require('../../database/models/invite'); // Varsayılan olarak Invite modeli

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('Davetleri ve ödülleri yönet')
    .addSubcommand(subcommand =>
      subcommand.setName('user')
        .setDescription('Bir kullanıcının davetlerini kontrol et')
        .addUserOption(option => option.setName('user').setDescription('Kontrol edilecek kullanıcı').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('add')
        .setDescription('Bir kullanıcıya davet ekle (Sadece sahip kullanabilir)')
        .addUserOption(option => option.setName('user').setDescription('Davet eklenecek kullanıcı').setRequired(true))
        .addIntegerOption(option => option.setName('number').setDescription('Eklenecek davet sayısı').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('remove')
        .setDescription('Bir kullanıcıdan davet sil (Sadece sahip kullanabilir)')
        .addUserOption(option => option.setName('user').setDescription('Davet silinecek kullanıcı').setRequired(true))
        .addIntegerOption(option => option.setName('number').setDescription('Silinecek davet sayısı').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('leaderboard')
        .setDescription('En fazla davet yapanların sıralamasını gör'))
    .addSubcommand(subcommand =>
      subcommand.setName('reset')
        .setDescription('Bir kullanıcının davetlerini sıfırla (Sadece sahip kullanabilir)')
        .addUserOption(option => option.setName('user').setDescription('Sıfırlanacak kullanıcı').setRequired(true))),
    
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('user');
    const number = interaction.options.getInteger('number');
    const guildId = interaction.guild.id;
    const isOwner = interaction.guild.ownerId === interaction.user.id;

    // Sadece sahibi kullanabilir komutları kontrol et
    if (!isOwner && ['add', 'remove', 'reset'].includes(subcommand)) {
      return interaction.reply({ content: 'Bu komutu yalnızca sunucu sahibi kullanabilir!', ephemeral: true });
    }

    switch (subcommand) {
      case 'user': {
        // Bir kullanıcının davetlerini kontrol et
        const userInvites = await Invite.findOne({ userId: targetUser.id, guildId });
        const invitesCount = userInvites ? userInvites.invites : 0;
        return interaction.reply({ content: `${targetUser.username} kullanıcısının **${invitesCount}** daveti var.` });
      }

      case 'add': {
        // Bir kullanıcıya davet ekle
        const userInvites = await Invite.findOneAndUpdate(
          { userId: targetUser.id, guildId },
          { $inc: { invites: number } },
          { upsert: true, new: true }
        );
        return interaction.reply({ content: `${targetUser.username} kullanıcısına **${number}** davet eklendi. Şu anda **${userInvites.invites}** daveti var.` });
      }

      case 'remove': {
        // Bir kullanıcıdan davet sil
        const userInvites = await Invite.findOneAndUpdate(
          { userId: targetUser.id, guildId },
          { $inc: { invites: -number } },
          { upsert: true, new: true }
        );
        return interaction.reply({ content: `${targetUser.username} kullanıcısından **${number}** davet silindi. Şu anda **${userInvites.invites}** daveti var.` });
      }

      case 'leaderboard': {
        // Davet sıralamasını göster
        const topInviters = await Invite.find({ guildId }).sort({ invites: -1 }).limit(10);
        if (topInviters.length === 0) {
          return interaction.reply({ content: 'Henüz davet verisi bulunmuyor.' });
        }

        const leaderboard = topInviters.map((invite, index) =>
          `${index + 1}. <@${invite.userId}> - **${invite.invites} davet**`
        ).join('\n');

        const leaderboardEmbed = new EmbedBuilder()
          .setTitle('🏆 Davet Liderlik Tablosu')
          .setColor('Gold')
          .setDescription(leaderboard)
          .setFooter({ text: `${interaction.guild.name} sunucusundaki en çok davet yapanlar` })
          .setTimestamp();

        return interaction.reply({ embeds: [leaderboardEmbed] });
      }

      case 'reset': {
        // Bir kullanıcının davetlerini sıfırla
        await Invite.findOneAndUpdate(
          { userId: targetUser.id, guildId },
          { invites: 0 },
          { new: true }
        );
        return interaction.reply({ content: `${targetUser.username} kullanıcısının davetleri sıfırlandı.` });
      }
    }
  }
};
