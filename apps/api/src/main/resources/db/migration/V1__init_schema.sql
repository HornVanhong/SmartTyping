CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(40) NOT NULL,
  avatar_color VARCHAR(16),
  role VARCHAR(20) NOT NULL DEFAULT 'MEMBER'
    CHECK (role IN ('MEMBER','MODERATOR','ADMIN')),
  preferred_locale VARCHAR(5) NOT NULL DEFAULT 'en'
    CHECK (preferred_locale IN ('en','km')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE','SUSPENDED','DELETED')),
  email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

CREATE TABLE passages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('en','km')),
  title VARCHAR(160),
  content TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL
    CHECK (difficulty IN ('BEGINNER','INTERMEDIATE','ADVANCED')),
  category VARCHAR(40) NOT NULL DEFAULT 'GENERAL',
  content_mode VARCHAR(20) NOT NULL DEFAULT 'PARAGRAPH'
    CHECK (content_mode IN ('WORDS','SENTENCES','PARAGRAPH','QUOTE','NUMBERS','PUNCTUATION')),
  source_name VARCHAR(160),
  license_name VARCHAR(120),
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_passages_catalog ON passages(locale, difficulty, content_mode, status);

CREATE TABLE typing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  passage_id UUID REFERENCES passages(id) ON DELETE SET NULL,
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('en','km')),
  mode VARCHAR(30) NOT NULL,
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds BETWEEN 10 AND 600),
  elapsed_ms BIGINT NOT NULL CHECK (elapsed_ms >= 0),
  correct_characters INTEGER NOT NULL CHECK (correct_characters >= 0),
  incorrect_characters INTEGER NOT NULL CHECK (incorrect_characters >= 0),
  total_characters INTEGER NOT NULL CHECK (total_characters >= 0),
  accuracy NUMERIC(5,2) NOT NULL CHECK (accuracy BETWEEN 0 AND 100),
  cpm NUMERIC(10,2) NOT NULL CHECK (cpm >= 0),
  wpm NUMERIC(10,2),
  raw_wpm NUMERIC(10,2),
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  ranked_eligible BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_user_created ON typing_sessions(user_id, created_at DESC);
CREATE INDEX idx_sessions_leaderboard ON typing_sessions(locale, mode, ranked_eligible, created_at DESC);

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(60) NOT NULL UNIQUE,
  name_en VARCHAR(100) NOT NULL,
  name_km VARCHAR(100) NOT NULL,
  description_en TEXT,
  description_km TEXT,
  icon_key VARCHAR(60),
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE user_achievements (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, achievement_id)
);

CREATE TABLE multiplayer_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(10) NOT NULL UNIQUE,
  host_user_id UUID NOT NULL REFERENCES users(id),
  passage_id UUID NOT NULL REFERENCES passages(id),
  locale VARCHAR(5) NOT NULL CHECK (locale IN ('en','km')),
  status VARCHAR(20) NOT NULL DEFAULT 'WAITING'
    CHECK (status IN ('WAITING','READY','COUNTDOWN','RACING','COMPLETED','CANCELLED')),
  is_private BOOLEAN NOT NULL DEFAULT TRUE,
  max_players INTEGER NOT NULL DEFAULT 5 CHECK (max_players BETWEEN 2 AND 20),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rooms_status_created ON multiplayer_rooms(status, created_at DESC);

CREATE TABLE race_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES multiplayer_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  progress_characters INTEGER NOT NULL DEFAULT 0 CHECK (progress_characters >= 0),
  correct_characters INTEGER NOT NULL DEFAULT 0 CHECK (correct_characters >= 0),
  incorrect_characters INTEGER NOT NULL DEFAULT 0 CHECK (incorrect_characters >= 0),
  finish_elapsed_ms BIGINT,
  final_cpm NUMERIC(10,2),
  final_wpm NUMERIC(10,2),
  placement INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'JOINED'
    CHECK (status IN ('JOINED','READY','RACING','FINISHED','DISCONNECTED','FORFEITED')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);
CREATE INDEX idx_participants_room ON race_participants(room_id);

CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id UUID NOT NULL REFERENCES users(id),
  reported_user_id UUID REFERENCES users(id),
  room_id UUID REFERENCES multiplayer_rooms(id),
  category VARCHAR(30) NOT NULL,
  details VARCHAR(1000),
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN','REVIEWING','RESOLVED','DISMISSED')),
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(80) NOT NULL,
  target_type VARCHAR(60),
  target_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
