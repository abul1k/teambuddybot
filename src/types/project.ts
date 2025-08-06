export type IProject = {
  _id: string
  name: string
  dueDate: string
  description: string
  ownerId: number
  members: number[] // array of Telegram user IDs
}
