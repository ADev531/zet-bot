import { ChatInputCommandInteraction, CacheType, MessageFlags, ContainerComponentData, ActionRowData } from "discord.js";
import { requestChannel } from "@/global.js";

export default async function verificationDone(interaction: ChatInputCommandInteraction<CacheType>) {
    const member = await interaction.options.getMember("유저");
    const handle = await interaction.options.getString("핸들");
}