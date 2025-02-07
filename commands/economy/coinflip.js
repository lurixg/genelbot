const { SlashCommandBuilder } = require('discord.js');
const User = require('../../database/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Yazı tura at ve şansını dene.')
    .addIntegerOption(option => 
      option.setName('bet')
        .setDescription('Bahis miktarı')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('side')
        .setDescription('Yazı mı Tura mı?')
        .setRequired(true)
        .addChoices(
          { name: 'Yazı', value: 'heads' },
          { name: 'Tura', value: 'tails' }
        )),
  async execute(interaction) {
    const bet = interaction.options.getInteger('bet');
    const side = interaction.options.getString('side').toLowerCase();
    const user = await User.findOne({ userId: interaction.user.id });

    if (!user || user.cash < bet) {
      return interaction.reply({ content: '💰 | Bahis yapacak yeterli nakitin yok.', ephemeral: true });
    }

    const flip = Math.random() < 0.5 ? 'heads' : 'tails';
    if (side === flip) {
      user.cash += bet; // Doğru tahmin edilirse bahis miktarı eklenir
      await user.save();
      return interaction.reply(`🎉 | Para **${flip === 'heads' ? 'Yazı' : 'Tura'}** geldi! **${bet}₺** kazandın!`);
    } else {
      user.cash -= bet; // Yanlış tahminde bahis miktarı eksiltilir
      await user.save();
      return interaction.reply(`❌ | Para **${flip === 'heads' ? 'Yazı' : 'Tura'}** geldi. **${bet}₺** kaybettin.`);
    }
  }
};
