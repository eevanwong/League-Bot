const puppeteer = require("puppeteer");
const Discord = require("discord.js");
const bot = new Discord.Client();
const call = "-";
require("dotenv").config();
//note: If I want to run this with heroku then i need to show the token (gitignore will result in files not being read which are necessary for bot to run)
/*
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}
*/

const TOKEN = process.env.TOKEN;

bot.login(TOKEN);

bot.on("ready", () => {
  console.info(`${bot.user.tag} is online!`);

  bot.user.setActivity("Youtube", { type: "WATCHING" });
});

bot.on("message", (msg) => {
  if (!msg.content.startsWith(call)) {
    return;
  }

  let command = msg.content.substring(1);

  if (command === "commands" || command === "help") {
    const commandList = [
      "`-stats [league username]` - Checks OPGG of player's match history and stats! \n" +
        "`-lastmatch [league username]` - Checks last match of player's match history. \n" +
        "`-patchnotes [champ name]` - Checks latest patchnotes for changes to a champ. \n",
    ];
    const commandsEmbed = new Discord.MessageEmbed()
      .setColor("#ffffff")
      .setTitle("List of Commands:")
      .setDescription(commandList[0]);

    msg.reply(commandsEmbed);
  } else if (command.startsWith("stats ")) {
    //Check if player exists or if a string is even entered (check with puppeteer)
    let player = command.substring(6, command.length);
    website("https://na.op.gg/summoner/userName=" + player);
    async function website(url) {
      console.log(url);
      const browser = await puppeteer.launch(); //initializes browser
      const page = await browser.newPage(); //new page

      await page.goto(url); //inputs link into browser

      const rankinfo = await page
        .evaluate(() => document.querySelector("div.TierRankInfo").innerText) //checks if profile has a name, if not, then profile dne
        .catch((err) => {
          msg.reply(player + " does not seem to exist");
          console.log(player + "dne");
          return;
        });
      console.log(rankinfo);
      const ranktext = rankinfo.split("\n").join(" ").split(" ");
      console.log(ranktext);

      const nameinfo = await page.evaluate(
        () => document.querySelector("span.Name").innerText
      );

      const [rankicon] = await page.$x(
        //Why does it need to be in brackets?
        "/html/body/div[2]/div[2]/div/div/div[5]/div[2]/div[1]/div[1]/div/div[1]/img"
      );

      console.log(rankicon);

      const ranksrc = await rankicon.getProperty("src"); //gets pic src

      const rankpic = await ranksrc.jsonValue(); //json value (search up json)

      const statsEmbed = new Discord.MessageEmbed() // difference between rich embed. message embed?
        .setTitle(nameinfo)
        .setURL(url)
        .setThumbnail(rankpic)
        .addFields(
          {
            name: "Rank",
            value: ranktext[2] + " " + ranktext[3],
            inline: true,
          },
          { name: "\u200B", value: "\u200B", inline: true },
          {
            name: "League Points:",
            value: ranktext[4] + " " + ranktext[5],
            inline: true,
          },
          {
            name: "Wins/Loss",
            value: ranktext[7] + ranktext[6] + "/" + ranktext[8],
            inline: true,
          },
          { name: "\u200B", value: "\u200B", inline: true },
          { name: "Win Ratio", value: ranktext[11], inline: true }
        );
      msg.channel.send(statsEmbed);
      await browser.close();
    }
  } else if (command.startsWith("lastmatch ")) {
    let player = command.substring(10, command.length);
    website("https://na.op.gg/summoner/userName=" + player);
    async function website(url) {
      console.log(url);
      const browser = await puppeteer.launch(); //initializes browser
      const page = await browser.newPage(); //new page
      await page.goto(url); //inputs link into browser

      await page
        .evaluate(() => document.querySelector("div.TierRankInfo").innerText) //ill probably change so that it will check this once to confirm if its an actual person
        .catch((err) => {
          s;
          msg.reply(player + " does not seem to exist");
          console.log(player + "dne");
          return;
        });

      await page.click(
        "div.GameItemWrap:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(7) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)"
      );

      await page.waitForSelector(".MatchDetailContent");

      const lastMatch = await page.$(".MatchDetailContent-overview");

      console.log(lastMatch);

      await lastMatch.screenshot({ path: "match-history.png" });

      msg.channel.send({ files: ["match-history.png"] });
      await browser.close();
    }
  } else if (command.startsWith("patchnotes ")) {
    //item changes, champ changes,
    let champ = command.substring(11, command.length);
    //const champID = "#patch-" + champ;

    website(
      "https://na.leagueoflegends.com/en-us/news/tags/patch-notes",
      champ
    );

    async function website(url, champ) {
      console.log(champ);
      const browser = await puppeteer.launch({
        defaultViewport: { width: 2000, height: 2000 }, //viewport is ignored for some reason, screenshot size is hella scuffed
      });
      const page = await browser.newPage(); //new page

      await page.goto(url); //inputs link into browser
      await page.click(
        "li.style__Item-sc-3mnuh-3:nth-child(1) > a:nth-child(1) > article:nth-child(1) > div:nth-child(2) > div:nth-child(1) > h2:nth-child(2)"
      ); //clicks latest patch notes
      await page.waitForNavigation();

      let champPatchs = await page.$$(
        "div.patch-change-block.white-stone.accent-before"
      );
      let champPic = await page.$$("a.reference-link[href]");

      const hrefs = await page.evaluate(() =>
        //thank god for stack overflow (this gets the actual hrefs)
        Array.from(document.querySelectorAll("a.reference-link[href]"), (a) =>
          a.getAttribute("href")
        )
      );
      //getting the div patch change blocks and champpics (see patch things for details)

      let patchSection = ""; //made this variable so that when the proper champURL is found i use this variable
      for (let i = 0; i < champPic.length; i++) {
        let champURL = hrefs[i].substring(62, hrefs[i].length);
        if (champURL.toUpperCase() == champ.toUpperCase() + "/") {
          console.log(champ + ", " + champURL);
          patchSection = champPatchs[i];
          await page.waitForTimeout(2300); //it needs to wait a bit to load

          await patchSection.screenshot({ path: "patch-section.png" }); //when i screenshot it gives a white background why? needed to load
          msg.channel.send({ files: ["patch-section.png"] }); //alright this really doesnt work because some patches are very large so i need some way to get around that... (maybe splititng it into 2 pics?)
          break;
        }
      }
      if (patchSection == "") {
        msg.channel.send("Champ has not been changed this patch.");
      }
      console.log(patchSection);

      await browser.close();

      //champPic[i] = champPic[i].getAttribute("href");
      //will go through each href and see if the name lines up and then will screenshot the patch-change-block of that champ (of the particular index)
      //console.log(champPic[i]);

      //#patch-anivia > a:nth-child(1)

      //div.content-border:nth-child(8) > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)
      //<img src="https://am-a.akamaihd.net/image?f=http://ddragon.leagueoflegends.com/cdn/10.24.1/img/champion/Anivia.png">

      /*
      let champPatch = await page.$(champID);

      if (champPatch != null) {
        console.log("found");
      } else if (champPatch == null) {
        console.log(champPatch);
      }
      //finds that champ is changed this patch

      const champPatchPic = await page.$();
      */

      //await page.$(champID, () => console.log("good"));
    }
  } else {
    msg.channel.send(
      "That doesnt seem to be a command, check `-commands` for more info"
    );
  }
});

//lastest patch notes & latest notes regarding specific champ
//mayb items specifically?

/*
      await page.waitForSelector('#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.RealContent > div > div.Content > div.GameItemList > div:nth-child(1) > div > div.GameDetail > div > div.MatchDetailContent.tabItems > div.Content.tabItem.MatchDetailContent-overview > div > table.GameDetailTable.Result-WIN > tbody > tr.Row.last > td.Items.Cell');

      await page.waitFor(25);

      const lastMatch = await page.$('#SummonerLayoutContent > div.tabItem.Content.SummonerLayoutContent.summonerLayout-summary > div.RealContent > div > div.Content > div.GameItemList > div:nth-child(1) > div');

      await lastMatch.screenshot({path: 'match-history.png'});
    }

*/
/*  
})
*/
