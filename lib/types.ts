export type QuestionType = "two_choices" | "four_choices" | "input"

export interface Question {
  id: string
  quizId: string
  questionText: string
  questionType: QuestionType
  options: any
  correctAnswer: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface Quiz {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  published: boolean
  coverImage: string | null
  authorId: string
  questions?: Question[]
}
