export type UserState = {
  members: number[]
}

export const userStates = new Map<number, UserState>()

export type AddTaskState = {
  step: number
  targetUsername?: string
  targetTelegramId?: number
  projectId?: string
  description?: string
  dueDate?: Date
}

export const addTaskStates = new Map<number, AddTaskState>()
