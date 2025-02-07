const { SlashCommandBuilder } = require('discord.js');
const User = require('../../database/models/User');
const config = require('../../config');
const checkCooldown = require('../../helpers/checkCooldown');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('beg')
    .setDescription('Biraz para dilen.'),
  async execute(interaction) {
    let user = await User.findOne({ userId: interaction.user.id });
    if (!user) {
      user = new User({
        userId: interaction.user.id,
        cash: 0,
        bank: 0,
        lastBeg: null,
      });
    }

    // Bekleme süresi kontrolü
    const cooldown = checkCooldown(user.lastBeg, config.cooldowns.beg);
    if (cooldown.remaining) {
      return interaction.reply({ content: `🕒 | Tekrar para dilenmek için **${cooldown.time}** beklemelisin!`, ephemeral: true });
    }

    // Rastgele dilenme miktarı (10 - 50 arası)
    const randomCash = Math.floor(Math.random() * 41) + 10;
    user.cash += randomCash;
    user.lastBeg = Date.now();
    await user.save();

    await interaction.reply(`🤲 | Diledin ve **${randomCash}₺** kazandın!`);
  }
};
