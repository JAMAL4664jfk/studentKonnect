-- Dating Profiles Table
CREATE TABLE IF NOT EXISTS "datingProfiles" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
  "name" VARCHAR(100) NOT NULL,
  "age" INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  "institution" VARCHAR(200),
  "course" VARCHAR(200),
  "bio" TEXT NOT NULL,
  "images" JSONB DEFAULT '[]'::jsonb,
  "interests" JSONB DEFAULT '[]'::jsonb,
  "isVerified" BOOLEAN DEFAULT FALSE,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Dating Interactions Table (likes, passes, matches)
CREATE TABLE IF NOT EXISTS "datingInteractions" (
  "id" SERIAL PRIMARY KEY,
  "fromUserId" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
  "toProfileId" INTEGER REFERENCES "datingProfiles"("id") ON DELETE CASCADE,
  "interactionType" VARCHAR(20) NOT NULL CHECK (interactionType IN ('like', 'pass', 'match')),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("fromUserId", "toProfileId")
);

-- Dating Matches Table
CREATE TABLE IF NOT EXISTS "datingMatches" (
  "id" SERIAL PRIMARY KEY,
  "user1Id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
  "user2Id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
  "matchedAt" TIMESTAMP DEFAULT NOW(),
  "isActive" BOOLEAN DEFAULT TRUE,
  CHECK ("user1Id" < "user2Id"),
  UNIQUE("user1Id", "user2Id")
);

-- Dating Messages Table
CREATE TABLE IF NOT EXISTS "datingMessages" (
  "id" SERIAL PRIMARY KEY,
  "matchId" INTEGER REFERENCES "datingMatches"("id") ON DELETE CASCADE,
  "senderId" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_datingProfiles_userId" ON "datingProfiles"("userId");
CREATE INDEX IF NOT EXISTS "idx_datingProfiles_isActive" ON "datingProfiles"("isActive");
CREATE INDEX IF NOT EXISTS "idx_datingInteractions_fromUserId" ON "datingInteractions"("fromUserId");
CREATE INDEX IF NOT EXISTS "idx_datingInteractions_toProfileId" ON "datingInteractions"("toProfileId");
CREATE INDEX IF NOT EXISTS "idx_datingMatches_user1Id" ON "datingMatches"("user1Id");
CREATE INDEX IF NOT EXISTS "idx_datingMatches_user2Id" ON "datingMatches"("user2Id");
CREATE INDEX IF NOT EXISTS "idx_datingMessages_matchId" ON "datingMessages"("matchId");
