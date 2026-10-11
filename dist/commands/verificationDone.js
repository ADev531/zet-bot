export default async function verificationDone(interaction) {
    const member = await interaction.options.getMember("유저");
    const handle = await interaction.options.getString("핸들");
}
