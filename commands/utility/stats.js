const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, version } = require('discord.js');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Bot istatistiklerini görüntüler.'),
    async execute(interaction) {
        const { client } = interaction;
        const uptime = formatDuration(client.uptime);
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalGuilds = client.guilds.cache.size;
        const totalUsers = client.users.cache.size;
        const nodeVersion = process.version;
        const discordJsVersion = version;
        const cpuModel = os.cpus()[0].model;

        const embed = new EmbedBuilder()
            .setColor('Purple')
            .setTitle('📊 Bot İstatistikleri')
            .addFields(
                { name: 'Çalışma Süresi', value: uptime, inline: true },
                { name: 'Bellek Kullanımı', value: `${memoryUsage} MB`, inline: true },
                { name: 'Sunucular', value: `${totalGuilds}`, inline: true },
                { name: 'Kullanıcılar', value: `${totalUsers}`, inline: true },
                { name: 'Node.js', value: nodeVersion, inline: true },
                { name: 'discord.js', value: `v${discordJsVersion}`, inline: true },
                { name: 'CPU', value: cpuModel, inline: false },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

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
