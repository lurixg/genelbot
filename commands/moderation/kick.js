const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Bir kullanıcıyı sunucudan atar.')
    .addUserOption(option => option.setName('user').setDescription('Atılacak kullanıcı').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');

    if (!interaction.member.permissions.has('KICK_MEMBERS')) {
      return interaction.reply({ content: 'Kullanıcıları atma yetkiniz yok.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id);
    
    if (member) {
      await member.kick('Kullanıcı komutla atıldı.');
      return interaction.reply(`🔨 | **${user.tag}** sunucudan atıldı.`);
    } else {
      return interaction.reply({ content: 'Bu kullanıcı bu sunucuda değil!', ephemeral: true });
    }
  }
};
