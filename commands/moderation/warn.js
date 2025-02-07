const { SlashCommandBuilder } = require('discord.js');
const User = require('../../database/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Bir kullanıcıya uyarı verir.')
    .addUserOption(option => option.setName('user').setDescription('Uyarı verilecek kullanıcı').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Uyarının nedeni').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const member = await interaction.guild.members.fetch(user.id);

    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
      return interaction.reply({ content: 'Üyeleri uyarmaya yetkiniz yok.', ephemeral: true });
    }

    if (member) {
      const userRecord = await User.findOne({ userId: user.id });
      if (!userRecord) {
        return interaction.reply({ content: 'Kullanıcı veritabanında bulunamadı!', ephemeral: true });
      }
      userRecord.warnings.push({ reason, date: new Date() });
      await userRecord.save();
      return interaction.reply(`⚠️ | **${user.tag}** kullanıcısına şu nedenle uyarı verildi: ${reason}`);
    } else {
      return interaction.reply({ content: 'Bu kullanıcı bu sunucuda değil!', ephemeral: true });
    }
  }
};
