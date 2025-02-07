const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Bir kullanıcıyı belirli bir süre için zaman aşımına sokar.')
    .addUserOption(option => option.setName('user').setDescription('Zaman aşımına sokulacak kullanıcı').setRequired(true))
    .addIntegerOption(option => option.setName('duration').setDescription('Süre saniye cinsinden').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration') * 1000;

    if (!interaction.member.permissions.has('MODERATE_MEMBERS')) {
      return interaction.reply({ content: 'Üyeleri zaman aşımına sokma izniniz yok.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id);

    if (member) {
      await member.timeout(duration, 'Komut ile zaman aşımına sokuldu.');
      return interaction.reply(`⏲️ | **${user.tag}** kullanıcısını ${duration / 1000} saniye süreyle zaman aşımına soktunuz.`);
    } else {
      return interaction.reply({ content: 'Bu kullanıcı bu sunucuda bulunmamaktadır!', ephemeral: true });
    }
  }
};
