const { SlashCommandBuilder } = require('discord.js');
const User = require('../../database/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Bankadan nakit çek.')
    .addIntegerOption(option => option.setName('miktar').setDescription('Çekmek istediğin miktar').setRequired(true)),
  async execute(interaction) {
    const miktar = interaction.options.getInteger('miktar');
    const user = await User.findOne({ userId: interaction.user.id });

    if (!user || user.bank < miktar) {
      return interaction.reply({ content: 'Bankanda yeterli miktarda para yok.', ephemeral: true });
    }

    user.bank -= miktar;
    user.cash += miktar;
    await user.save();

    await interaction.reply(`🏦 | **${miktar} nakit** bankadan çekildi.`);
  }
};
