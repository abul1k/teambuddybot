import { Project } from '../models/Project.js'
import { IProject } from '../types/project.js'

export const getAllProjects = async (): Promise<IProject[]> => {
  try {
    const projects: IProject[] = await Project.find()
    return projects
  } catch (error) {
    console.error('❗Error fetching projects:', error)
    return []
  }
}
