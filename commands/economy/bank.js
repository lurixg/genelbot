const { SlashCommandBuilder } = require('discord.js');
const User = require('../../database/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bank')
    .setDescription('Nakit ve banka bakiyenizi kontrol edin.'),
  async execute(interaction) {
    const user = await User.findOne({ userId: interaction.user.id });
    if (!user) {
      return interaction.reply({ content: '💳 | Henüz bir hesabınız yok.', ephemeral: true });
    }

    await interaction.reply(`🏦 | **${interaction.user.username}**, cüzdanınızda **${user.cash}₺** ve bankanızda **${user.bank}₺** bulunuyor.`);
  }
};
