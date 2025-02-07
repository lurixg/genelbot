const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Bir kullanıcıyı moderatörlere bildirir.')
    .addUserOption(option => option.setName('user').setDescription('Bildirecek kullanıcıyı seçin').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Bildirim sebebini yazın').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    const reportChannel = interaction.guild.channels.cache.find(channel => channel.name === 'reports');
    if (!reportChannel) return interaction.reply({ content: 'Bildirilen kanal mevcut değil.', ephemeral: true });

    await reportChannel.send(`🚨 Bildirilen Kullanıcı: **${user.tag}**\nSebep: ${reason}\nBildireni: **${interaction.user.tag}**`);
    return interaction.reply(`✅ | **${user.tag}** kullanıcısı bildirildi. Bildiriminiz için teşekkür ederiz.`);
  }
};
