const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Bir kullanıcıya rol verir veya rolden çıkarır.')
    .addUserOption(option => option.setName('user').setDescription('Değişiklik yapacak kullanıcıyı seçin').setRequired(true))
    .addRoleOption(option => option.setName('role').setDescription('Verilecek/Çıkarılacak rolü seçin').setRequired(true))
    .addStringOption(option => 
      option.setName('action')
        .setDescription('Rol ekleme veya çıkarma işlemi yapın.')
        .setRequired(true)
        .addChoices(
          { name: 'Ekle', value: 'add' },
          { name: 'Çıkar', value: 'remove' }
        )),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const action = interaction.options.getString('action');
    const member = await interaction.guild.members.fetch(user.id);

    // Komut sahibinin rol yönetme iznine sahip olup olmadığını kontrol et
    if (!interaction.member.permissions.has('MANAGE_ROLES')) {
      return interaction.reply({ content: 'Rol yönetme izniniz yok.', ephemeral: true });
    }

    // Seçilen işleme göre rol ekle veya çıkar
    if (action === 'add') {
      // Üyenin zaten rolü olup olmadığını kontrol et
      if (member.roles.cache.has(role.id)) {
        return interaction.reply({ content: `🎭 | **${user.tag}** zaten **${role.name}** rolüne sahip.`, ephemeral: true });
      } else {
        await member.roles.add(role);
        return interaction.reply(`🎭 | **${role.name}** rolü **${user.tag}** kullanıcısına verildi.`);
      }
    } else if (action === 'remove') {
      // Üyenin rolü olup olmadığını kontrol et
      if (!member.roles.cache.has(role.id)) {
        return interaction.reply({ content: `🎭 | **${user.tag}** kullanıcısının **${role.name}** rolü yok.`, ephemeral: true });
      } else {
        await member.roles.remove(role);
        return interaction.reply(`🎭 | **${role.name}** rolü **${user.tag}** kullanıcısından çıkarıldı.`);
      }
    }
  }
};
