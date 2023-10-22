const Discord = require('discord.js');
const client = require('../index');

client.on('ready', async () => {
  console.log(`Protocolo de acesso: ${client.user.id}`);
  client.user.setActivity('Recebendo notificações de um channel of YouTube!');
});