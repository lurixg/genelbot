const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, Colors } = require('discord.js'); // Colors'ı içe aktar
const Suggestion = require('../../database/models/suggestion'); // Suggestion modelini içe aktar

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggestion')
    .setDescription('Öneri komutları')
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Öneri kanalı kur')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('Öneriler için kanal')
            .setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('accept')
        .setDescription('Bir öneriyi kabul et')
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('Önerinin Mesaj ID\'si')
            .setRequired(true))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('decline')
        .setDescription('Bir öneriyi reddet')
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('Önerinin Mesaj ID\'si')
            .setRequired(true))
    ),
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (subcommand === 'setup') {
      const channel = interaction.options.getChannel('channel');
      let suggestionSetup = await Suggestion.findOne({ guildId });

      if (!suggestionSetup) {
        suggestionSetup = new Suggestion({
          guildId,
          channelId: channel.id,
        });
        await suggestionSetup.save();
        await interaction.reply(`Öneri kanalı ${channel} olarak ayarlandı.`);
      } else {
        suggestionSetup.channelId = channel.id;
        await suggestionSetup.save();
        await interaction.reply(`Öneri kanalı ${channel} olarak güncellendi.`);
      }

    } else if (subcommand === 'accept' || subcommand === 'decline') {
      const messageId = interaction.options.getString('message_id');
      const suggestionData = await Suggestion.findOne({ guildId });

      if (!suggestionData) {
        return interaction.reply('Öneri bulunamadı.');
      }

      const suggestion = suggestionData.suggestions.find(s => s.messageId === messageId);
      if (!suggestion) {
        return interaction.reply('Öneri bulunamadı.');
      }

      suggestion.accepted = subcommand === 'accept';
      suggestion.declined = subcommand === 'decline';
      await suggestionData.save();

      const channel = await interaction.guild.channels.fetch(suggestionData.channelId);
      const message = await channel.messages.fetch(messageId);
      const embed = new EmbedBuilder(message.embeds[0]) // Mevcut embed verileriyle yeni bir EmbedBuilder oluştur
        .setColor(subcommand === 'accept' ? Colors.Green : Colors.Red); // Renk sabitlerini kullan
      await message.edit({ embeds: [embed] });

      await interaction.reply(`Öneri ${subcommand === 'accept' ? 'kabul edildi' : 'reddedildi'}.`);
    }
  }
};
