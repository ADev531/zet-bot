import { createClient } from "redis";
export const redisClient = createClient({
    "url": process.env.REDIS_URL
});
export let requestChannel;
export async function prepare(client) {
    await redisClient.connect();
    if (!process.env.REQUEST_CHANNEL_ID) {
        console.log("[zet-bot] 환경 변수가 제대로 설정되었는지 확인하여 주십시오.");
        process.exit(1);
    }
    requestChannel = await client.channels.fetch(process.env.REQUEST_CHANNEL_ID);
}
