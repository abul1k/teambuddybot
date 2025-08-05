import { startTelegramBot } from './bot/telegramBot.js'
import { connectToDB } from './db/db.js'

await connectToDB()

startTelegramBot()
