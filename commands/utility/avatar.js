const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Bir kullanıcının avatarını görüntüler.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Avatarını almak istediğiniz kullanıcı')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle(`${user.tag} Avatarı`)
            .setImage(avatarURL)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
