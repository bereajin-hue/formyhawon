export type Lang = 'ko' | 'en'

// [korean, english] 튜플
type P = [string, string]

export const T = {
  // ──────────── 공통 ────────────
  common: {
    back: ['← 뒤로', '← Back'] as P,
    cancel: ['취소', 'Cancel'] as P,
    retry: ['다시 시도', 'Retry'] as P,
    saving: ['저장 중...', 'Saving...'] as P,
    processing: ['처리 중...', 'Processing...'] as P,
    generating: ['생성 중...', 'Generating...'] as P,
    noTitle: ['(제목 없음)', '(No title)'] as P,
    logout: ['로그아웃', 'Log out'] as P,
    grade: (g: number, lang: Lang) => lang === 'ko' ? `${g}학년` : `Grade ${g}`,
  },

  // ──────────── 사이드바 ────────────
  nav: {
    home: ['홈', 'Home'] as P,
    library: ['책 라이브러리', 'Book Library'] as P,
    essay: ['에세이', 'Essay'] as P,
    vocab: ['어휘 학습', 'Vocabulary'] as P,
    certificate: ['수료증', 'Certificate'] as P,
    childDashboard: ['자녀 대시보드', 'Children Dashboard'] as P,
    parentAccount: ['부모 계정', 'Parent Account'] as P,
    student: (lang: Lang) => lang === 'ko' ? '학년' : 'Grade',
    langToggle: ['🇺🇸 English', '🇰🇷 한국어'] as P,
  },

  // ──────────── 대시보드 ────────────
  dashboard: {
    greeting: (name: string, lang: Lang) => lang === 'ko' ? `안녕하세요, ${name}님! 👋` : `Hello, ${name}! 👋`,
    dayProgress: (current: number, lang: Lang) => lang === 'ko' ? `Day ${current} / 30` : `Day ${current} / 30`,
    checkinBadge: ['✅ 오늘 체크인 +5 XP', '✅ Check-in +5 XP'] as P,
    allDone: ['🎉 오늘 미션 모두 완료!', '🎉 All missions complete today!'] as P,
    allDoneDesc: ['훌륭해요! 내일도 이 기세로 달려봐요.', 'Great job! Keep it up tomorrow!'] as P,
    certBanner: ['🎓 수료증 보기', '🎓 View Certificate'] as P,
    certBannerDesc: ['지금까지의 학습 성과를 확인하고 인쇄해보세요!', 'Check your achievements and print your certificate!'] as P,
    todayMissions: ['오늘의 미션', "Today's Missions"] as P,
    missionCount: (done: number, total: number, lang: Lang) => lang === 'ko' ? `${done} / ${total} 완료` : `${done} / ${total} done`,
    xpStatus: ['XP 현황', 'XP Status'] as P,
    loadingMissions: ['미션 불러오는 중...', 'Loading missions...'] as P,
    milestoneAchieved: ['🏆 마일스톤 달성! 부모님 승인을 기다려요', '🏆 Milestone reached! Waiting for parent approval'] as P,
    dayMilestone: (day: number, lang: Lang) => lang === 'ko' ? `Day ${day} 마일스톤` : `Day ${day} Milestone`,
    soboReward: ['소보상', 'Small Reward'] as P,
    midReward: ['중간보상', 'Mid Reward'] as P,
    bigReward: ['대보상', 'Big Reward'] as P,
    approved: ['달성! ✓ 승인됨', 'Done! ✓ Approved'] as P,
    pendingApproval: ['달성! 승인 대기 중', 'Done! Approval pending'] as P,
  },

  // ──────────── XPBar ────────────
  xpbar: {
    milestone: (day: number, lang: Lang) => lang === 'ko' ? `Day ${day} 마일스톤` : `Day ${day} Milestone`,
    moreXp: (n: number, lang: Lang) => lang === 'ko' ? `${n} XP 더 모으면 보상!` : `${n} more XP for a reward!`,
  },

  // ──────────── 스트릭 ────────────
  streak: {
    notStarted: ['🌱 아직 시작 전', '🌱 Not started yet'] as P,
    daysStreak: (d: number, lang: Lang) => lang === 'ko' ? `🔥 ${d}일 연속 달성!` : `🔥 ${d}-day streak!`,
  },

  // ──────────── 미션 카드 ────────────
  mission: {
    clickComplete: ['클릭해서 완료 표시', 'Click to complete'] as P,
    autoHint: {
      vocab: ['어휘 세션 완료 시 자동 획득', 'Auto-awarded on vocab session'] as P,
      essay: ['에세이 첨삭 수령 시 자동 획득', 'Auto-awarded on essay feedback'] as P,
      reading: ['책 등록 후 챕터 질문 탭 방문 시 자동 획득', 'Auto-awarded when visiting chapter questions'] as P,
    },
    titles: {
      vocab: ['어휘 세션 완료 (EN 단어 + 문장 쓰기)', 'Vocabulary Session (EN words + sentences)'] as P,
      reading: ['독서 30분 + 챕터 질문 답변', '30-min Reading + Chapter Q&A'] as P,
      essay: ['에세이 문단 쓰기 또는 어휘 복습', 'Essay Writing or Vocabulary Review'] as P,
    },
  },

  // ──────────── 캘린더 ────────────
  calendar: {
    title: ['30일 챌린지 캘린더', '30-Day Challenge Calendar'] as P,
    done: ['완료', 'Done'] as P,
    today: ['오늘', 'Today'] as P,
    missed: ['미완료', 'Missed'] as P,
  },

  // ──────────── 라이브러리 ────────────
  library: {
    title: ['📚 책 라이브러리', '📚 Book Library'] as P,
    stats: (r: number, c: number, lang: Lang) => lang === 'ko' ? `읽는 중 ${r}권 · 완독 ${c}권` : `Reading ${r} · Completed ${c}`,
    addBook: ['+ 새 책 추가', '+ Add New Book'] as P,
    filterAll: (n: number, lang: Lang) => lang === 'ko' ? `전체 ${n}` : `All ${n}`,
    filterReading: (n: number, lang: Lang) => lang === 'ko' ? `읽는 중 ${n}` : `Reading ${n}`,
    filterCompleted: (n: number, lang: Lang) => lang === 'ko' ? `완독 ${n}` : `Completed ${n}`,
    empty: ['아직 추가한 책이 없어요', 'No books added yet'] as P,
    emptyDesc: ['위의 "새 책 추가" 버튼을 눌러보세요!', 'Click "+ Add New Book" above!'] as P,
    addFirst: ['첫 번째 책 추가하기', 'Add your first book'] as P,
  },

  // ──────────── 책 카드 ────────────
  bookCard: {
    reading: ['읽는 중', 'Reading'] as P,
    completed: ['완독 ✓', 'Completed ✓'] as P,
    wishlist: ['읽고 싶어요', 'Want to read'] as P,
    viewMaterials: ['학습 자료 보기', 'View Study Materials'] as P,
    markComplete: ['완독 표시', 'Mark Complete'] as P,
  },

  // ──────────── 책 추가 모달 ────────────
  addBook: {
    title: ['📚 새 책 추가', '📚 Add New Book'] as P,
    bookTitle: ['책 제목 *', 'Book Title *'] as P,
    titlePlaceholder: ['예: Animal Farm', 'e.g. Animal Farm'] as P,
    author: ['저자 *', 'Author *'] as P,
    authorPlaceholder: ['예: George Orwell', 'e.g. George Orwell'] as P,
    generatingMaterials: ['Claude가 학습 자료를 만들고 있어요...', 'Claude is creating study materials...'] as P,
    generatingDesc: ['30초 정도 걸릴 수 있어요', 'This may take about 30 seconds'] as P,
    adding: ['생성 중...', 'Creating...'] as P,
    add: ['추가하기 ✨', 'Add ✨'] as P,
    errorDefault: ['오류가 발생했습니다.', 'An error occurred.'] as P,
    recommended: ['추천 도서에서 선택', 'Pick from Recommended'] as P,
    recommendedHint: ['클릭하면 자동 입력돼요', 'Click to auto-fill'] as P,
    loadingRecommended: ['추천 도서 불러오는 중...', 'Loading recommendations...'] as P,
    orManual: ['직접 입력', 'Enter manually'] as P,
  },

  // ──────────── 책 상세 ────────────
  bookDetail: {
    background: ['📜 배경지식', '📜 Background'] as P,
    themes: ['🎭 핵심 테마', '🎭 Key Themes'] as P,
    essayQuestions: ['✍️ 에세이 질문', '✍️ Essay Questions'] as P,
    chapterQuestions: ['📖 챕터 질문', '📖 Chapter Questions'] as P,
    vocab: ['🔤 핵심 어휘', '🔤 Key Vocabulary'] as P,
    easy: ['쉬움', 'Easy'] as P,
    medium: ['중간', 'Medium'] as P,
    hard: ['어려움', 'Hard'] as P,
    generating: ['Claude가 학습 자료를 만들고 있어요', 'Claude is creating study materials'] as P,
    generatingDesc: ['배경지식, 테마, 에세이 질문, 어휘를 생성 중... (30초 소요)', 'Generating background, themes, questions, vocabulary... (30s)'] as P,
    historicalContext: ['🏛️ 역사적 배경', '🏛️ Historical Context'] as P,
    authorBio: ['✍️ 작가 소개', '✍️ About the Author'] as P,
    allegoryMap: ['🗺️ 알레고리 대조표', '🗺️ Allegory Map'] as P,
    keyScenes: ['핵심 장면', 'KEY SCENES'] as P,
    clickForEssay: ['질문을 클릭하면 에세이 에디터로 이동합니다.', 'Click a question to open the essay editor.'] as P,
    focus: ['핵심', 'Focus'] as P,
    gradeLabel: (g: number, lang: Lang) => lang === 'ko' ? `${g}학년` : `Grade ${g}`,
    aiError: ['AI 생성 오류', 'AI generation error'] as P,
  },

  // ──────────── 에세이 목록 ────────────
  writingList: {
    title: ['✍️ 에세이', '✍️ Essays'] as P,
    count: (n: number, lang: Lang) => lang === 'ko' ? `작성한 에세이 ${n}편` : `${n} essay${n !== 1 ? 's' : ''} written`,
    newEssay: ['+ 새 에세이', '+ New Essay'] as P,
    words: (n: number, lang: Lang) => lang === 'ko' ? `${n}단어` : `${n} words`,
    revisions: (n: number, lang: Lang) => lang === 'ko' ? `수정 ${n}회` : `${n} revision${n !== 1 ? 's' : ''}`,
    notGraded: ['첨삭 전', 'Not graded'] as P,
    empty: ['아직 작성한 에세이가 없어요', 'No essays written yet'] as P,
    emptyDesc: ['책 라이브러리에서 에세이 질문을 선택하거나 직접 작성해보세요', 'Select a question from the library or write your own'] as P,
    writeFirst: ['첫 에세이 쓰기', 'Write your first essay'] as P,
  },

  // ──────────── 에세이 에디터 ────────────
  essayEditor: {
    title: ['✍️ 에세이 에디터', '✍️ Essay Editor'] as P,
    selectBook: ['📚 책 선택 (선택사항)', '📚 Select Book (optional)'] as P,
    questionLabel: ['에세이 질문', 'Essay Question'] as P,
    getAiQuestion: ['✨ AI 질문 받기', '✨ Get AI Question'] as P,
    hint: ['💡 힌트:', '💡 Hint:'] as P,
    typeManually: ['직접 입력하기', 'Type manually'] as P,
    questionPlaceholder: (hasBook: boolean, lang: Lang) =>
      hasBook
        ? (lang === 'ko' ? "직접 입력하거나 위의 'AI 질문 받기' 버튼을 눌러보세요" : "Type here or click 'Get AI Question' above")
        : (lang === 'ko' ? '에세이 질문을 입력하세요...' : 'Enter your essay question...'),
    myEssay: ['내 에세이', 'My Essay'] as P,
    wordCount: (n: number, lang: Lang) => lang === 'ko' ? `${n} / 400단어 ${n >= 400 ? '✓' : ''}` : `${n} / 400 words ${n >= 400 ? '✓' : ''}`,
    essayPlaceholder: ['여기에 에세이를 작성하세요. 최소 400단어 이상 작성해야 AI 첨삭을 받을 수 있어요.', 'Write your essay here. You need at least 400 words to get AI feedback.'] as P,
    analyzing: ['Claude가 첨삭 중...', 'Claude is grading...'] as P,
    getFeedback: ['AI 첨삭 받기 (+20 XP~)', 'Get AI Feedback (+20 XP~)'] as P,
    getRevisionFeedback: ['다시 첨삭 받기 (+10 XP~)', 'Get Feedback Again (+10 XP~)'] as P,
    needQuestion: ['에세이 질문을 입력해주세요', 'Please enter an essay question'] as P,
    needWords: (n: number, lang: Lang) => lang === 'ko' ? `${n}단어 더 작성해야 해요` : `Need ${n} more words`,
    claudeReading: ['Claude가 에세이를 읽고 있어요...', 'Claude is reading your essay...'] as P,
    igcseEval: ['IGCSE 기준으로 5가지 항목을 평가합니다', 'Evaluating 5 criteria based on IGCSE standards'] as P,
    feedbackResult: ['AI 첨삭 결과', 'AI Feedback'] as P,
    feedbackInstruction: ['400단어 이상 작성 후 AI 첨삭 받기 버튼을 클릭하세요', 'Write 400+ words and click the feedback button'] as P,
    questionError: ['질문 생성 오류', 'Question generation error'] as P,
    generalError: ['오류가 발생했습니다', 'An error occurred'] as P,
  },

  // ──────────── 피드백 패널 ────────────
  feedback: {
    essayReward: ['에세이 제출 보상', 'Essay submission reward'] as P,
    overallScore: ['종합 점수', 'Overall Score'] as P,
    criteriaFeedback: ['항목별 피드백', 'Feedback by Criterion'] as P,
    modelSentence: ['✍️ 개선 예시 문장', '✍️ Model Sentence'] as P,
    overallComment: ['💬 전체 코멘트', '💬 Overall Comment'] as P,
    criteria: {
      thesis_clarity: ['📌 논제 명확성', '📌 Thesis Clarity'] as P,
      evidence_quality: ['📎 근거 품질', '📎 Evidence Quality'] as P,
      language_analysis: ['🔍 언어 분석', '🔍 Language Analysis'] as P,
      coherence: ['🔗 논리 흐름', '🔗 Coherence'] as P,
      contextual_awareness: ['🌍 맥락 이해', '🌍 Contextual Awareness'] as P,
    },
  },

  // ──────────── 어휘 세션 ────────────
  vocab: {
    title: ['🔤 어휘 세션', '🔤 Vocabulary Session'] as P,
    subtitle: ['책에서 뽑은 핵심 단어로 나만의 예문을 써보세요', 'Write example sentences using key words from the book'] as P,
    noBooks: ['읽고 있는 책이 없어요', 'No books currently in progress'] as P,
    noBooksDesc: ['라이브러리에서 책을 추가하고 학습을 시작하세요', 'Add books from the library to start learning'] as P,
    selectPrompt: ['오늘 어떤 책의 단어를 공부할까요?', "Which book's vocabulary do you want to study today?"] as P,
    preparing: ['준비 중...', 'Preparing...'] as P,
    start: ['시작하기', 'Start'] as P,
    needAllSentences: ['모든 단어에 예문을 입력해주세요', 'Please write sentences for all words'] as P,
    tip: ['💡 각 단어를 사용해서 나만의 문장을 완성하세요. 문장이 길수록 더 좋아요!', '💡 Write your own sentence using each word. Longer sentences are better!'] as P,
    bookExample: ['책 예문:', 'From the book:'] as P,
    sentencePlaceholder: (word: string, lang: Lang) =>
      lang === 'ko' ? `"${word}"를 사용한 나만의 영어 문장을 써보세요...` : `Write your own sentence using "${word}"...`,
    checkAnswers: ['채점하기 ✨', 'Check Answers ✨'] as P,
    checking: ['Claude가 문장을 확인하고 있어요...', 'Claude is checking your sentences...'] as P,
    checkingDesc: (n: number, lang: Lang) => lang === 'ko' ? `단어 ${n}개를 동시에 채점합니다` : `Grading ${n} words simultaneously`,
    sessionComplete: ['오늘의 어휘 세션 완료!', "Today's vocab session complete!"] as P,
    xpEarned: ['획득 XP', 'XP Earned'] as P,
    mySentence: ['내 문장', 'My Sentence'] as P,
    correctedSentence: ['교정 문장', 'Corrected Sentence'] as P,
    tomorrow: ['내일 다시 새로운 단어 세션이 시작됩니다 🎯', 'A new vocabulary session starts tomorrow 🎯'] as P,
    wordProgress: (i: number, total: number) => `${i} / ${total}`,
  },

  // ──────────── 부모 대시보드 ────────────
  parent: {
    title: ['👨‍👩‍👧 부모 대시보드', '👨‍👩‍👧 Parent Dashboard'] as P,
    subtitle: ['자녀들의 30일 챌린지 진행 현황', "Your children's 30-day challenge progress"] as P,
    pendingMilestones: (n: number, lang: Lang) => lang === 'ko' ? `🏆 승인 대기 중인 마일스톤 ${n}개` : `🏆 ${n} milestone${n > 1 ? 's' : ''} pending approval`,
    achievedOn: ['달성일:', 'Achieved:'] as P,
    approve: ['승인하기 ✓', 'Approve ✓'] as P,
    confirm: ['확인', 'Confirm'] as P,
    rewardPlaceholder: (reward: string, lang: Lang) => lang === 'ko' ? `보상 내용 (예: ${reward})` : `Reward (e.g. ${reward})`,
    todayMission: ['오늘 미션', "Today's Mission"] as P,
    allDone: ['✅ 모두 완료', '✅ All Done'] as P,
    missionsPartial: (n: number, lang: Lang) => lang === 'ko' ? `${n} / 3 완료` : `${n} / 3 done`,
    noProgress: ['아직 시작 안 함', 'Not started yet'] as P,
    milestones: ['마일스톤', 'Milestones'] as P,
    recentEssays: ['최근 에세이', 'Recent Essays'] as P,
    recentVocab: ['최근 어휘 세션', 'Recent Vocab Sessions'] as P,
    vocabComplete: (n: number, lang: Lang) => lang === 'ko' ? `${n}회 완료` : `${n} completed`,
    noStudents: ['등록된 학생이 없어요', 'No students registered'] as P,
    noStudentsDesc: ['자녀가 Scholar Quest에 가입하면 여기에 표시됩니다', 'Students will appear here once they join Scholar Quest'] as P,
    streakDays: (n: number, lang: Lang) => lang === 'ko' ? `${n}일 연속` : `${n}-day streak`,
    nextMilestone: ['다음 마일스톤까지', 'Until next milestone'] as P,
    achievedApproved: ['승인됨', 'Approved'] as P,
    achievedPending: ['대기 중', 'Pending'] as P,
    notAchieved: ['미달성', 'Not reached'] as P,
    gradeLabel: (g: number, lang: Lang) => lang === 'ko' ? `Grade ${g}` : `Grade ${g}`,
    xpLabel: (xp: number, lang: Lang) => lang === 'ko' ? `${xp.toLocaleString()} XP` : `${xp.toLocaleString()} XP`,
    milestoneLabel: {
      10: ['소보상 (500 XP)', 'Small Reward (500 XP)'] as P,
      20: ['중간보상 (900 XP)', 'Mid Reward (900 XP)'] as P,
      30: ['대보상 (1500 XP)', 'Big Reward (1500 XP)'] as P,
    },
    milestoneReward: {
      10: ['작은 선물', 'Small gift'] as P,
      20: ['특별 외출', 'Special outing'] as P,
      30: ['큰 보상', 'Big reward'] as P,
    },
  },

  // ──────────── 수료증 ────────────
  certificate: {
    title: ['🎓 30일 챌린지 수료증', '🎓 30-Day Challenge Certificate'] as P,
    complete: ['축하해요! 챌린지를 훌륭하게 완료했어요.', 'Congratulations! You completed the challenge!'] as P,
    inProgress: (day: number, lang: Lang) => lang === 'ko' ? `현재 Day ${day} 진행 중 · 완료 시 수료증이 발급됩니다.` : `Currently on Day ${day} · Certificate issued upon completion.`,
    print: ['🖨️ 인쇄하기', '🖨️ Print'] as P,
    certTitle: ['수 료 증', 'Certificate of Achievement'] as P,
    certSubtitle: ['30-Day English Challenge', '30-Day English Challenge'] as P,
    subject: ['이 증서는', 'This is to certify that'] as P,
    body: (lang: Lang) => lang === 'ko'
      ? 'Scholar Quest 30일 영어 학습 챌린지에 성실히 참여하여 탁월한 학습 성과를 이루었음을 증명합니다.'
      : 'has diligently participated in the Scholar Quest 30-Day English Learning Challenge and achieved excellent learning outcomes.',
    totalXp: ['총 획득 XP', 'Total XP Earned'] as P,
    completedDays: ['완료한 날', 'Days Completed'] as P,
    daysUnit: (n: number, lang: Lang) => lang === 'ko' ? `일 / 30일` : `days / 30`,
    essays: ['에세이 제출', 'Essays Submitted'] as P,
    essaysUnit: (n: number, lang: Lang) => lang === 'ko' ? '편' : '',
    vocabSessions: ['어휘 세션', 'Vocab Sessions'] as P,
    completionRate: ['챌린지 완료율', 'Challenge Completion Rate'] as P,
    milestones: ['달성 마일스톤', 'Achieved Milestones'] as P,
    startDate: ['챌린지 시작일:', 'Challenge Start:'] as P,
    issueDate: ['발급일:', 'Issue Date:'] as P,
    signature: ['부모님 서명', "Parent's Signature"] as P,
    inProgressNote: ['📌 아직 진행 중이에요', '📌 Still in progress'] as P,
    inProgressDesc: (done: number, lang: Lang) => lang === 'ko'
      ? `30일 중 ${done}일 완료했어요. 25일 이상 완료하면 수료증이 확정됩니다.`
      : `You've completed ${done} out of 30 days. Complete 25+ days to finalize your certificate.`,
  },

  // ──────────── 프로필 설정 ────────────
  setup: {
    title: ['프로필 설정', 'Profile Setup'] as P,
    subtitle: ['처음 방문하셨군요! 프로필을 만들어주세요.', 'Welcome! Please create your profile.'] as P,
    whoAmI: ['나는 누구인가요?', 'Who are you?'] as P,
    student: ['학생', 'Student'] as P,
    studentDesc: ['8학년 / 10학년', 'Grade 8 / Grade 10'] as P,
    parent: ['부모', 'Parent'] as P,
    parentDesc: ['자녀 진행 관리', "Monitor child's progress"] as P,
    name: ['이름', 'Name'] as P,
    namePlaceholder: ['예: 김지수', 'e.g. Jane'] as P,
    gradeLabel: ['학년', 'Grade'] as P,
    back: ['뒤로', 'Back'] as P,
    start: ['시작하기 🚀', 'Get Started 🚀'] as P,
    error: ['프로필 저장 중 오류가 발생했습니다. 다시 시도해주세요.', 'Error saving profile. Please try again.'] as P,
    logout: ['🚪 로그아웃', '🚪 Log out'] as P,
    gradeOption: (g: number, lang: Lang) => lang === 'ko' ? `${g}학년` : `Grade ${g}`,
  },

  // ──────────── Math Quest ────────────
  math: {
    // 공통
    mathQuest: ['Math Quest', 'Math Quest'] as P,
    dayOf: (day: number, lang: Lang) => lang === 'ko' ? `Day ${day} / 30` : `Day ${day} / 30`,
    backToDashboard: ['대시보드로 돌아가기', 'Back to Dashboard'] as P,
    xpEarned: ['획득 XP', 'XP Earned'] as P,

    // 대시보드
    dashboard: {
      greeting: (name: string, lang: Lang) => lang === 'ko' ? `안녕하세요, ${name}님!` : `Hello, ${name}!`,
      todayMission: ['오늘의 미션', "Today's Mission"] as P,
      possibleXp: ['획득 가능 XP', 'Possible XP'] as P,
      startStudy: ['학습 시작하기', 'Start Study'] as P,
      continueStudy: ['이어하기', 'Continue'] as P,
      completed: ['완료 ✓', 'Done ✓'] as P,
      review: ['복습', 'Review'] as P,
      reviewCount: (n: number, lang: Lang) => lang === 'ko' ? `복습 ${n}개` : `${n} reviews`,
      progress: ['진행률', 'Progress'] as P,
      calendar: ['30일 학습 달력', '30-Day Calendar'] as P,
      calendarToday: ['오늘', 'Today'] as P,
      calendarDone: ['완료', 'Done'] as P,
      calendarIncomplete: ['미완료', 'Incomplete'] as P,
      xpLabel: ['XP', 'XP'] as P,
    },

    // 세션 시작
    session: {
      uploadTitle: ['교재 사진 업로드', 'Upload Textbook Photo'] as P,
      uploadDesc: ['오늘 배운 교재나 노트 사진을 찍어 업로드하세요. AI가 개념을 분석합니다.', 'Take a photo of your textbook or notes. AI will analyze the concept.'] as P,
      cameraPrompt: ['사진을 찍거나 갤러리에서 선택', 'Take a photo or select from gallery'] as P,
      cameraHint: ['교재, 노트, 필기 모두 가능', 'Textbooks, notes, or handwriting all work'] as P,
      analyzing: ['AI가 개념을 분석 중...', 'AI is analyzing the concept...'] as P,
      startAnalysis: ['개념 분석 시작', 'Start Analysis'] as P,
      skipUpload: ['사진 없이 AI 개념 설명으로 바로 시작 →', 'Skip photo — Start with AI explanation →'] as P,
      alreadyDone: ['Day {day} 완료!', 'Day {day} Complete!'] as P,
    },

    // 개념 설명
    concept: {
      pageTitle: ['개념 설명', 'Concept Explanation'] as P,
      generate: ['AI 개념 설명 생성', 'Generate AI Explanation'] as P,
      generateDesc: (title: string, lang: Lang) => lang === 'ko' ? `AI가 ${title} 개념을 설명해 드립니다.` : `AI will explain ${title} for you.`,
      generating: ['AI가 분석 중...', 'AI is analyzing...'] as P,
      generateBtn: ['개념 설명 생성', 'Generate Explanation'] as P,
      formulas: ['핵심 공식', 'Key Formulas'] as P,
      workedExample: ['예제 풀이', 'Worked Example'] as P,
      problem: ['문제', 'Problem'] as P,
      answer: ['정답', 'Answer'] as P,
      commonMistakes: ['자주 하는 실수', 'Common Mistakes'] as P,
      startProblems: ['문제 풀기 시작', 'Start Problems'] as P,
      generateError: ['개념 생성에 실패했습니다.', 'Failed to generate concept.'] as P,
    },

    // 문제 풀기
    problems: {
      problemOf: (n: number, total: number, lang: Lang) => lang === 'ko' ? `문제 ${n} / ${total}` : `Problem ${n} / ${total}`,
      showHint: ['힌트 보기', 'Show Hint'] as P,
      hideHint: ['힌트 숨기기', 'Hide Hint'] as P,
      uploadAnswer: ['풀이 사진 촬영 또는 업로드', 'Take/Upload your answer photo'] as P,
      submit: ['제출하기', 'Submit'] as P,
      grading: ['채점 중...', 'Grading...'] as P,
      correct: ['정답입니다! 🎉', 'Correct! 🎉'] as P,
      wrong: ['아쉬워요 😢', 'Not quite 😢'] as P,
      errorLocation: ['오류 위치', 'Error Location'] as P,
      correctWorking: ['올바른 풀이', 'Correct Working'] as P,
      nextProblem: ['다음 문제', 'Next Problem'] as P,
      checkResult: ['결과 확인', 'Check Result'] as P,
      dayComplete: (day: number, lang: Lang) => lang === 'ko' ? `Day ${day} 완료!` : `Day ${day} Complete!`,
      generatingProblems: (level: string, lang: Lang) => lang === 'ko' ? `AI가 ${level} 문제를 생성 중...` : `AI is generating ${level} problems...`,
      retryTitle: ['조금 더 연습해봐요!', 'Keep practicing!'] as P,
      retryDesc: ['비슷한 문제 3개를 더 풀어봅시다.', "Let's try 3 more similar problems."] as P,
      retryBtn: ['유사문제 풀기', 'Try Similar Problems'] as P,
    },

    // 복습
    review: {
      title: ['수학 복습 큐', 'Math Review Queue'] as P,
      subtitle: (n: number, lang: Lang) => lang === 'ko' ? `오늘 복습할 문제 ${n}개` : `${n} problem${n !== 1 ? 's' : ''} to review today`,
      scheduledFor: ['복습 예정:', 'Scheduled:'] as P,
      startReview: ['복습 풀기 ▼', 'Start Review ▼'] as P,
      collapseReview: ['접기 ▲', 'Collapse ▲'] as P,
      uploadAnswer: ['풀이 사진 업로드', 'Upload Answer Photo'] as P,
      submit: ['제출', 'Submit'] as P,
      grading: ['채점 중...', 'Grading...'] as P,
      correctDone: ['정답! 복습 완료 🎉', 'Correct! Review done 🎉'] as P,
      wrong: ['아쉬워요...', 'Not quite...'] as P,
      markDone: ['이해했어요 — 완료 처리', 'I understand — Mark complete'] as P,
      emptyTitle: ['오늘 복습 없음!', 'No reviews today!'] as P,
      emptyDesc: ['오늘은 복습 없이 새 개념을 배울 차례예요!', "No reviews today — time to learn something new!"] as P,
    },

    // 진행률
    progress: {
      title: ['수학 진행률', 'Math Progress'] as P,
      subtitle: ['30일 IGCSE 수학 챌린지', '30-Day IGCSE Math Challenge'] as P,
      completedDays: ['완료 일수', 'Days Completed'] as P,
      totalXp: ['누적 XP', 'Total XP'] as P,
      dailyRate: ['일별 정답률', 'Daily Accuracy'] as P,
      areaRate: ['영역별 정답률', 'Accuracy by Area'] as P,
      weakTop3: ['약점 Top 3', 'Top 3 Weak Spots'] as P,
      upcomingReview: ['예정 복습', 'Upcoming Reviews'] as P,
      accuracy: ['정답률', 'Accuracy'] as P,
    },

    // 영역명
    area: {
      number: ['수', 'Number'] as P,
      algebra: ['대수', 'Algebra'] as P,
      geometry: ['기하', 'Geometry'] as P,
      statistics: ['통계', 'Statistics'] as P,
      sequences: ['수열', 'Sequences'] as P,
      transformation: ['변환', 'Transformation'] as P,
    },
  },
}
