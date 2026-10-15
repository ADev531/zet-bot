import { Client, Events, GatewayIntentBits, Routes, LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActivityType, SlashCommandBuilder } from "discord.js";
import { prepare } from "@/global.js";
import { guildCommands, dmCommands } from "@/commands/index.js"; 
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

client.once(Events.ClientReady, async(readyClient) => {
	console.log(`[zet-bot] ${readyClient.user.tag}으로 로그인되었습니다!`);

    await prepare(readyClient);

    if (!process.env.APPLICATION_ID || !process.env.GUILD_ID) {
        console.log("[zet-bot] APPLICATION_ID 및 GUILD_ID 환경 변수가 제대로 설정되었는지 확인하여 주십시오.");
        return;
    }

    try {
        const guildCommandDefines = Object.values(guildCommands).map(function(command) { return command.define; });
        const dmCommandDefines = Object.values(dmCommands).map(function(command) { return command.define; });

        rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.GUILD_ID), {
            "body": guildCommandDefines
        });

        rest.put(Routes.applicationCommands(process.env.APPLICATION_ID), {
            "body": dmCommandDefines
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
        if (guildCommands[interaction.commandName]) {
            guildCommands[interaction.commandName].callback(interaction);
        }
        else if (dmCommands[interaction.commandName]) {
            if (interaction.inGuild()) {
                await interaction.reply("해당 명령어는 DM에서 실행하셔야 합니다.");
                return;
            }

            dmCommands[interaction.commandName].callback(interaction);
        }
    }
});

client.login(process.env.TOKEN);