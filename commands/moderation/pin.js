const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pin')
    .setDescription('Bir mesajı kanalda sabitler.')
    .addStringOption(option => option.setName('message_id').setDescription('Sabitlenecek mesajın ID\'si').setRequired(true)),
  async execute(interaction) {
    const messageId = interaction.options.getString('message_id');

    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
      return interaction.reply({ content: 'Mesajları sabitleme yetkiniz yok.', ephemeral: true });
    }

    const message = await interaction.channel.messages.fetch(messageId);
    if (!message) return interaction.reply({ content: 'Mesaj bulunamadı!', ephemeral: true });

    await message.pin();
    return interaction.reply(`📌 | ID\'si **${messageId}** olan mesaj sabitlendi.`);
  }
};
