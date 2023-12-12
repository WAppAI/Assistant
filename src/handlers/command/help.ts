import { oneLine, stripIndents } from "common-tags";
import { Message } from "whatsapp-web.js";
import { ASSISTANT_NAME, BOT_PREFIX, CMD_PREFIX } from "../../constants";
import { invalidArgumentMessage } from "../../helpers/command";

export async function handleHelp(message: Message, args: string) {
  let reply: Message;

  switch (args) {
    case "help":
      reply = await message.reply(helpHelpMessage);
      break;
    case "ping":
      reply = await message.reply(pingHelpMessage);
      break;
    case "reset":
      reply = await message.reply(resetHelpMessage);
      break;
    case "jailbreak":
      reply = await message.reply(jailbreakHelpMessage);
      break;
    case "reminder":
      reply = await message.reply(reminderHelpMessage);
      break;
    case "change":
      reply = await message.reply(changeHelpMessage);
      break;
    case "":
      reply = await message.reply(helpMessage);
      break;
    default:
      reply = await message.reply(
        invalidArgumentMessage(args, "help <command>")
      );
      break;
  }

  return reply;
}

const helpMessage = stripIndents`${BOT_PREFIX}Available commands:

🆘 *${CMD_PREFIX}help _<command>_*
Displays the available commands, their functionalities and how to use them.
- Run *${CMD_PREFIX}help _<command>_* for more information about a specific command.

🗑️ *${CMD_PREFIX}reset*
Clears the conversation history for _this_ chat.
- Run *${CMD_PREFIX}reset bing* to clear the Bing conversation for this chat.
- Run *${CMD_PREFIX}reset openrouter* to clear the OpenRouter conversation for this chat.
- Run *${CMD_PREFIX}reset all* to clear the Bing and OpenRouter conversations for this chat, along with all the reminders.
- Run *${CMD_PREFIX}help reset* for more information.

🔄 *${CMD_PREFIX}change*
Change the LLM model used by the bot.
- Run *${CMD_PREFIX}change* to see the current LLM model.
- Run *${CMD_PREFIX}change <model>* to change the LLM model.
- Run *${CMD_PREFIX}help change* for more information.

⏰ *${CMD_PREFIX}reminder*
Manage reminders with the following commands:
- *${CMD_PREFIX}reminder list* List all reminders.
- *${CMD_PREFIX}reminder delete <index>⠀* Delete a specific reminder.
- *${CMD_PREFIX}reminder delete all* Delete all reminders.
- Run *${CMD_PREFIX}help reminder* for more information.

🔓 *${CMD_PREFIX}jailbreak _<enable|disable|on|off>_*
Enables or disables *_${ASSISTANT_NAME}_*'s jailbreak mode.
- Run *${CMD_PREFIX}help jailbreak* for more information.

🏓 *${CMD_PREFIX}ping*
Checks if the bot is alive by responding with '*_pong!_*'.
`;

const helpHelpMessage = stripIndents`I see what you did there.

That's pretty meta, but I'm not gonna help you with that.

Smart ass.
`;

const pingHelpMessage = stripIndents`🏓 *${CMD_PREFIX}ping*
Checks if the bot is alive by responding with '*_pong!_*'.`;

const resetHelpMessage = stripIndents`🗑️ *${CMD_PREFIX}reset*
Clears the conversation history for _this_ chat.

- *${CMD_PREFIX}reset bing* will reset the conversation history of Bing, essentially leaving it like a new conversation.

- *${CMD_PREFIX}reset openrouter* will reset the conversation history of OpenRouter, essentially leaving it like a new conversation.

- *${CMD_PREFIX}reset all* will reset the conversation history of OpenRouter and Bing, essentially leaving them like new conversations. Additionally, this will erase all reminders in _this_ conversation.
 `;

const jailbreakHelpMessage = stripIndents`🔓 *${CMD_PREFIX}jailbreak _<enable|disable|on|off>_*
Toggles *_${ASSISTANT_NAME}_*'s jailbreak mode on or off.

- If the argument *_<on>_* or *_<enable>_* is provided, it *enables* jailbreak mode for _this_ chat.

- If the argument *_<off>_* or *_<disable>_* is provided, it *disables* jailbreak mode for _this_ chat.

- If no argument is given, it returns the current jailbreak status.

- *NOTE*: enabling or disabling jailbreak mid-conversation will also reset it.

- *NOTE*: In group chats, only *admins* can use this command.

- *NOTE*: This action is *irreversible!*`;

const reminderHelpMessage = stripIndents`⏰ *${CMD_PREFIX}reminder*
Manage reminders with the following commands:

- *${CMD_PREFIX}reminder list* Lists all your active reminders. It provides you with a detailed view of your scheduled reminders, including their content and order.

- *${CMD_PREFIX}reminder delete <index>* Allows you to delete a specific reminder by providing its index in the list. You can find the index next to each reminder when you list them. For example, *${CMD_PREFIX}reminder delete 2* would delete the second reminder in your list.

- *${CMD_PREFIX}reminder delete all* Removes all of your active reminders. Use this command if you want to clear your entire reminders list.`;

const changeHelpMessage = stripIndents`🔄 *${CMD_PREFIX}change*
Change the LLM model used by the bot.

- *${CMD_PREFIX}change* will show you the current LLM model being used, along with a list of available models.

- *${CMD_PREFIX}change <model>* will change the LLM model used by the bot. The model that you change to will be used *only* for your conversations.

- An example of changing the LLM model would be *${CMD_PREFIX}change mistralai/mixtral-8x7b-instruct*

- See the list of available models at OpenRouter docs in https://openrouter.ai/docs#models.
`;
