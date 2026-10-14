import { ChatInputCommandInteraction, CacheType, MessageFlags, ContainerComponentData, ActionRowData, FileUploadBuilder, LabelBuilder, ModalBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } from "discord.js";
import { redisClient, requestChannel } from "@/global.js";

export default async function verifyCommand(interaction: ChatInputCommandInteraction<CacheType>) {
    const zetaHandle = await redisClient.get("zetaHandle:" + interaction.user.id);

    if (zetaHandle && zetaHandle !== "no_zeta") {
        const reverifyBtn = new ButtonBuilder()
            .setCustomId("reverify")
            .setLabel("다시 인증하기")
            .setStyle(ButtonStyle.Primary);
        
        const row = new ActionRowBuilder()
            .setComponents(reverifyBtn);

        await interaction.reply({
            "content": "현재 이미 인증이 완료된 상태에요. 다시 인증하실 건가요?",
            "components": [ row.toJSON() ]
        });

        return;
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
    
    await interaction.showModal(verifyModal);
}