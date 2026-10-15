import zetaCommand from "./zeta.js";
import verifyCommand from "./verify.js";

export let guildCommands: Record<string, Command> = {
    "제타": zetaCommand
};

export let dmCommands: Record<string, Command> = {
    "인증": verifyCommand
};