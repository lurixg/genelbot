const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Bir kullanıcı hakkında bilgi görüntüler.')
    .addUserOption(option => option.setName('user').setDescription('Bilgisi alınacak kullanıcı').setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;

    const member = await interaction.guild.members.fetch(user.id);
    const userInfo = `**Kullanıcı:** ${user.tag}\n**Sunucuya Katılma Tarihi:** ${member.joinedAt.toDateString()}\n**Roller:** ${member.roles.cache.map(role => role.name).join(', ') || 'Yok'}`;
    return interaction.reply({ content: userInfo, ephemeral: true });
  }
};
