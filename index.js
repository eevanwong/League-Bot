const Discord = require('discord.js');
const bot = new Discord.Client();
const call = '-';
require('dotenv').config(); 

/*
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}
*/


const TOKEN = process.env.TOKEN;
bot.login(TOKEN);

bot.on('ready', () => {
  console.info(`${bot.user.tag} is online!`);

  bot.user.setActivity("Youtube", {type:"WATCHING"})

  bot.guilds.forEach((guild) => {
    console.log(guild.name)
  })
});

bot.on('message', msg => {
  
  if (!(msg.content.startsWith(call))) {
    return;
  }

  let command = msg.content.substring(1);

  if (command === 'commands' || command === 'help') {
    const commandList = ["`-stats [league username]` - Checks OPGG of player's match history and stats! \n"];
    const commandsEmbed = new Discord.RichEmbed()
      .setColor('#ffffff')
      .setTitle('List of Commands:')
      .setDescription(commandList[0])
    msg.reply(commandsEmbed);
  }


  else if (command.substr(0,5) =="opgg ") { //hmm this doesnt really work
    player = command.substr(4,command.length);
    msg.channel.send(`https://na.op.gg/summoner/userName=${player}`)
  }

});

/*
client.on('message', msg => {
  if (!msg.content.startsWith(prefix)) {
    msg.reply(`${msg}`);
  }
});
*/

  /*
  } else if (msg.content.startsWith('!kick')) {
    if (msg.mentions.users.size) {
      const taggedUser = msg.mentions.users.first();
      msg.channel.send(`You wanted to kick: ${taggedUser.username}`);
    } else {
      msg.reply('Please tag  a valid user!');
    }
  }
});
*/