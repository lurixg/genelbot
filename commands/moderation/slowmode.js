const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Kanal için slowmode süresi ayarlar.')
    .addIntegerOption(option => option.setName('duration').setDescription('Süre saniye cinsinden').setRequired(true)),
  async execute(interaction) {
    const duration = interaction.options.getInteger('duration');

    if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
      return interaction.reply({ content: 'Slowmode ayarlamak için yetkiniz yok.', ephemeral: true });
    }

    await interaction.channel.setRateLimitPerUser(duration);
    return interaction.reply(`⏳ | Slowmode süresi **${duration}** saniye olarak ayarlandı.`);
  }
};
