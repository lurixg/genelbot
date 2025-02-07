const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unpin')
    .setDescription('Bir mesajın pinini kaldırır.')
    .addStringOption(option => option.setName('message_id').setDescription('Pinini kaldırılacak mesajın ID\'si').setRequired(true)),
  async execute(interaction) {
    const messageId = interaction.options.getString('message_id');

    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
      return interaction.reply({ content: 'Mesajların pinini kaldırmak için izniniz yok.', ephemeral: true });
    }

    const message = await interaction.channel.messages.fetch(messageId);
    if (!message) return interaction.reply({ content: 'Mesaj bulunamadı!', ephemeral: true });

    await message.unpin();
    return interaction.reply(`📌 | Mesajın pinini kaldırdım: **${messageId}**.`);
  }
};
