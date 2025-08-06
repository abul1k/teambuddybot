import TelegramBot from 'node-telegram-bot-api'
import { Project } from '../../models/Project.js'
import { addTaskStates, userStates } from '../../store/userStateStore.js'
import { Task } from '../../models/Task.js'

export const callbackQueryHandler = async (
  bot: TelegramBot,
  callbackQuery: TelegramBot.CallbackQuery
) => {
  const chatId = callbackQuery.message?.chat.id
  const userId = callbackQuery.from.id
  const data = callbackQuery.data

  if (!chatId || !data) return
  else if (data.startsWith('addmembers_project_')) {
    const projectId = data.replace('addmembers_project_', '')
    const userState = userStates.get(userId)

    if (!userState) {
      await bot.sendMessage(
        chatId,
        '⚠️ No members to add. Please use /addmember first.'
      )
      return bot.answerCallbackQuery(callbackQuery.id)
    }

    try {
      const project = await Project.findById(projectId)

      if (!project) {
        await bot.sendMessage(chatId, '❌ Project not found.')
      } else {
        const updatedMembers = Array.from(
          new Set([...(project.members || []), ...userState.members])
        )
        project.members = updatedMembers
        await project.save()

        await bot.sendMessage(
          chatId,
          `✅ Users added to project: ${updatedMembers.join(', ')}`,
          { parse_mode: 'Markdown' }
        )
      }

      userStates.delete(userId)
    } catch (error) {
      console.error('Error updating project:', error)
      await bot.sendMessage(chatId, '⚠️ Failed to update project.')
    }
  } else if (data.startsWith('addtask_project_')) {
    const projectId = data.replace('addtask_project_', '')
    const taskState = addTaskStates.get(userId)

    if (!taskState || taskState.step !== 1) {
      await bot.sendMessage(
        chatId,
        '⚠️ No task flow in progress. Use /addtask again.'
      )
      return bot.answerCallbackQuery(callbackQuery.id)
    }

    taskState.projectId = projectId
    taskState.step = 2
    addTaskStates.set(userId, taskState)

    await bot.sendMessage(chatId, '📝 Now send the task description:')
    return bot.answerCallbackQuery(callbackQuery.id)
  } else if (data.startsWith('complete_task_')) {
    const taskId = data.replace('complete_task_', '')

    try {
      const task = await Task.findById(taskId)
      if (!task) {
        await bot.sendMessage(chatId, '❌ Task not found.')
      } else {
        task.completed = true

        await task.save()

        const { message } = callbackQuery

        const updatedText = message.text.replace(
          /⏳ Status: ❌ Not Completed/,
          '⏳ Status: ✅ Completed'
        )

        await bot.editMessageText(updatedText, {
          chat_id: message.chat.id,
          message_id: message.message_id,
          parse_mode: 'HTML', // Optional, if you're using HTML formatting
        })
      }
    } catch (err) {
      console.error('Failed to mark task as completed:', err)
      await bot.sendMessage(chatId, '⚠️ Could not update the task.')
    }

    return bot.answerCallbackQuery(callbackQuery.id)
  }

  await bot.answerCallbackQuery(callbackQuery.id)
}
