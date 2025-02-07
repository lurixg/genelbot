const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Bir kullanıcıyı sesli kanalda susturmasını kaldırır.')
    .addUserOption(option => option.setName('user').setDescription('Susturması kaldırılacak kullanıcı').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');

    if (!interaction.member.permissions.has('MUTE_MEMBERS')) {
      return interaction.reply({ content: 'Üyeleri susturma izniniz yok.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id);

    if (member) {
      await member.voice.setMute(false, 'Komut ile susturma kaldırıldı.');
      return interaction.reply(`🔊 | **${user.tag}** kullanıcısının susturulması kaldırıldı.`);
    } else {
      return interaction.reply({ content: 'Bu kullanıcı bu sunucuda değil!', ephemeral: true });
    }
  }
};
