const { Client, Events, GatewayIntentBits, Collection, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const { token, apitoken } = require("./config.json");
const fs = require('node:fs');
const path = require('node:path');
const request = require("request");
client.commands = new Collection();
client.buttons=new Map();
client.questions=new Collection();
client.question=0;
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
	console.log(client.user.username + " is on!");
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

client.on("messageCreate", async (message) => {
	if (message.author.bot) return;
	if (Math.random() < 0) return;
	if (Math.random() < 0) {
		const m = message.content.replace(/[^a-zA-Z\s]/g, "").split(" ");
		var word = m[Math.floor(Math.random() * m.length)];
		const options = {
			method: 'GET',
			url: `https://wordsapiv1.p.rapidapi.com/words/${word}/synonyms`,
			headers: {
				'X-RapidAPI-Key': apitoken,
				'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
			}
		};
		request(options, function (error, response, body) {
			if (error) { return; }

			var syn = JSON.parse(body);
			//console.log(syn);
			//console.log(response.statusCode);
			if (response.statusCode != 200) { return; }
			if (syn.synonyms===undefined) return;
			if (syn.synonyms[0] === undefined) return;
			try {
				//console.log("nice");
				var embed = new EmbedBuilder();
				embed.setTitle("New Word");
				embed.setDescription(`Hey! Did you know a synonymn for \`${syn.word}\` is \`${(syn.synonyms)[0]}\`? <insert add to list or something btn>`);
				message.reply({ embeds: [embed] });
			}
			catch (e) {
				console.error(e);
			}
		});
	} else {
		const embed=new EmbedBuilder();
		embed.setTitle("POP QUIZ!");
		const a=new ButtonBuilder()
			.setCustomId(`Quiz_${client.question}_A`)
			.setLabel("A")
			.setStyle(ButtonStyle.Primary);
		const b=new ButtonBuilder()
			.setCustomId(`Quiz_${client.question}_B`)
			.setLabel("B")
			.setStyle(ButtonStyle.Primary);
		const c=new ButtonBuilder()
			.setCustomId(`Quiz_${client.question}_C`)
			.setLabel("C")
			.setStyle(ButtonStyle.Primary);
		const d=new ButtonBuilder()
			.setCustomId(`Quiz_${client.question}_D`)
			.setLabel("D")
			.setStyle(ButtonStyle.Primary);
		const row = new ActionRowBuilder()
			.addComponents(a,b,c,d);
		client.buttons.set(`Quiz_${client.question}_A`,a);
		client.buttons.set(`Quiz_${client.question}_B`,b);
		client.buttons.set(`Quiz_${client.question}_C`,c);
		client.buttons.set(`Quiz_${client.question}_D`,d);
		client.questions.set(""+client.question,"B");
		client.question++;
		message.channel.send({embeds:[embed],components:[row]});
	}

});
client.on('interactionCreate', async (interaction)=>{
	if(interaction.isButton()) {
        const btnInfo = interaction.customId.split("_");

        try {
			if(btnInfo[0]=="Quiz") {
				const correct=client.questions.get(btnInfo[1]);
				//console.log(correct);
				if(btnInfo[2]==correct) {
					/*award points*/
					interaction.reply("Correct!");
				} else {
					interaction.reply("wrong");
				}
				//delete buttons
				//console.log(client.buttons);
				//console.log(client.buttons.get(`Quiz_${btnInfo[1]}_A`));
				//client.buttons.get(`Quiz_${btnInfo[1]}_A`).setDisabled(true);
				client.buttons.delete(`Quiz_${btnInfo[1]}_A`);
				//client.buttons.get(`Quiz_${btnInfo[1]}_B`).setDisabled(true);
				client.buttons.delete(`Quiz_${btnInfo[1]}_B`);
				//client.buttons.get(`Quiz_${btnInfo[1]}_C`).setDisabled(true);
				client.buttons.delete(`Quiz_${btnInfo[1]}_C`);
				//client.buttons.get(`Quiz_${btnInfo[1]}_D`).setDisabled(true);
				client.buttons.delete(`Quiz_${btnInfo[1]}_D`);
				//console.log(interaction.message);
				interaction.message.edit({embeds:interaction.message.embeds,content:`Answered! Correct answer is: ${client.questions.get(btnInfo[1])}`,components:[]});
				client.questions.delete(""+btnInfo[1]);
			}
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing the button script !', ephemeral: true});
        }
    }
});