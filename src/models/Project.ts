import { Schema, model } from 'mongoose'

const projectSchema = new Schema({
  name: String,
  dueDate: Date,
  description: String,
  ownerId: Number,
  members: [Number], // array of Telegram user IDs
})

export const Project = model('Project', projectSchema)
