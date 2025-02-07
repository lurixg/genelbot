const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Belirtilen kanalda duyuru yapar.')
    .addChannelOption(option => option.setName('channel').setDescription('Duyuru yapılacak kanal').setRequired(true))
    .addStringOption(option => option.setName('message').setDescription('Duyuru mesajı').setRequired(true)),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');

    if (!interaction.member.permissions.has('SEND_MESSAGES')) {
      return interaction.reply({ content: 'Mesaj gönderme yetkiniz yok.', ephemeral: true });
    }

    await channel.send(`📢 Duyuru: ${message}`);
    return interaction.reply(`✅ | Duyuru **${channel.name}** kanalında gönderildi.`);
  }
};
