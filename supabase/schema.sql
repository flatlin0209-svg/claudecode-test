-- =============================================
-- Matching App Database Schema
-- Supabase SQL Editor で実行してください
-- =============================================

-- プロフィール
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname    TEXT NOT NULL CHECK (char_length(nickname) BETWEEN 1 AND 20),
  gender      TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  birthdate   DATE NOT NULL,
  region      TEXT,
  bio         TEXT CHECK (char_length(bio) <= 300),
  interests   TEXT[] DEFAULT '{}',
  photos      TEXT[] DEFAULT '{}',
  is_profile_complete BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- スワイプ
CREATE TABLE swipe_actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action      TEXT NOT NULL CHECK (action IN ('like', 'skip')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (actor_id, target_id)
);

-- マッチング
CREATE TABLE matches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user1_id, user2_id)
);

-- チャットメッセージ
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "全員が参照可" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "自分のプロフィールのみ挿入可" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "自分のプロフィールのみ更新可" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "自分のプロフィールのみ削除可" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- swipe_actions
ALTER TABLE swipe_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "自分のスワイプのみ参照可" ON swipe_actions
  FOR SELECT USING (auth.uid() = actor_id);

CREATE POLICY "自分のスワイプのみ挿入可" ON swipe_actions
  FOR INSERT WITH CHECK (auth.uid() = actor_id);

CREATE POLICY "自分のスワイプのみ更新可" ON swipe_actions
  FOR UPDATE USING (auth.uid() = actor_id);

-- matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "自分が含まれるマッチのみ参照可" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "システムによるマッチ挿入を許可" ON matches
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "マッチ参加者のみメッセージ参照可" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "マッチ参加者のみメッセージ送信可" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "自分のメッセージのみ既読更新可" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- =============================================
-- Realtime 有効化
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
