const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bir kullanıcıyı sunucudan yasaklar.')
    .addUserOption(option => option.setName('user').setDescription('Yasaklanacak kullanıcı').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');

    if (!interaction.member.permissions.has('BAN_MEMBERS')) {
      return interaction.reply({ content: 'Üyeleri yasaklama yetkiniz yok.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id);
    
    if (member) {
      await member.ban({ reason: 'Kullanıcı komutla yasaklandı.' });
      return interaction.reply(`🚫 | **${user.tag}** kullanıcısı sunucudan yasaklandı.`);
    } else {
      return interaction.reply({ content: 'Bu kullanıcı bu sunucuda değil!', ephemeral: true });
    }
  }
};
