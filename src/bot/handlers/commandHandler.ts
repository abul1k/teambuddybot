import { addMemberToProject } from '../commands/addMemberToProject.js'
import { addTask } from '../commands/addtask.js'
import { newProject } from '../commands/newproject.js'
import { handleStart } from '../commands/start.js'

export const commandHandler = (bot, msg, command, args) => {
  switch (command) {
    case '/start':
      handleStart(bot, msg)
      break
    case '/newproject':
      newProject(bot, msg)
      break
    case '/addmember':
      console.log()
      addMemberToProject(bot, msg)
      break
    case '/addtask':
      addTask(bot, msg, args)
      break
    default:
      bot.sendMessage(msg.chat.id, '❌ Unknown command.')
  }
}
