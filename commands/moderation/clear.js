const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Bir kanaldan belirtilen sayıda mesajı siler.')
    .addIntegerOption(option => option.setName('amount').setDescription('Silinecek mesaj sayısı').setRequired(true)),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
      return interaction.reply({ content: 'Mesajları silme yetkiniz yok.', ephemeral: true });
    }

    await interaction.channel.bulkDelete(amount, true);
    return interaction.reply(`🧹 | **${amount}** mesaj silindi.`);
  }
};
