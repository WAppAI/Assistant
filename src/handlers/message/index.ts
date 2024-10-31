import { proto, WAMessage } from "@whiskeysockets/baileys";
import { sock } from "../../clients/whatsapp.ts";
import {
  BOT_PREFIX,
  DEFAULT_MODEL,
  ENABLE_REMINDERS,
  ENABLE_SOURCES,
  ENABLE_SUGGESTIONS,
} from "../../constants";
import { getLLMModel, updateWaMessageId } from "../../crud/conversation";
import { createContextFromMessage } from "../context";
import {
  getCompletionWithBing,
  getSources,
  getSuggestions,
} from "../llm-models/completion-bing.ts";
import { getCompletionWithOpenRouter } from "../llm-models/completion-open-router.ts";
import { react } from "../reactions.ts";
import { handleReminderFor } from "../reminder/reminder.ts";

export async function handleMessage(message: WAMessage) {
  await react(message, "working");

  const chatId = message.key.remoteJid;
  if (!chatId) {
    return console.error("Invalid chat ID");
  }

  const isGroup = chatId.endsWith("@g.us");
  const streamingReply = await sock.sendMessage(
    chatId,
    { text: "..." },
    { quoted: message }
  );
  let llmModel = await getLLMModel(chatId);

  if (!streamingReply) return console.error("No streaming reply");

  if (!llmModel) {
    llmModel = DEFAULT_MODEL;
  }

  let response: string | null;

  try {
    const context = await createContextFromMessage(message);

    if (llmModel === "bing") {
      const completion = await getCompletionWithBing(
        message,
        context,
        streamingReply as proto.IWebMessageInfo
      );
      // @ts-ignore
      response = (completion as BingAIClientResponse).response;

      if (ENABLE_REMINDERS === "true") {
        // @ts-ignore
        response = await handleReminderFor(message, completion.response);
      }

      if (ENABLE_SUGGESTIONS === "true") {
        // @ts-ignore
        response = response + "\n\n" + getSuggestions(completion);
      }
      if (ENABLE_SOURCES === "true") {
        // @ts-ignore
        response = response + "\n\n" + getSources(completion);
      }
    } else {
      response = await getCompletionWithOpenRouter(
        message,
        context,
        streamingReply as proto.IWebMessageInfo
      );
    }

    if (!response)
      return `No response from LL model: ${llmModel}. Please try again.`;

    await sock.sendMessage(
      chatId,
      { text: response, edit: streamingReply.key },
      { quoted: message }
    );

    await react(message, "done");
  } catch (error) {
    console.error(error);

    const errorReply = await sock.sendMessage(chatId, {
      text: BOT_PREFIX + (error as Error).message,
    });

    await react(message, "error");
  }

  if (isGroup && llmModel === "bing" && streamingReply?.key?.id) {
    await updateWaMessageId(chatId, streamingReply.key.id);
  }
}
