export const helpUser = (bot, msg) => {
  const helpText = `
🤖 *Available Commands:*

📌 */start* — Start the bot  
🆕 */newproject* — Create a new project  
👥 */addmember* — Add members to a project  
📝 */addtask* — Add a task to a project  
❓ */help* — Show this help message

Enjoy your productivity! 🚀
  `
  bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' })
}
