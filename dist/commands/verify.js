import { FileUploadBuilder, LabelBuilder, ModalBuilder } from "discord.js";
export default async function verifyCommand(interaction) {
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
