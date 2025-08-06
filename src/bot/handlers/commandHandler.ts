import { addMemberToProject } from '../commands/addMemberToProject.js'
import { addTask } from '../commands/addtask.js'
import { helpUser } from '../commands/helpUser.js'
import { createNewProject } from '../commands/createNewProject.js'
import { start } from '../commands/start.js'

const commandsMap = {
  '/start': start,
  '/newproject': createNewProject,
  '/addmember': addMemberToProject,
  '/addtask': addTask,
  '/help': helpUser,
}

export const commandHandler = (bot, msg, command, args) => {
  const handler = commandsMap[command]
  if (handler) {
    if (command === '/addtask') {
      handler(bot, msg, args)
    } else {
      handler(bot, msg)
    }
  } else {
    bot.sendMessage(msg.chat.id, '❌ Unknown command.')
  }
}
