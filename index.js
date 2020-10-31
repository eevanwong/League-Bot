const puppeteer = require('puppeteer')
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

  else if (command.startsWith('stats ')) 
  //Check if player exists or if a string is even entered (check with puppeteer)
  { 
    let player = command.substring(6,command.length); 
    website('https://na.op.gg/summoner/userName='+player); 
    async function website(url) {
      //let url = 'https://na.op.gg/summoner/userName='+player;
      console.log(url);
      const browser = await puppeteer.launch(); //initializes browser
      const page = await browser.newPage(); //new page
      
      await page.goto(url); //inputs link into browser 

      
      const rankinfo = await page.evaluate(() => document.querySelector('div.TierRankInfo').innerText) //checks if profile has a name, if not, then profile dne  
      .catch((err) => {
          msg.reply(player + " does not seem to exist")
          console.log(player+'dne')
          return
        })
      console.log(rankinfo);
      const ranktext = rankinfo.split('\n').join(" ").split(" ");
      console.log(ranktext);

      const nameinfo = await page.evaluate(() => document.querySelector('span.Name').innerText)
      
      const [rankicon] = await page.$x('/html/body/div[2]/div[3]/div/div/div[5]/div[2]/div[1]/div[1]/div/div[1]/img')
                      //search this up
      const ranksrc = await rankicon.getProperty('src'); //gets pic src
      
      const rankpic = await ranksrc.jsonValue(); //json value (search up json)

      const statsEmbed = new Discord.MessageEmbed()// difference between rich embed. message embed?
        .setTitle(nameinfo)             
        .setURL(url)
        .setThumbnail(rankpic)
        .addFields(
           {name: 'Rank', value: ranktext[2] + " " + ranktext[3], inline : true},
           {name: '\u200B', value: '\u200B', inline: true},
           {name: 'League Points:', value: ranktext[4] + " "+  ranktext[5], inline: true },
           {name: 'Wins/Loss', value: ranktext[7] +ranktext[6] + '/' + ranktext[8], inline: true},
           {name: '\u200B', value: '\u200B', inline: true},
           {name: 'Win Ratio', value: ranktext[11], inline: true},
          )
      msg.reply(statsEmbed);
    }
      /*
      await page.waitForSelector('#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.RealContent > div > div.Content > div.GameItemList > div:nth-child(1) > div > div.GameDetail > div > div.MatchDetailContent.tabItems > div.Content.tabItem.MatchDetailContent-overview > div > table.GameDetailTable.Result-WIN > tbody > tr.Row.last > td.Items.Cell');

      await page.waitFor(25);

      const lastMatch = await page.$('#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.RealContent > div > div.Content > div.GameItemList > div:nth-child(1) > div');

      await lastMatch.screenshot({path: 'match-history.png'});
    }
    */
      
      
        
  } 
})
  


/*  
})
*/