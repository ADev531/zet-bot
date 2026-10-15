import { Client, Guild, TextChannel } from "discord.js";
import { createClient } from "redis";

export const redisClient = createClient({
    "url": process.env.REDIS_URL
});

export let guild : Guild;
export let requestChannel : TextChannel;
export let botClient : Client;

export async function prepare(client : Client) {
    await redisClient.connect();

    botClient = client;

    if (!process.env.REQUEST_CHANNEL_ID || !process.env.GUILD_ID) {
        console.log("[zet-bot] 환경 변수가 제대로 설정되었는지 확인하여 주십시오.");
        process.exit(1);
    }

    guild = await client.guilds.fetch(process.env.GUILD_ID) as Guild;
    requestChannel = await client.channels.fetch(process.env.REQUEST_CHANNEL_ID) as TextChannel;

    await guild.members.fetch();
}