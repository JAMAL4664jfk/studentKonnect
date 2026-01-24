-- Create enums
CREATE TYPE "role" AS ENUM ('user', 'admin');
CREATE TYPE "propertyType" AS ENUM ('apartment', 'room', 'studio', 'house', 'dormitory');
CREATE TYPE "category" AS ENUM ('books', 'electronics', 'furniture', 'clothing', 'sports', 'services', 'other');
CREATE TYPE "condition" AS ENUM ('new', 'like-new', 'good', 'fair', 'poor');
CREATE TYPE "level" AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE "transactionType" AS ENUM ('earn', 'redeem');
CREATE TYPE "rewardCategory" AS ENUM ('discount', 'voucher', 'merchandise', 'service', 'experience');

-- Users table (if not exists)
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) NOT NULL UNIQUE,
  "name" TEXT,
  "email" VARCHAR(320),
  "loginMethod" VARCHAR(64),
  "role" "role" NOT NULL DEFAULT 'user',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "lastSignedIn" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Accommodations table
CREATE TABLE "accommodations" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" VARCHAR(100) NOT NULL,
  "country" VARCHAR(100) NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
  "propertyType" "propertyType" NOT NULL,
  "bedrooms" INTEGER NOT NULL,
  "bathrooms" INTEGER NOT NULL,
  "amenities" TEXT,
  "images" TEXT,
  "availableFrom" TIMESTAMP NOT NULL,
  "availableUntil" TIMESTAMP,
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "latitude" DECIMAL(10,8),
  "longitude" DECIMAL(11,8),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Marketplace items table
CREATE TABLE "marketplaceItems" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "category" "category" NOT NULL,
  "condition" "condition" NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
  "images" TEXT,
  "location" VARCHAR(255),
  "isAvailable" BOOLEAN NOT NULL DEFAULT true,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "views" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Rewards table
CREATE TABLE "rewards" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "points" INTEGER NOT NULL DEFAULT 0,
  "level" "level" NOT NULL DEFAULT 'bronze',
  "totalEarned" INTEGER NOT NULL DEFAULT 0,
  "totalRedeemed" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reward transactions table
CREATE TABLE "rewardTransactions" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "type" "transactionType" NOT NULL,
  "points" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "referenceType" VARCHAR(50),
  "referenceId" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reward catalog table
CREATE TABLE "rewardCatalog" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "pointsCost" INTEGER NOT NULL,
  "category" "rewardCategory" NOT NULL,
  "image" VARCHAR(500),
  "termsAndConditions" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "stock" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_accommodations_userId ON "accommodations"("userId");
CREATE INDEX idx_accommodations_city ON "accommodations"("city");
CREATE INDEX idx_accommodations_isAvailable ON "accommodations"("isAvailable");

CREATE INDEX idx_marketplaceItems_userId ON "marketplaceItems"("userId");
CREATE INDEX idx_marketplaceItems_category ON "marketplaceItems"("category");
CREATE INDEX idx_marketplaceItems_isAvailable ON "marketplaceItems"("isAvailable");

CREATE INDEX idx_rewards_userId ON "rewards"("userId");
CREATE INDEX idx_rewardTransactions_userId ON "rewardTransactions"("userId");

-- Create trigger function for updating updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accommodations_updated_at BEFORE UPDATE ON "accommodations"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketplaceItems_updated_at BEFORE UPDATE ON "marketplaceItems"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON "rewards"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewardCatalog_updated_at BEFORE UPDATE ON "rewardCatalog"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
