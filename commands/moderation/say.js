const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Botun bir şey söylemesini sağlar.')
    .addStringOption(option => option.setName('message').setDescription('Gönderilecek mesajı belirtin').setRequired(true)),
  async execute(interaction) {
    const message = interaction.options.getString('message');

    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
      return interaction.reply({ content: 'Bu komutu kullanma izniniz yok.', ephemeral: true });
    }

    await interaction.reply(message);
    return interaction.followUp({ content: `✅ | Bot şunu söyledi: ${message}`, ephemeral: true });
  }
};
