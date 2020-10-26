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
    let command = commands[0];

    switch(command){
        case "/stats" : {
            CharacterGeneration.statsCommand();
            return false;
        }
        default: {
            return true;
        }
    }
});