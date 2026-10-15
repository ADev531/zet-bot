/*
    -----------
      zet-bot
    -----------

    The MIT License (MIT)

    Copyright (c) 2026 adev531

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { Client, Events, GatewayIntentBits, SlashCommandBuilder, Routes, ButtonBuilder, ButtonStyle, MessageFlags, ActionRowBuilder, ContainerBuilder, FileUploadBuilder, LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Interaction, ActivityType, GuildMember, User } from "discord.js";
import { prepare, redisClient } from "@/global.js";
import zeta from "@/commands/zeta.js";
import verify from "@/commands/verify.js";
import verifyModal from "@/modalHandlers/verifyModal.js";
import completeVerificationModal from "@/modalHandlers/completeVerificationModal.js";
import guildMemberAdd from "@/events/guildMemberAdd.js";
import denyVerificationModal from "@/modalHandlers/denyVerificationModal.js";

if (!process.env.TOKEN) {
    console.log("[zet-bot] TOKEN 환경 변수가 없습니다.");
    process.exit(1);
}

const client = new Client({
    "intents": [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const rest = client.rest;

const verifyCommand = new SlashCommandBuilder()
    .setName("인증")
    .setDescription("인증 혹은 재인증 절차를 실시합니다. (DM 전용)");

const zetaCommand = new SlashCommandBuilder()
    .setName("제타")
    .setDescription("유저의 제타 핸들을 확인합니다.")
    .addUserOption(function(option) {
        return option.setName("유저")
            .setDescription("확인할 유저")
            .setRequired(true);
    });

client.once(Events.ClientReady, async(readyClient) => {
	console.log(`[zet-bot] ${readyClient.user.tag}으로 로그인되었습니다!`);

    await prepare(readyClient);

    if (!process.env.APPLICATION_ID || !process.env.GUILD_ID) {
        console.log("[zet-bot] APPLICATION_ID 및 GUILD_ID 환경 변수가 제대로 설정되었는지 확인하여 주십시오.");
        return;
    }

    try {
        rest.put(Routes.applicationCommands(process.env.APPLICATION_ID), {
            "body": [
                verifyCommand.toJSON()
            ]
        });
        rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.GUILD_ID), {
            "body": [
                zetaCommand.toJSON()
            ]
        });
        
        console.log("[zet-bot] 명령어가 등록되었습니다.");
    } catch (e) {
        console.log("[zet-bot] 오류가 발생했습니다. 문의하여 주십시오.");
        console.log(e);

        process.exit(1);
    }

    readyClient.user.setPresence({
        "activities": [
            {
                "name": "제타 피드 스크롤 중",
                "type": ActivityType.Playing,
                "state": "시뮬레이터가 어디 있지..."
            }
        ],
        "status": "online"
    });
});

client.on(Events.GuildMemberAdd, guildMemberAdd);

client.on(Events.InteractionCreate, async(interaction) => {
    if (interaction.isModalSubmit()) {
        switch (interaction.customId) {
            case "verifyModal":
                verifyModal(interaction, false);
                break;
            case "verifyCommandModal":
                verifyModal(interaction, true);
                break;
            case "completeVerificationModal":
                completeVerificationModal(interaction, client);
                break;
            case "denyVerificationModal":
                denyVerificationModal(interaction, client);
                break;
        }

        return;
    }
    else if (interaction.isButton()) {
        switch (interaction.customId) {
            case "completeVerification":
            {
                const msgIdInput = new TextInputBuilder()
                    .setCustomId("messageId")
                    .setStyle(TextInputStyle.Short)
                    .setValue(interaction.message.id)
                    .setRequired(true);
                const idInputLabel = new LabelBuilder()
                    .setLabel("메시지 ID")
                    .setDescription("인증 완료에 필요한 정보에요. 수정하시면 제대로 작동하지 않아요!")
                    .setTextInputComponent(msgIdInput);

                const handleInput = new TextInputBuilder()
                    .setCustomId("zetaHandle")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("@핸들")
                    .setRequired(true);
                const handleInputLabel = new LabelBuilder()
                    .setLabel("제타 핸들")
                    .setDescription("해당 유저의 제타 핸들을 입력해 주세요.")
                    .setTextInputComponent(handleInput);

                const completeVerificationModal = new ModalBuilder()
                    .setCustomId("completeVerificationModal")
                    .setTitle("인증 완료하기")
                    .addLabelComponents(idInputLabel, handleInputLabel);
                
                await interaction.showModal(completeVerificationModal);
                break;
            }
            case "denyVerification":
            {
                const msgIdInput = new TextInputBuilder()
                    .setCustomId("messageId")
                    .setStyle(TextInputStyle.Short)
                    .setValue(interaction.message.id)
                    .setRequired(true);
                const idInputLabel = new LabelBuilder()
                    .setLabel("메시지 ID")
                    .setDescription("인증 거부에 필요한 정보에요. 수정하시면 제대로 작동하지 않아요!")
                    .setTextInputComponent(msgIdInput);

                const reasonInput = new TextInputBuilder()
                    .setCustomId("reason")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);
                const reasonInputLabel = new LabelBuilder()
                    .setLabel("사유")
                    .setDescription("요청 거부의 사유를 입력해 주세요.")
                    .setTextInputComponent(reasonInput);

                const completeVerificationModal = new ModalBuilder()
                    .setCustomId("denyVerificationModal")
                    .setTitle("인증 거부하기")
                    .addLabelComponents(idInputLabel, reasonInputLabel);
                
                await interaction.showModal(completeVerificationModal);
            }
        }
        
        return;
    }
    else if (interaction.isChatInputCommand()){
        if (interaction.commandName === "인증") {
            verify(interaction);
        }
        else if (interaction.commandName === "제타") {
            zeta(interaction);
        }
    }
});

client.login(process.env.TOKEN);