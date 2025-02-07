const { SlashCommandBuilder } = require('discord.js');
const User = require('../../database/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Bir kullanıcının uyarılarını gösterir.')
    .addUserOption(option => option.setName('user').setDescription('Kontrol edilecek kullanıcı').setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const userRecord = await User.findOne({ userId: user.id });

    if (!userRecord || userRecord.warnings.length === 0) {
      return interaction.reply(`⚠️ | **${user.tag}** kullanıcısının hiçbir uyarısı yok.`);
    }

    const warningsList = userRecord.warnings.map(warning => `Neden: ${warning.reason}, Tarih: ${warning.date.toLocaleString()}`).join('\n');
    return interaction.reply(`⚠️ | **${user.tag}** kullanıcısının şu uyarıları vardır:\n${warningsList}`);
  }
};
