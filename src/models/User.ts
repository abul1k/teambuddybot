import { Schema, model } from 'mongoose'

const userSchema = new Schema({
  telegramId: { type: Number, required: true, unique: true },
  username: String,
  first_name: String,
  last_name: String,
  createdAt: { type: Date, default: Date.now },
})

export const User = model('User', userSchema)
