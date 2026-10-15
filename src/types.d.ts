type Command = {
    "define": SlashCommandBuilder,
    "callback": (interaction: ChatInputCommandInteraction<CacheType>) => void
};