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
			//console.log(ready);
			if(ready==-1) {
			ready=-2;
			interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true })
			
		};
			if (ready != 1) return;
			//console.log("trying to send??");
			//interaction.editReply("Messages got!");
            var embed=new EmbedBuilder();
			embed.setTitle(definition.word);
            var d="";
            definition.definitions.forEach((val,i)=>{
                d+=`${i+1}. ${val.partOfSpeech}\n\t${val.definition}\n`
            })
			interaction.editReply({
				embeds: [embed.setDescription(d)]
			});
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
              if (error||response.statusCode!=200) {ready=-1; send();}
                definition=JSON.parse(body);
				//console.log(definition);
				ready++;
                send();
          });
		
		
	},
};