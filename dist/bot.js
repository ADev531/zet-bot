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
import { Client, Events, GatewayIntentBits, SlashCommandBuilder, Routes, LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActivityType } from "discord.js";
import { prepare } from "./global.js";
import zeta from "./commands/zeta.js";
import verify from "./commands/verify.js";
import verificationDone from "./commands/verificationDone.js";
import verifyModal from "./modalHandlers/verifyModal.js";
import completeVerificationModal from "./modalHandlers/completeVerificationModal.js";
import guildMemberAdd from "./events/guildMemberAdd.js";
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
    .setDescription("인증 절차를 재실시합니다.");
const verificationDoneCommand = new SlashCommandBuilder()
    .setName("인증완료")
    .setDescription("인증을 완료합니다. 행정팀 이상만 사용 가능합니다.")
    .addUserOption(function (option) {
    return option.setName("유저")
        .setDescription("인증을 완료시킬 유저")
        .setRequired(true);
})
    .addStringOption(function (option) {
    return option.setName("핸들")
        .setDescription("해당 유저의 핸들")
        .setRequired(true);
});
const zetaCommand = new SlashCommandBuilder()
    .setName("제타")
    .setDescription("유저의 제타 핸들을 확인합니다.")
    .addUserOption(function (option) {
    return option.setName("유저")
        .setDescription("확인할 유저")
        .setRequired(true);
});
client.once(Events.ClientReady, async (readyClient) => {
    console.log(`[zet-bot] ${readyClient.user.tag}으로 로그인되었습니다!`);
    await prepare(readyClient);
    try {
        rest.put(Routes.applicationCommands("1553744240951955456"), {
            "body": [
                verifyCommand.toJSON()
            ]
        });
        rest.put(Routes.applicationGuildCommands("1553744240951955456", "1535915746952089691"), {
            "body": [
                verificationDoneCommand.toJSON(),
                zetaCommand.toJSON()
            ]
        });
        console.log("[zet-bot] 명령어가 등록되었습니다.");
    }
    catch (e) {
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
client.on(Events.InteractionCreate, async (interaction) => {
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
        }
        return;
    }
    else if (interaction.isButton()) {
        const mentionRegex = /<@([0-9]*)>/;
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
                    const regexResult = mentionRegex.exec(interaction.message.content);
                    if (!regexResult || !regexResult[1]) {
                        await interaction.message.edit("알 수 없는 오류가 발생해, 인증 절차를 다시 실시해야 해요.\n(원본 메시지: " + interaction.message.content + ")");
                        break;
                    }
                    const user = await client.users.fetch(regexResult[1]);
                    await interaction.message.edit({
                        "content": "<@" + user.id + ">님 인증 거부 처리 (" + new Intl.DateTimeFormat().format(Date.now()) + ")",
                        "components": []
                    });
                    let dm = user.dmChannel;
                    if (!dm) {
                        dm = await user.createDM(true);
                    }
                    await dm.send("인증 요청이 거부되었어요. DM에서 `/인증` 커맨드를 실행해 인증 절차를 재실시해주세요.");
                    break;
                }
        }
        return;
    }
    else if (interaction.isChatInputCommand()) {
        if (interaction.commandName === "인증") {
            verify(interaction);
        }
        else if (interaction.commandName === "인증완료") {
            verificationDone(interaction);
        }
        else if (interaction.commandName === "제타") {
            zeta(interaction);
        }
    }
});
client.login(process.env.TOKEN);
