import { ModalSubmitInteraction, CacheType, MessageFlags, ContainerComponentData, ActionRowData, ButtonBuilder, ButtonStyle, ActionRowBuilder, Client } from "discord.js";
import { requestChannel, redisClient } from "@/global.js";

const mentionRegex = /<@([0-9]*)>/;

export default async function completeVerificationModal(interaction: ModalSubmitInteraction<CacheType>, client: Client) {
    const messageId = interaction.fields.getTextInputValue("messageId");
    let zetaHandle = interaction.fields.getTextInputValue("zetaHandle");

    const message = await requestChannel.messages.fetch(messageId);
    const regexResult = mentionRegex.exec(message.content);

    if (!regexResult || !regexResult[1]) {
        await message.edit("알 수 없는 오류가 발생해, 인증 절차를 다시 실시해야 해요.\n(원본 메시지: " + message.content + ")");
        return;
    }

    if (!zetaHandle.startsWith("@")) {
        zetaHandle = "@" + zetaHandle;
    }

    const user = await client.users.fetch(regexResult[1]);

    await redisClient.set("zetaHandle:" + user.id, zetaHandle);
    await message.edit({
        "content": "<@" + user.id + ">님 인증 완료 처리 (" + new Intl.DateTimeFormat().format(Date.now()) + ")\n등록된 제타 핸들: " + zetaHandle,
        "components": []
    });

    let dm = user.dmChannel;

    if (!dm) {
        dm = await user.createDM(true);
    }

    await dm.send("계정 인증이 완료되었어요!\n\n**중요 사항**: **혹여라도 제타 핸들을 변경하실 경우, DM에서 `/인증` 명령어를 실행해 재인증을 실시해주셔야 해요.**");
    await interaction.reply({
        "content": "계정 인증을 완료하였습니다.",
        "flags": MessageFlags.Ephemeral
    });
}