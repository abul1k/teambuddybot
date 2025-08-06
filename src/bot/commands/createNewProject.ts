import { Project } from '../../models/Project.js'
import TelegramBot from 'node-telegram-bot-api'

type UserState = {
  step: number
  data: {
    name?: string
    dueDate?: Date
    description?: string
  }
}

const userStates = new Map<number, UserState>() // userId -> state

export const isUserCreatingProject = (userId: number): boolean => {
  return userStates.has(userId)
}

export const getUserProjectDraft = (userId: number) => {
  return userStates.get(userId)?.data
}

export const createNewProject = (
  bot: TelegramBot,
  msg: TelegramBot.Message
) => {
  const userId = msg.from?.id
  if (!userId) return

  userStates.set(userId, { step: 1, data: {} })

  bot.sendMessage(msg.chat.id, '📁 What is the *name* of your project?', {
    parse_mode: 'Markdown',
  })
}

export const handleNewProjectSteps = async (
  bot: TelegramBot,
  msg: TelegramBot.Message
) => {
  const userId = msg.from?.id
  const chatId = msg.chat.id
  if (!userId || !msg.text) return

  const state = userStates.get(userId)
  const text = msg.text.trim()

  if (!state) return

  switch (state.step) {
    case 1: {
      if (text.length < 2) {
        return bot.sendMessage(
          chatId,
          '❌ Project name is too short. Try again.'
        )
      }

      state.data.name = text
      state.step++

      bot.sendMessage(chatId, '📅 Now enter the *due date* (dd.mm.yyyy)', {
        parse_mode: 'Markdown',
      })
      break
    }

    case 2: {
      if (!/^\d{2}\.\d{2}\.\d{4}$/.test(text)) {
        return bot.sendMessage(chatId, '❌ Use date format: dd.mm.yyyy')
      }

      const [day, month, year] = text.split('.').map(Number)
      const dueDate = new Date(year, month - 1, day)

      if (isNaN(dueDate.getTime())) {
        return bot.sendMessage(chatId, '❌ Invalid date. Try again.')
      }

      if (dueDate < new Date()) {
        return bot.sendMessage(chatId, '❌ Due date must be in the future.')
      }

      state.data.dueDate = dueDate
      state.step++

      bot.sendMessage(chatId, '📝 Enter a short *description* or type "skip"', {
        parse_mode: 'Markdown',
      })
      break
    }

    case 3: {
      state.data.description = text.toLowerCase() === 'skip' ? '' : text

      const project = new Project({
        name: state.data.name,
        dueDate: state.data.dueDate,
        description: state.data.description,
        ownerId: userId,
        members: [userId],
      })

      await project.save()
      userStates.delete(userId)

      const dueDateStr = state.data.dueDate?.toDateString() || 'Unknown'

      bot.sendMessage(
        chatId,
        `✅ *Project Created!*\n\n🗂 Name: *${
          project.name
        }*\n📅 Due: *${dueDateStr}*\n📝 Description: *${
          project.description || 'No description'
        }*`,
        { parse_mode: 'Markdown' }
      )

      break
    }
  }
}
