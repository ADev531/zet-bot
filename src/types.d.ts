type Command = {
    "define": SlashCommandBuilder,
    "callback": (interaction: ChatInputCommandInteraction<CacheType>) => void
};

type ModalHandler = (interaction: ModalSubmitInteraction<CacheType>) => void;