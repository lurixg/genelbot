const { SlashCommandBuilder } = require('discord.js');
const User = require('../../database/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Slot makinesini oynayarak şansını dene.')
    .addIntegerOption(option => option.setName('bahis').setDescription('Bahis miktarı').setRequired(true)),
  async execute(interaction) {
    const bahis = interaction.options.getInteger('bahis');
    const user = await User.findOne({ userId: interaction.user.id });

    if (!user || user.cash < bahis) {
      return interaction.reply({ content: 'Yeterli miktarda nakit paran yok.', ephemeral: true });
    }

    const slotSonuclari = ['🍒', '🍋', '🍊'];
    const sonuc = Array(3).fill().map(() => slotSonuclari[Math.floor(Math.random() * slotSonuclari.length)]);

    if (sonuc.every(symbol => symbol === sonuc[0])) {
      user.cash += bahis * 3; // Üç kat kazanç
      await user.save();
      return interaction.reply(`🎉 | Kazandın! **${sonuc.join(' | ')}** Bahsini üç katına çıkardın ve **${bahis * 3} nakit** kazandın!`);
    } else {
      user.cash -= bahis; // Bahisi kaybetme
      await user.save();
      return interaction.reply(`❌ | Kaybettin! **${sonuc.join(' | ')}** **${bahis} nakit** kaybettin.`);
    }
  }
};
