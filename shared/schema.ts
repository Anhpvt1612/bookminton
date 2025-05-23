import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  bio: text("bio"),
  location: text("location"),
  skillLevel: text("skill_level"),
  isCourtOwner: boolean("is_court_owner").default(false),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

// Court model
export const courts = pgTable("courts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
  pricePerHour: integer("price_per_hour").notNull(),
  ownerId: integer("owner_id").notNull(),
  amenities: text("amenities").array(),
  rating: integer("rating").default(0),
});

export const insertCourtSchema = createInsertSchema(courts).omit({
  id: true
});

// Booking model
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  courtId: integer("court_id").notNull(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled, completed
  totalPrice: integer("total_price").notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true
});

// TimeSlot model
export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  courtId: integer("court_id").notNull(),
  date: timestamp("date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isBooked: boolean("is_booked").default(false),
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({
  id: true
});

// PlayerRequest model
export const playerRequests = pgTable("player_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  timeRange: text("time_range").notNull(),
  message: text("message"),
  status: text("status").default("active"), // active, fulfilled, expired
});

export const insertPlayerRequestSchema = createInsertSchema(playerRequests).omit({
  id: true
});

// Chat model
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  read: boolean("read").default(false),
});

export const insertChatSchema = createInsertSchema(chats).omit({
  id: true,
  sentAt: true
});

// Reviews model
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  courtId: integer("court_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Court = typeof courts.$inferSelect;
export type InsertCourt = z.infer<typeof insertCourtSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;

export type PlayerRequest = typeof playerRequests.$inferSelect;
export type InsertPlayerRequest = z.infer<typeof insertPlayerRequestSchema>;

export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
