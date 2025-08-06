import TelegramBot from 'node-telegram-bot-api'
import * as dotenv from 'dotenv'
import { messageHandler } from './handlers/messageHandler.js'
import { callbackQueryHandler } from './handlers/callbackQueryHandler.js'

dotenv.config()

export const startTelegramBot = () => {
  const bot = new TelegramBot(process.env.TELEGRAM_TOKEN!, { polling: true })

  // Handle incoming messages
  bot.on('message', (msg) => {
    messageHandler(bot, msg)
  })

  // Handle inline button presses
  bot.on('callback_query', (callbackQuery) => {
    callbackQueryHandler(bot, callbackQuery)
  })
}
