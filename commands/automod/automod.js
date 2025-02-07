const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const AutoMod = require('../../database/models/automod'); // AutoMod modelinin içe aktarıldığını varsayalım

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Otomatik moderasyon ayarlarını yapılandır')
    .addSubcommand(subcommand =>
      subcommand.setName('antiinvites')
        .setDescription('Davet bağlantısı algılamayı etkinleştir veya devre dışı bırak')
        .addStringOption(option => 
          option.setName('status')
            .setDescription('Etkinleştir veya devre dışı bırak')
            .setRequired(true)
            .addChoices(
              { name: 'Etkinleştir', value: 'enable' },
              { name: 'Devre Dışı Bırak', value: 'disable' }
            )))

    .addSubcommand(subcommand =>
      subcommand.setName('antilinks')
        .setDescription('Genel bağlantı algılamayı etkinleştir veya devre dışı bırak')
        .addStringOption(option => 
          option.setName('status')
            .setDescription('Etkinleştir veya devre dışı bırak')
            .setRequired(true)
            .addChoices(
              { name: 'Etkinleştir', value: 'enable' },
              { name: 'Devre Dışı Bırak', value: 'disable' }
            )))

    .addSubcommand(subcommand =>
      subcommand.setName('antispam')
        .setDescription('Spam algılamayı etkinleştir veya devre dışı bırak')
        .addStringOption(option => 
          option.setName('status')
            .setDescription('Etkinleştir veya devre dışı bırak')
            .setRequired(true)
            .addChoices(
              { name: 'Etkinleştir', value: 'enable' },
              { name: 'Devre Dışı Bırak', value: 'disable' }
            )))

    .addSubcommand(subcommand =>
      subcommand.setName('whitelist')
        .setDescription('Otomatik moderasyon beyaz listesinden kullanıcı/rol ekleyin veya kaldırın')
        .addStringOption(option =>
          option.setName('action')
            .setDescription('Ekle veya kaldır')
            .setRequired(true)
            .addChoices(
              { name: 'Ekle', value: 'add' },
              { name: 'Kaldır', value: 'remove' }
            ))
        .addMentionableOption(option => 
          option.setName('target')
            .setDescription('Beyaz listeye eklenecek veya kaldırılacak kullanıcı/rol')
            .setRequired(true))),
  
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const subcommand = interaction.options.getSubcommand();
    const status = interaction.options.getString('status');
    const action = interaction.options.getString('action');
    const target = interaction.options.getMentionable('target');

    // Sunucu için otomod ayarlarını getir veya oluştur
    let autoModSettings = await AutoMod.findOne({ guildId });
    if (!autoModSettings) {
      autoModSettings = new AutoMod({ guildId });
      await autoModSettings.save();
    }

    switch (subcommand) {
      case 'antiinvites': {
        // Davet bağlantısı algılamayı etkinleştir veya devre dışı bırak
        if (status === 'enable') {
          autoModSettings.antiInvites = true;
          await autoModSettings.save();
          return interaction.reply({ content: '✅ | Davet bağlantısı algılama etkinleştirildi.', ephemeral: true });
        } else {
          autoModSettings.antiInvites = false;
          await autoModSettings.save();
          return interaction.reply({ content: '❌ | Davet bağlantısı algılama devre dışı bırakıldı.', ephemeral: true });
        }
      }

      case 'antilinks': {
        // Genel bağlantı algılamayı etkinleştir veya devre dışı bırak
        if (status === 'enable') {
          autoModSettings.antiLinks = true;
          await autoModSettings.save();
          return interaction.reply({ content: '✅ | Link algılama etkinleştirildi.', ephemeral: true });
        } else {
          autoModSettings.antiLinks = false;
          await autoModSettings.save();
          return interaction.reply({ content: '❌ | Link algılama devre dışı bırakıldı.', ephemeral: true });
        }
      }

      case 'antispam': {
        // Spam algılamayı etkinleştir veya devre dışı bırak
        if (status === 'enable') {
          autoModSettings.antiSpam = true;
          await autoModSettings.save();
          return interaction.reply({ content: '✅ | Spam algılama etkinleştirildi.', ephemeral: true });
        } else {
          autoModSettings.antiSpam = false;
          await autoModSettings.save();
          return interaction.reply({ content: '❌ | Spam algılama devre dışı bırakıldı.', ephemeral: true });
        }
      }

      case 'whitelist': {
        // Beyaz listeye kullanıcı/rol ekleme veya kaldırma
        const targetId = target.id;
        if (action === 'add') {
          if (autoModSettings.whitelist.includes(targetId)) {
            return interaction.reply({ content: '⚠️ | Bu kullanıcı/rol zaten beyaz listede.', ephemeral: true });
          }
          autoModSettings.whitelist.push(targetId);
          await autoModSettings.save();
          return interaction.reply({ content: `✅ | <@${targetId}> beyaz listeye eklendi.`, ephemeral: true });
        } else if (action === 'remove') {
          const index = autoModSettings.whitelist.indexOf(targetId);
          if (index === -1) {
            return interaction.reply({ content: '⚠️ | Bu kullanıcı/rol beyaz listede bulunmuyor.', ephemeral: true });
          }
          autoModSettings.whitelist.splice(index, 1);
          await autoModSettings.save();
          return interaction.reply({ content: `❌ | <@${targetId}> beyaz listeden kaldırıldı.`, ephemeral: true });
        }
      }
    }
  }
};
