import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const buddySearchRequests = sqliteTable("buddy_search_requests", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at_ms").notNull(),
  contactedAt: integer("contacted_at_ms"),
  area: text("area").notNull(),
  description: text("description").notNull(),
  lineKind: text("line_kind", { enum: ["id", "link"] }).notNull(),
  lineContact: text("line_contact").notNull(),
});

export const userVoice = sqliteTable("user_voice", {
  id: text("id").primaryKey().notNull(),
  visitReference: text("visit_reference").notNull().unique(),
  buddyId: text("buddy_id").notNull(),
  inviteHash: text("invite_hash").notNull().unique(),
  expiresAt: integer("expires_at").notNull(),
  status: text("status", { enum: ["invited", "pending", "approved", "rejected"] }).notNull().default("invited"),
  rating: integer("rating"),
  body: text("body"),
  submittedAt: integer("submitted_at"),
  publishedAt: integer("published_at"),
});

export const buddyMemberAccess = sqliteTable("buddy_member_access", {
  buddyId: text("buddy_id").primaryKey().notNull(),
  email: text("email").notNull().unique(),
});

export const buddyPeerIntroductions = sqliteTable("buddy_peer_introductions", {
  id: text("id").primaryKey().notNull(),
  authorId: text("author_id").notNull(),
  targetId: text("target_id").notNull(),
  strengths: text("strengths").notNull(),
  experience: text("experience").notNull(),
  goodFor: text("good_for").notNull(),
  status: text("status").notNull(),
  submittedAt: integer("submitted_at").notNull(),
}, table => [uniqueIndex("buddy_peer_author_target").on(table.authorId, table.targetId)]);

export const buddyReferrals = sqliteTable("buddy_referrals", {
  code: text("code").primaryKey().notNull(),
  authorId: text("author_id").notNull(),
  createdAt: integer("created_at").notNull(),
  status: text("status").notNull(),
  name: text("name"),
  area: text("area"),
  interest: text("interest"),
  mediaUrl: text("media_url"),
  lineKind: text("line_kind"),
  lineContact: text("line_contact"),
  submittedAt: integer("submitted_at"),
  targetId: text("target_id"),
});
