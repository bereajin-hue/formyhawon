export const BOOK_QUEST_SYSTEM = `
You are an expert IGCSE and IB MYP Literature tutor with 20 years of experience.
Your task is to generate a comprehensive study guide for a student.
You MUST respond with ONLY valid JSON. No markdown, no explanation, just JSON.
`

export const bookQuestPrompt = (
  title: string,
  author: string,
  grade: number,
  curriculumData?: {
    themes?: string[]
    essay_themes?: string[]
    difficulty?: string
    description?: string
  }
) => {
  const curriculumContext = curriculumData
    ? `
CURRICULUM CONTEXT (use this to ensure accuracy):
- Key themes: ${curriculumData.themes?.join(', ') ?? 'not specified'}
- Pre-approved essay questions: ${curriculumData.essay_themes?.join(' | ') ?? 'generate from scratch'}
- Difficulty level: ${curriculumData.difficulty ?? 'standard'}
- IGCSE notes: ${curriculumData.description ?? 'standard IGCSE text'}

IMPORTANT: The essay_prompts in your response MUST include the pre-approved questions above
(adapt wording slightly if needed, but keep the core question intact).
`
    : ''

  return `
Generate a complete IGCSE/MYP study guide for:
- Book: "${title}" by ${author}
- Student grade level: Grade ${grade} (${grade >= 10 ? 'IGCSE Year ' + (grade - 9) : 'MYP Year ' + (grade - 5)})
${curriculumContext}

Return ONLY this JSON structure (no other text):
{
  "background": {
    "historical_context": "Historical and social context of the book (2-3 sentences)",
    "author_bio": "Author biography and writing motivation (2 sentences)",
    "allegory_map": [
      {"character_or_symbol": "...", "real_world_meaning": "..."}
    ]
  },
  "themes": [
    {
      "name": "Theme name",
      "description": "Theme description (2-3 sentences)",
      "key_scenes": ["scene1", "scene2", "scene3"]
    }
  ],
  "essay_prompts": [
    {
      "question": "IGCSE/MYP style essay question",
      "difficulty": "easy",
      "focus": "Key analytical point of this question"
    }
  ],
  "chapter_questions": {
    "Chapter 1": ["analytical question 1", "analytical question 2", "analytical question 3"],
    "Chapter 2": ["...", "...", "..."]
  },
  "vocab_spotlight": [
    {
      "word": "C1 level word",
      "definition": "definition",
      "usage": "example usage from the book"
    }
  ]
}

Requirements:
- essay_prompts: exactly 6 questions (2 easy, 2 medium, 2 hard)
- themes: exactly 4 themes
- vocab_spotlight: exactly 10 words
- chapter_questions: cover all major chapters/sections
- All content in English
`
}

export const ESSAY_FEEDBACK_SYSTEM = `
You are an experienced IGCSE Literature examiner providing formative feedback.
Be specific, constructive, and age-appropriate.
You MUST respond with ONLY valid JSON. No markdown, no preamble.
`

export const essayFeedbackPrompt = (
  essay: string,
  prompt: string,
  bookTitle: string,
  grade: number
) => `
A Grade ${grade} student has written this essay about "${bookTitle}":

Essay Question: ${prompt}

Student's Essay:
${essay}

Evaluate this essay against IGCSE Assessment Objectives. Return ONLY this JSON:
{
  "scores": {
    "thesis_clarity": {
      "score": 1,
      "label": "Needs work",
      "feedback": "specific feedback (2-3 sentences)",
      "tip": "one concrete improvement tip"
    },
    "evidence_quality": { "score": 1, "label": "Needs work", "feedback": "...", "tip": "..." },
    "language_analysis": { "score": 1, "label": "Needs work", "feedback": "...", "tip": "..." },
    "coherence": { "score": 1, "label": "Needs work", "feedback": "...", "tip": "..." },
    "contextual_awareness": { "score": 1, "label": "Needs work", "feedback": "...", "tip": "..." }
  },
  "model_sentence": "one improved example sentence for the weakest area",
  "overall_comment": "encouraging overall comment (2-3 sentences)",
  "xp_bonus": 0
}

Score scale: 1=Needs work, 2=Developing, 3=Good, 4=Excellent
label must match score: 1="Needs work", 2="Developing", 3="Good", 4="Excellent"
xp_bonus: 0 if average < 2.5, 10 if average >= 2.5, 20 if average >= 3.5
`

export const VOCAB_CHECK_SYSTEM = `
You are a language tutor. Check if the student used the target word correctly.
Be encouraging. Return ONLY valid JSON.
`

