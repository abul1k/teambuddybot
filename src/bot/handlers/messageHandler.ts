import TelegramBot from 'node-telegram-bot-api'
import { commandHandler } from './commandHandler.js'
import {
  handleNewProjectSteps,
  isUserCreatingProject,
} from '../commands/newproject.js'

export const messageHandler = async (
  bot: TelegramBot,
  msg: TelegramBot.Message
) => {
  const text = msg.text
  const userId = msg.from?.id

  // If it's a command (starts with /), route to commandHandler
  if (text && text.startsWith('/')) {
    return commandHandler(
      bot,
      msg,
      text.split(' ')[0],
      text.split(' ').slice(1)
    )
  }

  // If user is in /newproject flow, handle step
  if (userId && isUserCreatingProject(userId)) {
    return handleNewProjectSteps(bot, msg)
  }

  // Optionally respond if it's not a command or not part of a flow
  // bot.sendMessage(msg.chat.id, "🤖 I didn't understand that. Use /help for commands.")
}
