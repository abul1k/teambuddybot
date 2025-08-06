// commands/addTask.ts
import TelegramBot from 'node-telegram-bot-api'
import { User } from '../../models/User.js'
import { Project } from '../../models/Project.js'
import { addTaskStates } from '../../store/userStateStore.js'
import { Task } from '../../models/Task.js'

export const addTask = async (bot: TelegramBot, msg: TelegramBot.Message) => {
  const chatId = msg.chat.id
  const userId = msg.from?.id
  const text = msg.text || ''

  const match = text.match(/^\/addtask\s+@(\w+)$/)
  if (!match || !userId) {
    return bot.sendMessage(chatId, '❌ Usage: /addtask @username')
  }

  const username = match[1]
  const user = await User.findOne({ username })
  if (!user) {
    return bot.sendMessage(chatId, `❌ User @${username} not found.`)
  }

  const projects = await Project.find({ members: user.telegramId })
  if (projects.length === 0) {
    return bot.sendMessage(chatId, `❌ @${username} is not in any project.`)
  }

  // Save state
  addTaskStates.set(userId, {
    step: 1,
    targetUsername: username,
    targetTelegramId: user.telegramId,
  })

  const buttons = projects.map((p) => [
    {
      text: p.name,
      callback_data: `addtask_project_${p._id}`,
    },
  ])

  return bot.sendMessage(chatId, `📂 Choose a project for @${username}:`, {
    reply_markup: {
      inline_keyboard: buttons,
    },
  })
}

export const handleAddTaskFinalStep = async (
  bot: TelegramBot,
  msg: TelegramBot.Message,
  addTaskStates: Map<number, any>
) => {
  const userId = msg.from?.id
  const chatId = msg.chat.id
  const text = msg.text

  const taskState = userId ? addTaskStates.get(userId) : null

  if (!taskState || !text) return false

  if (taskState.step === 2) {
    // Step 2: Save task description and move to Step 3
    taskState.description = text
    taskState.step = 3
    addTaskStates.set(userId, taskState)

    await bot.sendMessage(chatId, '📅 Now enter the *due date* (dd.mm.yyyy)', {
      parse_mode: 'Markdown',
    })
    return true
  }

  if (taskState.step === 3) {
    // Step 3: Save due date and create the task
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

    try {
      const task = new Task({
        projectId: taskState.projectId,
        userTelegramId: taskState.targetTelegramId,
        description: taskState.description,
        dueDate: new Date(dueDate),
      })

      await task.save()
      await bot.sendMessage(
        chatId,
        `✅ Task for @${taskState.targetUsername} has been added with due date ${text}.`
      )
      addTaskStates.delete(userId)
    } catch (err) {
      console.error('Error saving task:', err)
      await bot.sendMessage(chatId, '❌ Failed to save task.')
    }

    return true
  }

  return false
}
