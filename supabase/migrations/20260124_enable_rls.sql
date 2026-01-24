-- Enable Row Level Security on all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accommodations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "marketplaceItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rewards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rewardTransactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rewardCatalog" ENABLE ROW LEVEL SECURITY;

-- Create policies for service role (full access)
CREATE POLICY "Service role can do everything on users" ON "users"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on accommodations" ON "accommodations"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on marketplaceItems" ON "marketplaceItems"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on rewards" ON "rewards"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on rewardTransactions" ON "rewardTransactions"
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on rewardCatalog" ON "rewardCatalog"
  FOR ALL USING (auth.role() = 'service_role');

-- Create policies for public read access (you can modify these later)
CREATE POLICY "Anyone can read accommodations" ON "accommodations"
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read marketplace items" ON "marketplaceItems"
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read reward catalog" ON "rewardCatalog"
  FOR SELECT USING (true);

-- Users can read their own data
CREATE POLICY "Users can read own profile" ON "users"
  FOR SELECT USING (auth.uid()::text = "openId");

CREATE POLICY "Users can read own rewards" ON "rewards"
  FOR SELECT USING (auth.uid()::text = (SELECT "openId" FROM "users" WHERE id = "userId"));

CREATE POLICY "Users can read own transactions" ON "rewardTransactions"
  FOR SELECT USING (auth.uid()::text = (SELECT "openId" FROM "users" WHERE id = "userId"));
