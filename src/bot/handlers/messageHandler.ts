import TelegramBot from 'node-telegram-bot-api'
import { commandHandler } from './commandHandler.js'
import {
  handleNewProjectSteps,
  isUserCreatingProject,
} from '../commands/createNewProject.js'

export const messageHandler = async (
  bot: TelegramBot,
  msg: TelegramBot.Message
) => {
  const text = msg.text
  const userId = msg.from?.id

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

  bot.sendMessage(
    msg.chat.id,
    "🤖 I didn't understand that. Use /help for commands."
  )
}
