const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Bir kanalı mesaj göndermeye kapatır.')
    .addChannelOption(option => option.setName('channel').setDescription('Kapatılacak kanal').setRequired(false)),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
      return interaction.reply({ content: 'Kanal yönetme yetkiniz yok.', ephemeral: true });
    }

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SEND_MESSAGES: false });
    return interaction.reply(`🔒 | **${channel.name}** kanalı kilitlendi.`);
  }
};
