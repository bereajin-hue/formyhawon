export type UserRole = 'student' | 'parent'
export type BookStatus = 'reading' | 'completed' | 'wishlist'
export type VocabLanguage = 'EN' | 'DE' | 'FR'
export type MilestoneDay = 10 | 20 | 30

export interface Profile {
  id: string
  user_id: string
  role: UserRole
  name: string
  grade?: number
  parent_id?: string
  xp_total: number
  streak_days: number
  last_active?: string
  created_at: string
}

export interface Book {
  id: string
  user_id: string
  title: string
  author: string
  grade_level?: number
  status: BookStatus
  started_at?: string
  completed_at?: string
  created_at: string
}

export interface BookQuestContent {
  background: {
    historical_context: string
    author_bio: string
    allegory_map: Array<{ character_or_symbol: string; real_world_meaning: string }>
  }
  themes: Array<{
    name: string
    description: string
    key_scenes: string[]
  }>
  essay_prompts: Array<{
    question: string
    difficulty: 'easy' | 'medium' | 'hard'
    focus: string
  }>
  chapter_questions: Record<string, string[]>
  vocab_spotlight: Array<{
    word: string
    definition: string
    usage: string
  }>
}

export interface BookQuest {
  id: string
  book_title: string
  book_author: string
  grade_level: number
  content: BookQuestContent
  generated_at: string
}

export interface EssayFeedbackScore {
  score: 1 | 2 | 3 | 4
  label: 'Needs work' | 'Developing' | 'Good' | 'Excellent'
  feedback: string
  tip: string
}

export interface EssayFeedback {
  scores: {
    thesis_clarity: EssayFeedbackScore
    evidence_quality: EssayFeedbackScore
    language_analysis: EssayFeedbackScore
    coherence: EssayFeedbackScore
    contextual_awareness: EssayFeedbackScore
  }
  model_sentence: string
  overall_comment: string
  xp_bonus: 0 | 10 | 20
}

export interface Essay {
  id: string
  user_id: string
  book_id?: string
  prompt_text: string
  content: string
  word_count?: number
  ai_feedback?: EssayFeedback
  revision_count: number
  submitted_at: string
  updated_at: string
}

export interface VocabWord {
  word: string
  definition: string
  example: string
}

export interface VocabCorrection {
  word: string
  score: number
  is_correct: boolean
  corrected_sentence: string
  explanation: string
  encouragement: string
}

export interface VocabSession {
  id: string
  user_id: string
  session_date: string
  language: VocabLanguage
  words: VocabWord[]
  sentences?: Record<string, string>
  ai_corrections?: VocabCorrection[]
  completed: boolean
  created_at: string
}

export interface Mission {
  id: string
  title: string
  type: 'vocab' | 'reading' | 'essay'
  xp: number
  completed: boolean
}

export interface DailyMission {
  id: string
  user_id: string
  mission_date: string
  missions: Mission[]
  completed_count: number
  all_done: boolean
  xp_earned: number
  created_at: string
}

export interface XPLog {
  id: string
  user_id: string
  amount: number
  reason: string
  created_at: string
}

export interface Milestone {
  id: string
  user_id: string
  day_number: MilestoneDay
  xp_required: number
  achieved_at?: string
  parent_approved_at?: string
  reward_description?: string
}

// ─── Math Quest Types ───────────────────────────────────────────────

export type MathLevel = 'easy' | 'medium' | 'hard' | 'synthesis'
export type MathSessionStatus = 'not_started' | 'in_progress' | 'completed'
export type MathArea = 'number' | 'algebra' | 'geometry' | 'statistics' | 'sequences' | 'transformation'

export interface MathConceptSummary {
  concept_name: string
  formulas: string[]
  explanation: string
  worked_example: {
    problem: string
    steps: string[]
    answer: string
  }
  common_mistakes: string[]
}

export interface MathSession {
  id: string
  student_id: string
  day_number: number
  topic_title: string
  concept_image_url: string | null
  concept_summary: MathConceptSummary | null
  status: MathSessionStatus
  xp_earned: number
  date: string
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface MathProblem {
  id: string
  session_id: string
  student_id: string
  level: MathLevel
  problem_number: number
  is_retry: boolean
  problem_text: string
  correct_answer: string
  answer_image_url: string | null
  is_correct: boolean | null
  ai_feedback: string | null
  ai_score: number | null
  created_at: string
}

export interface MathReviewItem {
  id: string
  student_id: string
  problem_id: string
  scheduled_date: string
  completed: boolean
  completed_at: string | null
  created_at: string
  problem?: MathProblem
}

export interface MathDailyReport {
  id: string
  student_id: string
  date: string
  day_number: number
  total_problems: number
  correct_count: number
  time_minutes: number
  weak_areas: string[]
  ai_report: string | null
  parent_viewed: boolean
  created_at: string
}

export interface GeneratedMathProblem {
  problem_text: string
  correct_answer: string
  hint: string
}

export interface MathGradeResult {
  is_correct: boolean
  score: number
  method_correct: boolean
  feedback: string
  error_location: string | null
  correct_working: string | null
}
