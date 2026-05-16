import { pgTable, text, serial, integer, boolean, varchar, timestamp, pgEnum, foreignKey, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const listingTypeEnum = pgEnum('listing_type', ['personal', 'job', 'business', 'community', 'casual']);
export const listingStatusEnum = pgEnum('listing_status', ['active', 'expired', 'featured']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'confirmed', 'failed']);
export const paymentTypeEnum = pgEnum('payment_type', ['featured', 'job', 'boost']);
export const userRoleEnum = pgEnum('user_role', ['user', 'sub_admin', 'super_admin']);

// Users
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  securityQuestion: varchar('security_question', { length: 255 }).notNull(),
  securityAnswer: varchar('security_answer', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  payments: many(payments)
}));

// Listings
export const listings = pgTable('listings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  type: listingTypeEnum('type').notNull(),
  subcategory: varchar('subcategory', { length: 50 }),
  price: integer('price'),
  status: listingStatusEnum('status').default('active').notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isPaid: boolean('is_paid').default(false).notNull(),
  isBoosted: boolean('is_boosted').default(false).notNull(),
  boostExpiresAt: timestamp('boost_expires_at'),
  country: varchar('country', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  isRemote: boolean('is_remote').default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => {
  return {
    locationIdx: index('location_idx').on(table.country, table.state, table.city),
    typeStatusIdx: index('type_status_idx').on(table.type, table.status),
    expiresAtIdx: index('expires_at_idx').on(table.expiresAt)
  }
});

export const listingsRelations = relations(listings, ({ one, many }) => ({
  user: one(users, {
    fields: [listings.userId],
    references: [users.id]
  }),
  payments: many(payments)
}));

// Payments
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  listingId: integer('listing_id').references(() => listings.id).notNull(),
  amount: integer('amount').notNull(), // In cents
  currency: varchar('currency', { length: 10 }).default('USD').notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  paymentType: paymentTypeEnum('payment_type').default('featured').notNull(),
  paymentMethod: varchar('payment_method', { length: 20 }).default('crypto').notNull(),
  coinbaseChargeId: varchar('coinbase_charge_id', { length: 255 }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id]
  }),
  listing: one(listings, {
    fields: [payments.listingId],
    references: [listings.id]
  })
}));

// Sessions
export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  expiresAt: timestamp('expires_at').notNull()
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}));

// Reports
export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  listingId: integer('listing_id').references(() => listings.id).notNull(),
  reason: text('reason').notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // pending, resolved, dismissed
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id]
  }),
  listing: one(listings, {
    fields: [reports.listingId],
    references: [listings.id]
  })
}));

// Zod schemas for insertions
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertListingSchema = createInsertSchema(listings).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertSessionSchema = createInsertSchema(sessions);
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true });

// Types for database operations
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
