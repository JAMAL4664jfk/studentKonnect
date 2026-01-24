import { integer, pgEnum, pgTable, text, timestamp, varchar, decimal, boolean, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */

// Enums for PostgreSQL
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const propertyTypeEnum = pgEnum("propertyType", ["apartment", "room", "studio", "house", "dormitory"]);
export const categoryEnum = pgEnum("category", ["books", "electronics", "furniture", "clothing", "sports", "services", "other"]);
export const conditionEnum = pgEnum("condition", ["new", "like-new", "good", "fair", "poor"]);
export const levelEnum = pgEnum("level", ["bronze", "silver", "gold", "platinum"]);
export const transactionTypeEnum = pgEnum("transactionType", ["earn", "redeem"]);
export const rewardCategoryEnum = pgEnum("rewardCategory", ["discount", "voucher", "merchandise", "service", "experience"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Accommodation listings table
 * Stores student housing and accommodation options
 */
export const accommodations = pgTable("accommodations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(), // Foreign key to users table
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Monthly rent
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  propertyType: propertyTypeEnum("propertyType").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  amenities: text("amenities"), // JSON string of amenities
  images: text("images"), // JSON array of image URLs
  availableFrom: timestamp("availableFrom").notNull(),
  availableUntil: timestamp("availableUntil"),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Accommodation = typeof accommodations.$inferSelect;
export type InsertAccommodation = typeof accommodations.$inferInsert;

/**
 * Marketplace listings table
 * Stores items for sale or exchange between students
 */
export const marketplaceItems = pgTable("marketplaceItems", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(), // Foreign key to users table
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: categoryEnum("category").notNull(),
  condition: conditionEnum("condition").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  images: text("images"), // JSON array of image URLs
  location: varchar("location", { length: 255 }),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  views: integer("views").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type InsertMarketplaceItem = typeof marketplaceItems.$inferInsert;

/**
 * Rewards table
 * Stores student rewards and loyalty points
 */
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(), // Foreign key to users table
  points: integer("points").default(0).notNull(),
  level: levelEnum("level").default("bronze").notNull(),
  totalEarned: integer("totalEarned").default(0).notNull(), // Lifetime points earned
  totalRedeemed: integer("totalRedeemed").default(0).notNull(), // Lifetime points redeemed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = typeof rewards.$inferInsert;

/**
 * Reward transactions table
 * Tracks all point earning and redemption activities
 */
export const rewardTransactions = pgTable("rewardTransactions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(), // Foreign key to users table
  type: transactionTypeEnum("type").notNull(),
  points: integer("points").notNull(),
  description: text("description").notNull(),
  referenceType: varchar("referenceType", { length: 50 }), // e.g., "accommodation_booking", "marketplace_sale"
  referenceId: integer("referenceId"), // ID of related entity
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RewardTransaction = typeof rewardTransactions.$inferSelect;
export type InsertRewardTransaction = typeof rewardTransactions.$inferInsert;

/**
 * Reward catalog table
 * Stores available rewards that can be redeemed with points
 */
export const rewardCatalog = pgTable("rewardCatalog", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  pointsCost: integer("pointsCost").notNull(),
  category: rewardCategoryEnum("category").notNull(),
  image: varchar("image", { length: 500 }),
  termsAndConditions: text("termsAndConditions"),
  isActive: boolean("isActive").default(true).notNull(),
  stock: integer("stock"), // null means unlimited
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type RewardCatalogItem = typeof rewardCatalog.$inferSelect;
export type InsertRewardCatalogItem = typeof rewardCatalog.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accommodations: many(accommodations),
  marketplaceItems: many(marketplaceItems),
  rewards: many(rewards),
  rewardTransactions: many(rewardTransactions),
}));

export const accommodationsRelations = relations(accommodations, ({ one }) => ({
  user: one(users, {
    fields: [accommodations.userId],
    references: [users.id],
  }),
}));

export const marketplaceItemsRelations = relations(marketplaceItems, ({ one }) => ({
  user: one(users, {
    fields: [marketplaceItems.userId],
    references: [users.id],
  }),
}));

export const rewardsRelations = relations(rewards, ({ one }) => ({
  user: one(users, {
    fields: [rewards.userId],
    references: [users.id],
  }),
}));

export const rewardTransactionsRelations = relations(rewardTransactions, ({ one }) => ({
  user: one(users, {
    fields: [rewardTransactions.userId],
    references: [users.id],
  }),
}));
