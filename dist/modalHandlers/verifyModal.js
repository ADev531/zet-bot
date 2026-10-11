import { MessageFlags, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { requestChannel } from "../global.js";
export default async function verifyModal(interaction, viaCommand) {
    const uploadedFiles = interaction.fields.getUploadedFiles("screenshot");
    if (!uploadedFiles) {
        return;
    }
    const screenshot = uploadedFiles.first();
    if (!screenshot) {
        return;
    }
    if (!screenshot.contentType || !screenshot.contentType.startsWith("image/")) {
        interaction.reply("제출하신 파일의 형식이 이미지가 아닌 것 같아요. 다시 한 번 시도해 주실래요?");
        return;
    }
    if (!viaCommand) {
        const messageId = interaction.fields.getTextInputValue("messageId");
        try {
            const dm = interaction.user.dmChannel;
            if (!dm) {
                await interaction.reply("DM 채널이 인식되지 않아요. 다시 한 번 시도해 주실래요?");
                return;
            }
            const msg = await dm.messages.fetch(messageId);
            const container = msg.components[0];
            const row = container.components.at(-1);
            if (!row) {
                await msg.edit("알 수 없는 오류가 발생했어요. DM에서 `/인증` 커맨드를 실행해 인증 과정을 재실시해 주세요.");
                return;
            }
            for (let i = 0; i < row.components.length; i++) {
                row.components[i].data.disabled = true;
            }
            await msg.edit({
                "components": [container],
                "flags": MessageFlags.IsComponentsV2
            });
        }
        catch {
            interaction.reply("메시지 ID란이 수정된 것 같아요. 다시 한 번 시도해 주실래요?");
            return;
        }
    }
    const completeVerificationBtn = new ButtonBuilder()
        .setCustomId("completeVerification")
        .setLabel("인증 완료하기")
        .setStyle(ButtonStyle.Primary);
    const denyVerificationBtn = new ButtonBuilder()
        .setCustomId("denyVerification")
        .setLabel("인증 거부하기")
        .setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder()
        .setComponents(completeVerificationBtn, denyVerificationBtn);
    await requestChannel.send({
        "content": "<@" + interaction.user.id + ">님께서 인증을 요청하셨어요!",
        "components": [
            row.toJSON()
        ],
        "files": [
            {
                "attachment": screenshot.url,
                "name": screenshot.name
            }
        ]
    });
    interaction.reply("제출해주셔서 감사합니다. 서버 관리진이 확인할 때까지 잠시만 기다려 주세요! :)");
}
