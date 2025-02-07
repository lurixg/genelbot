const { SlashCommandBuilder } = require('discord.js');
const User = require('../../database/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cash')
    .setDescription('Nakit bakiyeni kontrol et.'),
  async execute(interaction) {
    const user = await User.findOne({ userId: interaction.user.id });
    if (!user) {
      return interaction.reply({ content: '💰 | Henüz bir bakiyen yok.', ephemeral: true });
    }

    await interaction.reply(`💸 | **${interaction.user.username}**, şu an **${user.cash}₺** nakitin var!`);
  }
};
