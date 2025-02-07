const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Bir kullanıcıyı sunucudan yasaklamayı kaldırır.')
    .addStringOption(option => option.setName('userid').setDescription('Yasaklamayı kaldırılacak kullanıcının ID\'si').setRequired(true)),
  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    
    if (!interaction.member.permissions.has('BAN_MEMBERS')) {
      return interaction.reply({ content: 'Üyelerin yasaklarını kaldırma izniniz yok.', ephemeral: true });
    }

    try {
      await interaction.guild.members.unban(userId);
      return interaction.reply(`✅ | ID\'si **${userId}** olan kullanıcının yasaklamasını kaldırdınız.`);
    } catch (error) {
      return interaction.reply({ content: 'Bu kullanıcıyı yasaklamayı kaldıramadım. Lütfen ID\'yi kontrol edin.', ephemeral: true });
    }
  }
};
