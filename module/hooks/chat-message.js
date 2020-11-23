/**
 * Primary use of this hook is to intercept chat commands.
 * /char  - Begin character generation
 * /table - Roll on a table
 * /cond  - Lookup a condition
 * /name  - Generate a name
 * /avail - Start an item availability test
 * /pay - Player: Remove money from character. GM: Start a payment request
 * /credit - Player: Not allowed. GM: Start a credit request to send money to players
 * /help - display a help message on all the commands above
 */

import {CharacterGeneration} from "../system/chargen.js";

Hooks.on("chatMessage", (html, content, msg) => {
    let regExp;
    regExp = /(\S+)/g;
    let commands = content.match(regExp);
    let command = (commands.length>0 && commands[0].split("/").length > 0) ? commands[0].split("/")[1].trim() : null;
    let arg1 = (commands.length > 1) ? commands[1].trim() : null;
    const actor = game.cof.macros.getSpeakersActor();

    const validCommands = ["for", "str", "dex", "con", "int", "sag", "wis", "cha", "atc", "melee", "atd", "ranged", "atm", "magic"];

    if(command && validCommands.includes(command)) {
        game.cof.macros.rollStatMacro(actor, command, null);
        return false;
    }
    else if(command && command === "skill") {
        if(arg1 && validCommands.includes(arg1)) {
            game.cof.macros.rollStatMacro(actor, arg1, null);
        } else {
            ui.notifications.error("Vous devez préciser la caractéristique à tester, par exemple \"/skill str\".");
        }
        return false;
    }
    else if(command && command === "stats") {
        CharacterGeneration.statsCommand();
        return false;
    }
});