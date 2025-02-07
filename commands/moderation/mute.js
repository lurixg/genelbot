const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Bir kullanıcıyı sesli kanalda sessize alır.')
    .addUserOption(option => option.setName('user').setDescription('Sessize alınacak kullanıcı').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');

    if (!interaction.member.permissions.has('MUTE_MEMBERS')) {
      return interaction.reply({ content: 'Üyeleri sessize alma yetkiniz yok.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id);

    if (member) {
      await member.voice.setMute(true, 'Komutla sessize alındı.');
      return interaction.reply(`🔇 | **${user.tag}** sessize alındı.`);
    } else {
      return interaction.reply({ content: 'Bu kullanıcı bu sunucuda değil!', ephemeral: true });
    }
  }
};
