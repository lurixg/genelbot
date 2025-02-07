const { SlashCommandBuilder } = require('discord.js');
const User = require('../../database/models/User');
const config = require('../../config');
const checkCooldown = require('../../helpers/checkCooldown');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Başka bir kullanıcıyı soymaya çalışın.')
    .addUserOption(option =>
      option.setName('hedef')
        .setDescription('Soymak istediğiniz kullanıcı')
        .setRequired(true)
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('hedef');
    if (targetUser.id === interaction.user.id) {
      return interaction.reply({ content: `❌ | Kendini soyamazsın!`, ephemeral: true });
    }

    let user = await User.findOne({ userId: interaction.user.id });
    let target = await User.findOne({ userId: targetUser.id });

    if (!user || !target) {
      return interaction.reply({ content: `❌ | Ya senin ya da hedefin hesabı yok!`, ephemeral: true });
    }

    // Cooldown kontrolü
    const cooldown = checkCooldown(user.lastRob, config.cooldowns.rob);
    if (cooldown.remaining) {
      return interaction.reply({ content: `🕒 | Yeniden soygun yapabilmek için **${cooldown.time}** beklemen gerekiyor!`, ephemeral: true });
    }

    // Başarı şansını rastgele belirle
    const success = Math.random() < 0.5; // Başarı şansı %50
    const robAmount = Math.floor(Math.random() * 201) + 50; // 50 ile 250 arasında bir miktar

    if (success) {
      // Başarılı soygun
      if (target.cash < robAmount) {
        return interaction.reply({ content: `❌ | Hedefin yeterli nakit parası yok!`, ephemeral: true });
      }
      user.cash += robAmount;
      target.cash -= robAmount;
      user.lastRob = Date.now();
      await user.save();
      await target.save();

      await interaction.reply(`💰 | Başarıyla **${targetUser.username}**'den **${robAmount} nakit** çaldın!`);
    } else {
      // Başarısız soygun, hedefe ödeme yap
      if (user.cash < robAmount) {
        return interaction.reply({ content: `❌ | Soygun başarısız olursa ödeme yapacak kadar paran yok!`, ephemeral: true });
      }
      user.cash -= robAmount;
      target.cash += robAmount;
      user.lastRob = Date.now();
      await user.save();
      await target.save();

      await interaction.reply(`❌ | **${targetUser.username}**'i soymaya çalıştın ama başarısız oldun ve **${robAmount} nakit** ödemen gerekti.`);
    }
  }
};
