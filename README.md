# League Info Bot

Bot is made for discord to see their league stats from OP.GG website using Puppeteer and Discord Js.

<br/>

## Commands

### -stats [username]

Command uses Puppeteer to webscrape ranked info from OP.GG's DOMs for the specific username. It then outputs information in an Embed to the user using Discord's API.

![](img/statsimg.png)

### -lastgame [username]

Command uses Puppeteer to webscrap info by interacting with the page and getting the most recent match of the player profile

![VISUAL:](img/match.png)

### -patchnotes [champion]

Command uses Puppeteer to webscrape from leagues official pathnotes, it will look at the latest patchnotes and it will send back a pic of the changes

![](img/lastpatch-command.png)


## FUTURE UPDATES
- bot hosting w/ heroku 
- For patch notes, bot will automatically puppeteeer the information, grab each change for champions, then store the images in database 
