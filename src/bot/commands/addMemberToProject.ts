import { Project } from '../../models/Project.js'
import TelegramBot from 'node-telegram-bot-api'
import { User } from '../../models/User.js'

export const addMemberToProject = async (
  bot: TelegramBot,
  msg: TelegramBot.Message
) => {
  try {
    const ownerId = msg.from?.id
    if (!ownerId) {
      return bot.sendMessage(msg.chat.id, '❌ Unable to identify you.')
    }

    const text = msg.text
    const mentions = text?.split(' ').slice(1)

    if (!mentions || mentions.length === 0) {
      return bot.sendMessage(
        msg.chat.id,
        '❌ Please mention at least one user to add.\n\nExample: /addmember @john @alex'
      )
    }

    const project = await Project.findOne({ ownerId })
    if (!project) {
      return bot.sendMessage(
        msg.chat.id,
        "❌ You don't have a project yet. Use /newproject to create one."
      )
    }

    const newMemberIds: number[] = []

    if (msg.entities) {
      for (const entity of msg.entities) {
        if (entity.type === 'mention') {
          // Extract mentioned username (without @)
          const usernameMentioned = msg.text
            .slice(entity.offset, entity.offset + entity.length)
            .replace('@', '')

          // Find user in your DB by username
          const dbUser = await User.findOne({ username: usernameMentioned })

          if (dbUser) {
            newMemberIds.push(dbUser.telegramId)
          }
        }
      }
    }

    if (newMemberIds.length === 0) {
      return bot.sendMessage(
        msg.chat.id,
        `❌ Couldn't find Telegram IDs for the mentioned users. Make sure they've interacted with the bot.`
      )
    }

    // Filter out duplicates
    const uniqueMembers = [...new Set([...project.members, ...newMemberIds])]

    console.log(uniqueMembers)
    project.members = uniqueMembers
    await project.save()

    bot.sendMessage(
      msg.chat.id,
      `✅ Successfully added ${newMemberIds.length} member(s) to your project!`
    )
  } catch (error) {
    console.error('❌ Error adding member:', error)
    bot.sendMessage(
      msg.chat.id,
      '❌ Something went wrong while adding members.'
    )
  }
}
