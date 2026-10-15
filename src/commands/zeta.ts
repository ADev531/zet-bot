import { ChatInputCommandInteraction, CacheType, MessageFlags, ContainerComponentData, ActionRowData, FileUploadBuilder, LabelBuilder, ModalBuilder } from "discord.js";
import { redisClient } from "@/global.js";

export default async function zetaCommand(interaction: ChatInputCommandInteraction<CacheType>) {
    const user = interaction.options.getUser("유저");

    if (!user) {
        await interaction.reply({
            "content": "유저가 지정되지 않았습니다.",
            "flags": MessageFlags.Ephemeral
        });
        return;
    }

    const zetaHandle = await redisClient.get("zetaHandle:" + user.id);

    if (!zetaHandle) {
        await interaction.reply({
            "content": "<@" + user.id + ">님은 미인증 상태입니다.",
            "flags": MessageFlags.Ephemeral
        });
    }
    else if (zetaHandle === "no_zeta") {
        await interaction.reply({
            "content": "<@" + user.id + ">님은 제타 계정이 없습니다.",
            "flags": MessageFlags.Ephemeral
        });
    }
    else {
        await interaction.reply({
            "content": "<@" + user.id + ">님의 제타 핸들은 `" + zetaHandle + "`입니다.",
            "flags": MessageFlags.Ephemeral
        });
    }
}