const { SlashCommandBuilder } = require('discord.js');
const User = require('../../database/models/User');
const config = require('../../config');
const checkCooldown = require('../../helpers/checkCooldown');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Para kazanmak için çalış.'),
  async execute(interaction) {
    let user = await User.findOne({ userId: interaction.user.id });
    if (!user) {
      user = new User({
        userId: interaction.user.id,
        cash: 0,
        bank: 0,
        lastWork: null,
      });
    }

    // Cooldown kontrolü
    const cooldown = checkCooldown(user.lastWork, config.cooldowns.work);
    if (cooldown.remaining) {
      return interaction.reply({ content: `🕒 | Tekrar çalışmak için **${cooldown.time}** beklemen gerekiyor!`, ephemeral: true });
    }

    // Çalışma ödülünü 50 ile 200 arasında rastgele belirle
    const randomCash = Math.floor(Math.random() * 151) + 50;
    user.cash += randomCash;
    user.lastWork = Date.now();
    await user.save();

    await interaction.reply(`💼 | Çalıştın ve **${randomCash} nakit** kazandın!`);
  }
};
