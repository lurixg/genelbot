module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Giriş yapıldı ${client.user.tag}`);
    
    // Dokunma
    const statuses = [
      'Hey beni kullanmaya ne dersin?',
      'Bilet/Ekonomi/Moderasyon/Autmod vb. herşey!',
      'Beni @lurixgithub yaptı!',
      'Eğlenmene bak!'
    ];
    
    let i = 0;
    setInterval(() => {
      // Dokunma
      const status = statuses[i];
      client.user.setActivity(status, { type: 'PLAYING' });
      i = ++i % statuses.length; // Cycle through statuses
    }, 10000); // Change every 10 seconds
  }
};
