export const addTask = (bot, msg, args) => {
  const text = args.join(' ')

  // 🧠 Extract task name, assignee, and due date using regex
  const match = text.match(/(.+?) \/assign (@\w+) \/due (\d{4}-\d{2}-\d{2})/)

  if (!match) {
    bot.sendMessage(
      msg.chat.id,
      '❌ Please use the format: Task name /assign @username /due YYYY-MM-DD'
    )
    return
  }

  const [, taskName, assignee, dueDate] = match

  // 📝 Save or log the task (for now, just simulate)
  bot.sendMessage(
    msg.chat.id,
    `✅ Task created:\n📌 *${taskName}*\n👤 Assigned to: ${assignee}\n📅 Due: ${dueDate}`,
    { parse_mode: 'Markdown' }
  )
}
