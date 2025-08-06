import { Schema, model } from 'mongoose'

const taskSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  userTelegramId: { type: Number, required: true }, // Telegram user ID
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

export const Task = model('Task', taskSchema)
