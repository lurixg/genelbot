const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Bot gecikmesi ve API gecikmesini gösterir.'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Ping atılıyor...', fetchReply: true });
        const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Bot Gecikmesi', value: `${botLatency}ms`, inline: true },
                { name: 'API Gecikmesi', value: `${apiLatency}ms`, inline: true },
            )
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });
    },
};
