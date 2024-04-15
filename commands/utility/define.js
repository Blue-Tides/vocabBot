const request=require("request");
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {apitoken}=require("../../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('define')
		.setDescription('Defines a word')
		.addStringOption(option =>
			option.setName('word')
				.setDescription('word to be defined')
                .setRequired(true))
	,
	async execute(interaction) {
		await interaction.deferReply();
		var definition=null;
		function send() {
			if(ready==-1) {
			ready=-2;
			interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			return;
		};
			if (ready != 1&&ready!=-3) return;
            var embed=new EmbedBuilder();
			if(ready==1){
			embed.setTitle(definition.word);
            var d="";
            definition.definitions.forEach((val,i)=>{
                d+=`${i+1}. ${val.partOfSpeech}\n\t${val.definition}\n`
            })
			if(d=="") d="No definitions provided :skull:"
			interaction.editReply({
				embeds: [embed.setDescription(d)]
			});
		} else {
			embed.setDescription(`cannot find word \`${interaction.options.getString("word")}\``);
			interaction.editReply({embeds: [embed.setDescription(`cannot find word \`${interaction.options.getString("word")}\``)]});
		}

		}
		var ready=0;
        const options = {
            method: 'GET',
            url: `https://wordsapiv1.p.rapidapi.com/words/${interaction.options.getString("word")}/definitions`,
            headers: {
              'X-RapidAPI-Key': apitoken,
              'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
            }
          };
          
          request(options, function (error, response, body) {
              if (error) {ready=-1;send();return;}
			
                definition=JSON.parse(body);
				//console.log(definition);
				//console.log(response.statusCode);
				if(response.statusCode==404) {ready=-3;send(); return;}
				if(response.statusCode!=200) {ready=-1;send();return;}
				ready++;
                send();
          });
		
		
	},
};