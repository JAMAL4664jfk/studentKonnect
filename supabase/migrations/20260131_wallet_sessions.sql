-- Wallet Sessions Table Migration
-- Stores wallet authentication tokens for persistent user sessions
-- Created: 2026-01-31

-- Create wallet sessions table
CREATE TABLE IF NOT EXISTS "walletSessions" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "phoneNumber" VARCHAR(20) NOT NULL UNIQUE,
  "customerId" VARCHAR(255),
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT NOT NULL,
  "accessTokenExpiresAt" TIMESTAMP NOT NULL,
  "refreshTokenExpiresAt" TIMESTAMP NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastRefreshedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on phoneNumber for fast lookups
CREATE INDEX IF NOT EXISTS "idx_walletSessions_phoneNumber" ON "walletSessions" ("phoneNumber");

-- Create index on userId for user-based queries
CREATE INDEX IF NOT EXISTS "idx_walletSessions_userId" ON "walletSessions" ("userId");

-- Create index on isActive for filtering active sessions
CREATE INDEX IF NOT EXISTS "idx_walletSessions_isActive" ON "walletSessions" ("isActive");

-- Add foreign key constraint to users table (if exists)
-- Note: Uncomment if you want to enforce referential integrity
-- ALTER TABLE "walletSessions" 
-- ADD CONSTRAINT "fk_walletSessions_userId" 
-- FOREIGN KEY ("userId") REFERENCES "users"("id") 
-- ON DELETE CASCADE;

-- Create function to automatically update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_wallet_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before updates
CREATE TRIGGER trigger_update_wallet_session_timestamp
BEFORE UPDATE ON "walletSessions"
FOR EACH ROW
EXECUTE FUNCTION update_wallet_session_updated_at();

-- Add comments for documentation
COMMENT ON TABLE "walletSessions" IS 'Stores wallet authentication tokens for persistent user sessions across app restarts';
COMMENT ON COLUMN "walletSessions"."userId" IS 'Foreign key to users table';
COMMENT ON COLUMN "walletSessions"."phoneNumber" IS 'User phone number used for wallet login (unique)';
COMMENT ON COLUMN "walletSessions"."customerId" IS 'Wallet API customer ID';
COMMENT ON COLUMN "walletSessions"."accessToken" IS 'JWT access token for API authentication';
COMMENT ON COLUMN "walletSessions"."refreshToken" IS 'JWT refresh token for obtaining new access tokens';
COMMENT ON COLUMN "walletSessions"."accessTokenExpiresAt" IS 'Access token expiration timestamp';
COMMENT ON COLUMN "walletSessions"."refreshTokenExpiresAt" IS 'Refresh token expiration timestamp';
COMMENT ON COLUMN "walletSessions"."isActive" IS 'Whether the session is currently active (false = logged out)';
COMMENT ON COLUMN "walletSessions"."lastRefreshedAt" IS 'Timestamp of last token refresh';
