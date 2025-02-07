const { SlashCommandBuilder } = require('discord.js');
const User = require('../../database/models/User');
const config = require('../../config');
const checkCooldown = require('../../helpers/checkCooldown');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lootbox')
    .setDescription('Rastgele bir ödül almak için lootbox açın.'),
  async execute(interaction) {
    let user = await User.findOne({ userId: interaction.user.id });
    if (!user) {
      user = new User({
        userId: interaction.user.id,
        cash: 0,
        bank: 0,
        lastLootbox: null,
      });
    }

    // Cooldown kontrolü
    const cooldown = checkCooldown(user.lastLootbox, config.cooldowns.lootbox);
    if (cooldown.remaining) {
      return interaction.reply({ content: `🕒 | Bir lootbox daha açmak için **${cooldown.time}** beklemeniz gerekiyor!`, ephemeral: true });
    }

    // Lootbox ödülünü 100 ile 500 arasında rastgele belirle
    const randomReward = Math.floor(Math.random() * 401) + 100;
    user.cash += randomReward;
    user.lastLootbox = Date.now();
    await user.save();

    await interaction.reply(`🎁 | Bir lootbox açtınız ve **${randomReward} nakit** kazandınız!`);
  }
};
