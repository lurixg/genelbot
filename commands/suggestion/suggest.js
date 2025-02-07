const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Suggestion = require('../../database/models/suggestion'); // Bu yolun doğru olduğundan emin olun

module.exports = {
    data: new SlashCommandBuilder()
      .setName('suggest')
      .setDescription('Bir şey önerin')
      .addStringOption(option =>
        option.setName('suggestion')
          .setDescription('Öneriniz')
          .setRequired(true)),
    
    async execute(interaction) {
      const suggestionText = interaction.options.getString('suggestion');
      const suggestionData = await Suggestion.findOne({ guildId: interaction.guild.id });
  
      if (!suggestionData) {
        return interaction.reply('Öneri kanalı kurulmamış. İlk önce `/suggestion setup` komutunu kullanın.');
      }
  
      const channel = await interaction.guild.channels.fetch(suggestionData.channelId);
      const embed = new EmbedBuilder()
        .setTitle('Yeni Öneri')
        .setDescription(suggestionText)
        .setFooter({ text: `Öneri ID: ${Date.now()}` });
  
      // Öneri mesajını belirlenen kanala gönder
      const message = await channel.send({ embeds: [embed] });
      
      // Öneriyi veritabanına kaydet
      suggestionData.suggestions.push({ messageId: message.id, content: suggestionText });
      await suggestionData.save();
      
      // Etkileşimi yanıtla
      await interaction.reply('Öneriniz gönderildi!');
    }
};
