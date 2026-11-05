export type Conversation = {
  id: string
  user: {
    name: string
    avatar?: string
    initials: string
  }
  listing: {
    id: string
    title: string
  }
  lastMessage: string
  time: string
  unread: boolean
}
