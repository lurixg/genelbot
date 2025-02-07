const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Giveaway = require('../../database/models/Giveaway');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Çekilişleri yönet')
  .addSubcommand(subcommand =>
    subcommand
      .setName('start')
      .setDescription('Çekiliş başlat')
      .addStringOption(option => option.setName('duration').setDescription('Süre (ör. 10s, 1m, 2h)').setRequired(true))
      .addIntegerOption(option => option.setName('winners').setDescription('Kazanan sayısı').setRequired(true))
      .addStringOption(option => option.setName('prize').setDescription('Çekilişin ödülü').setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('end')
      .setDescription('Çekilişi bitir')
      .addStringOption(option => option.setName('message_id').setDescription('Çekilişin mesaj ID\'si').setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('cancel')
      .setDescription('Çekilişi iptal et')
      .addStringOption(option => option.setName('message_id').setDescription('Çekilişin mesaj ID\'si').setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('drop')
      .setDescription('Kanalda çekiliş başlat')
      .addIntegerOption(option => option.setName('winners').setDescription('Kazanan sayısı').setRequired(true))
      .addStringOption(option => option.setName('prize').setDescription('Çekilişin ödülü').setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName('edit')
      .setDescription('Çekilişi düzenle')
      .addStringOption(option => option.setName('message_id').setDescription('Çekilişin mesaj ID\'si').setRequired(true))
      .addStringOption(option => option.setName('duration').setDescription('Yeni süre (ör. 10s, 1m, 2h)').setRequired(false))
      .addIntegerOption(option => option.setName('winners').setDescription('Yeni kazanan sayısı').setRequired(false))
      .addStringOption(option => option.setName('prize').setDescription('Yeni ödül').setRequired(false))),  
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'start':
        await startGiveaway(interaction);
        break;
      case 'end':
        await endGiveaway(interaction);
        break;
      case 'cancel':
        await cancelGiveaway(interaction);
        break;
      case 'drop':
        await dropGiveaway(interaction);
        break;
      case 'edit':
        await editGiveaway(interaction);
        break;
      default:
        await interaction.reply('Bilinmeyen alt komut.');
    }
  },
};

// Function to convert duration to milliseconds
function parseDuration(duration) {
  const timeUnitRegex = /(\d+)([smhwd])/g;
  let totalMilliseconds = 0;
  let match;

  while ((match = timeUnitRegex.exec(duration)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    
    switch (unit) {
      case 's':
        totalMilliseconds += value * 1000;
        break;
      case 'm':
        totalMilliseconds += value * 60 * 1000;
        break;
      case 'h':
        totalMilliseconds += value * 60 * 60 * 1000;
        break;
      case 'd':
        totalMilliseconds += value * 24 * 60 * 60 * 1000;
        break;
      case 'w':
        totalMilliseconds += value * 7 * 24 * 60 * 60 * 1000;
        break;
    }
  }

  return totalMilliseconds;
}

// Function to start a giveaway
async function startGiveaway(interaction) {
  const durationInput = interaction.options.getString('duration');
  const winners = interaction.options.getInteger('winners');
  const prize = interaction.options.getString('prize');

  const duration = parseDuration(durationInput);
  if (duration <= 0) {
    return interaction.reply('Geçersiz süre belirtildi.');
  }

  const endTime = Date.now() + duration;

  const embed = new EmbedBuilder()
    .setTitle('🎉 Çekiliş! 🎉')
    .setDescription(`Ödül: ${prize}\nKazananlar: ${winners}\n-${durationInput} sonra bitecek.\n🎉 tepkisine basarak katılın!`)
    .setFooter({ text: `Ends at: ${new Date(endTime).toLocaleString()}` });

  const message = await interaction.channel.send({ embeds: [embed] });
  await message.react('🎉');

  const giveaway = new Giveaway({
    messageId: message.id,
    channelId: interaction.channel.id,
    guildId: interaction.guild.id,
    duration: duration,
    winners: winners,
    prize: prize,
    participants: [],
    ended: false,
  });

  await giveaway.save();

  const filter = (reaction, user) => {
    return reaction.emoji.name === '🎉' && !user.bot;
  };

  const collector = message.createReactionCollector({
    filter,
    time: duration,
  });

  collector.on('collect', async (reaction, user) => {
    if (!giveaway.participants.includes(user.id)) {
      giveaway.participants.push(user.id);
      await giveaway.save();
    }
  });

  collector.on('remove', async (reaction, user) => {
    const index = giveaway.participants.indexOf(user.id);
    if (index > -1) {
      giveaway.participants.splice(index, 1);
      await giveaway.save();
    }
  });

  // Countdown in seconds
  const interval = setInterval(async () => {
    const timeLeft = endTime - Date.now();
    if (timeLeft <= 0) {
      clearInterval(interval);
      await endGiveawayById(message.id, interaction.guild, interaction);
    } else {
      const secondsLeft = Math.round(timeLeft / 1000);
      embed.setDescription(`Ödül: ${prize}\nKazananlar: ${winners}\n${secondsLeft} sonra bitecek.s\n🎉 tepkisine basarak katılın!`);
      await message.edit({ embeds: [embed] });
    }
  }, 1000);

  await interaction.reply(`Çekiliş başladı! ${durationInput} sonra bitecek.`);
}

// Function to end a giveaway
async function endGiveaway(interaction) {
  const messageId = interaction.options.getString('message_id');
  const giveaway = await Giveaway.findOne({ messageId });

  if (!giveaway || giveaway.ended) {
    return interaction.reply('Çekiliş bulunamadı yada zaten giriş yapılmış.');
  }

  await endGiveawayById(messageId, interaction.guild, interaction);
  await interaction.reply('Çekiliş bitirildi.');
}

// Function to cancel a giveaway
async function cancelGiveaway(interaction) {
  const messageId = interaction.options.getString('message_id');
  const giveaway = await Giveaway.findOne({ messageId });

  if (!giveaway) {
    return interaction.reply('Çekiliş bulunumadı.');
  }

  const channel = await interaction.guild.channels.fetch(giveaway.channelId);
  const message = await channel.messages.fetch(messageId);
  
  await message.delete();
  await giveaway.delete();

  await interaction.reply('Çekiliş iptal edildi.');
}

// Function to drop a giveaway
async function dropGiveaway(interaction) {
  const winners = interaction.options.getInteger('winners');
  const prize = interaction.options.getString('prize');

  const embed = new EmbedBuilder()
    .setTitle('🎉 Çekiliş Drop! 🎉')
    .setDescription(`Ödül: ${prize}\nKazananlar: ${winners}\n🎉 tepkisine basarak katılabilirsiniz. `);

  const message = await interaction.channel.send({ embeds: [embed] });
  await message.react('🎉');

  const giveaway = new Giveaway({
    messageId: message.id,
    channelId: interaction.channel.id,
    guildId: interaction.guild.id,
    duration: 0, // No duration for drop
    winners: winners,
    prize: prize,
    participants: [],
    ended: false,
  });

  await giveaway.save();
  await interaction.reply(`Çekiliş droplandı!`);
}

// Function to edit a giveaway
async function editGiveaway(interaction) {
  if (!interaction.member.permissions.has('MANAGE_GUILD')) {
    return interaction.reply('Senin bu çekilişi düzenlemeye yetkin yok.');
  }

  const messageId = interaction.options.getString('message_id');
  const durationInput = interaction.options.getString('duration');
  const winners = interaction.options.getInteger('winners');
  const prize = interaction.options.getString('prize');

  const giveaway = await Giveaway.findOne({ messageId });

  if (!giveaway) {
    return interaction.reply('Çekiliş bulunamadı!');
  }

  if (durationInput) {
    const duration = parseDuration(durationInput);
    giveaway.duration = duration;
  }

  if (winners) {
    giveaway.winners = winners;
  }

  if (prize) {
    giveaway.prize = prize;
  }

  await giveaway.save();
  await interaction.reply('Çekiliş başarıyla düzenlendi!.');
}

// Function to end a giveaway by message ID
async function endGiveawayById(messageId, guild, interaction) {
  const giveaway = await Giveaway.findOne({ messageId });

  if (!giveaway || giveaway.ended) return;

  const channel = await guild.channels.fetch(giveaway.channelId);
  const message = await channel.messages.fetch(messageId);

  const participants = giveaway.participants;
  if (participants.length === 0) {
    await message.channel.send('Çekilişe hiçbir katılımcı katılmadı.');
    giveaway.ended = true;
    await giveaway.save();
    return;
  }

  const winners = [];
  for (let i = 0; i < giveaway.winners; i++) {
    const winner = participants[Math.floor(Math.random() * participants.length)];
    if (winners.includes(winner)) continue;
    winners.push(winner);
  }

  const winnerUsernames = winners.map(id => `<@${id}>`).join(', ');

  const winnerEmbed = new EmbedBuilder()
    .setTitle('🎉 Çekiliş sona erdi! 🎉')
    .setDescription(`Ödül: ${giveaway.prize}\nKazananlar: ${winnerUsernames}`);

  await message.channel.send({ embeds: [winnerEmbed] });

  giveaway.ended = true;
  await giveaway.save();
}
