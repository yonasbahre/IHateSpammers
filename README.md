# IHateSpammers

[Click me to add IHS to your server!](https://discord.com/api/oauth2/authorize?client_id=973090364804194334&permissions=1099511627776&scope=bot)

IHateSpammers is a Discord bot that automatically sends a friendly message of your choice to anyone who spams the same message repeatedly in any of your server's channels. You can even have the spammers muted for a certain period of time!

*Make sure to set values for the repeats and addChannel commands in order to activate the bot! More info below.*
<br/>
<br/>

## **Commands**

`-ihs repeats <# of repeats>`

This sets the number of times a spam message will be repeated before the bot responds.
For instance, `-ihs repeats 3` will cause the bot to respond if the same message is repeated 3 times. This setting applies to all text channels in the server.

If this value is set to 0, the bot will not respond to any spam messages. This value is set to 0 by default, so make sure to use this command at least once to activate the bot.
<br/>
<br/>

`-ihs response <your response>`

Sets the message the bot will respond to the spammers with. The default message is "pls stop", so feel free to change this to something a little more interesting. This setting applies to all text channels in the server.

Do **not** surround your message with quotes. If you'd like to respond with an image or gif, use a link to that image. 

Example: `-ihs response https://media2.giphy.com/media/LAKIIRqtM1dqE/giphy.gif?cid=ecf05e4725rrcyh6tkbx5zz4uxcg54r0lqsdfro8os64m7vj&rid=giphy.gif&ct=g` 
<br/>
<br/>

`-ihs mutetime <mute time>`

This sets how long you would like to mute spammers **in minutes**. This setting applies to all text channels in the server and has a default value of 0, so the bot will not mute anyone until you specify this. Everyone who sent a message in the spam chain will be muted.

The bot can *only mute users with a higher role than itself*, so make sure it has a role higher than the highest-up person you want to mute. If the bot has a lower role than a spammer, it will still send its response but without muting them.

The server owner can **not** be muted by the bot.
<br/>
<br/>

`-ihs addChannel <channel name>`

This tells the bot to listen for spam messages in the specified channel. ***The bot can only respond in channels it has been added to.***

Do **not** put quotes around the channel name.
<br/>
<br/>

`-ihs removeChannel <channel name>`

This tells the bot to stop listening/responding to spam in the specified channel.
<br/>
<br/>

`-ihs addRole <role name>`

This allows all users with the specified role to use the bot's commands. The server owner will always be able to use all bot commands, even if their role has not been added. This does **not** make users with this role immune from being muted, as long as the bot has a higher role than them.

Do **not** put quotes around the role name.
<br/>
<br/>

`-ihs removeRole <role name>`

Removes command privileges from users with the specified role. Keep in mind that if a user has another role that has been added, or if they have been given permission individually, *they will still be able to use commands*.
<br/>
<br/>

`-ihs addUser <username#0000>`

This allows the specified individual user to use the bot's commands. The server owner will always be able to use all bot commands, even if they have not been added to this list individually. Users that have been given command permission can still be muted by the bot, as long the bot has a higher role than them.

Do **not** put quotes around the username, and be sure to include the user's tag number.
<br/>
<br/>

`-ihs removeUser <username#0000>`

Removes command privileges from the specified user. Keep in mind that if the user still has any roles that have been given permission to use commands, *they will still be able to use the bots commands*.
<br/>
<br/>

`-ihs kickme`

Removes the bot from your server - use this in case you can't remove the bot through the Discord app. ***Only the server owner can use this command, even if other users have been given command permission.***