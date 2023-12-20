import { Message } from "whatsapp-web.js";
import { setStatusFor } from "../../helpers/message";
import { createContextFromMessage } from "../context";
import {
  getCompletionWithBing,
  getSources,
  getSuggestions,
} from "../llm-models/completion-bing.ts";
import { log } from "../../helpers/utils";
import {
  BING_COOKIES,
  BOT_PREFIX,
  ENABLE_REMINDERS,
  ENABLE_SOURCES,
  ENABLE_SUGGESTIONS,
  OPENROUTER_API_KEY,
} from "../../constants";
import { handleReminderFor } from "../reminder/reminder.ts";
import { getLLMModel, updateWaMessageId } from "../../crud/conversation";
import { getCompletionWithOpenRouter } from "../llm-models/completion-open-router.ts";

export async function handleMessage(message: Message) {
  await log(message);
  await setStatusFor(message, "working");
  const chat = await message.getChat();
  const streamingReply = await message.reply("...");
  const llmModel = await getLLMModel(chat.id._serialized);
  let response: string | null;

  try {
    const context = await createContextFromMessage(message);
    let response: string | null = null;

    if (llmModel === "bing" && BING_COOKIES !== "") {
      const completion = await getCompletionWithBing(
        message,
        context,
        streamingReply
      );
      response = completion.response;

      if (ENABLE_REMINDERS === "true")
        response = await handleReminderFor(message, completion.response);

      // TODO: must have a way to select them when replying
      // TODO: maybe they can live in a new whatsapp message (sent immediately after the completion)?
      if (ENABLE_SUGGESTIONS === "true")
        response = response + "\n\n" + getSuggestions(completion);
      if (ENABLE_SOURCES === "true")
        response = response + "\n\n" + getSources(completion);
    } else if (llmModel !== "bing" && OPENROUTER_API_KEY !== "") {
      console.log("Using Open Router");
      response = await getCompletionWithOpenRouter(
        message,
        context,
        streamingReply
      );
    }
    else {
      throw new Error("No LLM model specified or no API key provided for the selected model");
    }

    if (!response) throw new Error("No response from LLM");

    // @ts-ignore
    const finalReply = await streamingReply.edit(response);

    await log(finalReply, true);
    await setStatusFor(message, "done");
  } catch (error) {
    console.error(error);

    const errorReply = await streamingReply.edit(BOT_PREFIX + error);

    await log(errorReply, true);
    await setStatusFor(message, "error");
  }

  // The waMessageId is used to track the last completion sent by the bot in the chat (finalReply)
  // Allows the user to get completions from the bot without having to mention it in groups
  // Just gotta reply to this message (finalReply) in a thread
  // streamingReply.id === finalReply.id === errorReply.id
  if (chat.isGroup)
    if (llmModel === "bing")
      await updateWaMessageId(
        chat.id._serialized,
        streamingReply.id._serialized
      );
}
