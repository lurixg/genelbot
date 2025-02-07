const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require('discord.js');
const Ticket = require('../../database/models/ticket');
const { createTranscript } = require('discord-html-transcripts'); // Transkript oluşturma için

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Destek sistemi komutları')
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Destek sistemini kur')
        .addChannelOption(option => option.setName('channel').setDescription('Destek için kanal').setRequired(true))
        .addRoleOption(option => option.setName('staff-role').setDescription('Personel rolü').setRequired(true))
        .addChannelOption(option => option.setName('logs').setDescription('Destek log kanalı').setRequired(true))
        .addChannelOption(option => option.setName('transcript').setDescription('Transkript kanalı').setRequired(true))
        .addStringOption(option => option.setName('title').setDescription('Destek mesajı başlığı').setRequired(true))
        .addStringOption(option => option.setName('description').setDescription('Destek mesajı açıklaması').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Bir kullanıcıyı destek kanalından çıkar')
        .addUserOption(option => option.setName('user').setDescription('Çıkarılacak kullanıcı').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Bir kullanıcıyı destek kanalına ekle')
        .addUserOption(option => option.setName('user').setDescription('Eklemek için kullanıcı').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('close')
        .setDescription('Destek biletini kapat ve kanalını sil.'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('transcript')
        .setDescription('Destek biletinin transkriptini al.')),

  async execute(interaction) {
    const { options } = interaction;
    const subcommand = options.getSubcommand();

    if (subcommand === 'setup') {
      const channel = options.getChannel('channel');
      const staffRole = options.getRole('staff-role');
      const logsChannel = options.getChannel('logs');
      const transcriptChannel = options.getChannel('transcript');
      const title = options.getString('title');
      const description = options.getString('description');

      // Yeni bir destek belgesi oluştur
      const ticket = new Ticket({
        channelId: channel.id,
        staffRoleId: staffRole.id,
        logsChannelId: logsChannel.id,
        transcriptChannelId: transcriptChannel.id,
        title,
        description,
      });

      await ticket.save();

      // Destek mesajı embed'ini oluştur
      const ticketEmbed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: 'Destek oluşturmak için aşağıdaki butona tıklayın.' });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('Destek Oluştur')
            .setStyle(ButtonStyle.Primary)
        );

      // Embed'i belirtilen kanalda gönder
      await channel.send({ embeds: [ticketEmbed], components: [row] });
      await interaction.reply(`🎫 | Destek sistemi başarıyla ${channel} kanalında kuruldu. Başlık: **${title}**.`);
    } else if (subcommand === 'remove') {
      const user = options.getUser('user');
      const member = await interaction.guild.members.fetch(user.id);

      // Kullanıcının destek kanalında olup olmadığını kontrol et
      if (interaction.channel.permissionsFor(member).has(PermissionsBitField.Flags.ViewChannel)) {
        await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: false });
        await interaction.reply(`❌ | **${user.tag}**, destek kanalından çıkarıldı.`);
      } else {
        await interaction.reply(`⚠️ | **${user.tag}**, destek kanalında değil.`);
      }
    } else if (subcommand === 'add') {
      const user = options.getUser('user');
      const member = await interaction.guild.members.fetch(user.id);

      // Kullanıcının destek kanalında olup olmadığını kontrol et
      if (!interaction.channel.permissionsFor(member).has(PermissionsBitField.Flags.ViewChannel)) {
        await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true });
        await interaction.reply(`✅ | **${user.tag}**, destek kanalına eklendi.`);
      } else {
        await interaction.reply(`⚠️ | **${user.tag}** zaten destek kanalında.`);
      }
    } else if (subcommand === 'close') {
      // Destek biletini kapat
      const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
      if (!ticket) {
        return interaction.reply(`❌ | Bu kanal açık bir destek biletiyle ilişkili değil.`);
      }

      // Log ve transkript kanallarını veritabanından al
      const logsChannel = interaction.guild.channels.cache.get(ticket.logsChannelId);
      const transcriptChannel = interaction.guild.channels.cache.get(ticket.transcriptChannelId);

      // Destek biletinin transkriptini oluştur
      const transcript = await createTranscript(interaction.channel);

      // Transkripti transkript kanalına gönder
      await transcriptChannel.send({
        content: `Destek bileti #${ticket.ticketNumber} için transkript, <@${ticket.userId}> tarafından oluşturuldu.`,
        files: [transcript],
      });

      // Log kanalına bildirim gönderebilirsiniz
      if (logsChannel) {
        await logsChannel.send(`📝 | Destek bileti #${ticket.ticketNumber}, ${interaction.user.tag} tarafından kapatıldı ve transkript kaydedildi.`);
      }

      // Destek biletini veritabanından sil
      await Ticket.deleteOne({ channelId: interaction.channel.id });

      // Destek kanalını sil
      await interaction.channel.delete();
    } else if (subcommand === 'transcript') {
      // Veritabanından destek biletini al
      const ticket = await Ticket.findOne({ channelId: interaction.channel.id });
      if (!ticket) {
        return interaction.reply(`❌ | Bu kanal açık bir destek biletiyle ilişkili değil.`);
      }

      // Destek biletinin transkriptini oluştur
      const transcript = await createTranscript(interaction.channel);

      // Transkripti transkript kanalına gönder
      const transcriptChannel = interaction.guild.channels.cache.get(ticket.transcriptChannelId);
      await transcriptChannel.send({
        content: `Destek bileti #${ticket.ticketNumber} için transkript, <@${ticket.userId}> tarafından oluşturuldu.`,
        files: [transcript],
      });

      await interaction.reply(`📜 | Bu biletin transkripti, ${transcriptChannel} kanalına gönderildi.`);
    }
  },
};
