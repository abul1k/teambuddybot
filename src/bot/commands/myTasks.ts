import TelegramBot from 'node-telegram-bot-api'
import { Task } from '../../models/Task.js'
import { Project } from '../../models/Project.js'

export const myTasks = async (bot: TelegramBot, msg: TelegramBot.Message) => {
  const userId = msg.from?.id
  if (!userId) return

  const userTasks = await Task.find({ userTelegramId: userId })

  if (userTasks.length === 0) {
    return bot.sendMessage(msg.chat.id, '❌ You have no tasks.')
  }

  const projectIds = [
    ...new Set(userTasks.map((task) => task.projectId?.toString())),
  ]
  const projects = await Project.find({ _id: { $in: projectIds } })
  const projectMap = new Map(projects.map((p) => [p._id.toString(), p.name]))

  for (let i = 0; i < userTasks.length; i++) {
    const task = userTasks[i]
    const projectName =
      projectMap.get(task.projectId?.toString()) || 'Unknown Project'

    const message =
      `*📝 Task ${i + 1}*\n` +
      `*📂 Project:* _${projectName}_\n` +
      `*🧾 Description:* ${task.description}\n` +
      `*⏳ Status:* ${task.completed ? '✅ Completed' : '❌ Not Completed'}\n` +
      `* 📅 Due:* ${new Date(task.dueDate).toLocaleDateString()}`

    const inline_keyboard = task.completed
      ? [] // no button if already completed
      : [
          [
            {
              text: '✅ Mark as Completed',
              callback_data: `complete_task_${task._id}`,
            },
          ],
        ]

    await bot.sendMessage(msg.chat.id, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard,
      },
    })
  }
}
