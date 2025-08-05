import TelegramBot from 'node-telegram-bot-api'
import * as dotenv from 'dotenv'
import { messageHandler } from './handlers/messageHandler.js'

dotenv.config()

export const startTelegramBot = () => {
  const bot = new TelegramBot(process.env.TELEGRAM_TOKEN!, { polling: true })

  bot.on('message', (msg) => {
    messageHandler(bot, msg)
  })
}
