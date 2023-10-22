const Discord = require("discord.js");
const fs = require('fs');
const { parse } = require("path");
const { token, channel_id, id_channel_of_notifications_discord } = require('config.json')
const client = new Discord.Client({
  intents: [ 
    Discord.IntentsBitField.Flags.Guilds,
    Discord.IntentsBitField.Flags.GuildMembers,
    Discord.IntentsBitField.Flags.GuildModeration,
    Discord.IntentsBitField.Flags.GuildIntegrations,
    Discord.IntentsBitField.Flags.GuildWebhooks,
    Discord.IntentsBitField.Flags.GuildInvites,
    Discord.IntentsBitField.Flags.GuildVoiceStates,
    Discord.IntentsBitField.Flags.GuildMessages,
    Discord.IntentsBitField.Flags.GuildPresences,
    Discord.IntentsBitField.Flags.GuildMessageReactions,
    Discord.IntentsBitField.Flags.GuildMessageTyping,
    Discord.IntentsBitField.Flags.DirectMessages,
    Discord.IntentsBitField.Flags.DirectMessageReactions,
    Discord.IntentsBitField.Flags.DirectMessageTyping,
    Discord.IntentsBitField.Flags.MessageContent
  ]
});
client.db = require("quick.db");
client.request = new (require("rss-parser"))();

client.on("ready", async () => {
  console.log("Estou pronto!", client.user.username);
  const channelId = id_channel_of_notifications_discord; // Substitua pelo ID do canal onde deseja enviar as mensagens.
  const channel = await client.channels.cache.get(channelId);
  await handleUploads(channel);
});

function handleUploads(channel) {
  if (client.db.fetch(`postedVideos`) === null) client.db.set(`postedVideos`, []);

  setInterval(() => {
    client.request.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel_id}`)
      .then(data => {
        if (client.db.fetch(`postedVideos`).includes(data.items[0].link)) return;
        
        client.db.set(`videoData`, data.items[0]);
        client.db.push("postedVideos", data.items[0].link);
        let parsed = client.db.fetch(`videoData`);
        
        if (!channel) {
          console.log('Canal não encontrado.');
          return;
        }

        // Crie um objeto Date a partir do formato de data cru
        const parsedDate = new Date(parsed.pubDate);
        // Use funções do objeto Date para formatar a data como desejar
        const formattedDate = `${parsedDate.getDate()}/${parsedDate.getMonth() + 1}/${parsedDate.getFullYear()} ${parsedDate.getHours()}:${parsedDate.getMinutes()}`;
        channel.send({
          embeds: [
            new Discord.EmbedBuilder()
            .setTitle(`${parsed.author}`)
            .setColor('#2f3136')
            .setTimestamp()
            .setDescription(`- **${parsed.author}:** acabei de postar um video novo no meu canal do YouTube vai lá ver!\n- **Titulo:** "${parsed.title}" um dos videos que recomendamos você assistir!\n### Conteúdos recomendados\n- **Marketing Digital**\npara quem quer levantar grana rápida essa é uma das melhores formas é recomendamos canais que realmente ensina você a fazer isso. Apenas os confiaveis é melhor gratuito.\n- **Programação**\npara quem quer aprender a programar com qualquer linguagem, nós postamos no nosso canal videos case todos os dias criando projetos simples com o "Programador do ChatGPT" que é o dono.\n- **Entre outros conteúdos**\npostamos também outros tipos de conteúdos que venha te ajudar em seu desenvolvimento pessoal.\n\n> **Video publicado em:** ${formattedDate} por **${parsed.author}**\n> todos os direitos autorais reservados para ${parsed.author}!`)
          ],
          components: [
            new Discord.ActionRowBuilder()
              .addComponents(
                new Discord.ButtonBuilder()
                  .setURL(`${parsed.link}`)
                  .setLabel('Assistir no YouTube')
                  .setStyle(Discord.ButtonStyle.Link),
                  new Discord.ButtonBuilder()
                  .setCustomId('reports')
                  .setDisabled(true)
                  .setLabel('Denúncia o Video')
                  .setStyle(Discord.ButtonStyle.Danger)
              )
          ]
        });
      });
  }, 30000);
}

// exportando o cliente para outras pastas.
module.exports = client;

// bloqueia o app de parar se houver erro no console 'catch'.
process.on('uncaughtException', (err, origin) => { console.log(err, origin); });

// slash commands Discord.js@14.0.1
client.login(token);

fs.readdir('./event', (err, file) => {
  file.forEach(event => {
    require(`./event/${event}`);
  });
});
