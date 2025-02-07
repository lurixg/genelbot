// commands/moderation/snipe.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const messageDeleteEvent = require('../../events/messageDelete');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('Bu kanalda en son silinen mesajı gösterir.'),

  async execute(interaction) {
    const lastDeletedMessage = messageDeleteEvent.getLastDeletedMessage();

    if (!lastDeletedMessage) {
      return interaction.reply({ content: 'Silinen mesaj bulunmamaktadır.', ephemeral: true });
    }

    const snipeEmbed = new EmbedBuilder()
      .setColor('#ff0000')
      .setAuthor({ name: lastDeletedMessage.author.tag, iconURL: lastDeletedMessage.author.displayAvatarURL() })
      .setDescription(lastDeletedMessage.content || 'İçerik yok')
      .setTimestamp(lastDeletedMessage.createdAt)
      .setFooter({ text: `Mesaj ID: ${lastDeletedMessage.id}` });

    return interaction.reply({ embeds: [snipeEmbed] });
  }
};
