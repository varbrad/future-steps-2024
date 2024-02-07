import users from './data/users.json'

export type User = typeof users[number]

export type UserStats = {
  total: number
  x: string[]
  steps: number[]
}