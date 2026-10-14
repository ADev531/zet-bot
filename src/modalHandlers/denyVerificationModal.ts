import { ModalSubmitInteraction, CacheType, MessageFlags, ContainerComponentData, ActionRowData, ButtonBuilder, ButtonStyle, ActionRowBuilder, Client } from "discord.js";
import { requestChannel, redisClient } from "@/global.js";

const mentionRegex = /<@([0-9]*)>/;

export default async function denyVerificationModal(interaction: ModalSubmitInteraction<CacheType>, client: Client) {
    const messageId = interaction.fields.getTextInputValue("messageId");
    let reason = interaction.fields.getTextInputValue("reason");

    const message = await requestChannel.messages.fetch(messageId);
    const regexResult = mentionRegex.exec(message.content);

    if (!regexResult || !regexResult[1]) {
        await message.edit("알 수 없는 오류가 발생해, 인증 절차를 다시 실시해야 해요.\n(원본 메시지: " + message.content + ")");
        return;
    }

    const user = await client.users.fetch(regexResult[1]);

    await message.edit({
        "content": "<@" + user.id + ">님 인증 거부 처리 (" + new Intl.DateTimeFormat().format(Date.now()) + ")\n사유: " + reason,
        "components": []
    });

    let dm = user.dmChannel;

    if (!dm) {
        dm = await user.createDM(true);
    }

    dm.send("계정 인증이 거부되었어요. DM에서 `/인증` 커맨드를 실행해 인증 절차를 재실시해주세요.\n사유: " + reason);
    await interaction.reply("계정 인증 요청을 거부하였습니다.");
};