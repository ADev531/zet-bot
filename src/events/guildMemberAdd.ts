import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, FileUploadBuilder, GuildMember, LabelBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { redisClient } from "@/global.js";

export default async function guildMemberAdd(member: GuildMember) {
    const dm = await member.createDM(true);

    const container = new ContainerBuilder()
        .setAccentColor(0x0099ff)
        .addTextDisplayComponents(function(text) {
            return text.setContent("# 제타 비공식 커뮤니티에 오신 걸 환영합니다!");
        })
        .addMediaGalleryComponents(function(mediaGallery) {
            return mediaGallery.addItems(function(galleryItem) {
                return galleryItem.setURL("https://cdn.discordapp.com/attachments/1536607552282955886/1552557629757325324/Zeta_Creator_Community.png?ex=6acc74f8&is=6acb2378&hm=3e1a57478272a66a763491de2f09aa2f0702847b2def8c1924531bab4cc132e6&")
            });
        })
        .addTextDisplayComponents(function(text) {
            return text.setContent("제타 비공식 커뮤니티에 오신 걸 진심으로 환영합니다! 먼저, 아래 명시된 대로 **계정 인증 절차**를 거쳐 주세요.\n**제타 계정**이 있으시다면 **인증하기** 버튼을, 없으시다면 **제타 계정이 없어요!** 버튼을 눌러주세요.\n\n**(3분 안에 선택하지 않으실 경우, 미인증 상태로 남게 돼요.)**");
        })
        .addSeparatorComponents(function(seperator) {
            return seperator;
        })
        .addActionRowComponents(function(rowBuilder) {
            const verifyBtn = new ButtonBuilder()
                .setCustomId("verify")
                .setLabel("인증하기")
                .setStyle(ButtonStyle.Primary);

            const noZetaBtn = new ButtonBuilder()
                .setCustomId("noZeta")
                .setLabel("제타 계정이 없어요!")
                .setStyle(ButtonStyle.Danger);

            return rowBuilder.addComponents(verifyBtn, noZetaBtn);
        });

    const msg = await dm.send({
        "components": [ container ],
        "flags": MessageFlags.IsComponentsV2
    });

    try {
        const result = await msg.awaitMessageComponent({ time: 180_000 });

        if (result.customId === "verify") {
            const msgIdInput = new TextInputBuilder()
                .setCustomId("messageId")
                .setStyle(TextInputStyle.Short)
                .setValue(msg.id)
                .setRequired(true);
            const idInputLabel = new LabelBuilder()
                .setLabel("메시지 ID")
                .setDescription("인증 요청에 필요한 정보에요. 수정하시면 제대로 작동하지 않아요!")
                .setTextInputComponent(msgIdInput);

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
                .setCustomId("verifyModal")
                .setTitle("인증하기")
                .addLabelComponents(idInputLabel, uploadLabel);
            
            await result.showModal(verifyModal);
        }
        else {
            await redisClient.set("zetaHandle:" + member.id, "no_zeta");

            const buttons = (container.components.at(-1) as ActionRowBuilder).components;
            for (let i = 0; i < buttons.length; i++) {
                (buttons[i] as ButtonBuilder).setDisabled(true);
            }

            await msg.edit({
                "components": [ container ],
                "flags": MessageFlags.IsComponentsV2
            });

            await result.reply("감사합니다! 이후 제타 계정이 생기신다면 DM에서 `/인증` 커맨드를 실행해 주세요.");
        }
    } catch {
        const buttons = (container.components.at(-1) as ActionRowBuilder).components;
        for (let i = 0; i < buttons.length; i++) {
            (buttons[i] as ButtonBuilder).setDisabled(true);
        }

        container.addTextDisplayComponents(function(text) {
            return text.setContent("-# 인증이 3분 이내에 진행되지 않아 취소되었어요! 인증 절차를 다시 밟으시려면 DM에서 `/인증` 커맨드를 실행해주시고, 제타 계정이 없으시다면 <#1536344624640299049> 채널에서 말씀해주세요.");
        });

        await msg.edit({
            "components": [ container ],
            "flags": MessageFlags.IsComponentsV2
        });
    }
};