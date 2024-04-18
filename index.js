const { Client, Events, GatewayIntentBits, Collection, EmbedBuilder } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] });
const {token,apitoken}= require("./config.json");
const fs = require('node:fs');
const path = require('node:path');
const request=require("request");
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

require("./load_commands.js");
//const dontdie = require("./dontdie.js");
//fs storage stuff setup
client.login(token);
client.on('ready', () => {
  console.log(client.user.username+" is on!");
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
 // console.log(interaction.client);
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on("messageCreate", (message) => {
	if(message.author.bot) return;
	if(Math.random()<0.9) return;
	const m=message.content.replace("/[^a-zA-Z]/g","").split(" ");
	var word=m[Math.floor(Math.random()*m.length)];
	const options = {
		method: 'GET',
		url: `https://wordsapiv1.p.rapidapi.com/words/${word}/synonyms`,
		headers: {
		  'X-RapidAPI-Key': apitoken,
		  'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
		}
	  };
	  request(options, function (error, response, body) {
		if (error) {return;}
		
		  var syn=JSON.parse(body);
		  if(response.statusCode!=200) {return;}
			try {
			var embed=new EmbedBuilder();
			embed.setTitle("New Word");
			embed.setDescription(`Hey! Did you know a synonymn for \`${syn.word}\` is \`${(syn.synonyms)[0]}\`? <insert add to list or something btn>`);
		  message.reply({embeds: [embed]});}
		  catch(e) {
			console.error(e);
		  }
	});
	
});
