-- Math Quest 스키마
-- Supabase SQL Editor에 붙여넣고 실행하세요.

-- 1. math_sessions
create table math_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,   -- profiles.id 참조
  day_number int not null,    -- 1~30
  topic_title text not null,
  concept_image_url text,
  concept_summary jsonb,
  status text not null default 'not_started',  -- 'not_started' | 'in_progress' | 'completed'
  xp_earned int default 0,
  date date not null,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique (student_id, day_number)
);

-- 2. math_problems
create table math_problems (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references math_sessions(id) on delete cascade not null,
  student_id uuid not null,   -- profiles.id 참조
  level text not null,        -- 'easy' | 'medium' | 'hard' | 'synthesis'
  problem_number int not null,
  is_retry boolean default false,
  problem_text text not null,
  correct_answer text not null,
  answer_image_url text,
  is_correct boolean,
  ai_feedback text,
  ai_score int,               -- 0~100
  created_at timestamptz default now()
);

-- 3. math_review_queue (스페이스드 리피티션)
create table math_review_queue (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,   -- profiles.id 참조
  problem_id uuid references math_problems(id) on delete cascade not null,
  scheduled_date date not null,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- 4. math_daily_reports
create table math_daily_reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,   -- profiles.id 참조
  date date not null,
  day_number int not null,
  total_problems int default 0,
  correct_count int default 0,
  time_minutes int default 0,
  weak_areas jsonb default '[]',
  ai_report text,
  parent_viewed boolean default false,
  created_at timestamptz default now(),
  unique (student_id, date)
);

-- RLS 활성화
alter table math_sessions enable row level security;
alter table math_problems enable row level security;
alter table math_review_queue enable row level security;
alter table math_daily_reports enable row level security;

-- RLS 정책: 학생은 본인 데이터만 접근
create policy "math_sessions_own" on math_sessions
  for all using (student_id = (
    select id from profiles where user_id = auth.uid() limit 1
  ));

create policy "math_problems_own" on math_problems
  for all using (student_id = (
    select id from profiles where user_id = auth.uid() limit 1
  ));

create policy "math_review_own" on math_review_queue
  for all using (student_id = (
    select id from profiles where user_id = auth.uid() limit 1
  ));

create policy "math_reports_own" on math_daily_reports
  for all using (student_id = (
    select id from profiles where user_id = auth.uid() limit 1
  ));

-- 부모는 자녀 세션/리포트 조회 가능
create policy "math_sessions_parent_read" on math_sessions
  for select using (
    student_id in (
      select id from profiles where parent_id = (
        select id from profiles where user_id = auth.uid() limit 1
      )
    )
  );

create policy "math_reports_parent_read" on math_daily_reports
  for select using (
    student_id in (
      select id from profiles where parent_id = (
        select id from profiles where user_id = auth.uid() limit 1
      )
    )
  );
