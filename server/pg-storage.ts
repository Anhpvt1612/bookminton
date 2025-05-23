import { IStorage } from "./storage";
import { db } from "./db";
import { eq, and, gte, lte, like, asc, desc, or } from "drizzle-orm";
import { 
  User, InsertUser,
  Court, InsertCourt,
  Booking, InsertBooking,
  TimeSlot, InsertTimeSlot,
  PlayerRequest, InsertPlayerRequest,
  Chat, InsertChat,
  Review, InsertReview,
  users, courts, bookings, timeSlots, playerRequests, chats, reviews
} from "@shared/schema";

export class PgStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Court operations
  async getCourt(id: number): Promise<Court | undefined> {
    const result = await db.select().from(courts).where(eq(courts.id, id));
    return result[0];
  }

  async getCourtsByOwner(ownerId: number): Promise<Court[]> {
    return db.select().from(courts).where(eq(courts.ownerId, ownerId));
  }

  async createCourt(court: InsertCourt): Promise<Court> {
    const result = await db.insert(courts).values(court).returning();
    return result[0];
  }

  async updateCourt(id: number, court: Partial<InsertCourt>): Promise<Court | undefined> {
    const result = await db.update(courts).set(court).where(eq(courts.id, id)).returning();
    return result[0];
  }

  async deleteCourt(id: number): Promise<boolean> {
    const result = await db.delete(courts).where(eq(courts.id, id)).returning();
    return result.length > 0;
  }

  async searchCourts(params: {
    location?: string;
    date?: Date;
    timeRange?: string;
  }): Promise<Court[]> {
    let query = db.select().from(courts);
    
    if (params.location) {
      query = query.where(like(courts.location, `%${params.location}%`));
    }
    
    // Nếu có date và timeRange, sẽ cần tìm theo timeslots
    if (params.date) {
      // Tìm các sân có time slots vào ngày đó
      const availableCourts = await db
        .select({ courtId: timeSlots.courtId })
        .from(timeSlots)
        .where(
          and(
            eq(timeSlots.date, params.date),
            eq(timeSlots.isBooked, false)
          )
        );
      
      if (availableCourts.length > 0) {
        const courtIds = availableCourts.map(c => c.courtId);
        query = query.where(courts.id.in(courtIds));
      } else {
        return []; // Không có sân nào có slots trống
      }
    }
    
    return query;
  }

  async getAllCourts(): Promise<Court[]> {
    return db.select().from(courts);
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id));
    return result[0];
  }

  async getUserBookings(userId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getCourtBookings(courtId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.courtId, courtId));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const result = await db.insert(bookings).values(booking).returning();
    return result[0];
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const result = await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return result[0];
  }

  // TimeSlot operations
  async getTimeSlotsByCourtAndDate(courtId: number, date: Date): Promise<TimeSlot[]> {
    return db.select()
      .from(timeSlots)
      .where(
        and(
          eq(timeSlots.courtId, courtId),
          eq(timeSlots.date, date)
        )
      )
      .orderBy(asc(timeSlots.startTime));
  }

  async createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const result = await db.insert(timeSlots).values(timeSlot).returning();
    return result[0];
  }

  async updateTimeSlotBookedStatus(id: number, isBooked: boolean): Promise<TimeSlot | undefined> {
    const result = await db.update(timeSlots)
      .set({ isBooked })
      .where(eq(timeSlots.id, id))
      .returning();
    return result[0];
  }

  // Player request operations
  async getPlayerRequest(id: number): Promise<PlayerRequest | undefined> {
    const result = await db.select().from(playerRequests).where(eq(playerRequests.id, id));
    return result[0];
  }

  async getAllPlayerRequests(): Promise<PlayerRequest[]> {
    return db.select().from(playerRequests).where(eq(playerRequests.status, "active"));
  }

  async getPlayerRequestsByUser(userId: number): Promise<PlayerRequest[]> {
    return db.select().from(playerRequests).where(eq(playerRequests.userId, userId));
  }

  async createPlayerRequest(request: InsertPlayerRequest): Promise<PlayerRequest> {
    const result = await db.insert(playerRequests).values(request).returning();
    return result[0];
  }

  async updatePlayerRequestStatus(id: number, status: string): Promise<PlayerRequest | undefined> {
    const result = await db.update(playerRequests)
      .set({ status })
      .where(eq(playerRequests.id, id))
      .returning();
    return result[0];
  }

  // Chat operations
  async getChatMessages(senderId: number, receiverId: number): Promise<Chat[]> {
    return db.select()
      .from(chats)
      .where(
        or(
          and(
            eq(chats.senderId, senderId),
            eq(chats.receiverId, receiverId)
          ),
          and(
            eq(chats.senderId, receiverId),
            eq(chats.receiverId, senderId)
          )
        )
      )
      .orderBy(asc(chats.sentAt));
  }

  async createChatMessage(message: InsertChat): Promise<Chat> {
    const result = await db.insert(chats).values(message).returning();
    return result[0];
  }

  async markChatMessagesAsRead(senderId: number, receiverId: number): Promise<boolean> {
    const result = await db.update(chats)
      .set({ read: true })
      .where(
        and(
          eq(chats.senderId, senderId),
          eq(chats.receiverId, receiverId),
          eq(chats.read, false)
        )
      )
      .returning();
    return result.length > 0;
  }

  // Review operations
  async getCourtReviews(courtId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.courtId, courtId));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }

  async getReviewByUserAndCourt(userId: number, courtId: number): Promise<Review | undefined> {
    const result = await db.select()
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          eq(reviews.courtId, courtId)
        )
      );
    return result[0];
  }

  async updateCourtRating(courtId: number): Promise<void> {
    // Tính toán rating trung bình cho court
    const courtReviews = await this.getCourtReviews(courtId);
    if (courtReviews.length === 0) return;
    
    const avgRating = courtReviews.reduce((sum, review) => sum + review.rating, 0) / courtReviews.length;
    
    // Cập nhật rating cho court
    await db.update(courts)
      .set({ rating: avgRating })
      .where(eq(courts.id, courtId));
  }
}