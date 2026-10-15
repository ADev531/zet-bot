import { ChatInputCommandInteraction, CacheType, MessageFlags, ContainerComponentData, ActionRowData, FileUploadBuilder, LabelBuilder, ModalBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } from "discord.js";
import { guild, redisClient, requestChannel } from "@/global.js";

export default async function verifyCommand(interaction: ChatInputCommandInteraction<CacheType>) {
    if (interaction.inGuild()) {
        await interaction.reply("해당 명령어는 DM에서 실행해주셔야 합니다.");
        return;
    }

    if (!(await guild.members.fetch()).get(interaction.user.id)) {
        await interaction.reply("해당 명령어는 제타 비공식 커뮤니티 서버에 들어가 있는 상태로만 사용하실 수 있어요.");
        return;
    }

    const zetaHandle = await redisClient.get("zetaHandle:" + interaction.user.id);

    if (zetaHandle && zetaHandle !== "no_zeta") {
        const reverifyBtn = new ButtonBuilder()
            .setCustomId("reverify")
            .setLabel("다시 인증하기")
            .setStyle(ButtonStyle.Primary);
        
        const cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("취소")
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .setComponents(reverifyBtn, cancel);

        const msg = await interaction.reply({
            "content": "현재 이미 인증이 완료된 상태에요. 재인증하실 건가요?\n-# (3분 이내로 선택하지 않으실 경우, 자동으로 취소돼요.)",
            "components": [ row.toJSON() ]
        });

        try {
            const result = await msg.awaitMessageComponent({ time: 180_000 });

            if (result.customId === "cancel") {
                await msg.edit({
                    "content": "재인증이 취소되었어요! 만약 재인증하고 싶으시다면 DM에서 `/인증` 커맨드를 다시 실행해주세요.",
                    "components": []
                });
                return;
            }
        }
        catch {
            await msg.edit({
                "content": "선택이 3분 이내에 이루어지지지 않아 취소되었어요! 만약 재인증하고 싶으시다면 DM에서 `/인증` 커맨드를 다시 실행해주세요.",
                "components": []
            });
            return;
        }
    }

    const fileUpload = new FileUploadBuilder()
        .setCustomId("screenshot")
        .setMinValues(1)
        .setMaxValues(1)
        .setRequired(true);
    const uploadLabel = new LabelBuilder()
        .setLabel("인증용 이미지 업로드")
        .setDescription("제타 마이페이지에서 닉네임과 핸들명이 포함된 스크린샷을 찍어 올려주세요.")
        .setFileUploadComponent(fileUpload);

    const verifyModal = new ModalBuilder()
        .setCustomId("verifyCommandModal")
        .setTitle("인증하기")
        .addLabelComponents(uploadLabel);
    
    await interaction.showModal(verifyModal, { "withResponse": !interaction.replied });
}