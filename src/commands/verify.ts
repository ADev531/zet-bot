import { ChatInputCommandInteraction, CacheType, MessageFlags, ContainerComponentData, ActionRowData, FileUploadBuilder, LabelBuilder, ModalBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } from "discord.js";
import { guild, redisClient, requestChannel } from "@/global.js";

export default async function verifyCommand(interaction: ChatInputCommandInteraction<CacheType>) {
    if (interaction.inGuild()) {
        await interaction.reply("해당 명령어는 DM에서 실행해주셔야 합니다.");
        return;
    }

    if (!guild.members.cache.get(interaction.user.id)) {
        await interaction.reply({
            "content": "해당 명령어는 제타 비공식 커뮤니티 서버에 가입되어 있으셔야 사용하실 수 있어요.",
            "flags": MessageFlags.Ephemeral
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