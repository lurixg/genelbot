const { SlashCommandBuilder } = require('discord.js');
const User = require('../../database/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('Nakitini bankaya yatır.')
    .addIntegerOption(option => option.setName('amount').setDescription('Yatırılacak miktar').setRequired(true)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const user = await User.findOne({ userId: interaction.user.id });

    if (!user || user.cash < amount) {
      return interaction.reply({ content: 'Yatıracak yeterli nakitiniz yok.', ephemeral: true });
    }

    user.cash -= amount;
    user.bank += amount;
    await user.save();

    await interaction.reply(`🏦 | **${amount}₺** miktarını bankaya yatırdınız.`);
  }
};
