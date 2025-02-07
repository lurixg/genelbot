const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Bir kanalı mesaj gönderebilmek için açar.')
    .addChannelOption(option => option.setName('channel').setDescription('Açılacak kanal').setRequired(false)),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
      return interaction.reply({ content: 'Kanal açma izniniz yok.', ephemeral: true });
    }

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SEND_MESSAGES: true });
    return interaction.reply(`🔓 | **${channel.name}** kanalı açıldı.`);
  }
};
