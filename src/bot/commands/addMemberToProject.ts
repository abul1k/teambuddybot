import TelegramBot from 'node-telegram-bot-api'
import { getAllProjects } from '../../services/projectService.js'
import { userStates } from '../../store/userStateStore.js'
import { User } from '../../models/User.js'

export const addMemberToProject = async (
  bot: TelegramBot,
  msg: TelegramBot.Message
) => {
  const userId = msg.from?.id
  const chatId = msg.chat.id
  if (!userId || !msg.text) return

  const usernames = msg.text
    .split(' ')
    .slice(1)
    .filter((word) => word.startsWith('@'))
    .map((u) => u.replace('@', ''))

  if (usernames.length === 0) {
    return bot.sendMessage(chatId, '❗ Please specify at least one @username.')
  }

  // Fetch users from DB
  const users = await User.find({ username: { $in: usernames } })

  if (users.length === 0) {
    return bot.sendMessage(
      chatId,
      '⚠️ None of the usernames were found in the system.'
    )
  }

  // Find which usernames were not found
  const foundUsernames = users.map((u) => u.username)
  const notFound = usernames.filter((u) => !foundUsernames.includes(u))

  // Store only Telegram IDs
  const telegramIds = users.map((u) => u.telegramId)
  userStates.set(userId, { members: telegramIds })

  if (notFound.length > 0) {
    await bot.sendMessage(
      chatId,
      `⚠️ These usernames were not found: ${notFound
        .map((u) => '@' + u)
        .join(', ')}`
    )
  }

  const listOfProjects = await getAllProjects()
  if (listOfProjects.length === 0) {
    return bot.sendMessage(chatId, '⚠️ No projects found.')
  }

  const options = {
    reply_markup: {
      inline_keyboard: listOfProjects.map((project) => [
        {
          text: project.name,
          callback_data: `addmembers_project_${project._id}`,
        },
      ]),
    },
  }

  await bot.sendMessage(chatId, 'Select a project to add members:', options)
}
