import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  description: text('description').notNull(),
});

export const seasons = sqliteTable('seasons', {
  id: text('id').primaryKey(),
  seasonNumber: integer('season_number').notNull(),
  startsAt: integer('starts_at').notNull(),
  endsAt: integer('ends_at').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
});

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  handle: text('handle').notNull().unique(),
  displayName: text('display_name').notNull(),
  avatarUrl: text('avatar_url').notNull(),
  followerCount: integer('follower_count').notNull().default(0),
  bio: text('bio').notNull().default(''),
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false),
  verifiedAt: integer('verified_at'),
});

export const verificationChallenges = sqliteTable('verification_challenges', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.id),
  challengeCode: text('challenge_code').notNull(),
  status: text('status', { enum: ['pending', 'verified', 'expired'] }).notNull().default('pending'),
  expiresAt: integer('expires_at').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const bids = sqliteTable('bids', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.id),
  categoryId: text('category_id').notNull().references(() => categories.id),
  seasonId: text('season_id').notNull().references(() => seasons.id),
  amountCents: integer('amount_cents').notNull(),
  description: text('description').notNull().default(''),
  stripePaymentId: text('stripe_payment_id'),
  status: text('status', { enum: ['pending', 'active', 'outbid'] }).notNull().default('pending'),
  createdAt: integer('created_at').notNull(),
});

export const clickLogs = sqliteTable('click_logs', {
  id: text('id').primaryKey(),
  bidId: text('bid_id').notNull().references(() => bids.id),
  ipHash: text('ip_hash').notNull(),
  userAgentHash: text('user_agent_hash').notNull(),
  createdAt: integer('created_at').notNull(),
});
