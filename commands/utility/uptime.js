const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000 % 60);
    const minutes = Math.floor(ms / (1000 * 60) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    const parts = [];
    if (days) parts.push(`${days}g`);
    if (hours) parts.push(`${hours}s`);
    if (minutes) parts.push(`${minutes}d`);
    if (seconds) parts.push(`${seconds}s`);

    return parts.join(' ');
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Bot\'un çalışma süresini görüntüler.'),
    async execute(interaction) {
        const uptime = formatDuration(interaction.client.uptime);

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('🕒 Bot Çalışma Süresi')
            .setDescription(`**${uptime}** süredir çevrimiçiyim.`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
