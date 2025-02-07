const { SlashCommandBuilder } = require('discord.js');
const User = require('../../database/models/User');
const config = require('../../config');
const checkCooldown = require('../../helpers/checkCooldown');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Günlük nakit ödülünü al.'),
  async execute(interaction) {
    let user = await User.findOne({ userId: interaction.user.id });
    if (!user) {
      user = new User({
        userId: interaction.user.id,
        cash: 0,
        bank: 0,
        lastDaily: null,
      });
    }

    // Cooldown kontrolü
    const cooldown = checkCooldown(user.lastDaily, config.cooldowns.daily);
    if (cooldown.remaining) {
      return interaction.reply({ content: `🕒 | Günlük nakit ödülünü **${cooldown.time}** sonra alabilirsin!`, ephemeral: true });
    }

    // Günlük nakit ödülünü 50 ile 150 arasında rastgele belirle
    const randomCash = Math.floor(Math.random() * 101) + 50;
    user.cash += randomCash;
    user.lastDaily = Date.now();
    await user.save();

    await interaction.reply(`🎉 | Günlük ödülünü **${randomCash}₺** olarak aldın!`);
  }
};
