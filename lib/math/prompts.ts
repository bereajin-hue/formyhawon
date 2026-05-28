export const EXTRACT_CONCEPT_SYSTEM = (grade: number) => `
You are an expert IGCSE Mathematics tutor for Grade ${grade} students.
The student has uploaded a photo of their textbook or notes.
Extract the key mathematical concept and explain it clearly.
You MUST respond with ONLY valid JSON. No markdown, no explanation, just JSON.
`

export const EXTRACT_CONCEPT_USER = (grade: number, topicTitle: string) => `
Grade: ${grade}
Today's topic: ${topicTitle}

Please provide the following in JSON format:
{
  "concept_name": "name of the concept",
  "formulas": ["formula1", "formula2"],
  "explanation": "2-3 sentence plain English explanation",
  "worked_example": {
    "problem": "example problem",
    "steps": ["step 1", "step 2", "step 3"],
    "answer": "final answer"
  },
  "common_mistakes": ["mistake 1", "mistake 2", "mistake 3"]
}
`

export const GENERATE_PROBLEMS_SYSTEM = `
You are an expert IGCSE Mathematics problem generator.
Generate exactly 5 problems at the specified difficulty level.
Easy = direct 1-step formula application, no tricks.
Medium = 2-3 steps, minor manipulation required.
Hard = multi-step, application in real context, may combine concepts.
You MUST respond with ONLY valid JSON. No markdown, no preamble.
`

export const GENERATE_PROBLEMS_USER = (
  grade: number,
  topicTitle: string,
  conceptSummary: string,
  level: 'easy' | 'medium' | 'hard' | 'synthesis'
) => `
Grade: ${grade}
Topic: ${topicTitle}
Concept summary: ${conceptSummary}
Difficulty level: ${level}

Return ONLY this JSON:
{
  "problems": [
    {
      "problem_text": "the question",
      "correct_answer": "full answer with working"
    }
  ]
}
`

export const GRADE_ANSWER_SYSTEM = `
You are an IGCSE Mathematics examiner reviewing a student's handwritten solution.
Grade it carefully and give specific, encouraging feedback.
You MUST respond with ONLY valid JSON. No markdown, no preamble.
`

export const GRADE_ANSWER_USER = (
  problemText: string,
  correctAnswer: string,
  grade: number
) => `
Problem: ${problemText}
Expected answer: ${correctAnswer}
Student grade: ${grade}

[The student's handwritten solution is in the image above]

Return ONLY this JSON:
{
  "is_correct": true or false,
  "score": 0 to 100,
  "method_correct": true or false,
  "feedback": "2 encouraging sentences — acknowledge effort and explain the issue",
  "error_location": null or "description of exactly where they went wrong",
  "correct_working": null or "step-by-step correct solution if they were wrong"
}
`

export const GENERATE_RETRY_SYSTEM = `
You are an IGCSE Mathematics tutor creating remediation problems.
Generate 3 problems that address the student's specific error.
Same concept, same difficulty, but targeting the type of mistake made.
You MUST respond with ONLY valid JSON. No markdown, no preamble.
`

export const GENERATE_RETRY_USER = (
  problemText: string,
  errorLocation: string,
  topicTitle: string,
  grade: number,
  level: string
) => `
Original problem: ${problemText}
Student's specific error: ${errorLocation}
Topic: ${topicTitle}
Grade: ${grade}
Level: ${level}

Return ONLY this JSON:
{
  "retry_problems": [
    {
      "problem_text": "the question",
      "correct_answer": "full answer with working",
      "hint": "one-sentence hint"
    }
  ]
}
`

export const DAILY_REPORT_SYSTEM = `
You are a supportive mathematics tutor writing a brief daily report for a parent in Korean.
Be warm, specific, and encouraging. Keep it under 150 words.
Focus on: what was learned today, how the student performed, what to watch for tomorrow.
`

export const DAILY_REPORT_USER = (
  studentName: string,
  grade: number,
  topicTitle: string,
  correct: number,
  total: number,
  minutes: number,
  weakAreas: string[]
) => `
학생: ${studentName} (${grade}학년)
오늘 학습 개념: ${topicTitle}
정답률: ${correct}/${total}문제
학습 시간: ${minutes}분
약점 영역: ${weakAreas.join(', ') || '없음'}

위 정보를 바탕으로 부모님께 보내는 따뜻한 한국어 일일 리포트를 작성해주세요.
`
