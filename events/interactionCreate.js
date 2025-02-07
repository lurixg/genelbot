const { Events, PermissionsBitField } = require('discord.js');
const Ticket = require('../database/models/ticket'); // Ticket modelini içe aktar
const Suggestion = require('../database/models/suggestion'); // Öneri modelini içe aktar

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {
        // Slash komutlarını işle
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            // Komut izinlerini kontrol et
            if (command.permissions) {
                const missingPermissions = command.permissions.filter(permission => 
                    !interaction.guild.me.permissions.has(permission)
                );
                if (missingPermissions.length > 0) {
                    return await interaction.reply({ 
                        content: `⚠️ | Bu komutu çalıştırmak için aşağıdaki izinlere ihtiyacım var: \`${missingPermissions.join(', ')}\`.`, 
                        ephemeral: true 
                    });
                }
            }

            // Belirli komutlar için ek kontroller
            if (command.name === 'mute' || command.name === 'unmute') {
                const member = interaction.options.getMember('user');
                if (!member.voice.channel) {
                    return await interaction.reply({ 
                        content: `🚫 | Kullanıcının bir ses kanalında olması gerekiyor: ${command.name === 'mute' ? 'susturulması' : 'susturmasının kaldırılması'} için.`, 
                        ephemeral: true 
                    });
                }
            }

            try {
                await command.execute(interaction, client); // Client'ı geçirerek komutu çalıştır
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '💀 | Nadir görülen bir bot hatasıyla karşılaştınız.', ephemeral: true });
            }
        }

        // Buton etkileşimlerini işle
        if (interaction.isButton()) {
            const { customId } = interaction; // Buton etkileşimleri için customId'yi al
            const ticketData = await Ticket.findOne({ channelId: interaction.channel.id });

            // Destek bileti etkileşimleri
            if (ticketData) {
                switch (customId) {
                    case 'create_ticket':
                        await createTicket(interaction, ticketData);
                        break;
                    case 'ticket_claim':
                        await claimTicket(interaction); // claimTicket fonksiyonunu uygula
                        break;
                    case 'ticket_delete':
                        await deleteTicket(interaction); // deleteTicket fonksiyonunu uygula
                        break;
                    case 'ticket_transcript':
                        await getTranscript(interaction); // getTranscript fonksiyonunu uygula
                        break;
                    default:
                        break;
                }
            }
        }
    },
};

async function createTicket(interaction, ticketData) {
    const userTickets = await Ticket.countDocuments({ userId: interaction.user.id, guildId: interaction.guild.id });
    const ticketNumber = userTickets + 1; // Yeni bilet numarasını belirle
    const channelName = `ticket-${interaction.user.username}-${ticketNumber}`;

    const ticketChannel = await interaction.guild.channels.create({
        name: channelName,
        type: 0, // 'GUILD_TEXT' artık kullanılmıyor, metin kanalları için 0 kullan
        permissionOverwrites: [
            {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
                id: interaction.user.id,
                allow: [PermissionsBitField.Flags.ViewChannel],
            },
            {
                id: ticketData.staffRoleId,
                allow: [PermissionsBitField.Flags.ViewChannel],
            },
        ],
    });

    // Yetkili rolünü etiketleyerek kullanıcıyı bilgilendir
    await ticketChannel.send({
        content: `Merhaba ${interaction.user}, biletiniz oluşturuldu! <@&${ticketData.staffRoleId}> yetkilileri, lütfen yardımcı olun.`,
    });

    // Etkileşime yanıt ver
    await interaction.reply({ content: `✅ | Destek bileti oluşturuldu: ${ticketChannel}`, ephemeral: true });

    // Bilet verilerini veritabanına kaydet
    const newTicket = new Ticket({
        userId: interaction.user.id,
        channelId: ticketChannel.id,
        guildId: interaction.guild.id,
        ticketNumber: ticketNumber, // Gelecekte kullanmak için bilet numarasını kaydet
        description: "Yeni destek bileti oluşturuldu", // Varsayılan bir açıklama ver veya özelleştir
        title: `Bilet #${ticketNumber}`, // Varsayılan bir başlık ver
        transcriptChannelId: ticketData.transcriptChannelId, // Önceden tanımlandığını varsayıyoruz
        logsChannelId: ticketData.logsChannelId, // Önceden tanımlandığını varsayıyoruz
        staffRoleId: ticketData.staffRoleId // Önceden tanımlandığını varsayıyoruz
    });
  
    await newTicket.save();
}
