export type ArticleType = 'travel' | 'reporter' | 'editor'

export interface ArticleData {
  headline: string
  subtitle: string
  body: string
  byline: string
  date: string
  location: string
  authorName: string
  mediaName: string
  mediaNameHanja?: string
  issueNumber?: string
  photos?: string[]
  type: ArticleType
}
