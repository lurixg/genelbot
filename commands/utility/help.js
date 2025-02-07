const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commandsPath = path.join(__dirname, '../..', 'commands');

// Kategori başlıkları için emojiler
const categoryEmojis = {
  fun: '🎉',
  automod: '🤖',
  economy: '💰',
  moderation: '🔨',
  suggestion: '💡',
  giveaway: '🎁',
  ticket: '🎫',
  invites: '📩',
  utility: '🛠️',
  information: 'ℹ️',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Bot için yardım menüsünü görüntüler.'),

  async execute(interaction) {
    const categories = fs.readdirSync(commandsPath);
    const botIcon = interaction.client.user.displayAvatarURL();

    let pageIndex = 0; // Hangi sayfanın gösterileceğini takip etmek için indeks

    const generateHomeEmbed = () => ({
      color: 0x0099ff,
      title: '✨ Funio Yardım İçin Burada!',
      description: 'Discord için çok amaçlı bir bottur. Süper bir sunucu kurmanıza yardımcı olabilir.',
      thumbnail: {
        url: botIcon,
      },
      fields: [
        { name: '📌 __BOT BİLGİSİ__', value: `> :arrow_right: Prefix: \`${process.env.PREFIX}\`\n> :arrow_right: Discord.js Sürümü: \`v${require('discord.js').version}\`\n> :arrow_right: Node Versiyonu: \`${process.versions.node}\`\n> :arrow_right: Yapan: \`lurixgithub\`` },
        { name: '📋 __Mevcut Kategoriler__', value: categories.map(cat => `> ${categoryEmojis[cat] || '❓'} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`).join('\n') },
      ],
      footer: {
        text: 'Aşağıdaki butonları kullanarak gezin.',
      },
    });

    const generateCategoryEmbed = (index) => {
      const category = categories[index];
      const commandFiles = fs.readdirSync(path.join(commandsPath, category)).filter(file => file.endsWith('.js'));
      
      const commands = commandFiles.map(file => {
        const command = require(path.join(commandsPath, category, file));
        const subcommands = command.data.options ? command.data.options.map(option => option.name).join(', ') : 'Alt komut yok';
        return `> **/${command.data.name}**: ${subcommands}`;
      }).join('\n');

      return {
        color: 0x0099ff,
        title: `📋 __${category.charAt(0).toUpperCase() + category.slice(1)} Komutları__`,
        description: commands || 'Bu kategoride komut yok.',
        footer: {
          text: `Sayfa ${index + 1} / ${categories.length}`,
        },
      };
    };

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('Önceki')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(pageIndex === 0),
        new ButtonBuilder()
          .setCustomId('home')
          .setLabel('Ana Sayfa')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Sonraki')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(pageIndex === categories.length - 1)
      );

    const helpMessage = await interaction.reply({ embeds: [generateHomeEmbed()], components: [row], fetchReply: true });

    const filter = i => {
      i.deferUpdate();
      return i.user.id === interaction.user.id;
    };

    const collector = helpMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'next') {
        if (pageIndex < categories.length - 1) {
          pageIndex++;
          await interaction.editReply({ embeds: [generateCategoryEmbed(pageIndex)], components: [row] });
        }
      } else if (i.customId === 'prev') {
        if (pageIndex > 0) {
          pageIndex--;
          await interaction.editReply({ embeds: [generateCategoryEmbed(pageIndex)], components: [row] });
        }
      } else if (i.customId === 'home') {
        pageIndex = 0; // Ana sayfaya dön
        await interaction.editReply({ embeds: [generateHomeEmbed()], components: [row] });
      }
    });

    collector.on('end', collected => {
      row.components.forEach(button => button.setDisabled(true));
      interaction.editReply({ components: [row] });
    });
  },
};
