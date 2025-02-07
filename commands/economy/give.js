const { SlashCommandBuilder } = require('discord.js');
const User = require('../../database/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('Başka bir kullanıcıya nakit ver.')
    .addUserOption(option => option.setName('target').setDescription('Nakit verilecek kullanıcı').setRequired(true))
    .addIntegerOption(option => option.setName('amount').setDescription('Verilecek miktar').setRequired(true)),
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const amount = interaction.options.getInteger('amount');

    const giver = await User.findOne({ userId: interaction.user.id });
    const receiver = await User.findOne({ userId: target.id });

    if (!giver || giver.cash < amount) {
      return interaction.reply({ content: 'Verilecek yeterli nakitiniz yok.', ephemeral: true });
    }

    // Hesapları güncelle
    giver.cash -= amount;
    receiver.cash += amount;

    await giver.save();
    await receiver.save();

    await interaction.reply(`💸 | **${amount}₺** miktarını **${target.username}**'ya verdiniz.`);
  }
};