export const vocabCheckPrompt = (
  word: string,
  definition: string,
  sentence: string,
  language: 'EN' | 'DE' | 'FR'
) => `
Target word: "${word}" (${language === 'EN' ? 'C1 English' : language === 'DE' ? 'German B1' : 'French B1'})
Definition: ${definition}
Student's sentence: "${sentence}"

Return ONLY this JSON:
{
  "score": 1,
  "is_correct": true,
  "corrected_sentence": "corrected sentence (original if correct)",
  "explanation": "why correct or incorrect (1-2 sentences)",
  "encouragement": "short encouraging message"
}

Score: 1=Incorrect, 2=Partially correct, 3=Correct, 4=Correct+sophisticated, 5=Excellent
`

export const ESSAY_QUESTION_SYSTEM = `
You are an expert IGCSE and IB MYP Literature teacher.
Generate a single essay question tailored to the student's grade level.
You MUST respond with ONLY valid JSON. No markdown, no explanation.
`

export const essayQuestionPrompt = (title: string, author: string, grade: number) => `
Generate one essay question for a Grade ${grade} student who is reading "${title}" by ${author}.

Grade ${grade} context: ${grade === 10
  ? 'IGCSE Year 10 — focus on literary devices, author\'s craft, language choices, thematic analysis, and critical evaluation. Questions should be analytical and text-based.'
  : 'IB MYP Year 3 (Grade 8) — focus on character development, personal response to themes, basic literary techniques, and making connections to real life. Questions should be accessible but thoughtful.'
}

Rules:
- Make it specific to this book (use character names, events, or quotes)
- Vary the type each call: sometimes character analysis, sometimes theme, sometimes language/style, sometimes structure
- Use age-appropriate vocabulary for Grade ${grade}
- The question should require a full essay response (not just yes/no)

Return ONLY this JSON:
{
  "question": "the full essay question",
  "type": "character|theme|language|structure",
  "difficulty": "easy|medium|hard",
  "hint": "one sentence hint on how to approach this question"
}
`

export const discussionPrompt = (book: string, focus: string, grade: number) => `
Generate 3 Socratic discussion questions for a Grade ${grade} student studying "${book}".
Focus area: ${focus}

Return ONLY this JSON:
{
  "questions": [
    {
      "question": "Socratic discussion question",
      "context": "why this question matters (1 sentence)",
      "follow_up": "deeper follow-up question"
    }
  ]
}
`

export const MATH_PROBLEM_SYSTEM = `
You are an expert IGCSE/MYP Mathematics tutor following Cambridge 0580 syllabus.
Generate problems that match the exact difficulty and skills specified.
Return ONLY valid JSON. No markdown, no explanation.
`

export const mathProblemPrompt = (
  grade: number,
  topicData: {
    unit_name: string
    topic_name: string
    difficulty: string
    igcse_syllabus_ref: string
    key_skills: string[]
    prerequisites: string[]
  },
  level: 'foundation' | 'core' | 'extended',
  count: number = 5
) => `
Generate ${count} IGCSE Mathematics problems for:
- Grade: ${grade}
- Unit: ${topicData.unit_name}
- Topic: ${topicData.topic_name}
- Cambridge Syllabus Reference: ${topicData.igcse_syllabus_ref}
- Difficulty: ${level}
- Key skills to test: ${topicData.key_skills.join(', ')}
- Prerequisites (assume mastered): ${topicData.prerequisites.join(', ')}

Problem difficulty distribution for "${level}":
${level === 'foundation' ? '- All problems: straightforward single-step (1-2 marks each)' : ''}
${level === 'core' ? '- 2 easy (1-2 marks), 2 medium (3-4 marks), 1 hard (5+ marks)' : ''}
${level === 'extended' ? '- 1 medium (3-4 marks), 3 hard (5-6 marks), 1 exam-style (7+ marks)' : ''}

Return ONLY this JSON:
{
  "topic_summary": "2-3 sentence explanation of this topic for a Grade ${grade} student",
  "key_formulas": ["formula1", "formula2"],
  "problems": [
    {
      "problem_number": 1,
      "problem_text": "Full problem statement with all necessary information",
      "marks": 3,
      "difficulty": "easy|medium|hard",
      "hint": "One-line hint (optional, for foundation/core)",
      "correct_answer": "Exact answer with units if applicable",
      "worked_solution": "Step-by-step working",
      "igcse_skill": "Which key skill this tests"
    }
  ],
  "common_mistakes": ["mistake1", "mistake2", "mistake3"]
}
`

export const sisterDebatePrompt = (book: string) => `
Generate a debate topic for two sisters (Grade 10 and Grade 8) who both read "${book}".

Return ONLY this JSON:
{
  "topic": "debate topic as a yes/no or for/against question",
  "grade10": {
    "angle": "Grade 10 perspective (more analytical, IGCSE lens)",
    "starters": ["argument starter 1", "argument starter 2"]
  },
  "grade8": {
    "angle": "Grade 8 perspective (more intuitive, personal)",
    "starters": ["argument starter 1", "argument starter 2"]
  },
  "rules": ["debate rule 1", "debate rule 2", "debate rule 3"]
}
`
