import moment from 'moment'
import { User } from '../../models/User.js'

export const handleStart = async (bot, msg) => {
  const { id, username, first_name, last_name } = msg.from

  try {
    const existingUser = await User.findOne({ telegramId: id })

    if (existingUser) {
      const startedAt = moment(existingUser.createdAt).format(
        'MMMM Do YYYY, HH:mm'
      )
      console.log(`ℹ️ User already exists: ${username || id}`)
      await bot.sendMessage(
        msg.chat.id,
        `ℹ️ You already started the bot on ${startedAt}.`
      )
      return
    }

    await User.create({
      telegramId: id,
      username,
      first_name,
      last_name,
    })

    console.log(`✅ New user saved: ${username || id}`)

    await bot.sendMessage(msg.chat.id, '👋 Welcome to TeamBuddyBot!')
  } catch (err) {
    console.error('❌ Error saving user:', err)
    await bot.sendMessage(
      msg.chat.id,
      '⚠️ Something went wrong while saving you.'
    )
  }
}
